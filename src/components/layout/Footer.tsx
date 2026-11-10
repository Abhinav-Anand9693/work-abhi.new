import React from "react";
import Link from "next/link";
import Container from "./Container";
import { ShieldCheck, Heart, Sparkles, ExternalLink, Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/40 text-foreground transition-colors">
      <Container className="py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block text-2xl font-black tracking-tight text-foreground">
              Work<span className="text-primary">Abhi</span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              WorkAbhi is a free browser-first utilities platform. Compress multiple images in batches,
              trim &amp; convert videos, manage PDFs, and calculate finances—with zero file uploads.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 max-w-fit">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Zero-Upload Client Architecture</span>
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 max-w-fit">
                <Cpu className="w-4 h-4 shrink-0" />
                <span>Low-RAM Optimized &amp; Multithreaded</span>
              </div>
            </div>
          </div>

          {/* Popular Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Popular Tools
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/tool/image-compressor" className="hover:text-primary transition-colors">
                  Batch Image Compressor
                </Link>
              </li>
              <li>
                <Link href="/tool/video-compressor" className="hover:text-primary transition-colors">
                  Video Compressor
                </Link>
              </li>
              <li>
                <Link href="/tool/merge-pdf" className="hover:text-primary transition-colors">
                  Merge PDF Files
                </Link>
              </li>
              <li>
                <Link href="/tool/sip-calculator" className="hover:text-primary transition-colors">
                  SIP &amp; Investment Calc
                </Link>
              </li>
              <li>
                <Link href="/tool/qr-code-generator" className="hover:text-primary transition-colors">
                  QR Code Generator
                </Link>
              </li>
              <li>
                <Link href="/tools" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline pt-1">
                  Browse All 280+ Tools →
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Guides */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Company &amp; Guides
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Engineering Blog &amp; Guides
                </Link>
              </li>
              <li>
                <Link href="/blog/batch-image-compression-guide" className="hover:text-primary transition-colors text-xs text-muted-foreground/80">
                  ↳ Batch Image Guide
                </Link>
              </li>
              <li>
                <Link href="/blog/client-side-privacy-deep-dive" className="hover:text-primary transition-colors text-xs text-muted-foreground/80">
                  ↳ Zero-Upload Security
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Support &amp; Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Legal &amp; Privacy
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-primary transition-colors">
                  Disclaimer &amp; Accuracy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-primary transition-colors">
                  Cookie &amp; Storage Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom separator and copyright */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} WorkAbhi. All rights reserved. Client-side browser utilities.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/disclaimer" className="hover:text-foreground transition-colors">
              Disclaimer
            </Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">
              Cookies
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              Engineered with <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" /> for productivity
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}