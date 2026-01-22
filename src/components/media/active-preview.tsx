import { FileVideo, FileImage, Loader2 } from "lucide-react";
import { ProcessedFile } from "@/lib/types";
import { useMemo } from "react";
import { ImageConversionOptions, VideoConversionOptions } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { ImageColorPicker } from "react-image-color-picker";

interface ActivePreviewProps {
  activeFile: ProcessedFile | null;
  imageSettings?: ImageConversionOptions;
  videoSettings?: VideoConversionOptions;
  isPickingColor?: boolean;
  setIsPickingColor?: (isPicking: boolean) => void;
  setImageSettings?: (settings: ImageConversionOptions) => void;
}

export function ActivePreview({
  activeFile,
  imageSettings,
  videoSettings,
  isPickingColor,
  setIsPickingColor,
  setImageSettings,
}: ActivePreviewProps) {
  const previewUrl = useMemo(() => {
    if (!activeFile) return null;
    if (activeFile.result) return activeFile.result;
    return URL.createObjectURL(activeFile.file);
  }, [activeFile]);

  const handleColorPick = (color: string) => {
    if (imageSettings && setImageSettings && setIsPickingColor) {
      setImageSettings({
        ...imageSettings,
        targetColor: color.toUpperCase(),
      });
      setIsPickingColor(false);
    }
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
            isPickingColor && previewUrl ? (
              <div className="w-full h-full flex items-center justify-center cursor-crosshair">
                <ImageColorPicker
                  onColorPick={handleColorPick}
                  imgSrc={previewUrl}
                  zoom={1}
                />
              </div>
            ) : (
              <img
                src={previewUrl || ""}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
            )
          ) : (
            <div className="text-center">
              <FileVideo className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">{activeFile.file.name}</p>
            </div>
          )}

          {/* Overlay for Idle/Pending State */}
          {isIdle && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-white font-medium">Processing...</p>
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
