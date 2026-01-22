import { z } from "zod";

export const ImageFormatSchema = z.enum(["webp", "avif", "png", "jpeg"]);
export const VideoFormatSchema = z.enum(["mp4", "webm"]);

export const ImageConversionSchema = z.object({
  format: ImageFormatSchema.default("webp"),
  quality: z.number().min(1).max(100).default(80),
  removeBackground: z.boolean().default(false),
  autoBackgroundRemoval: z.boolean().default(false),
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

export const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
];
export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
];
