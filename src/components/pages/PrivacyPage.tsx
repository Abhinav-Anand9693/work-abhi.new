import React from "react";
import Container from "@/components/layout/Container";
import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2, FileText, Globe, EyeOff } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="py-12 sm:py-20">
      <Container className="max-w-4xl">
        <div className="space-y-4 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
            <span>CLIENT-SIDE PRIVACY ARCHITECTURE</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: October 2026 • Last updated: October 30, 2026
          </p>
        </div>

        {/* Highlight Guarantee */}
        <div className="my-8 p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-foreground text-base sm:text-lg">
                Our Core Privacy Guarantee: Zero File Uploads
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                WorkAbhi is architected so that your files, videos, audios, PDFs, and images are processed
                <strong> strictly in your local browser memory</strong>. We do not transmit your files to our servers,
                we do not store them, and we do not have access to view or inspect your content under any circumstances.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 text-foreground text-sm sm:text-base leading-relaxed">
          {/* 1. Information We Do Not Collect */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">1. Files &amp; Content We Do Not Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              Unlike traditional online utilities that require uploading files to a cloud server to perform conversions, WorkAbhi
              processes data directly inside your browser using HTML5 Canvas, Web Audio API, WebCodecs, Web Workers, and the W3C Web
              Cryptography API. Consequently, we <strong>never collect, inspect, transmit, or store</strong>:
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground list-disc list-inside">
              <li>The contents of any image, video, audio file, document, or PDF you process.</li>
              <li>Embedded metadata, EXIF tags, GPS coordinates, or personal details within your media files.</li>
              <li>Passwords, cryptographic hashes, or tokens generated or decoded in our developer utilities.</li>
              <li>User account data (no account registration or login is required to access any tool).</li>
            </ul>
          </section>

          {/* 2. Information Voluntarily Provided */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">2. Information You Voluntarily Provide</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you contact us via email (<a href="mailto:chotuchintu9693@gmail.com" className="text-primary hover:underline font-mono">chotuchintu9693@gmail.com</a>)
              or submit a message through our Contact page, we receive your email address, name, and whatever comments or bug descriptions you include.
              This information is used strictly to answer your inquiry and troubleshoot reported technical issues. We never sell, rent, or trade your contact information.
            </p>
          </section>

          {/* 3. Server Logging & Hosting Infrastructure */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">3. Hosting Infrastructure &amp; Technical Server Logs</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you load web pages from WorkAbhi, our hosting network infrastructure automatically processes standard internet connection metadata
              (such as your IP address, browser user-agent, operating system, referring URL, and request timestamps). This technical data is processed
              transiently by cloud web servers solely to deliver static files, detect malicious automated attacks (DDoS prevention), and ensure network stability.
              This network routing metadata is never coupled to any tool processing, as tool processing occurs on your client machine.
            </p>
          </section>

          {/* 4. Local Storage Usage */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">4. Local Storage (No Tracking Cookies)</h2>
            <p className="text-muted-foreground leading-relaxed">
              WorkAbhi does not use third-party tracking cookies or behavioral advertising cookies. We use HTML5 <code>localStorage</code> strictly on your device for:
            </p>
            <ul className="mt-2 space-y-1 text-muted-foreground list-disc list-inside">
              <li><code>workabhi-theme</code>: Remembers whether you chose Dark or Light mode.</li>
              <li><code>recent-tools</code>: Stores tool identifiers you recently visited for convenient navigation.</li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              You can clear these values at any time through your browser settings. See our{" "}
              <Link href="/cookies" className="text-primary font-semibold hover:underline">
                Cookie Policy
              </Link>{" "}
              for detailed instructions.
            </p>
          </section>

          {/* 5. Advertising & Analytics Status */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">5. Advertising &amp; Third-Party Analytics Status</h2>
            <p className="text-muted-foreground leading-relaxed">
              WorkAbhi does not currently run commercial banner advertisements (e.g., Google AdSense) or third-party behavioral analytics trackers (e.g., Google Analytics, Meta Pixel). If advertising or analytics integrations are ever introduced to fund hosting costs, this policy will be promptly updated, and applicable consent mechanisms will be provided in compliance with regional regulations.
            </p>
          </section>

          {/* 6. Data Retention & Deletion */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">6. Data Retention &amp; Automatic Deletion</h2>
            <p className="text-muted-foreground leading-relaxed">
              Because files are decoded into local JavaScript memory, they exist in your temporary browser heap only for the duration of your tab session.
              Once you close or refresh the tab, all image buffers, audio samples, and file blobs are automatically purged by your browser's garbage collector.
              WorkAbhi retains no file copies, historical archives, or recovery logs.
            </p>
          </section>

          {/* 7. Security Practices */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">7. Security Architecture</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our primary security strategy is data minimization: by avoiding server-side file uploads entirely, your files are protected from cloud storage breaches, interception during server transit, and unauthorized database access. All web traffic between your device and our domain is encrypted in transit using standard HTTPS / TLS protocols.
            </p>
          </section>

          {/* 8. Children's Privacy */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              WorkAbhi is a general audience educational and productivity utility site and does not knowingly solicit or collect personal information from children under the age of 13 (or under 16 where applicable). Because no registration is required to use any tool, children may safely perform calculations and image conversions locally without sharing personal identity data.
            </p>
          </section>

          {/* 9. User Rights & Data Requests */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">9. Your Privacy Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your jurisdiction (such as under the European GDPR or California CCPA), you have the right to request access to, correction of, or deletion of any personal communications you have sent to us. Because we do not store accounts or personal file records, there is no database record of your tool usage to retrieve or delete. For any support-related data inquiries, email <a href="mailto:chotuchintu9693@gmail.com" className="text-primary font-mono hover:underline">chotuchintu9693@gmail.com</a>.
            </p>
          </section>

          {/* 10. Policy Updates & Contact */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">10. Policy Updates &amp; Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect functional improvements or regulatory updates. Any modifications will be posted here with an updated effective date.
            </p>
            <p className="mt-3 text-muted-foreground">
              For privacy-related questions or technical inquiries, contact the operator directly:
            </p>
            <div className="mt-2 p-4 rounded-xl border border-border bg-card max-w-md">
              <div className="font-semibold text-foreground">WorkAbhi Project Operator</div>
              <div className="text-xs text-muted-foreground mt-0.5">Email Support &amp; Inquiries:</div>
              <a href="mailto:chotuchintu9693@gmail.com" className="font-mono text-sm text-primary font-semibold hover:underline block mt-1">
                chotuchintu9693@gmail.com
              </a>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
