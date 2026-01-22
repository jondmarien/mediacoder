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
import { ImageConversionOptions, VideoConversionOptions } from "@/lib/schemas";

interface PreviewPanelProps {
  files: ProcessedFile[];
  onRemoveFile: (id: string) => void;
  imageSettings: ImageConversionOptions;
  setImageSettings: (settings: ImageConversionOptions) => void;
  videoSettings: VideoConversionOptions;
  isPickingColor: boolean;
  setIsPickingColor: (isPicking: boolean) => void;
  selectedFileId?: string | null;
  onSelectFile?: (id: string | null) => void;
  isIndividualMode?: boolean;
  globalImageSettings?: ImageConversionOptions;
  globalVideoSettings?: VideoConversionOptions;
}

export function PreviewPanel({
  files,
  onRemoveFile,
  imageSettings, // This is effective settings (for ActivePreview)
  setImageSettings,
  videoSettings, // This is effective settings
  isPickingColor,
  setIsPickingColor,
  selectedFileId,
  onSelectFile,
  isIndividualMode,
  globalImageSettings,
  globalVideoSettings,
}: PreviewPanelProps) {
  const activeFile =
    files.find((f) => f.id === selectedFileId) ||
    (files.length > 0 ? files[files.length - 1] : null);

  return (
    <Card className="h-full flex flex-col overflow-hidden bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col gap-4">
        {files.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground dashed-border rounded-lg m-2">
            <p>Upload files to see preview</p>
          </div>
        ) : (
          <div className="flex flex-col h-full space-y-6">
            <ActivePreview
              files={files}
              activeFile={activeFile}
              imageSettings={imageSettings}
              videoSettings={videoSettings}
              isPickingColor={isPickingColor}
              setIsPickingColor={setIsPickingColor}
              setImageSettings={setImageSettings}
            />
            <PreviewQueueList
              files={files}
              onRemoveFile={onRemoveFile}
              imageSettings={imageSettings}
              videoSettings={videoSettings}
              selectedFileId={selectedFileId}
              onSelectFile={onSelectFile}
              isIndividualMode={isIndividualMode}
              globalImageSettings={globalImageSettings}
              globalVideoSettings={globalVideoSettings}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
