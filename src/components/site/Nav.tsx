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
            {nav.links.map((l) => {
              const tipId = `nav-tip-${l.label.toLowerCase()}`;
              return (
                <li key={l.href} className="relative group">
                  <a
                    href={l.href}
                    aria-describedby={tipId}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md transition-colors hover:text-tx focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {l.label}
                  </a>
                  {"tooltip" in l ? (
                    <span
                      id={tipId}
                      role="tooltip"
                      className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 pt-1 opacity-0 transition-all duration-150 ease-out group-hover:opacity-100 group-focus-within:opacity-100 group-hover:translate-y-0 group-focus-within:translate-y-0 -translate-y-1 z-50 whitespace-nowrap"
                    >
                      <span className="inline-block rounded-md border border-tx/15 bg-paper-2/95 px-2.5 py-1 text-xs font-normal text-tx-2 shadow-lg backdrop-blur-md">
                        {l.tooltip}
                      </span>
                    </span>
                  ) : null}
                </li>
              );
            })}
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
