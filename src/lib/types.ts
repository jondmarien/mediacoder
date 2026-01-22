import { ImageConversionOptions, VideoConversionOptions } from "./schemas";

export type ProcessedFile = {
  file: File;
  status: "idle" | "pending" | "processing" | "completed" | "error";
  result?: string;
  error?: string;
  id: string;
  outputFilename?: string;
  imageSettings?: ImageConversionOptions;
  videoSettings?: VideoConversionOptions;
};
