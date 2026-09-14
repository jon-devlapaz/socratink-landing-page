import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { site } from "@/lib/content";

export const metadata = {
  title: `Terms of Service • ${site.name}`,
  description: "Plain-language terms for using Socratink.",
};

export default function TermsPage() {
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
            Plain-Language Agreement
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-tx">
            Terms of Service
          </h1>
          <p className="text-sm text-tx-2">
            Last updated: September 2026 · Effective immediately
          </p>
        </div>

        <article className="space-y-8 text-sm sm:text-base leading-relaxed text-tx-2">
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium text-tx">
              1. Purpose of the Service
            </h2>
            <p>
              Socratink is a learning partner for hard technical and academic material. It is built to help you explain ideas, see what holds, and keep the work.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium text-tx">
              2. Free trial
            </h2>
            <p>
              We provide free access directly in your browser with no payment obligation or credit card required.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium text-tx">
              3. Learner Authorship & Responsibility
            </h2>
            <p>
              You retain ownership of the original explanations and answers you author. Socratink is a learning tool and does not guarantee specific scores on third-party standardized examinations or professional certifications.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium text-tx">
              4. Fair Use & Integrity
            </h2>
            <p>
              You agree to use Socratink for legitimate study. Automated scraping, malicious disruption of service, or abusive reverse engineering is prohibited.
            </p>
          </section>

          <section className="space-y-3 border-t border-tx/10 pt-8">
            <h2 className="font-serif text-xl font-medium text-tx">
              5. Questions & Support
            </h2>
            <p>
              For legal questions or assistance, contact us at{" "}
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
