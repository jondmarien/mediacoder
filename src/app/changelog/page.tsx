import { ModeToggle } from "@/components/mode-toggle";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";

interface ChangelogPost {
  slug: string;
  title: string;
  date: string;
  version?: string;
  tags?: string[];
  content: string; // Raw MDX content
}

function getChangelogPosts(): ChangelogPost[] {
  const postsDirectory = path.join(process.cwd(), "src/app/changelog/posts");

  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const filenames = fs.readdirSync(postsDirectory);

  const posts = filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug: filename.replace(/\.mdx$/, ""),
      title: data.title,
      date: data.date,
      version: data.version,
      tags: data.tags || [],
      content,
    };
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

const components = {
  h1: (props: any) => (
    <h1
      className="mt-8 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
      {...props}
    />
  ),
  h2: (props: any) => (
    <h2
      className="mt-8 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
      {...props}
    />
  ),
  h3: (props: any) => (
    <h3
      className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight"
      {...props}
    />
  ),
  p: (props: any) => <p className="leading-7 not-first:mt-4" {...props} />,
  ul: (props: any) => (
    <ul className="my-4 ml-6 list-disc [&>li]:mt-2" {...props} />
  ),
  ol: (props: any) => (
    <ol className="my-4 ml-6 list-decimal [&>li]:mt-2" {...props} />
  ),
  li: (props: any) => <li className="" {...props} />,
  strong: (props: any) => (
    <strong className="font-bold text-foreground" {...props} />
  ),
  a: (props: any) => (
    <a
      className="font-medium text-primary underline underline-offset-4"
      {...props}
    />
  ),
  blockquote: (props: any) => (
    <blockquote
      className="mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground"
      {...props}
    />
  ),
};

export default function ChangelogPage() {
  const changelogs = getChangelogPosts();

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto relative">
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <h1 className="text-3xl font-semibold tracking-tight">
                Changelog
              </h1>
            </div>
            <ModeToggle />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-10 pb-20">
        <div className="relative">
          {changelogs.map((post) => {
            const formattedDate = formatDate(post.date);

            return (
              <div key={post.slug} className="relative group">
                <div className="flex flex-col md:flex-row gap-y-6">
                  {/* Left side - Date & Version */}
                  <div className="md:w-48 shrink-0">
                    <div className="md:sticky md:top-24 pb-10">
                      <time className="text-sm font-medium text-muted-foreground block mb-3">
                        {formattedDate}
                      </time>

                      <div className="flex flex-wrap gap-2">
                        {post.version && (
                          <div className="inline-flex relative z-10 items-center justify-center h-8 px-2 text-foreground border border-border rounded-lg text-sm font-bold bg-background">
                            {post.version}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Content */}
                  <div className="flex-1 md:pl-8 relative pb-10 border-l border-border md:border-l-0">
                    {/* Vertical timeline line - only visible on desktop to avoid clutter on mobile */}
                    <div className="hidden md:block absolute top-2 left-0 w-px h-full bg-border group-last:bg-linear-to-b group-last:from-border group-last:to-transparent">
                      {/* Timeline dot */}
                      <div className="hidden md:block absolute -translate-x-1/2 size-3 bg-primary rounded-full z-10 ring-4 ring-background" />
                    </div>

                    <div className="space-y-6 ml-6 md:ml-0">
                      <div className="relative z-10 flex flex-col gap-2">
                        <h2 className="text-2xl font-semibold tracking-tight text-balance">
                          {post.title}
                        </h2>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="h-6 w-fit px-2 text-xs font-medium bg-muted text-muted-foreground rounded-full border flex items-center justify-center"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-muted-foreground leading-relaxed">
                        <MDXRemote
                          source={post.content}
                          components={components}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
