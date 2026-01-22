import { FileVideo, FileImage, Loader2 } from "lucide-react";
import { ProcessedFile } from "@/lib/types";
import { useEffect, useRef, useState, useMemo } from "react";
import { ImageConversionOptions, VideoConversionOptions } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ActivePreviewProps {
  files?: ProcessedFile[]; // Add files prop
  activeFile: ProcessedFile | null;
  imageSettings?: ImageConversionOptions;
  videoSettings?: VideoConversionOptions;
  isPickingColor?: boolean;
  setIsPickingColor?: (isPicking: boolean) => void;
  setImageSettings?: (settings: ImageConversionOptions) => void;
}

const FUNNY_LOADING_MESSAGES = [
  "Reticulating splines...",
  "Summoning digital demons...",
  "Compressing pixels with a hydraulic press...",
  "Ordering pizza for the CPU...",
  "Counting backwards from infinity...",
  "Translating to binary and back...",
  "Feeding the hamsters...",
  "Dividing by zero (carefully)...",
  "Optimizing for 56k modems...",
  "Searching for the any button...",
];

export function ActivePreview({
  files = [],
  activeFile,
  imageSettings,
  videoSettings,
  isPickingColor,
  setIsPickingColor,
  setImageSettings,
}: ActivePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageBitmap, setImageBitmap] = useState<ImageBitmap | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(FUNNY_LOADING_MESSAGES[0]);

  // Cycle loading messages
  useEffect(() => {
    if (activeFile?.status === "processing") {
      const interval = setInterval(() => {
        setLoadingMsg(
          FUNNY_LOADING_MESSAGES[
            Math.floor(Math.random() * FUNNY_LOADING_MESSAGES.length)
          ],
        );
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [activeFile?.status]);

  // Calculate queue progress
  const queueStats = useMemo(() => {
    if (!files.length) return { current: 0, total: 0 };
    // Total batch is files that are NOT idle (meaning they were added to queue)
    // Or simpler: Total files in the current "session" of uploads?
    // Let's just use the current index of the active file relative to the whole list.
    const index = files.findIndex((f) => f.id === activeFile?.id);
    return {
      current: index + 1,
      total: files.length,
    };
  }, [files, activeFile]);

  // Load image when activeFile changes
  useEffect(() => {
    if (activeFile?.file && activeFile.file.type.startsWith("image")) {
      createImageBitmap(activeFile.file).then(setImageBitmap);
    } else {
      setImageBitmap(null);
    }
  }, [activeFile]);

  // Process and Draw Image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageBitmap) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Use natural size
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw original
    ctx.drawImage(imageBitmap, 0, 0);

    // Apply Real-time Background Removal if applicable
    if (
      imageSettings?.removeBackground &&
      !isPickingColor &&
      imageSettings.targetColor
    ) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const target = hexToRgb(imageSettings.targetColor);
      const threshold = imageSettings.threshold || 0;
      const distLimit = (threshold / 100) * 441.67;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean distance
        const dist = Math.sqrt(
          Math.pow(r - target.r, 2) +
            Math.pow(g - target.g, 2) +
            Math.pow(b - target.b, 2),
        );

        if (dist <= distLimit) {
          data[i + 3] = 0; // Transparent
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }
  }, [imageBitmap, imageSettings, isPickingColor]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (
      !isPickingColor ||
      !canvasRef.current ||
      !setImageSettings ||
      !setIsPickingColor
    )
      return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Calculate scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Boundary check
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

    setImageSettings({
      ...imageSettings!,
      targetColor: hex,
    });
    setIsPickingColor(false);

    navigator.clipboard.writeText(hex);
    toast.success(`Color copied: ${hex}`);
  };

  const isIdle =
    activeFile?.status === "idle" || activeFile?.status === "pending";

  const getSettingsLabel = () => {
    if (!activeFile) return null;
    if (activeFile.file.type.startsWith("video")) {
      return `${videoSettings?.format.toUpperCase()} ${
        videoSettings?.muteAudio ? "(Muted)" : ""
      }`;
    } else {
      let label = `${imageSettings?.format.toUpperCase()} ${
        imageSettings?.quality
      }%`;
      if (imageSettings?.removeBackground) label += " (BG Removed)";
      return label;
    }
  };

  return (
    <div className="flex-1 border rounded-lg bg-black/20 flex items-center justify-center overflow-hidden min-h-[300px] relative group h-full">
      {activeFile ? (
        <>
          {activeFile.file.type.startsWith("image") ? (
            <div
              className={`relative w-full h-full flex items-center justify-center ${isPickingColor ? "cursor-crosshair" : ""}`}
            >
              {/* Checkerboard background for transparency visibility */}
              <div
                className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    "conic-gradient(#808080 0.25turn, transparent 0.25turn 0.5turn, #808080 0.5turn 0.75turn, transparent 0.75turn)",
                  backgroundSize: "20px 20px",
                }}
              />
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="max-w-full max-h-full object-contain relative z-10"
              />
            </div>
          ) : (
            <div className="text-center">
              <FileVideo className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">{activeFile.file.name}</p>
            </div>
          )}

          {/* Overlay for Idle/Pending State */}
          {isIdle && !isPickingColor && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
              <Badge variant="secondary" className="mb-2">
                Pending Conversion
              </Badge>
              <div className="bg-background/80 backdrop-blur px-3 py-1.5 rounded text-xs font-mono">
                {getSettingsLabel()}
              </div>
            </div>
          )}

          {/* Overlay for Processing */}
          {activeFile.status === "processing" && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-30 pointer-events-none text-center p-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium text-white mb-1">
                {loadingMsg}
              </p>
              <p className="text-sm text-white/50">
                Processing file {queueStats.current} of {queueStats.total}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-muted-foreground">
          <FileImage className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>No file selected</p>
        </div>
      )}
    </div>
  );
}

// Helpers
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}
