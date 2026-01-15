"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAsyncQueuer } from "@tanstack/react-pacer";
import { toast } from "sonner";
import { uploadAndProcessImage, uploadAndProcessVideo } from "@/app/actions";
import { ImageConversionOptions, VideoConversionOptions } from "@/lib/schemas";
import { ProcessedFile } from "@/lib/types";

export function useMediaConverter() {
  const [files, setFiles] = useState<ProcessedFile[]>([]);

  const [imageSettings, setImageSettings] = useState<ImageConversionOptions>({
    format: "webp",
    quality: 80,
    removeBackground: false,
    threshold: 10,
    targetColor: "#00FF00",
  });

  const [videoSettings, setVideoSettings] = useState<VideoConversionOptions>({
    format: "mp4",
    muteAudio: false,
  });

  // Refs to access latest state inside async worker without re-creating it
  const imageSettingsRef = useRef(imageSettings);
  const videoSettingsRef = useRef(videoSettings);

  useEffect(() => {
    imageSettingsRef.current = imageSettings;
  }, [imageSettings]);

  useEffect(() => {
    videoSettingsRef.current = videoSettings;
  }, [videoSettings]);

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

      const isVideo = file.type.startsWith("video");
      const vSettings = videoSettingsRef.current;
      const iSettings = imageSettingsRef.current;

      if (isVideo) {
        formData.append("format", vSettings.format);
        if (vSettings.muteAudio) formData.append("muteAudio", "true");

        const result = await uploadAndProcessVideo(formData);
        if (!result.success) throw new Error(result.error);
        return result;
      } else {
        formData.append("format", iSettings.format);
        formData.append("quality", iSettings.quality.toString());
        if (iSettings.removeBackground) {
          formData.append("removeBackground", "true");
          formData.append("threshold", iSettings.threshold?.toString() || "10");
          formData.append("targetColor", iSettings.targetColor || "#00FF00");
        }

        const result = await uploadAndProcessImage(formData);
        if (!result.success) throw new Error(result.error);
        return result;
      }
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

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const processedFiles = newFiles.map((file) => ({
        file,
        status: "pending" as const,
        id: Math.random().toString(36).substring(7),
      }));

      setFiles((prev) => [...prev, ...processedFiles]);

      processedFiles.forEach((f) => {
        queue.addItem(f.file);
      });
    },
    [queue]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return {
    files,
    addFiles,
    removeFile,
    imageSettings,
    setImageSettings,
    videoSettings,
    setVideoSettings,
  };
}
