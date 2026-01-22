import sharp from "sharp";

export interface ImageProcessOptions {
  buffer: Buffer;
  format: "jpeg" | "png" | "webp" | "avif" | "tiff";
  quality?: number;
  width?: number;
  height?: number;
  removeBackground?: {
    color: string; // Hex code, e.g., "#00FF00"
    threshold: number; // 0-100
  };
}

export async function processImage(
  options: ImageProcessOptions,
): Promise<Buffer> {
  let pipeline = sharp(options.buffer);

  // Metadata preservation
  pipeline = pipeline.keepMetadata();

  // Resize
  if (options.width || options.height) {
    pipeline = pipeline.resize(options.width, options.height, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Background Removal (Basic Chroma Key Implementation)
  if (options.removeBackground) {
    // NOTE: True "Magic Wand" usually happens on client (Canvas) for interactivity,
    // but doing it server-side "blindly" based on a hex code is possible:
    // 1. Get raw buffer.
    // 2. Iterate RGBA.
    // 3. Set Alpha to 0 if close to target color.

    // Ensure alpha channel exists before raw processing
    pipeline = pipeline.ensureAlpha();

    const { data, info } = await pipeline
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Parse target color
    const targetColor = hexToRgb(options.removeBackground.color);
    const threshold = options.removeBackground.threshold;

    // Modify buffer (simple CPU iterator)
    const newPixelData = removeBackgroundRaw(
      data,
      info.channels,
      targetColor,
      threshold,
    );

    pipeline = sharp(newPixelData, {
      raw: {
        width: info.width,
        height: info.height,
        channels: info.channels,
      },
    });
  }

  // Output formatting
  switch (options.format) {
    case "jpeg":
      return pipeline.jpeg({ quality: options.quality || 80 }).toBuffer();
    case "png":
      return pipeline.png({ quality: options.quality || 100 }).toBuffer();
    case "webp":
      return pipeline.webp({ quality: options.quality || 80 }).toBuffer();
    case "avif":
      return pipeline.avif({ quality: options.quality || 80 }).toBuffer();
    case "tiff":
      return pipeline.tiff({ quality: options.quality || 80 }).toBuffer();
    default:
      return pipeline.toBuffer();
  }
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 255, b: 0 }; // Default green
}

function removeBackgroundRaw(
  data: Buffer,
  channels: number,
  target: { r: number; g: number; b: number },
  threshold: number,
): Buffer {
  // Threshold is 0-100, normalize to 0-441 (max euclidean dist for RGB)
  // Max distance is sqrt(255^2 * 3) ≈ 441.67
  const distLimit = (threshold / 100) * 441.67;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.sqrt(
      Math.pow(r - target.r, 2) +
        Math.pow(g - target.g, 2) +
        Math.pow(b - target.b, 2),
    );

    if (dist <= distLimit) {
      if (channels === 4) {
        data[i + 3] = 0; // Set alpha to 0
      }
    }
  }
  return data;
}
