import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { site } from "@/lib/content";

export const metadata = {
  title: `Privacy Policy • ${site.name}`,
  description: "Our plain-language privacy commitment: zero model training, complete data ownership, and instant export or deletion.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper text-tx selection:bg-accent/20">
      <header className="border-b border-tx/10 bg-paper/80 backdrop-blur-xl py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-8">
          <Wordmark />
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1.5 text-xs sm:text-sm font-medium text-tx-2 hover:text-tx transition-colors"
          >
            <span aria-hidden="true">←</span>
            <span>Back to landing</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="space-y-3 border-b border-tx/10 pb-8 mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent font-semibold">
            Plain-Language Commitment
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-tx">
            Privacy Policy
          </h1>
          <p className="text-sm text-tx-2">
            Last updated: September 2026 · Effective immediately
          </p>
        </div>

        <article className="space-y-8 text-sm sm:text-base leading-relaxed text-tx-2">
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium text-tx">
              1. Zero Foundation Model Training
            </h2>
            <p>
              Your unassisted diagnostic explanations, answers, and reasoning belong strictly to you.{" "}
              <strong className="text-tx font-semibold">Socratink never uses private diagnostic sessions to train or fine-tune public foundation models.</strong>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium text-tx">
              2. Data Ownership & Portability
            </h2>
            <p>
              We believe learner-authored work is first-class evidence of capability, not corporate telemetry.
              All your study records, gap analyses, and session logs can be exported at any time in portable, plain-text Markdown or structured JSON.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium text-tx">
              3. Permanent Deletion
            </h2>
            <p>
              You maintain total control over your history. When you delete a session or your account, your data is permanently expunged from our operational storage.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium text-tx">
              4. In-Browser Diagnostic & Guest Sessions
            </h2>
            <p>
              Initial trial encounters run directly in your browser. No third-party ad tracking, pixel scraping, or cross-site telemetry is attached to your thinking process.
            </p>
          </section>

          <section className="space-y-3 border-t border-tx/10 pt-8">
            <h2 className="font-serif text-xl font-medium text-tx">
              5. Contact Us
            </h2>
            <p>
              For privacy questions, data export assistance, or account deletion inquiries, contact our team directly at{" "}
              <a
                href="mailto:support@socratink.ai"
                className="text-accent underline underline-offset-4 hover:text-tx transition-colors font-mono text-sm"
              >
                support@socratink.ai
              </a>.
            </p>
          </section>
        </article>
      </main>

      <footer className="border-t border-tx/10 py-8 text-center text-xs text-tx-3">
        <p>© {site.name} {site.year}. All rights reserved.</p>
      </footer>
    </div>
  );
}
