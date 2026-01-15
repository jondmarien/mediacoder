"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileVideo, FileImage, Loader2, Download, X } from "lucide-react";
import { ProcessedFile } from "./media-converter";

interface PreviewPanelProps {
  files: ProcessedFile[];
  onRemoveFile: (id: string) => void;
}

export function PreviewPanel({ files, onRemoveFile }: PreviewPanelProps) {
  const activeFile = files.length > 0 ? files[files.length - 1] : null;

  return (
    <Card className="h-full min-h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>
          Real-time processing status and results.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {files.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg m-4 min-h-[300px]">
            <p>No files in queue</p>
            <p className="text-xs opacity-50">Upload a file to see preview</p>
          </div>
        ) : (
          <div className="flex flex-col h-full space-y-6">
            {/* Main Preview Area */}
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

            {/* File List / Queue */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Queue ({files.length})
              </h4>
              <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/40 border text-sm"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      {file.file.type.startsWith("video") ? (
                        <FileVideo className="w-4 h-4 shrink-0" />
                      ) : (
                        <FileImage className="w-4 h-4 shrink-0" />
                      )}
                      <span className="truncate max-w-[150px]">
                        {file.file.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          file.status === "completed" ? "default" : "secondary"
                        }
                        className="text-[10px] h-5"
                      >
                        {file.status}
                      </Badge>
                      {file.status === "completed" && file.result && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          asChild
                        >
                          <a href={file.result} download={file.file.name}>
                            <Download className="w-3 h-3" />
                          </a>
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveFile(file.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
