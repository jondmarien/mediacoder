"use server";

import { processImage, ImageProcessOptions } from "@/lib/image-processing";
import { v4 as uuidv4 } from "uuid";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

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
    // Rate Limiting (IP-based ideally, but using static token for demo/MVP)
    // !! TODO: In real prod, use headers().get('x-forwarded-for')
    await limiter.check(10, "CACHE_TOKEN"); // 10 requests per minute per token

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

    const processedBuffer = await processImage(options);

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
