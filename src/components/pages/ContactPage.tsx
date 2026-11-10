import React, { useState } from "react";
import Container from "@/components/layout/Container";
import { Mail, MessageSquare, Send, CheckCircle2, Clock, HelpCircle, Sparkles } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="py-12 sm:py-20">
      <Container className="max-w-4xl">
        <div className="space-y-4 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <Mail className="w-3.5 h-3.5" />
            <span>GET IN TOUCH</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
            Contact Support &amp; Feedback
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Have a question, encountered an issue, or want to suggest a new tool for WorkAbhi?
            We'd love to hear from you.
          </p>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {/* Contact Details */}
          <div className="space-y-6 md:col-span-1">
            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-2 text-foreground font-bold">
                <Mail className="w-4 h-4 text-primary" /> Email Support
              </div>
              <p className="text-xs text-muted-foreground">
                For general support, feedback, and enterprise inquiries:
              </p>
              <a
                href="mailto:chotuchintu9693@gmail.com"
                className="mt-2 block font-mono text-xs font-semibold text-primary hover:underline break-all"
              >
                chotuchintu9693@gmail.com
              </a>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-2 text-foreground font-bold">
                <Clock className="w-4 h-4 text-emerald-500" /> Response Time
              </div>
              <p className="text-xs text-muted-foreground">
                Our team typically reviews and responds to feedback within 24 to 48 hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-2 text-foreground font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" /> Feature Requests
              </div>
              <p className="text-xs text-muted-foreground">
                Want a specific format converter or calculator added? Let us know and we'll prioritize it!
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Message Sent Successfully!</h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  Thank you for reaching out, {name}. Our engineering and support team has received your inquiry and will follow up shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setName("");
                    setEmail("");
                    setSubject("");
                    setMessage("");
                    setSubmitted(false);
                  }}
                  className="mt-4 px-5 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 rounded-3xl border border-border bg-card space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Your Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Tool / Feature Request</option>
                      <option value="feedback">Feedback &amp; Testimonial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Batch image compression feedback"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your question, request, or issue in detail..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition resize-y"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
