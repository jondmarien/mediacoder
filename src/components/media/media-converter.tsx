"use client";

import { ConfigurationPanel } from "./configuration-panel";
import { PreviewPanel } from "./preview-panel";
import { useMediaConverter } from "@/hooks/use-media-converter";
import { motion } from "framer-motion";
import { useState } from "react";

export default function MediaConverter() {
  const {
    files,
    addFiles,
    removeFile,
    imageSettings,
    setImageSettings,
    videoSettings,
    setVideoSettings,
    startConversion,
    isConverting,
  } = useMediaConverter();

  const [isPickingColor, setIsPickingColor] = useState(false);
  const [activeTab, setActiveTab] = useState("image");

  const handleFilesAdded = (newFiles: File[]) => {
    addFiles(newFiles);
    // Auto-switch tab based on the first file type using startsWith
    if (newFiles.length > 0) {
      if (newFiles[0].type.startsWith("video")) {
        setActiveTab("video");
      } else if (newFiles[0].type.startsWith("image")) {
        setActiveTab("image");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto"
    >
      <ConfigurationPanel
        onFilesAdded={handleFilesAdded}
        imageSettings={imageSettings}
        setImageSettings={setImageSettings}
        videoSettings={videoSettings}
        setVideoSettings={setVideoSettings}
        onConvert={startConversion}
        isConverting={isConverting}
        canConvert={files.some((f) => f.status === "idle")}
        isPickingColor={isPickingColor}
        setIsPickingColor={setIsPickingColor}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <PreviewPanel
        files={files}
        onRemoveFile={removeFile}
        imageSettings={imageSettings}
        setImageSettings={setImageSettings}
        videoSettings={videoSettings}
        isPickingColor={isPickingColor}
        setIsPickingColor={setIsPickingColor}
      />
    </motion.div>
  );
}
