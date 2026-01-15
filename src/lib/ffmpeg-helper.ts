import ffmpeg, { FfprobeData } from "fluent-ffmpeg";

// Ensure ffmpeg is available in path or configure here
// ffmpeg.setFfmpegPath('/path/to/ffmpeg');

export interface VideoConversionOptions {
  inputPath: string;
  outputPath: string;
  format: string;
  codec?: string;
  bitrate?: string;
  width?: number;
  height?: number;
}

export async function convertVideo(
  options: VideoConversionOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(options.inputPath)
      .output(options.outputPath)
      .toFormat(options.format);

    if (options.codec) {
      command = command.videoCodec(options.codec);
    }

    if (options.bitrate) {
      command = command.videoBitrate(options.bitrate);
    }

    if (options.width && options.height) {
      command = command.size(`${options.width}x${options.height}`);
    }

    command
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });
}

export async function getVideoMetadata(path: string): Promise<FfprobeData> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata);
    });
  });
}
