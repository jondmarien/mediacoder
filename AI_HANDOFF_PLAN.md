# MediaCoder - AI Agent Support Plan

**Objective**: Build a high-performance, web-based image and video converter using Next.js 16 and server-side processing.

## 🏗️ Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Shadcn UI
- **State/Data**: `@tanstack/react-query`, `@tanstack/react-form`, `zod`
- **Image Processing**: `sharp` (Server-side)
- **Video Processing**: `fluent-ffmpeg` (Server-side) requiring `ffmpeg` binary
- **Icons**: `lucide-react`

## 🎯 Features

### Service: `mediaeditor.chron0.tech`

1.  **Image Converter**:
    *   Formats: JPEG, PNG, WebP, AVIF, GIF, etc.
    *   Features: Quality/compression slider, Resizing.
    *   Tech: `sharp` in Server Actions.

2.  **Video Converter**:
    *   Formats: MP4, WebM, AVI, etc.
    *   Codecs: H.264, VP9, AV1.
    *   Features: Bitrate control, Audio codec selection.
    *   Tech: `fluent-ffmpeg` (Server Actions) or `ffmpeg.wasm` (Client-side fallback if server limits are hit).
    *   *Note*: For Vercel deployment, long-running FFmpeg processes may time out. Consider `ffmpeg.wasm` for client-side processing as a robust alternative.

3.  **UI/UX**:
    *   Drag & Drop File Upload.
    *   Real-time progress bars.
    *   Dark Mode default.
    *   Responsive mobile design.

## 🛠️ Implementation Steps for the Agent

### Phase 1: Setup
1.  Initialize project: `bun create next-app . --typescript --tailwind --eslint`.
    *   *Note*: Ensure Tailwind v4 setup (or standard v3 if v4 is unstable, but user prefers modern).
2.  Install dependencies:
    *   `bun add sharp fluent-ffmpeg zod @tanstack/react-query @tanstack/react-form lucide-react clsx tailwind-merge`
    *   `bun add -d @types/fluent-ffmpeg`
3.  Setup Shadcn UI (or manual component copy).

### Phase 2: Core Architecture
1.  **File Structure**:
    ```
    app/
      page.tsx          // Landing & Upload
      actions.ts        // Server Actions (Image/Video processing)
      api/              // Route Handlers (if needed for streaming)
    components/
      media/
        upload-zone.tsx
        conversion-form.tsx
        progress-bar.tsx
    lib/
      utils.ts
      ffmpeg-helper.ts  // Logic for spawning ffmpeg
    ```
2.  **Server Config**: Ensure `ffmpeg` binary is available in the environment or use a buildpack if deploying to Vercel (or switch to `ffmpeg.wasm`).

### Phase 3: Development
1.  [x] Build `UploadZone` with drag-and-drop.
2.  [x] Implement `ImageConversion` server action using `sharp`.
3.  [x] Implement `VideoConversion`.
4.  [x] Add Zod schemas for validation (file size, type, settings).
5.  [x] Implement client-side validation in `useMediaConverter`.

### Phase 4: UI Polish
1.  Apply "Premium" aesthetics: Dark mode, glassmorphism, smooth animations (`framer-motion` or CSS).
2.  Ensure mobile responsiveness.

## 🤖 Agent Instructions (MCP Usage)

- **Use MCP Servers**:
    - `context7` & `exa`: For looking up latest docs on `sharp`, `fluent-ffmpeg`, or Next.js 16 features.
    - `find_by_name` / `grep_search`: For navigating the codebase.
- **Constraints**:
    - **No external AI APIs**.
    - **No localStorage** (unless strictly needed for preferences).
    - **Strict TypeScript**.

## 🚀 Getting Started

```bash
cd mediacoder
bun install
bun dev
```
