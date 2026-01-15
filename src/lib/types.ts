export type ProcessedFile = {
  file: File;
  status: "pending" | "processing" | "completed" | "error";
  result?: string;
  error?: string;
  id: string;
};
