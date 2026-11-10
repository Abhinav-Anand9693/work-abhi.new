import React, { useState, useMemo } from "react";
import Container from "@/components/layout/Container";
import Link from "next/link";
import { BLOG_POSTS, BlogPost } from "@/data/blogPosts";
import { BookOpen, Clock, Calendar, ArrowRight, Tag, Search, Sparkles } from "lucide-react";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    BLOG_POSTS.forEach((post) => set.add(post.category));
    return Array.from(set);
  }, []);

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="py-12 sm:py-20">
      <Container>
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>WORKABHI BLOG &amp; GUIDES</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground">
            Guides, Tutorials &amp; Engineering Insights
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Learn practical tips on image compression, video optimization, browser security,
            and how to streamline your digital workflows without uploading private files.
          </p>
        </div>

        {/* Search & Categories Bar */}
        <div className="mt-12 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
            />
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col justify-between p-7 rounded-3xl border border-border/80 bg-card/60 backdrop-blur hover:border-primary/50 hover:shadow-xl transition-all duration-300"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[11px]">
                    {post.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                  <span>•</span>
                  <span>{post.date}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>

                <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {post.summary}
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">By {post.author}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-bold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No articles found matching "{searchQuery}". Try another keyword or category.
          </div>
        )}
      </Container>
    </div>
  );
}
