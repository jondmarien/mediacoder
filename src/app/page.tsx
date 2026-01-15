import MediaConverter from "@/components/media/media-converter";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 leading-relaxed font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-xl">
                M
              </span>
            </div>
            <span className="font-bold text-xl tracking-tight">MediaCoder</span>
          </div>
          <nav className="flex items-center space-x-2">
            <ModeToggle />
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://github.com/jondmarien/mediacoder"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                <GitHubIcon className="w-5 h-5 mr-2" />
                GitHub
              </a>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-4 md:p-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

        <div className="z-10 w-full flex flex-col items-center space-y-12">
          <div className="text-center space-y-4 pt-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight pb-2">
              Media Conversion
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Secure, server-side processing. No AI gimmicks.
            </p>
          </div>

          <MediaConverter />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 md:px-8 border-t bg-background/50 backdrop-blur">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <a
              href="https://github.com/jondmarien"
              className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
            >
              chron0
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
