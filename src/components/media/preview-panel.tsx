"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProcessedFile } from "@/lib/types";
import { PreviewQueueList } from "./preview-queue-list";
import { ActivePreview } from "./active-preview";

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
            <ActivePreview activeFile={activeFile} />
            <PreviewQueueList files={files} onRemoveFile={onRemoveFile} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
