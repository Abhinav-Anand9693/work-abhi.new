import React from "react";
import Container from "@/components/layout/Container";
import Link from "next/link";
import { Scale, CheckCircle2, AlertCircle } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="py-12 sm:py-20">
      <Container className="max-w-4xl">
        <div className="space-y-4 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <Scale className="w-3.5 h-3.5" />
            <span>TERMS &amp; CONDITIONS</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: October 2026 • Last updated: October 30, 2026
          </p>
        </div>

        <div className="mt-8 space-y-8 text-foreground text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using WorkAbhi (the "Service"), you acknowledge that you have read, understood,
              and agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">2. Description of Service &amp; License</h2>
            <p className="text-muted-foreground leading-relaxed">
              WorkAbhi provides browser-based, client-side productivity utilities (including image manipulation,
              audio synthesis, video transcoding, PDF editing, code formatting, and mathematical calculations).
              We grant you a non-exclusive, worldwide, royalty-free license to use the tools for personal, commercial,
              educational, or non-profit purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">3. User Ownership of Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain 100% full ownership, intellectual property rights, and copyright to all files, media, text,
              and data processed through WorkAbhi. Because files are processed locally on your client machine and are
              never uploaded or copied to our infrastructure, WorkAbhi claims zero rights over any user outputs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to use the Service for any unlawful activities or in a manner that attempts to reverse-engineer,
              disrupt, or overload the application infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">5. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              The tools and services on WorkAbhi are provided on an "as is" and "as available" basis without warranties
              of any kind, either express or implied. While we strive to ensure precision, stability, and speed across
              all supported browsers, we do not guarantee that the service will be entirely error-free or uninterrupted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall WorkAbhi, its maintainers, or affiliates be liable for any direct, indirect, incidental,
              special, or consequential damages arising from the use of or inability to use the tools or loss of data.
              Always maintain independent backups of critical files.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">7. Contact &amp; Questions</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any questions regarding these Terms, please reach out to us at{" "}
              <a href="mailto:chotuchintu9693@gmail.com" className="font-mono text-primary font-semibold hover:underline">
                chotuchintu9693@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
