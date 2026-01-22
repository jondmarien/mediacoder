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
import { removeBackground } from "@imgly/background-removal";

export function useMediaConverter() {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const [imageSettings, setImageSettings] = useState<ImageConversionOptions>({
    format: "webp",
    quality: 80,
    removeBackground: false,
    autoBackgroundRemoval: false,
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
        // Log for debugging format issue
        console.log("Processing image with settings:", iSettings);

        let fileToUpload = file;

        // Handle Auto AI Background Removal (Client-side)
        if (iSettings.removeBackground && iSettings.autoBackgroundRemoval) {
          if (file.type === "image/gif") {
            toast.warning(
              "Auto AI background removal does not support GIFs. Skipping.",
            );
            // Fallthrough to normal upload without processing
          } else {
            try {
              // Using public path or default
              const blob = await (removeBackground as any)(file, {
                progress: (key: any, current: any, total: any) => {
                  // Optional: could update progress via a side-channel or just let it spin
                },
              });

              // Convert blob to file with same name but png type (imgly outputs png/webp)
              fileToUpload = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, "") + ".png",
                { type: "image/png" },
              );

              // We do NOT set 'removeBackground' to true for the server, because we already removed it.
              // The server will just process format conversion / resizing.
            } catch (error) {
              console.error("Auto BG Removal failed:", error);

              // If specific error, show it
              if (
                error instanceof Error &&
                error.message.includes("Invalid format")
              ) {
                toast.error(`Auto BG failed: Unsupported format ${file.type}`);
              } else {
                toast.error("Failed to remove background automatically.");
              }
              // We stop here or fallthrough?
              // If it fails, we should probably stop or ask user.
              // Throwing error stops the queue for this file.
              throw new Error("Auto BG Removal failed processing this file.");
            }
          }
        }

        formData.set("file", fileToUpload); // Update file in formData
        formData.append("format", iSettings.format);
        formData.append("quality", iSettings.quality.toString());

        // Only append server-side removal params if we are in MANUAL mode
        if (iSettings.removeBackground && !iSettings.autoBackgroundRemoval) {
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
        const originalExt = file.name.split(".").pop()?.toUpperCase() || "FILE";
        const targetFormat = file.type.startsWith("video")
          ? videoSettingsRef.current.format.toUpperCase()
          : imageSettingsRef.current.format.toUpperCase();

        toast.success(
          `Converted from ${originalExt} to ${targetFormat} finished!`,
          { duration: 4000 },
        );
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
