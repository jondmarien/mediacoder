export type ProcessedFile = {
  file: File;
  status: "idle" | "pending" | "processing" | "completed" | "error";
  result?: string;
  error?: string;
  id: string;
  outputFilename?: string;
};
