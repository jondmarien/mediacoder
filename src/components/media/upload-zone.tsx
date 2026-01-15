"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAsyncQueuer } from "@tanstack/react-pacer";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  X,
  FileAudio,
  FileVideo,
  FileImage,
  Download,
  File as FileIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { uploadAndProcessImage } from "@/app/actions";

interface ProcessedFile {
  file: File;
  status: "pending" | "processing" | "completed" | "error";
  result?: string;
  error?: string;
  id: string;
}

export default function UploadZone() {
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
      formData.append("format", "webp"); // Default to webp for now

      const result = await uploadAndProcessImage(formData);
      if (!result.success) throw new Error(result.error);
      return result;
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

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        status: "pending" as const,
        id: Math.random().toString(36).substring(7),
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      newFiles.forEach((f) => {
        queue.addItem(f.file);
      });
    },
    [queue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
    },
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div
        {...getRootProps()}
        className={cn(
          "relative group cursor-pointer flex flex-col items-center justify-center w-full h-64 rounded-3xl border-2 border-dashed transition-all duration-300 ease-out",
          isDragActive
            ? "border-primary bg-primary/5 text-primary scale-[1.02] shadow-xl shadow-primary/10"
            : "border-muted-foreground/25 bg-background/50 hover:bg-muted/50 hover:border-primary/50 text-muted-foreground"
        )}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 space-y-4">
          <div
            className={cn(
              "p-4 rounded-full bg-muted/50 transition-transform duration-300 group-hover:scale-110",
              isDragActive && "bg-primary/10 text-primary"
            )}
          >
            <Upload className="w-10 h-10" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-lg font-medium">
              {isDragActive ? "Drop files now" : "Drag & drop files here"}
            </p>
            <p className="text-sm text-muted-foreground/80">
              or click to select
            </p>
          </div>
          <p className="text-xs text-muted-foreground/60 px-4">
            Supports PNG, JPG, WEBP, AVIF, MP4, WebM
          </p>
        </div>
        <input {...getInputProps()} />
      </div>

      {/* Progress & Queue */}
      {files.length > 0 && (
        <div className="space-y-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 rounded-xl border bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="flex items-center space-x-4 overflow-hidden">
                <div className="p-2 bg-muted rounded-lg shrink-0">
                  {file.file.type.startsWith("video") ? (
                    <FileVideo className="w-6 h-6" />
                  ) : (
                    <FileImage className="w-6 h-6" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate max-w-[200px] md:max-w-md">
                    {file.file.name}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{(file.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span>•</span>
                    <span
                      className={cn(
                        "capitalize",
                        file.status === "completed" && "text-green-500",
                        file.status === "error" && "text-red-500",
                        file.status === "processing" && "text-blue-500"
                      )}
                    >
                      {file.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {file.status === "processing" && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
                {file.status === "completed" && file.result && (
                  <Button size="icon" variant="ghost" asChild>
                    <a
                      href={file.result}
                      download={
                        file.file.name.replace(/\.[^/.]+$/, "") +
                        "-processed.webp"
                      }
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visual Gallery of Results */}
      {files.filter((f) => f.status === "completed" && f.result).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          {files
            .filter((f) => f.status === "completed" && f.result)
            .map((pf) => (
              <div
                key={pf.id}
                className="relative rounded-xl overflow-hidden border bg-background shadow-sm group aspect-square"
              >
                {pf.file.type.startsWith("image") ? (
                  <img
                    src={pf.result}
                    alt={pf.file.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-muted">
                    <FileVideo className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white truncate font-medium">
                    {pf.file.name}
                  </p>
                  <a
                    href={pf.result}
                    download={pf.file.name}
                    className="mt-2 inline-flex items-center justify-center w-full py-1.5 bg-primary text-primary-foreground text-xs rounded shadow-sm hover:bg-primary/90"
                  >
                    <Download className="w-3 h-3 mr-1.5" />
                    Download
                  </a>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
