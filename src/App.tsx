import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import Hero from "@/components/home/hero";
import WhyWorkAbhi from "@/components/home/WhyWorkAbhi";
import PopularTools from "@/components/home/PopularTools";
import ExploreCategories from "@/components/home/ExploreCategories";
import HowItWorks from "@/components/home/HowItWork";
import PrivacySection from "@/components/home/PrivacySection";
import FinalCTA from "@/components/home/FinalCTA";
import ToolSearch from "@/components/tools/ToolSearch";
import ToolGrid from "@/components/tools/ToolGrid";
import ToolRunner from "@/components/tools/ToolRunner";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import HowToUse from "@/components/seo/HowToUse";
import FAQ from "@/components/seo/FAQ";
import RelatedTools from "@/components/seo/RelatedTools";
import HeadSEO from "@/components/seo/HeadSEO";
import ToolTechnicalDetails from "@/components/seo/ToolTechnicalDetails";
import AboutPage from "@/components/pages/AboutPage";
import BlogPage from "@/components/pages/BlogPage";
import BlogPostPage from "@/components/pages/BlogPostPage";
import PrivacyPage from "@/components/pages/PrivacyPage";
import TermsPage from "@/components/pages/TermsPage";
import ContactPage from "@/components/pages/ContactPage";
import DisclaimerPage from "@/components/pages/DisclaimerPage";
import CookiePage from "@/components/pages/CookiePage";
import { categories } from "@/config/categories";
import { getToolById, getToolsByCategory } from "@/lib/toolRegistry";
import { getRelatedTools } from "@/lib/relatedTools";
import { searchTools } from "@/lib/toolSearch";
import {
  Search,
  Sparkles,
  Zap,
  ShieldCheck,
  Moon,
  Sun,
  X,
  ArrowRight,
  Compass,
  Cpu,
} from "lucide-react";

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === "undefined") return "/";
    const hash = window.location.hash.replace(/^#/, "");
    if (hash) return hash;
    return window.location.pathname || "/";
  });

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      localStorage.getItem("workabhi-theme") === "dark" ||
      (!localStorage.getItem("workabhi-theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  // Dark mode effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("workabhi-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("workabhi-theme", "light");
    }
  }, [isDark]);

  // Handle custom navigation and browser popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace(/^#/, "");
      const path = hash || window.location.pathname || "/";
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCustomNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{ href: string; replace?: boolean }>;
      const href = customEvent.detail?.href;
      if (!href) return;

      if (customEvent.detail.replace) {
        window.history.replaceState({}, "", href);
      } else {
        window.history.pushState({}, "", href);
      }
      setCurrentPath(href);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSearchModalOpen(false);
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("workabhi-navigate", handleCustomNavigate);

    // Global keyboard shortcut for quick search: Ctrl+K / Cmd+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("workabhi-navigate", handleCustomNavigate);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Filtered tools for search modal
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchTools(searchQuery).slice(0, 8);
  }, [searchQuery]);

  // Active tool and category for dynamic SEO
  const activeCategory = useMemo(() => {
    const match = currentPath.replace(/\/+$/, "").match(/^\/tools\/([a-zA-Z0-9_-]+)$/);
    if (!match) return null;
    return categories.find((c) => c.id === match[1]) || null;
  }, [currentPath]);

  const activeTool = useMemo(() => {
    const match = currentPath.replace(/\/+$/, "").match(/^\/tool\/([a-zA-Z0-9_-]+)$/);
    if (!match) return null;
    return getToolById(match[1]) || null;
  }, [currentPath]);

  // Route dispatcher
  const routeContent = useMemo(() => {
    const normalized = currentPath.replace(/\/+$/, "") || "/";

    // 1. Home
    if (normalized === "/" || normalized === "/home") {
      return (
        <>
          <Hero />
          <WhyWorkAbhi />
          <PopularTools />
          <ExploreCategories />
          <HowItWorks />
          <PrivacySection />
          <FinalCTA />
        </>
      );
    }

    // 2. All Tools (/tools)
    if (normalized === "/tools") {
      return (
        <Container className="py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EXPLORE ALL 280+ TOOLS</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Free Everyday Web Tools
            </h1>
            <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Every tool runs 100% locally in your browser. Zero file-size restrictions,
              low-RAM optimized algorithms, and live real-time progress with realistic time remaining.
            </p>
          </div>
          <div className="mt-10">
            <ToolSearch />
          </div>
        </Container>
      );
    }

    // 2a. About Us (/about)
    if (normalized === "/about") {
      return <AboutPage />;
    }

    // 2b. Blog Listing (/blog)
    if (normalized === "/blog") {
      return <BlogPage />;
    }

    // 2c. Blog Post (/blog/:slug)
    const blogMatch = normalized.match(/^\/blog\/([a-zA-Z0-9_-]+)$/);
    if (blogMatch) {
      return <BlogPostPage slug={blogMatch[1]} />;
    }

    // 2d. Privacy Policy (/privacy)
    if (normalized === "/privacy") {
      return <PrivacyPage />;
    }

    // 2e. Terms of Service (/terms)
    if (normalized === "/terms") {
      return <TermsPage />;
    }

    // 2f. Contact Us (/contact)
    if (normalized === "/contact") {
      return <ContactPage />;
    }

    // 2g. Disclaimer (/disclaimer)
    if (normalized === "/disclaimer") {
      return <DisclaimerPage />;
    }

    // 2h. Cookie Policy (/cookies)
    if (normalized === "/cookies" || normalized === "/cookie-policy") {
      return <CookiePage />;
    }

    // 3. Category (/tools/[category])
    const categoryMatch = normalized.match(/^\/tools\/([a-zA-Z0-9_-]+)$/);
    if (categoryMatch) {
      const categoryId = categoryMatch[1];
      const categoryItem = categories.find((c) => c.id === categoryId);

      if (categoryItem) {
        const categoryTools = getToolsByCategory(categoryItem.id as any);
        const categoryBreadcrumb = [
          { name: "Home", href: "/" },
          { name: "Tools", href: "/tools" },
          { name: categoryItem.name, href: `/tools/${categoryItem.id}` },
        ];
        return (
          <Container className="py-12 sm:py-16">
            <Breadcrumbs items={categoryBreadcrumb} />
            <div className="max-w-3xl mt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-3">
                <Compass className="w-3.5 h-3.5" />
                <span>{categoryItem.name.toUpperCase()} SUITE</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                {categoryItem.name}
              </h1>
              <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
                {categoryItem.description}
              </p>
            </div>
            <div className="mt-10">
              <ToolGrid tools={categoryTools} />
            </div>
          </Container>
        );
      }
    }

    // 4. Individual Tool (/tool/[id])
    const toolMatch = normalized.match(/^\/tool\/([a-zA-Z0-9_-]+)$/);
    if (toolMatch) {
      const toolId = toolMatch[1];
      const tool = getToolById(toolId);

      if (tool) {
        const related = getRelatedTools(tool);
        const breadcrumbItems = [
          { name: "Home", href: "/" },
          { name: "Tools", href: "/tools" },
          {
            name: tool.category.charAt(0).toUpperCase() + tool.category.slice(1),
            href: `/tools/${tool.category}`,
          },
          { name: tool.name, href: `/tool/${tool.id}` },
        ];

        return (
          <Container className="py-8 sm:py-12">
            <Breadcrumbs items={breadcrumbItems} />

            <header className="mt-6 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary capitalize">
                  {tool.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Local In-Browser Processing
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full">
                  <Cpu className="w-3 h-3" />
                  Low-RAM Optimized
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                {tool.name}
              </h1>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                {tool.seo.intro ?? tool.description}
              </p>
            </header>

            <div className="mt-8">
              <ToolRunner tool={tool} />
            </div>

            <ToolTechnicalDetails tool={tool} />

            {tool.seo.howToUse && tool.seo.howToUse.length > 0 && (
              <HowToUse steps={tool.seo.howToUse} />
            )}

            {tool.seo.faq && tool.seo.faq.length > 0 && (
              <FAQ items={tool.seo.faq} />
            )}

            <RelatedTools tools={related} />
          </Container>
        );
      }
    }

    // 5. 404 Not Found fallback
    return (
      <Container className="py-20 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-destructive/10 text-destructive">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Tool or Page Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The tool or page you requested could not be located. Browse all our 280+ free browser tools below.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                window.history.pushState({}, "", "/tools");
                setCurrentPath("/tools");
              }}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow hover:opacity-90 transition"
            >
              Browse All Tools
            </button>
            <button
              onClick={() => {
                window.history.pushState({}, "", "/");
                setCurrentPath("/");
              }}
              className="px-5 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </Container>
    );
  }, [currentPath]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <HeadSEO currentPath={currentPath} tool={activeTool} category={activeCategory} />

      <Navbar />

      {/* Floating Theme and Search Buttons in header bar */}
      <div className="sticky top-16 z-40 bg-card/60 backdrop-blur border-b border-border/50 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border/80 bg-background/80 hover:bg-muted text-xs text-muted-foreground transition shadow-sm w-full max-w-xs"
          >
            <Search className="w-3.5 h-3.5 text-primary" />
            <span className="truncate">Search 280+ tools...</span>
            <kbd className="ml-auto hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-muted border border-border rounded font-mono">
              Ctrl+K
            </kbd>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                window.history.pushState({}, "", "/tools");
                setCurrentPath("/tools");
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition hidden sm:inline-flex items-center gap-1"
            >
              All Tools <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsDark((prev) => !prev)}
              aria-label="Toggle theme"
              className="p-1.5 rounded-xl border border-border/80 bg-background/80 hover:bg-muted text-foreground transition"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Routed Content */}
      <main className="flex-1">{routeContent}</main>

      <Footer />

      {/* Quick Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center px-4 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g., compress image, trim video, emi, pdf)..."
                className="w-full px-3 py-3.5 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 max-h-[60vh] overflow-y-auto divide-y divide-border/40">
              {searchResults.length > 0 ? (
                searchResults.map((tool, index) => (
                  <button
                    key={`${tool.id}-${tool.category ?? index}`}
                    onClick={() => {
                      window.history.pushState({}, "", `/tool/${tool.id}`);
                      setCurrentPath(`/tool/${tool.id}`);
                      setSearchModalOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-muted/80 flex items-center justify-between gap-3 transition"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{tool.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary capitalize font-medium">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))
              ) : searchQuery.trim() ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No tools found matching "{searchQuery}".
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Type to instantly search all 280+ tools. Press <kbd className="px-1 bg-muted rounded border">Esc</kbd> to close.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
