"use client";

import { ConfigurationPanel } from "./configuration-panel";
import { PreviewPanel } from "./preview-panel";
import { useMediaConverter } from "@/hooks/use-media-converter";

export default function MediaConverter() {
  const {
    files,
    addFiles,
    removeFile,
    imageSettings,
    setImageSettings,
    videoSettings,
    setVideoSettings,
  } = useMediaConverter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
      <ConfigurationPanel
        onFilesAdded={addFiles}
        imageSettings={imageSettings}
        setImageSettings={setImageSettings}
        videoSettings={videoSettings}
        setVideoSettings={setVideoSettings}
      />
      <PreviewPanel files={files} onRemoveFile={removeFile} />
    </div>
  );
}
