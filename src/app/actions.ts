"use server";

import { processImage, ImageProcessOptions } from "@/lib/image-processing";
import { v4 as uuidv4 } from "uuid";
import { AsyncRateLimiter } from "@tanstack/pacer";
import { z } from "zod";

// Rate limiter wrapper for the processing function
const rateLimitedProcessor = new AsyncRateLimiter(
  async (options: ImageProcessOptions) => {
    return await processImage(options);
  },
  {
    limit: 10,
    window: 60 * 1000, // 60 seconds
    windowType: "sliding",
  }
);

const ImageUploadSchema = z.object({
  format: z.enum(["jpeg", "png", "webp", "avif", "tiff"]),
  quality: z.number().min(1).max(100).default(80),
  width: z.number().optional(),
  height: z.number().optional(),
  bgRemoveColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  bgRemoveThreshold: z.number().min(0).max(100).default(20),
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
      bgRemoveColor: formData.get("bgRemoveColor") || undefined,
      bgRemoveThreshold: Number(formData.get("bgRemoveThreshold") || 20),
    };

    const validatedData = ImageUploadSchema.parse(rawData);

    // File validation
    if (file.size > 20 * 1024 * 1024) {
      // 20MB limit
      throw new Error("File size exceeds 20MB limit");
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
          rateLimitedProcessor.getMsUntilNextWindow() / 1000
        )}s`
      );
    }

    return {
      success: true,
      data: `data:image/${
        validatedData.format
      };base64,${processedBuffer.toString("base64")}`,
      filename: `processed-${uuidv4()}.${validatedData.format}`,
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

export async function processVideoUpload(formData: FormData) {
  return { success: true, message: "Video processing implementation pending" };
}
