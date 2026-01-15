"use client";

import { useState, useCallback } from "react";
import { useAsyncQueuer } from "@tanstack/react-pacer";
import { toast } from "sonner";
import { uploadAndProcessImage, uploadAndProcessVideo } from "@/app/actions";
import { ConfigurationPanel } from "./configuration-panel";
import { PreviewPanel } from "./preview-panel";

export type ProcessedFile = {
  file: File;
  status: "pending" | "processing" | "completed" | "error";
  result?: string;
  error?: string;
  id: string;
};

export default function MediaConverter() {
  const [files, setFiles] = useState<ProcessedFile[]>([]);

  const queue = useAsyncQueuer<File>(
    async (file) => {
      // Update status to processing
      setFiles((prev) =>
        prev.map((f) => {
          if (f.file === file) {
            return { ...f, status: "processing" };
          }
          return f;
        })
      );

      const formData = new FormData();
      formData.append("file", file);

      const isVideo = file.type.startsWith("video");

      if (isVideo) {
        formData.append("format", "mp4"); // Default to mp4 for now
        const result = await uploadAndProcessVideo(formData);
        if (!result.success) throw new Error(result.error);
        return result;
      } else {
        formData.append("format", "webp"); // Default to webp for now
        const result = await uploadAndProcessImage(formData);
        if (!result.success) throw new Error(result.error);
        return result;
      }
    },
    {
      concurrency: 2,
      onSuccess: (res, file) => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.file === file) {
              return { ...f, status: "completed", result: res.data };
            }
            return f;
          })
        );
        toast.success(`Processed ${file.name}`);
      },
      onError: (err, file) => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.file === file) {
              return { ...f, status: "error", error: err.message };
            }
            return f;
          })
        );
        toast.error(`Failed: ${file.name}`);
      },
    }
  );

  const handleFilesAdded = useCallback(
    (newFiles: File[]) => {
      const processedFiles = newFiles.map((file) => ({
        file,
        status: "pending" as const,
        id: Math.random().toString(36).substring(7),
      }));

      setFiles((prev) => [...prev, ...processedFiles]);

      processedFiles.forEach((f) => {
        queue.addItem(f.file);
      });
    },
    [queue]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
      <ConfigurationPanel onFilesAdded={handleFilesAdded} />
      <PreviewPanel files={files} onRemoveFile={removeFile} />
    </div>
  );
}
