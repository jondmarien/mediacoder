import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileVideo, FileImage, Download, X, Archive } from "lucide-react";
import { ProcessedFile } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { ImageConversionOptions, VideoConversionOptions } from "@/lib/schemas";
import JSZip from "jszip";
import { toast } from "sonner";

interface PreviewQueueListProps {
  files: ProcessedFile[];
  onRemoveFile: (id: string) => void;
  imageSettings: ImageConversionOptions;
  videoSettings: VideoConversionOptions;
  selectedFileId?: string | null;
  onSelectFile?: (id: string | null) => void;
}

export function PreviewQueueList({
  files,
  onRemoveFile,
  imageSettings,
  videoSettings,
  selectedFileId,
  onSelectFile,
}: PreviewQueueListProps) {
  const getDisplayFilename = (file: ProcessedFile) => {
    if (file.status === "completed" && file.outputFilename) {
      return file.outputFilename;
    }

    const originalName = file.file.name;
    const nameWithoutExt = originalName.substring(
      0,
      originalName.lastIndexOf("."),
    );
    const isVideo = file.file.type.startsWith("video");

    // Use file specific settings if available (from creation time), else fallback to current global
    const fileTargetFormat = isVideo
      ? file.videoSettings?.format || videoSettings.format
      : file.imageSettings?.format || imageSettings.format;

    return `${nameWithoutExt}.${fileTargetFormat}`;
  };

  const completedFiles = files.filter(
    (f) => f.status === "completed" && f.result,
  );

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const toastId = toast.loading("Creating zip archive...");

    try {
      // Add files to zip
      completedFiles.forEach((file) => {
        if (file.result && file.outputFilename) {
          // Remove data URL prefix to get base64
          const base64Data = file.result.split(",")[1];
          zip.file(file.outputFilename, base64Data, { base64: true });
        }
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mediacoder-batch-${new Date().getTime()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Zip archive downloaded", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create zip", { id: toastId });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">
          Queue ({files.length})
        </h4>
        {completedFiles.length > 2 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadZip}
            className="h-8 gap-2 bg-background border-dashed hover:border-solid transition-all"
          >
            <Archive className="w-3 h-3" />
            Download as Zip
          </Button>
        )}
      </div>
      <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        <AnimatePresence initial={false} mode="popLayout">
          {files.map((file) => {
            const displayName = getDisplayFilename(file);
            const isSelected = file.id === selectedFileId;

            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelectFile?.(file.id)}
                className={`flex items-center justify-between p-3 rounded-md border text-sm overflow-hidden cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-primary/10 border-primary"
                    : "bg-muted/40 border-transparent hover:bg-muted/60"
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  {file.file.type.startsWith("video") ? (
                    <FileVideo
                      className={`w-4 h-4 shrink-0 ${isSelected ? "text-primary" : "text-blue-500"}`}
                    />
                  ) : (
                    <FileImage
                      className={`w-4 h-4 shrink-0 ${isSelected ? "text-primary" : "text-purple-500"}`}
                    />
                  )}
                  <span
                    className="truncate max-w-[200px] md:max-w-[300px] font-medium"
                    title={displayName}
                  >
                    {displayName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      file.status === "completed" ? "default" : "secondary"
                    }
                    className="text-[10px] h-5 capitalize"
                  >
                    {file.status}
                  </Badge>
                  {file.status === "completed" && file.result && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 hover:text-primary transition-colors"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={file.result} download={displayName}>
                        <Download className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(file.id);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
