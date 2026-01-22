"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAsyncQueuer } from "@tanstack/react-pacer";
import { toast } from "sonner";
import { uploadAndProcessImage, uploadAndProcessVideo } from "@/app/actions";
import {
  ImageConversionOptions,
  VideoConversionOptions,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
} from "@/lib/schemas";
import { ProcessedFile } from "@/lib/types";

export function useMediaConverter() {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);

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

  // Monitor files state to turn off isConverting
  useEffect(() => {
    if (isConverting) {
      const hasWork = files.some(
        (f) => f.status === "pending" || f.status === "processing",
      );
      if (!hasWork && files.length > 0) {
        setIsConverting(false);
      }
    }
  }, [files, isConverting]);

  const queue = useAsyncQueuer<File>(
    async (file) => {
      // Update status to processing
      setFiles((prev) =>
        prev.map((f) => {
          if (f.file === file) {
            return { ...f, status: "processing" };
          }
          return f;
        }),
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
              return { ...f, status: "completed" as const, result: res.data };
            }
            return f;
          }),
        );
        toast.success(`Processed ${file.name}`);
      },
      onError: (err, file) => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.file === file) {
              return { ...f, status: "error" as const, error: err.message };
            }
            return f;
          }),
        );
        toast.error(`Failed: ${file.name}`);
      },
    },
  );

  const startConversion = useCallback(() => {
    setIsConverting(true);

    // Find all idle files
    const filesToProcess = files.filter((f) => f.status === "idle");

    if (filesToProcess.length === 0) {
      setIsConverting(false);
      return;
    }

    // Update their status to pending visual feedback
    setFiles((prev) =>
      prev.map((f) => (f.status === "idle" ? { ...f, status: "pending" } : f)),
    );

    // Add them to the queue
    filesToProcess.forEach((f) => {
      queue.addItem(f.file);
    });
  }, [files, queue]);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles: File[] = [];

      newFiles.forEach((file) => {
        const isVideo = file.type.startsWith("video");

        if (isVideo) {
          if (
            !ACCEPTED_VIDEO_TYPES.includes(file.type) &&
            !file.type.endsWith("mkv")
          ) {
            // TODO:mkv often has inconsistent mime types in browser
            // Relaxed check for video types or add logic
          }
          if (file.size > MAX_VIDEO_SIZE) {
            toast.error(`File ${file.name} exceeds 100MB limit.`);
            return;
          }
        } else {
          // Strict check for images
          if (file.size > MAX_IMAGE_SIZE) {
            toast.error(`File ${file.name} exceeds 20MB limit.`);
            return;
          }
        }

        validFiles.push(file);
      });

      if (validFiles.length === 0) return;

      const processedFiles = validFiles.map((file) => ({
        file,
        status: "idle" as const, // Changed from pending to idle
        id: Math.random().toString(36).substring(7),
      }));

      setFiles((prev) => [...prev, ...processedFiles]);

      // Removed auto-queueing: processedFiles.forEach((f) => queue.addItem(f.file));
    },
    [queue],
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
    startConversion, // Expose this
    isConverting,
  };
}
