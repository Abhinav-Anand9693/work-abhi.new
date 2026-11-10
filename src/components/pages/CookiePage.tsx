import React from "react";
import Container from "@/components/layout/Container";
import Link from "next/link";
import { Cookie, ShieldCheck, CheckCircle2, Info, Settings } from "lucide-react";

export default function CookiePage() {
  return (
    <div className="py-12 sm:py-20">
      <Container className="max-w-4xl">
        <div className="space-y-4 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <Cookie className="w-3.5 h-3.5" />
            <span>LOCAL STORAGE &amp; COOKIES</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
            Cookie &amp; Local Storage Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: October 2026 • Last updated: October 31, 2026
          </p>
        </div>

        {/* Summary Card */}
        <div className="my-8 p-6 rounded-2xl border border-primary/20 bg-card/60 backdrop-blur">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-foreground text-base sm:text-lg">
                Zero Tracking Cookies
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                WorkAbhi does not use third-party advertising cookies, cross-site trackers, or behavioral profiling scripts.
                We use only essential browser <code>localStorage</code> to remember non-sensitive user preferences locally on your device.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 text-foreground text-sm sm:text-base leading-relaxed">
          {/* Section 1: What Technologies Are Used */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">1. Technologies We Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you use WorkAbhi, our application uses HTML5 <code>localStorage</code> rather than standard HTTP cookies to store two simple user preferences:
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border border-border rounded-xl overflow-hidden">
                <thead className="bg-muted text-foreground font-semibold">
                  <tr className="border-b border-border">
                    <th className="p-3">Key Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Expiration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3 font-mono text-primary font-medium">workabhi-theme</td>
                    <td className="p-3 text-muted-foreground">localStorage</td>
                    <td className="p-3 text-muted-foreground">Stores whether you selected Dark mode or Light mode.</td>
                    <td className="p-3 text-muted-foreground">Persistent until cleared by user</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-primary font-medium">recent-tools</td>
                    <td className="p-3 text-muted-foreground">localStorage</td>
                    <td className="p-3 text-muted-foreground">Stores IDs of tools you opened recently for quick-access navigation.</td>
                    <td className="p-3 text-muted-foreground">Persistent until cleared by user</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
              Neither of these values contains personal identification, IP addresses, email addresses, or file contents.
            </p>
          </section>

          {/* Section 2: Advertising & Analytics */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">2. Advertising &amp; Third-Party Analytics</h2>
            <p className="text-muted-foreground leading-relaxed">
              WorkAbhi does not currently partner with advertising networks (such as Google AdSense) or third-party behavioral analytics services (such as Google Analytics or Meta Pixel). No third-party cookies are deposited on your device through WorkAbhi.
            </p>
          </section>

          {/* Section 3: Managing and Clearing Preferences */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">3. How to Manage or Clear Your Local Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              Because these values exist solely in your local browser, you can clear them at any time directly through your browser’s settings:
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground list-disc list-inside">
              <li><strong>Google Chrome:</strong> Settings &gt; Privacy and security &gt; Site settings &gt; View permissions and data stored across sites &gt; Search "workabhi.com" &gt; Clear data.</li>
              <li><strong>Mozilla Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data &gt; Manage Data &gt; Remove workabhi.com.</li>
              <li><strong>Apple Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data &gt; Remove workabhi.com.</li>
              <li><strong>Microsoft Edge:</strong> Settings &gt; Cookies and site permissions &gt; Manage and delete cookies and site data.</li>
            </ul>
          </section>

          {/* Section 4: Contact */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">4. Questions &amp; Support</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions regarding our storage practices or privacy controls, please contact us at{" "}
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
