import Link from "next/link";
import { AppearanceToggle } from "@/components/theme/AppearanceToggle";
import { Wordmark } from "@/components/ui/Wordmark";
import { inkDropPath } from "@/components/site/ink-drop";
import { notFound, site, footer } from "@/lib/content";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper text-tx flex flex-col justify-between selection:bg-accent/20">
      <header className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]">
        <div className="border-b border-tx/5 bg-paper/80 backdrop-blur-xl py-2">
          <div className="mx-auto flex h-10 max-w-6xl items-center justify-between px-3 sm:px-8">
            <Wordmark />
            <AppearanceToggle />
          </div>
        </div>
      </header>

      <main id="main" className="flex-1 flex flex-col items-center justify-center px-4 pt-28 pb-16 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <span className="inline-block font-serif text-sm tracking-[0.2em] uppercase text-tx-2" aria-hidden="true">
            {notFound.cue} · Unwritten
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.1] tracking-[-0.025em] text-balance">
            {notFound.title}
          </h1>

          <p className="text-tx-2 text-base leading-relaxed max-w-[34ch] mx-auto">
            {notFound.body}
          </p>

          <figure className="py-2 flex justify-center" aria-hidden="true">
            <svg viewBox="0 0 200 40" className="w-48 h-10 overflow-visible" role="img">
              <path
                d="M10 20 C60 20 100 18 150 20"
                fill="none"
                stroke="var(--tx)"
                strokeOpacity="0.2"
                strokeWidth="1.2"
                strokeDasharray="4 6"
              />
              <path
                d={inkDropPath}
                transform="translate(152 20) scale(4.5)"
                fill="var(--accent)"
              />
            </svg>
          </figure>

          <div className="pt-2">
            <Link
              href={notFound.action.href}
              className="btn-accent inline-flex items-center gap-2"
            >
              <span>{notFound.action.label}</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-tx/5 py-6 px-4">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 text-xs text-tx-2">
          <p>© {site.name} {site.year}. {footer.legalNote}</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-tx transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-tx transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
