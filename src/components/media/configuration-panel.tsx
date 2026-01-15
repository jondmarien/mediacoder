"use client";

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
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageConversionOptions, VideoConversionOptions } from "@/lib/schemas";
import { FileDropzone } from "./file-dropzone";

interface ConfigurationPanelProps {
  onFilesAdded: (files: File[]) => void;
  imageSettings: ImageConversionOptions;
  setImageSettings: (settings: ImageConversionOptions) => void;
  videoSettings: VideoConversionOptions;
  setVideoSettings: (settings: VideoConversionOptions) => void;
}

export function ConfigurationPanel({
  onFilesAdded,
  imageSettings,
  setImageSettings,
  videoSettings,
  setVideoSettings,
}: ConfigurationPanelProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
        <CardDescription>
          Customize your media processing settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FileDropzone onFilesAdded={onFilesAdded} />

        <Tabs defaultValue="image" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="image">Image Settings</TabsTrigger>
            <TabsTrigger value="video">Video Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={imageSettings.format}
                  onValueChange={(val: any) =>
                    setImageSettings({ ...imageSettings, format: val })
                  }
                >
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
                <Label>Quality ({imageSettings.quality}%)</Label>
                <div className="pt-2">
                  <Slider
                    value={[imageSettings.quality]}
                    onValueChange={(vals) =>
                      setImageSettings({ ...imageSettings, quality: vals[0] })
                    }
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label>Background Removal</Label>
                <div className="text-[0.8rem] text-muted-foreground">
                  Remove solid background colors.
                </div>
              </div>
              <Switch
                checked={imageSettings.removeBackground}
                onCheckedChange={(checked) =>
                  setImageSettings({
                    ...imageSettings,
                    removeBackground: checked,
                  })
                }
              />
            </div>

            {imageSettings.removeBackground && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label>Target Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      className="w-12 h-9 p-1 cursor-pointer"
                      value={imageSettings.targetColor}
                      onChange={(e) =>
                        setImageSettings({
                          ...imageSettings,
                          targetColor: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="text"
                      className="flex-1 font-mono uppercase"
                      value={imageSettings.targetColor}
                      onChange={(e) => {
                        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                          setImageSettings({
                            ...imageSettings,
                            targetColor: e.target.value,
                          });
                        }
                      }}
                      maxLength={7}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Threshold ({imageSettings.threshold}%)</Label>
                  <div className="pt-2">
                    <Slider
                      value={[imageSettings.threshold || 10]}
                      onValueChange={(vals) =>
                        setImageSettings({
                          ...imageSettings,
                          threshold: vals[0],
                        })
                      }
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="video" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={videoSettings.format}
                  onValueChange={(val: any) =>
                    setVideoSettings({ ...videoSettings, format: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                    <SelectItem value="webm">WebM (VP9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label>Mute Audio</Label>
                <div className="text-[0.8rem] text-muted-foreground">
                  Remove audio track from video.
                </div>
              </div>
              <Switch
                checked={videoSettings.muteAudio}
                onCheckedChange={(checked) =>
                  setVideoSettings({ ...videoSettings, muteAudio: checked })
                }
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
