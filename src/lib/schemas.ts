import { z } from "zod";

export const ImageFormatSchema = z.enum(["webp", "avif", "png", "jpeg"]);
export const VideoFormatSchema = z.enum(["mp4", "webm"]);

export const ImageConversionSchema = z.object({
  format: ImageFormatSchema.default("webp"),
  quality: z.number().min(1).max(100).default(80),
  removeBackground: z.boolean().default(false),
  threshold: z.number().min(0).max(100).default(10).optional(),
  targetColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color")
    .default("#00FF00")
    .optional(), // Green screen default
});

export const VideoConversionSchema = z.object({
  format: VideoFormatSchema.default("mp4"),
  muteAudio: z.boolean().default(false),
});

export type ImageConversionOptions = z.infer<typeof ImageConversionSchema>;
export type VideoConversionOptions = z.infer<typeof VideoConversionSchema>;
