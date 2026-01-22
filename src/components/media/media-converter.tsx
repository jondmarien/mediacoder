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
    updateFileSettings,
    imageSettings,
    setImageSettings,
    videoSettings,
    setVideoSettings,
    startConversion,
    isConverting,
  } = useMediaConverter();

  const [isPickingColor, setIsPickingColor] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("image");

  const selectedFile = files.find((f) => f.id === selectedFileId) || null;

  const handleSetImageSettings = (newSettings: any) => {
    if (selectedFileId) {
      // Update specific file
      updateFileSettings(selectedFileId, newSettings);
    } else {
      // Update global defaults
      setImageSettings(newSettings);
    }
  };

  const handleSetVideoSettings = (newSettings: any) => {
    if (selectedFileId) {
      updateFileSettings(selectedFileId, newSettings);
    } else {
      setVideoSettings(newSettings);
    }
  };

  // Derived settings to pass to configuration panel
  // If a file is selected, show ITS settings. Otherwise global defaults.
  // Note: We need to ensure we merge with defaults if file settings are partial, but they are initialized fully in useMediaConverter.
  const currentImageSettings = selectedFile?.imageSettings || imageSettings;
  const currentVideoSettings = selectedFile?.videoSettings || videoSettings;

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

  const handleRemoveFile = (id: string) => {
    removeFile(id);
    if (selectedFileId === id) setSelectedFileId(null);
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
        imageSettings={currentImageSettings}
        setImageSettings={handleSetImageSettings}
        videoSettings={currentVideoSettings}
        setVideoSettings={handleSetVideoSettings}
        onConvert={startConversion}
        isConverting={isConverting}
        canConvert={files.some((f) => f.status === "idle")}
        isPickingColor={isPickingColor}
        setIsPickingColor={setIsPickingColor}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedFileName={selectedFile?.file.name}
      />
      <PreviewPanel
        files={files}
        onRemoveFile={handleRemoveFile}
        imageSettings={currentImageSettings}
        setImageSettings={handleSetImageSettings}
        videoSettings={currentVideoSettings}
        isPickingColor={isPickingColor}
        setIsPickingColor={setIsPickingColor}
        selectedFileId={selectedFileId}
        onSelectFile={setSelectedFileId}
      />
    </motion.div>
  );
}
