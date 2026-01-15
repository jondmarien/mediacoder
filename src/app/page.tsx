import UploadZone from "@/components/media/upload-zone";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="z-10 max-w-5xl w-full flex flex-col items-center space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            MediaCoder
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Secure, private, and high-performance media conversion.
            <br className="hidden md:block" />
            No AI magic—just raw computing power.
          </p>
        </div>

        <UploadZone />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left">
          <FeatureCard
            title="Universal Formats"
            desc="Convert between modern standards: AVIF, WebP, H.264, AV1 and more."
          />
          <FeatureCard
            title="Privacy First"
            desc="Processed on secure servers with immediate deletion. No data training."
          />
          <FeatureCard
            title="Chroma Removing"
            desc="Clean background removal using precise color thresholding algorithms."
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl border bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-colors">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
