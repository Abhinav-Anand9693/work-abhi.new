import React from "react";
import Container from "@/components/layout/Container";
import Link from "next/link";
import { AlertTriangle, ShieldCheck, Scale, FileText, CheckCircle2 } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="py-12 sm:py-20">
      <Container className="max-w-4xl">
        <div className="space-y-4 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>LEGAL &amp; ACCURACY NOTICE</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
            Disclaimer
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: October 2026 • Last updated: October 31, 2026
          </p>
        </div>

        <div className="mt-8 space-y-8 text-foreground text-sm sm:text-base leading-relaxed">
          {/* General Informational Purpose */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">1. General Information Purpose Only</h2>
            <p className="text-muted-foreground leading-relaxed">
              All tools, calculators, formatters, and utilities published on WorkAbhi (https://workabhi.com)
              are provided in good faith for general informational, educational, and personal utility purposes.
              They are designed to assist with routine tasks such as compressing images, formatting code, and estimating
              standard mathematical formulas.
            </p>
          </section>

          {/* No Professional Financial or Legal Advice */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">2. No Financial, Investment, or Legal Advice</h2>
            <p className="text-muted-foreground leading-relaxed">
              The financial and mathematical calculators (including but not limited to the EMI Calculator, Loan Calculator,
              SIP Calculator, Compound Interest Calculator, and CAGR Calculator) use standard mathematical formulas to provide
              estimates based on the numbers you input.
            </p>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              These calculations do <strong>not</strong> constitute certified financial advice, loan approvals, or tax counsel.
              Actual bank interest rates, amortizations, tax liabilities, and investment returns may differ due to fees,
              compounding frequencies, regulatory changes, or institutional terms. Always consult a certified financial
              advisor or chartered accountant for decisions requiring official verification.
            </p>
          </section>

          {/* Developer & Cryptographic Tools Disclaimer */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">3. Security &amp; Cryptographic Utilities</h2>
            <p className="text-muted-foreground leading-relaxed">
              Security utilities (such as hash generators, password generators, and JWT decoders) utilize standard W3C Web
              Cryptography APIs and open JavaScript specifications in your browser. While suitable for debugging, testing,
              and standard generation, they are provided without express warranty of fitness for mission-critical enterprise
              security architectures. Users remain responsible for evaluating security requirements before using outputs in
              production systems.
            </p>
          </section>

          {/* User Backup Responsibility */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">4. File Integrity &amp; Backup Responsibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              Because all file conversions, compressions, and image transformations execute in your local device’s memory,
              WorkAbhi does not retain copies or backups of your files.
            </p>
            <div className="mt-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
              <strong>Important Note:</strong> Always maintain an independent, untouched original backup of your files before
              performing batch compression, PDF splitting, or format transformations. WorkAbhi cannot restore files that you
              modify or discard.
            </div>
          </section>

          {/* "As-Is" Service Availability */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">5. "As Is" and "As Available" Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              WorkAbhi does not make warranties or representations regarding the completeness, reliability, or 100% uninterrupted
              availability of the website or tools. Performance is bound by your local browser environment, available RAM, and
              hardware capabilities. We reserve the right to modify, update, or discontinue tools without prior notice.
            </p>
          </section>

          {/* External Links */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">6. External Links &amp; Third Parties</h2>
            <p className="text-muted-foreground leading-relaxed">
              The website may contain hyperlinks to external sites, browser specifications, or educational documentation.
              WorkAbhi has no control over the content, privacy practices, or availability of external third-party domains.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">7. Inquiries</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you discover an error, formula discrepancy, or issue in any tool, please notify us so we can review and resolve it:
            </p>
            <p className="mt-2 text-muted-foreground">
              Contact: <a href="mailto:chotuchintu9693@gmail.com" className="font-mono text-primary font-semibold hover:underline">chotuchintu9693@gmail.com</a>
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
