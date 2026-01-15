"use client";

import { FileVideo, FileImage, Loader2 } from "lucide-react";
import { ProcessedFile } from "@/lib/types";

interface ActivePreviewProps {
  activeFile: ProcessedFile | null;
}

export function ActivePreview({ activeFile }: ActivePreviewProps) {
  return (
    <div className="flex-1 border rounded-lg bg-black/20 flex items-center justify-center overflow-hidden min-h-[300px] relative group">
      {activeFile?.status === "completed" && activeFile.result ? (
        activeFile.file.type.startsWith("image") ? (
          <img
            src={activeFile.result}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-center">
            <FileVideo className="w-16 h-16 mx-auto mb-2 opacity-50" />
            <p>Video Processed</p>
          </div>
        )
      ) : (
        <div className="text-center">
          {activeFile?.status === "processing" ? (
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-2 text-primary" />
          ) : (
            <FileImage className="w-12 h-12 mx-auto mb-2 opacity-20" />
          )}
          <p className="text-sm text-muted-foreground capitalize">
            {activeFile?.status || "Waiting..."}
          </p>
        </div>
      )}
    </div>
  );
}
