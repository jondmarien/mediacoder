"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface ConfigurationPanelProps {
  onFilesAdded: (files: File[]) => void;
}

export function ConfigurationPanel({ onFilesAdded }: ConfigurationPanelProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAdded(acceptedFiles);
    },
    [onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
    },
  });

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
        <CardDescription>
          Customize your media processing settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div className="space-y-2">
          <Label>Input (File)</Label>
          <div
            {...getRootProps()}
            className={cn(
              "relative group cursor-pointer flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed transition-all duration-300 ease-out",
              isDragActive
                ? "border-primary bg-primary/5 text-primary"
                : "border-muted-foreground/25 bg-muted/20 hover:bg-muted/50 hover:border-primary/50 text-muted-foreground"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <Upload className="w-6 h-6" />
              <p className="text-sm font-medium">
                {isDragActive ? "Drop file" : "Click to upload"}
              </p>
            </div>
          </div>
        </div>

        {/* Settings Placeholders */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Format (Image)</Label>
            <Select defaultValue="webp">
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webp">WebP</SelectItem>
                <SelectItem value="avif">AVIF</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quality</Label>
            <div className="pt-2">
              <Slider defaultValue={[80]} max={100} step={1} />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border text-xs text-muted-foreground">
          <p>
            More advanced settings (frame rate, bitrate, background removal
            color) coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
