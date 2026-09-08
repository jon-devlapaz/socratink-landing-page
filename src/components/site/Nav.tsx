"use client";

import Link from "next/link";
import { AppearanceToggle } from "@/components/theme/AppearanceToggle";
import { Wordmark } from "@/components/ui/Wordmark";
import { nav } from "@/lib/content";

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="border-b border-tx/5 bg-paper/80 backdrop-blur-xl">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-8"
        >
          <Wordmark />

          <ul className="hidden items-center gap-7 text-sm text-tx-2 md:flex">
            {nav.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md transition-colors hover:text-tx focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <AppearanceToggle />
            <Link href={nav.login.href} className="btn-ghost hidden sm:inline-flex">
              {nav.login.label}
            </Link>
            <Link href={nav.cta.href} className="btn-primary shrink-0">
              {nav.cta.label}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
