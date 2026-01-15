"use client";

import { ConfigurationPanel } from "./configuration-panel";
import { PreviewPanel } from "./preview-panel";
import { useMediaConverter } from "@/hooks/use-media-converter";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto"
    >
      <ConfigurationPanel
        onFilesAdded={addFiles}
        imageSettings={imageSettings}
        setImageSettings={setImageSettings}
        videoSettings={videoSettings}
        setVideoSettings={setVideoSettings}
      />
      <PreviewPanel files={files} onRemoveFile={removeFile} />
    </motion.div>
  );
}
