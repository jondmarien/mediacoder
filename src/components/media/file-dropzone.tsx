"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
  className?: string;
  disabled?: boolean;
}

export function FileDropzone({
  onFilesAdded,
  className,
  disabled,
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles?.length > 0) {
        onFilesAdded(acceptedFiles);
      }
    },
    [onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept: {
      "image/*": [],
      "video/*": [],
    },
  });

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Input (File)</Label>
      <div
        {...getRootProps()}
        className={cn(
          "relative group cursor-pointer flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed transition-all duration-300 ease-out",
          disabled && "opacity-60 cursor-not-allowed",
          isDragActive
            ? "border-primary bg-primary/5 text-primary"
            : "border-muted-foreground/25 bg-muted/20 hover:bg-muted/50 hover:border-primary/50 text-muted-foreground"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <Upload className="w-6 h-6" />
          <p className="text-sm font-medium">
            {isDragActive ? "Drop file" : "Click to upload"}
          </p>
        </div>
      </div>
    </div>
  );
}
