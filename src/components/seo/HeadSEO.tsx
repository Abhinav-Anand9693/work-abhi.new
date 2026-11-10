import { useEffect } from "react";
import type { Tool } from "@/types/tool";
import type { Category } from "@/types/category";
import { siteConfig } from "@/config/site";

interface HeadSEOProps {
  currentPath: string;
  tool?: Tool | null;
  category?: Category | null;
}

export default function HeadSEO({ currentPath, tool, category }: HeadSEOProps) {
  useEffect(() => {
    const normalized = currentPath.replace(/\/+$/, "") || "/";
    const baseUrl = siteConfig.url;

    let pageTitle = "WorkAbhi - Free Everyday Web Tools | Fast & Private";
    let metaDescription = siteConfig.description;
    let canonicalPath = normalized;
    let ogType = "website";
    let schemaGraph: any[] = [];

    // Helper to build canonical URL
    const canonicalUrl = `${baseUrl}${canonicalPath === "/" ? "" : canonicalPath}`;

    // 1. Home
    if (normalized === "/" || normalized === "/home") {
      pageTitle = "WorkAbhi - Free Everyday Web Tools | Fast, Private & In-Browser";
      metaDescription =
        "Free suite of 280+ fast client-side tools for image compression, video trimming, PDF editing, financial calculators, developer converters, and security utilities. 100% private in your browser.";
      canonicalPath = "/";

      schemaGraph = [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "WorkAbhi",
          url: baseUrl,
          description: metaDescription,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${baseUrl}/tools?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "WorkAbhi",
          url: baseUrl,
          logo: `${baseUrl}/logo.png`,
          contactPoint: {
            "@type": "ContactPoint",
            email: "chotuchintu9693@gmail.com",
            contactType: "customer support",
          },
        },
      ];
    }
    // 2. All Tools
    else if (normalized === "/tools") {
      pageTitle = "Browse All Free Online Tools | WorkAbhi Directory";
      metaDescription =
        "Search and filter through 280+ free browser-based tools. Image compressors, PDF editors, financial calculators, encoders, and converters running locally on your device.";
      canonicalPath = "/tools";

      schemaGraph = [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "WorkAbhi Tools Directory",
          url: canonicalUrl,
          description: metaDescription,
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
            { "@type": "ListItem", position: 2, name: "Tools", item: canonicalUrl },
          ],
        },
      ];
    }
    // 3. Category Page
    else if (category) {
      pageTitle = `${category.name} - Free Online Tools | WorkAbhi`;
      metaDescription = `Free online ${category.name.toLowerCase()}. ${category.description} Client-side processing with zero server uploads and fast local performance.`;
      canonicalPath = `/tools/${category.id}`;

      schemaGraph = [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${category.name} | WorkAbhi`,
          url: canonicalUrl,
          description: metaDescription,
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
            { "@type": "ListItem", position: 2, name: "Tools", item: `${baseUrl}/tools` },
            { "@type": "ListItem", position: 3, name: category.name, item: canonicalUrl },
          ],
        },
      ];
    }
    // 4. Individual Tool Page
    else if (tool) {
      pageTitle = tool.seo?.title || `${tool.name} - Free Online Tool | WorkAbhi`;
      metaDescription =
        tool.seo?.description ||
        `${tool.name} - Free browser utility by WorkAbhi. ${tool.description} Fast client-side processing without uploading files to any server.`;
      canonicalPath = `/tool/${tool.id}`;
      ogType = "article";

      const toolSchema: any = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: tool.name,
        description: tool.seo?.description || tool.description,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "All modern web browsers",
        browserRequirements: "Requires HTML5, JavaScript, and modern browser APIs",
        url: canonicalUrl,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      };

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
          { "@type": "ListItem", position: 2, name: "Tools", item: `${baseUrl}/tools` },
          {
            "@type": "ListItem",
            position: 3,
            name: tool.category.charAt(0).toUpperCase() + tool.category.slice(1),
            item: `${baseUrl}/tools/${tool.category}`,
          },
          { "@type": "ListItem", position: 4, name: tool.name, item: canonicalUrl },
        ],
      };

      schemaGraph = [toolSchema, breadcrumbSchema];

      if (tool.seo?.faq && tool.seo.faq.length > 0) {
        schemaGraph.push({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: tool.seo.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        });
      }
    }
    // 5. Legal & Informational Pages
    else if (normalized === "/about") {
      pageTitle = "About WorkAbhi - Client-Side Architecture & Privacy Mission";
      metaDescription =
        "Discover WorkAbhi's mission to provide fast, reliable, and completely private web utilities. Learn how our browser-based client-side architecture protects user files.";
      canonicalPath = "/about";
      schemaGraph = [
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About WorkAbhi",
          url: canonicalUrl,
          description: metaDescription,
        },
      ];
    } else if (normalized === "/privacy") {
      pageTitle = "Privacy Policy - Zero-Upload Client-Side Architecture | WorkAbhi";
      metaDescription =
        "WorkAbhi Privacy Policy: Your files never leave your device. All image, video, audio, and PDF manipulations execute locally in browser memory with zero tracking.";
      canonicalPath = "/privacy";
    } else if (normalized === "/terms") {
      pageTitle = "Terms of Service - WorkAbhi Free Online Tools";
      metaDescription =
        "Read WorkAbhi terms of service. Understand license terms, ownership of processed files, service availability, and disclaimers for all tools.";
      canonicalPath = "/terms";
    } else if (normalized === "/contact") {
      pageTitle = "Contact WorkAbhi - Support, Feedback & Bug Reports";
      metaDescription =
        "Get in touch with the WorkAbhi team for support inquiries, feature recommendations, or bug reports. Direct contact via chotuchintu9693@gmail.com.";
      canonicalPath = "/contact";
    } else if (normalized === "/disclaimer") {
      pageTitle = "Disclaimer & Accuracy Notice - WorkAbhi";
      metaDescription =
        "Review WorkAbhi's disclaimer on calculator estimates, local processing results, tool availability, and file backup responsibilities.";
      canonicalPath = "/disclaimer";
    } else if (normalized === "/cookies" || normalized === "/cookie-policy") {
      pageTitle = "Cookie & Local Storage Policy - WorkAbhi";
      metaDescription =
        "WorkAbhi uses zero tracking cookies. Learn about our minimal localStorage preferences (theme and recent tools) and how to manage them.";
      canonicalPath = "/cookies";
    } else if (normalized === "/blog") {
      pageTitle = "WorkAbhi Blog - Web Performance & Privacy Tutorials";
      metaDescription =
        "Guides, performance deep dives, and tutorials on browser-based multimedia processing, modern Web APIs, and client-side privacy.";
      canonicalPath = "/blog";
    }

    // Apply Document Title
    document.title = pageTitle;

    // Helper to safely set or update meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement("meta");
        if (isProperty) {
          element.setAttribute("property", name);
        } else {
          element.setAttribute("name", name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Helper to set or update canonical link
    const setCanonical = (href: string) => {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    // Update Core Meta Tags
    setMeta("description", metaDescription);
    setCanonical(canonicalUrl);

    // Update OpenGraph
    setMeta("og:title", pageTitle, true);
    setMeta("og:description", metaDescription, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:type", ogType, true);

    // Update Twitter Cards
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", pageTitle);
    setMeta("twitter:description", metaDescription);

    // Update Structured Data JSON-LD
    let scriptTag = document.getElementById("workabhi-jsonld") as HTMLScriptElement | null;
    if (schemaGraph.length > 0) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = "workabhi-jsonld";
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(schemaGraph.length === 1 ? schemaGraph[0] : schemaGraph);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [currentPath, tool, category]);

  return null;
}
