"use server";

import { processImage, ImageProcessOptions } from "@/lib/image-processing";
import { v4 as uuidv4 } from "uuid";
import { AsyncRateLimiter } from "@tanstack/pacer";
import { z } from "zod";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import * as fs from "fs";
import { convertVideo } from "@/lib/ffmpeg-helper";

import {
  ImageConversionSchema,
  VideoConversionSchema,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from "@/lib/schemas";

// Rate limiter wrapper for the processing function
const rateLimitedProcessor = new AsyncRateLimiter(
  async (options: ImageProcessOptions) => {
    return await processImage(options);
  },
  {
    limit: 10,
    window: 60 * 1000, // 60 seconds
    windowType: "sliding",
  },
);

const ImageUploadSchema = ImageConversionSchema.extend({
  width: z.number().optional(),
  height: z.number().optional(),
  bgRemoveColor: z.string().optional(), // Mapped from targetColor in logic
  bgRemoveThreshold: z.number().default(10), // Mapped from threshold
});

export async function uploadAndProcessImage(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");

    // Validate inputs
    const rawData = {
      format: formData.get("format"),
      quality: Number(formData.get("quality") || 80),
      width: Number(formData.get("width") || 0) || undefined,
      height: Number(formData.get("height") || 0) || undefined,
      // Logic for background removal parameters
      bgRemoveColor:
        formData.get("removeBackground") === "true"
          ? (formData.get("targetColor") as string)
          : undefined,
      bgRemoveThreshold: Number(formData.get("threshold") || 10),
    };

    const validatedData = ImageUploadSchema.parse(rawData);

    // File validation
    if (file.size > MAX_IMAGE_SIZE) {
      // 20MB limit
      throw new Error("File size exceeds limit");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const options: ImageProcessOptions = {
      buffer,
      format: validatedData.format,
      quality: validatedData.quality,
      width: validatedData.width,
      height: validatedData.height,
      removeBackground: validatedData.bgRemoveColor
        ? {
            color: validatedData.bgRemoveColor,
            threshold: validatedData.bgRemoveThreshold,
          }
        : undefined,
    };

    // Execute via rate limiter
    const processedBuffer = await rateLimitedProcessor.maybeExecute(options);

    if (!processedBuffer) {
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil(
          rateLimitedProcessor.getMsUntilNextWindow() / 1000,
        )}s`,
      );
    }

    const originalName = file.name;
    const nameWithoutExt = originalName.substring(
      0,
      originalName.lastIndexOf("."),
    );
    const filename = `${nameWithoutExt}.${validatedData.format}`;

    return {
      success: true,
      data: `data:image/${
        validatedData.format
      };base64,${processedBuffer.toString("base64")}`,
      filename: filename,
    };
  } catch (error) {
    console.error("Image processing failed:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        details: error.issues,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process image",
    };
  }
}

// --- Video Processing ---

const VideoUploadSchema = VideoConversionSchema.extend({
  codec: z.string().optional(),
  // Add more video specific options here (bitrate, etc.)
});

export async function uploadAndProcessVideo(formData: FormData) {
  let inputPath = "";
  let outputPath = "";

  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");

    // Validation
    const rawData = {
      format: formData.get("format") || "mp4",
      codec: formData.get("codec") || undefined,
      muteAudio: formData.get("muteAudio") === "true",
    };
    const validatedData = VideoUploadSchema.parse(rawData);

    if (file.size > MAX_VIDEO_SIZE) {
      // 100MB limit for video
      throw new Error("File size exceeds 100MB video limit");
    }

    // Temp file handling
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = join(tmpdir(), "mediacoder-uploads");

    // Ensure temp dir exists
    if (!fs.existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    const uniqueId = uuidv4();
    inputPath = join(tempDir, `${uniqueId}-input`); // Append extension if needed by ffmpeg detection, but fluent-ffmpeg usually detects
    // Actually best to keep extension for ffmpeg detection
    const originalName = file.name;
    const ext = originalName.split(".").pop() || "dat";
    inputPath = `${inputPath}.${ext}`;

    outputPath = join(tempDir, `${uniqueId}-output.${validatedData.format}`);

    await writeFile(inputPath, buffer);

    // Process
    await convertVideo({
      inputPath,
      outputPath,
      format: validatedData.format,
      codec: validatedData.codec,
      muteAudio: validatedData.muteAudio,
    });

    // Read result
    const outputBuffer = await readFile(outputPath);

    // Cleanup (async, don't wait)
    cleanupFiles([inputPath, outputPath]);

    const nameWithoutExt = originalName.substring(
      0,
      originalName.lastIndexOf("."),
    );
    const filename = `${nameWithoutExt}.${validatedData.format}`;

    return {
      success: true,
      data: `data:video/${validatedData.format};base64,${outputBuffer.toString(
        "base64",
      )}`,
      filename: filename,
    };
  } catch (error) {
    // Cleanup on error too
    if (inputPath) cleanupFiles([inputPath]);
    if (outputPath) cleanupFiles([outputPath]);

    console.error("Video processing failed:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        details: error.issues,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process video",
    };
  }
}

async function cleanupFiles(paths: string[]) {
  for (const path of paths) {
    try {
      if (fs.existsSync(path)) await unlink(path);
    } catch (e) {
      console.error(`Failed to cleanup ${path}`, e);
    }
  }
}
