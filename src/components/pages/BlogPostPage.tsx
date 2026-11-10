import React from "react";
import Container from "@/components/layout/Container";
import Link from "next/link";
import { BLOG_POSTS, BlogPost } from "@/data/blogPosts";
import {
  Clock,
  Calendar,
  ArrowLeft,
  Share2,
  Bookmark,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";

interface BlogPostPageProps {
  slug: string;
}

export default function BlogPostPage({ slug }: BlogPostPageProps) {
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <Container className="py-20 text-center">
        <h1 className="text-3xl font-bold">Article Not Found</h1>
        <p className="mt-3 text-muted-foreground text-sm">
          The guide you are looking for does not exist or has been relocated.
        </p>
        <Link
          href="/blog"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </Container>
    );
  }

  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <article className="py-12 sm:py-20">
      <Container className="max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Articles
          </Link>
        </div>

        {/* Post Header */}
        <header className="space-y-4 border-b border-border/80 pb-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold">
              {post.category}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {post.readTime}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{post.date}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {post.summary}
          </p>

          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <span>Written by <strong className="text-foreground">{post.author}</strong></span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Article link copied to clipboard!");
                  }
                }}
                className="inline-flex items-center gap-1 hover:text-foreground transition"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>
        </header>

        {/* Post Content */}
        <div className="mt-10 space-y-6 text-foreground leading-relaxed sm:text-lg">
          {post.content.map((paragraph, index) => {
            if (paragraph.startsWith("### ")) {
              return (
                <h2 key={index} className="text-2xl font-bold mt-10 mb-4 text-foreground">
                  {paragraph.replace("### ", "")}
                </h2>
              );
            }
            if (paragraph.startsWith("1. ") || paragraph.startsWith("2. ") || paragraph.startsWith("3. ")) {
              return (
                <div key={index} className="pl-4 border-l-2 border-primary/40 my-3 text-base text-muted-foreground">
                  <p>{paragraph}</p>
                </div>
              );
            }
            return (
              <p key={index} className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Direct Tool CTA */}
        {post.relatedToolId && (
          <div className="mt-12 p-6 sm:p-8 rounded-3xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary mb-1">
                <Zap className="w-3.5 h-3.5" /> Try This Tool Online For Free
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Use {post.relatedToolName || "this tool"} now
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                No upload caps, 100% in-browser processing, and multi-file support.
              </p>
            </div>
            <Link
              href={`/tool/${post.relatedToolId}`}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition shrink-0 inline-flex items-center gap-1.5"
            >
              Open Tool <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Read Next Section */}
        {otherPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border">
            <h3 className="text-xl font-bold text-foreground mb-6">Read More Guides</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {otherPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="p-5 rounded-2xl border border-border bg-card/60 hover:border-primary/40 transition block group"
                >
                  <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                    {p.category}
                  </span>
                  <h4 className="font-bold text-foreground mt-2 group-hover:text-primary transition-colors text-sm sm:text-base">
                    {p.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {p.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </article>
  );
}
