import React from "react";
import type { Tool } from "@/types/tool";
import { ShieldCheck, Cpu, HardDrive, FileCheck, Layers, HelpCircle, CheckCircle2, AlertCircle } from "lucide-react";

interface ToolTechnicalDetailsProps {
  tool: Tool;
}

export default function ToolTechnicalDetails({ tool }: ToolTechnicalDetailsProps) {
  // Determine realistic default specifications by category if not explicitly provided
  const getFormatSpecs = () => {
    if (tool.seo.supportedFormats) {
      return tool.seo.supportedFormats;
    }
    switch (tool.category) {
      case "image":
        return {
          input: ["JPEG (.jpg, .jpeg)", "PNG (.png)", "WebP (.webp)", "GIF (.gif)", "SVG (.svg)", "BMP (.bmp)"],
          output: ["WebP", "JPEG", "PNG", "Original format"],
        };
      case "video":
        return {
          input: ["MP4", "WebM", "MOV", "MKV (browser-supported codecs)"],
          output: ["MP4 (H.264/AAC)", "WebM (VP8/VP9)", "GIF animation", "PNG frame"],
        };
      case "audio":
        return {
          input: ["MP3", "WAV", "OGG", "AAC", "M4A", "FLAC"],
          output: ["MP3", "WAV", "AAC"],
        };
      case "pdf":
        return {
          input: ["PDF (.pdf)", "Images (.jpg, .png) for PDF builder"],
          output: ["Optimized PDF", "Extracted PNG/JPEG images"],
        };
      case "developer":
      case "text":
        return {
          input: ["JSON", "XML", "YAML", "CSV", "Markdown", "Plain Text", "Base64"],
          output: ["Formatted JSON", "Parsed CSV/YAML", "Encoded/Decoded text", "HTML"],
        };
      case "qr":
        return {
          input: ["URLs", "Plain text", "vCard", "Wi-Fi credentials", "Email addresses", "Image scan (PNG, JPG)"],
          output: ["High-res SVG", "PNG barcode/QR code"],
        };
      case "security":
        return {
          input: ["Text strings", "Passphrases", "Custom character configurations", "Cryptographic keys"],
          output: ["SHA-256", "SHA-512", "MD5", "UUID v4", "High-entropy Passwords", "HMAC"],
        };
      case "calculator":
      case "date-time":
        return {
          input: ["Numeric amounts", "Interest rates", "Dates & timestamps", "Time zones"],
          output: ["Amortization breakdown", "Target returns", "Date differences", "Formatted time strings"],
        };
      default:
        return {
          input: ["Standard modern web data formats"],
          output: ["Computed results & downloadable files"],
        };
    }
  };

  const formats = getFormatSpecs();

  // Engine architectural explanation
  const getEngineArchitecture = () => {
    if (tool.seo.technicalSpecs) return tool.seo.technicalSpecs;
    switch (tool.category) {
      case "image":
        return "Executes via the HTML5 2D Canvas API and background Web Workers with OffscreenCanvas where supported. Images are decoded into memory, manipulated using pixel-level transformations or bicubic resampling, and re-encoded locally.";
      case "video":
        return "Powered by client-side WebCodecs and container remuxing algorithms. Video streams are decoded and edited locally in your browser thread, avoiding any cloud upload bottlenecks.";
      case "audio":
        return "Utilizes the Web Audio API (AudioContext) and Mediabunny AAC/MP3 encoders. Audio waveforms are decoded into raw PCM audio buffers and processed with zero server interaction.";
      case "pdf":
        return "Powered by PDF-Lib and PDF.js running in pure JavaScript. Document structures, page dictionaries, and stream objects are reconstructed directly in client memory.";
      case "security":
        return "Utilizes the W3C Web Cryptography API (`window.crypto.subtle`) and cryptographically secure pseudorandom number generator (`window.crypto.getRandomValues`). Sensitive hashes and keys never cross the network.";
      case "developer":
      case "text":
        return "Processes structured syntax using client-side JavaScript parsers and abstract syntax trees (ASTs). Formatting, encoding, and schema transformations execute synchronously in your browser.";
      default:
        return "High-performance client-side JavaScript routines executed inside your browser's V8 or JavaScriptCore runtime engine.";
    }
  };

  // Limitations
  const getLimitations = () => {
    if (tool.seo.limitations) return tool.seo.limitations;
    switch (tool.category) {
      case "video":
        return "Very large 4K video files depend on your device's available browser RAM and GPU hardware acceleration. For optimal performance, keep other heavy browser tabs closed during processing.";
      case "image":
        return "Batch processing allows up to 50 images concurrently. Extremely large images (>50 Megapixels) may temporarily require additional browser memory during canvas canvas allocation.";
      case "pdf":
        return "Encrypted PDFs with password restrictions must be unlocked before merging or splitting. File operations are bound by local device memory.";
      case "audio":
        return "Supports browser-decodable audio formats. Long recordings (over 2 hours) may take a few seconds to decode into PCM memory.";
      default:
        return "Performance is bounded by your device's CPU and memory, ensuring complete privacy with no cloud file caps.";
    }
  };

  // Features list
  const getFeatures = () => {
    if (tool.seo.features && tool.seo.features.length > 0) return tool.seo.features;
    return [
      "100% In-Browser Execution: Zero bytes sent to external cloud servers.",
      "Instant Processing: No queue delays, bandwidth limits, or upload waits.",
      "Live Realistic Progress: Monotonic ETA countdown system prevents time fluctuations.",
      "Privacy by Design: Files remain strictly in your device's temporary memory.",
      "No Registration Required: Free unlimited access without creating an account.",
    ];
  };

  // Real Use Cases
  const getUseCases = () => {
    if (tool.seo.useCases && tool.seo.useCases.length > 0) return tool.seo.useCases;
    switch (tool.category) {
      case "image":
        return [
          "Optimizing image files for website loading speed and SEO benchmarks.",
          "Preparing profile photos and banners for social media platforms.",
          "Converting modern formats like WebP or AVIF to universal PNG/JPEG.",
          "Batch compression for email attachments and online forms.",
        ];
      case "security":
        return [
          "Generating cryptographically secure, high-entropy passwords for accounts.",
          "Verifying software download integrity using SHA-256 and MD5 checksums.",
          "Inspecting and debugging JWT payloads without leaking secret tokens.",
          "Generating valid UUID v4 identifiers for database and API development.",
        ];
      case "calculator":
        return [
          "Planning monthly home or car loan EMIs before visiting lending institutions.",
          "Simulating long-term compound growth for SIP and mutual fund investments.",
          "Computing accurate date differences for project milestones and deadlines.",
          "Calculating percentage increases and discount margins for retail sales.",
        ];
      default:
        return [
          "Everyday office and remote-work productivity tasks.",
          "Quick developer debugging and data format conversions.",
          "Confidential document handling where cloud uploads are strictly prohibited.",
        ];
    }
  };

  return (
    <div className="mt-16 space-y-12">
      {/* 1. Implemented Features & Technical Specifications */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2.5 text-xs font-bold text-primary uppercase tracking-wider mb-2">
          <Layers className="w-4 h-4" />
          <span>Technical Architecture &amp; Features</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          How {tool.name} Operates Locally
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {getEngineArchitecture()}
        </p>

        {/* Feature Checkpoints */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {getFeatures().map((feature, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Supported Formats & Device Limits */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Supported Formats */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
            <FileCheck className="w-4 h-4" />
            <span>Supported Formats</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            Input &amp; Output Capabilities
          </h3>

          <div className="mt-4 space-y-3">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Supported Inputs:
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {formats.input.map((fmt, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs rounded-lg bg-muted text-foreground font-mono"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Supported Outputs:
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {formats.output.map((fmt, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs rounded-lg bg-primary/10 text-primary font-mono font-medium"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Limitations & Device Bound */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
            <Cpu className="w-4 h-4" />
            <span>Device Specifications</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            Performance &amp; Browser Limits
          </h3>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {getLimitations()}
          </p>
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              All operations execute on your client hardware. Processing speed scales directly with your device's CPU cores and memory.
            </span>
          </div>
        </div>
      </div>

      {/* 3. Privacy & Data Handling Guarantee */}
      <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">
              Privacy &amp; Data Security Guarantee
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When using {tool.name}, your files and data <strong>never travel across the internet</strong>. All encoding, conversions, and calculations occur directly inside your browser tab. We cannot see, log, or retain any of your content.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> 0 Bytes Transferred
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Zero Server Storage
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> No Cookies / Tracking
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Common Use Cases */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>Common Applications</span>
        </div>
        <h3 className="text-xl font-bold text-foreground">
          Popular Use Cases for {tool.name}
        </h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {getUseCases().map((useCase, i) => (
            <li
              key={i}
              className="p-3.5 rounded-xl border border-border/80 bg-background/50 text-sm text-muted-foreground flex items-start gap-2.5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
              <span>{useCase}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
