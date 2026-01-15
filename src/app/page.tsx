import UploadZone from "@/components/media/upload-zone";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">
                M
              </span>
            </div>
            <span className="font-bold text-xl tracking-tight">MediaCoder</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </a>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-6 md:p-24 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />

        <div className="z-10 max-w-5xl w-full flex flex-col items-center space-y-16">
          <div className="text-center space-y-6 pt-10">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium text-muted-foreground mb-4 bg-muted/50 backdrop-blur">
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              v1.0 Beta Now Live
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60 pb-2">
              Transform Media
              <br />
              <span className="text-primary">Without Limits</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Secure, server-side processing for high-performance conversion.
              <br className="hidden md:block" />
              Raw computing power. No AI gimmicks.
            </p>
          </div>

          <UploadZone />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pt-12">
            <FeatureCard
              title="Universal Formats"
              desc="Convert between modern standards: AVIF, WebP, H.264, AV1 and more."
              icon="🔄"
            />
            <FeatureCard
              title="Privacy First"
              desc="Processed on secure servers with immediate deletion. No data training."
              icon="🛡️"
            />
            <FeatureCard
              title="Chroma Keying"
              desc="Clean background removal using precise color thresholding algorithms."
              icon="🎨"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 md:px-8 md:py-0 border-t bg-background/50 backdrop-blur">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <a href="#" className="font-medium underline underline-offset-4">
              Antigravity
            </a>
            . The source code is available on GitHub.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: string;
}) {
  return (
    <div className="group p-6 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
