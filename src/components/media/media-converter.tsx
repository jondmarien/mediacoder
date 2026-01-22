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
  const [isIndividualMode, setIsIndividualMode] = useState(false);

  // Clear selection when mode is disabled
  const handleModeChange = (enabled: boolean) => {
    setIsIndividualMode(enabled);
    if (!enabled) setSelectedFileId(null);
  };

  const selectedFile = isIndividualMode
    ? files.find((f) => f.id === selectedFileId) || null
    : null;

  // Derived settings to pass to configuration panel
  // If a file is selected, show ITS settings (merged with global for completeness). Otherwise global defaults.
  // Note: We intentionally fallback to imageSettings (global) if selectedFile.imageSettings is missing (inheritance).
  // But for the UI controls, we want the "effective" settings.
  const currentImageSettings = selectedFile?.imageSettings || imageSettings;
  const currentVideoSettings = selectedFile?.videoSettings || videoSettings;

  const handleSetImageSettings = (newSettings: any) => {
    if (selectedFileId && isIndividualMode) {
      // Forking: Take global defaults, merge with any existing file settings, then apply new.
      // We must fully materialize the settings object on the file now.
      const merged = {
        ...imageSettings,
        ...(selectedFile?.imageSettings || {}),
        ...newSettings,
      };
      updateFileSettings(selectedFileId, merged);
    } else {
      setImageSettings(newSettings);
    }
  };

  const handleSetVideoSettings = (newSettings: any) => {
    if (selectedFileId && isIndividualMode) {
      const merged = {
        ...videoSettings,
        ...(selectedFile?.videoSettings || {}),
        ...newSettings,
      };
      updateFileSettings(selectedFileId, merged);
    } else {
      setVideoSettings(newSettings);
    }
  };

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

  const handleSelectFile = (id: string | null) => {
    if (!isIndividualMode && id) return; // Prevent selection if mode is off
    setSelectedFileId(id);
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
        isIndividualMode={isIndividualMode}
        onToggleMode={handleModeChange}
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
        onSelectFile={handleSelectFile}
        isIndividualMode={isIndividualMode}
      />
    </motion.div>
  );
}
