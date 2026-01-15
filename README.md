# MediaCoder

A high-performance, privacy-focused media conversion tool built with **Next.js 16**, **Bun**, and server-side processing. MediaCoder allows you to convert images and videos, adjust quality, and remove backgrounds without relying on external AI APIs or client-side heavy lifting.

![MediaCoder Preview](/public/preview.png)

## 🚀 Features

-   **Secure Server-Side Processing**: Your files are processed securely on the server using `sharp` and `fluent-ffmpeg`, ensuring privacy and performance.
-   **No AI Gimmicks**: Robust, algorithmic background removal using Chroma Key / Color Thresholding logic.
-   **Broad Format Support**:
    -   **Images**: JPEG, PNG, WebP, AVIF, TIFF.
    -   **Videos**: MP4 (H.264), WebM (VP9).
-   **Advanced Settings**:
    -   Adjust image quality and dimensions.
    -   Remove image backgrounds with customizable color and threshold.
    -   Mute video audio.
    -   Select video codecs.
-   **Premium UI**:
    -   Modern, dark-mode-first aesthetics.
    -   Glassmorphism effects and smooth animations.
    -   Responsive design for mobile and desktop.
    -   Real-time progress tracking and file queue.

## 🛠️ Tech Stack

-   **Runtime**: [Bun](https://bun.sh/)
-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS v4, Shadcn UI, Lucide React
-   **State Management**: React Hooks, `@tanstack/react-pacer` (for queue management)
-   **Image Processing**: `sharp`
-   **Video Processing**: `fluent-ffmpeg` (requires `ffmpeg` binary)
-   **Fonts**: Geist Sans & Mono

## 📦 Installation & Setup

1.  **Prerequisites**:
    -   [Bun](https://bun.sh/) installed.
    -   [FFmpeg](https://ffmpeg.org/) installed and available in your system's PATH.

2.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/mediacoder.git
    cd mediacoder
    ```

3.  **Install dependencies**:
    ```bash
    bun install
    ```

4.  **Run the development server**:
    ```bash
    bun dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Architecture

-   **`src/app/actions.ts`**: Server Actions handling the core image and video processing logic.
-   **`src/hooks/use-media-converter.ts`**: Custom hook managing the file queue, upload state, and conversion settings.
-   **`src/components/media/`**:
    -   `media-converter.tsx`: Main container component.
    -   `configuration-panel.tsx`: Settings UI (Dropzone, Selects, Sliders).
    -   `preview-panel.tsx`: results display and queue management.
-   **`src/lib/`**:
    -   `image-processing.ts`: Sharp logic and manual pixel manipulation for background removal.
    -   `ffmpeg-helper.ts`: Fluent-ffmpeg wrapper.
    -   `schemas.ts`: Zod validation schemas and constants.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
