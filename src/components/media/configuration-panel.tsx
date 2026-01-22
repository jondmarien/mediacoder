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
import { Pipette, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import Sketch from "@uiw/react-color-sketch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ConfigurationPanelProps {
  onFilesAdded: (files: File[]) => void;
  imageSettings: ImageConversionOptions;
  setImageSettings: (settings: ImageConversionOptions) => void;
  videoSettings: VideoConversionOptions;
  setVideoSettings: (settings: VideoConversionOptions) => void;
  onConvert: () => void;
  isConverting: boolean;
  canConvert: boolean;
  isPickingColor: boolean;
  setIsPickingColor: (isPicking: boolean) => void;
}

export function ConfigurationPanel({
  onFilesAdded,
  imageSettings,
  setImageSettings,
  videoSettings,
  setVideoSettings,
  onConvert,
  isConverting,
  canConvert,
  isPickingColor,
  setIsPickingColor,
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
              <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex bg-muted p-1 rounded-lg">
                  <button
                    className={`flex-1 text-sm py-1.5 rounded-md transition-all ${
                      imageSettings.autoBackgroundRemoval
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:bg-background/50"
                    }`}
                    onClick={() =>
                      setImageSettings({
                        ...imageSettings,
                        autoBackgroundRemoval: true,
                      })
                    }
                  >
                    Auto (AI)
                  </button>
                  <button
                    className={`flex-1 text-sm py-1.5 rounded-md transition-all ${
                      !imageSettings.autoBackgroundRemoval
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:bg-background/50"
                    }`}
                    onClick={() =>
                      setImageSettings({
                        ...imageSettings,
                        autoBackgroundRemoval: false,
                      })
                    }
                  >
                    Manual (Color)
                  </button>
                </div>

                {!imageSettings.autoBackgroundRemoval && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Target Color</Label>
                      <div className="flex items-center gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <div
                              className="w-10 h-10 rounded border cursor-pointer shadow-sm"
                              style={{
                                backgroundColor: imageSettings.targetColor,
                              }}
                            />
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-none shadow-xl">
                            <Sketch
                              color={imageSettings.targetColor}
                              disableAlpha
                              onChange={(color) =>
                                setImageSettings({
                                  ...imageSettings,
                                  targetColor: color.hex.toUpperCase(),
                                })
                              }
                            />
                          </PopoverContent>
                        </Popover>

                        <div className="relative flex-1">
                          <Input
                            type="text"
                            className="font-mono uppercase pl-8"
                            value={imageSettings.targetColor}
                            onChange={(e) => {
                              if (/^#[0-9A-F]{0,6}$/i.test(e.target.value)) {
                                setImageSettings({
                                  ...imageSettings,
                                  targetColor: e.target.value,
                                });
                              }
                            }}
                            maxLength={7}
                          />
                          <div
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm border"
                            style={{
                              backgroundColor: imageSettings.targetColor,
                            }}
                          />
                        </div>

                        <Button
                          size="icon"
                          variant={isPickingColor ? "secondary" : "outline"}
                          onClick={() => setIsPickingColor(!isPickingColor)}
                          title="Pick color from preview"
                          className={
                            isPickingColor ? "animate-pulse border-primary" : ""
                          }
                        >
                          <Pipette className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Threshold ({imageSettings.threshold}%)</Label>
                      <div className="pt-2">
                        <Slider
                          value={[imageSettings.threshold ?? 10]}
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

                {imageSettings.autoBackgroundRemoval && (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    AI will automatically detect and remove the background.
                  </div>
                )}
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

        <div className="pt-2 border-t">
          <Button
            onClick={onConvert}
            disabled={!canConvert || isConverting}
            className="w-full"
            size="lg"
          >
            {isConverting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              "Convert All"
            )}
          </Button>
          {!canConvert && (
            <p className="text-center text-xs text-muted-foreground mt-2">
              Add files to start conversion
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
