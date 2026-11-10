import React from "react";
import Container from "@/components/layout/Container";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Cpu,
  Lock,
  Globe2,
  HardDrive,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-20">
      <Container>
        {/* Header Hero */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ABOUT WORKABHI</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground">
            Fast, Private, Client-Side Tools for Everyday Work.
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-muted-foreground leading-relaxed">
            WorkAbhi was created to eliminate the frustration of slow cloud converters,
            artificial 10MB paywalls, and privacy risks. Everything you process on WorkAbhi runs
            100% locally inside your web browser.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">100% Private &amp; Local</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Your sensitive documents, confidential videos, and private photos never leave your device.
              They are never uploaded to any remote server or stored in any database.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Zero Arbitrary File Limits</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              No 5 MB or 10 MB caps. Compress 50 images at a time, trim gigabyte videos, and process
              thousand-page PDFs directly using your device's native hardware.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Web Worker Multi-Threading</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Intensive compression and formatting tasks run in dedicated background threads.
              Your main browser UI stays fluid, responsive, and locked at 60 FPS.
            </p>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl border border-primary/20 bg-gradient-to-b from-card via-card to-background shadow-xl">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              How WorkAbhi Compares to Traditional Online Converters
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A transparent comparison between browser-based processing and server-dependent alternatives.
            </p>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/80">
                  <th className="py-3 px-4 font-bold text-foreground">Feature</th>
                  <th className="py-3 px-4 font-bold text-primary">WorkAbhi</th>
                  <th className="py-3 px-4 font-bold text-muted-foreground">Standard Online Tools</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">File Privacy</td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Stays 100% on your device
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">Uploaded to remote cloud servers</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">File Size Limits</td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Unlimited (device hardware)
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">Restricted to 5MB - 25MB (paywalls)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">Upload &amp; Download Lag</td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Instant (Zero network transfer)
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">Slow upload &amp; waiting in queues</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">Batch Processing</td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Up to 50 files + ZIP download
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">Limited to 1-2 files per hour</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">Offline Capable</td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Works even without internet
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">Requires continuous internet</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical Architecture */}
        <div className="mt-20">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Our Technology Stack
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            We leverage cutting-edge browser specifications to perform tasks that used to require heavy servers.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-5 rounded-2xl border border-border bg-card">
              <div className="font-bold text-foreground">Web Workers Pool</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Offloads heavy CPU processing away from the main UI thread using transferable ArrayBuffers.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card">
              <div className="font-bold text-foreground">Web Audio API</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Decodes and synthesizes audio streams in milliseconds with hardware-accelerated filters.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card">
              <div className="font-bold text-foreground">OffscreenCanvas &amp; WebGL</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Performs high-resolution image manipulations, matrix convolutions, and batch exports.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card">
              <div className="font-bold text-foreground">WebCodecs &amp; MediaBunny</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Enables frame-accurate video trimming, audio demuxing, and fast transcode pipelines.
              </p>
            </div>
          </div>
        </div>

        {/* Operator & Transparency */}
        <div className="mt-20 p-8 rounded-3xl border border-border bg-card">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground">Operator &amp; Governance</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              WorkAbhi is maintained by an independent engineering project dedicated to building open, privacy-respecting
              web applications. We believe web software should perform useful work on your device without demanding unnecessary
              account registrations, tracking cookies, or file uploads.
            </p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              For security reports, feature requests, or inquiries regarding the platform, contact the operator directly at{" "}
              <a href="mailto:chotuchintu9693@gmail.com" className="font-mono text-primary font-semibold hover:underline">
                chotuchintu9693@gmail.com
              </a>.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center p-10 rounded-3xl bg-primary text-primary-foreground">
          <h2 className="text-2xl sm:text-4xl font-black">Ready to get your work done faster?</h2>
          <p className="mt-3 text-sm sm:text-base opacity-90 max-w-xl mx-auto">
            Explore all 280+ free browser tools with zero signup, zero watermarks, and complete privacy.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/tools"
              className="px-6 py-3 rounded-xl bg-background text-foreground font-bold text-sm shadow hover:opacity-90 transition"
            >
              Explore All 280+ Tools
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
