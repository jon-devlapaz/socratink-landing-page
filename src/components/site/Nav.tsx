"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppearanceToggle } from "@/components/theme/AppearanceToggle";
import { Wordmark } from "@/components/ui/Wordmark";
import { nav } from "@/lib/content";

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="border-b border-tx/5 bg-paper/80 backdrop-blur-xl py-2">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-10 max-w-6xl items-center justify-between px-3 sm:px-8"
        >
          <Wordmark />

          <ul className="hidden items-center gap-5 lg:gap-7 text-sm text-tx-2 md:flex">
            {nav.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="inline-flex min-h-11 items-center justify-center rounded-md px-1 text-tx-2 transition-colors hover:text-tx focus-visible:outline-2 focus-visible:outline-offset-2"
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
            <Link
              href={nav.cta.href}
              className="btn-primary shrink-0 px-2.5 sm:px-3.5 text-xs sm:text-[0.8125rem]"
            >
              <span className="sm:hidden">{nav.cta.shortLabel}</span>
              <span className="hidden sm:inline">{nav.cta.label}</span>
            </Link>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-tx-2 transition-colors hover:text-tx focus-visible:outline-2 focus-visible:outline-offset-2 md:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                {open ? (
                  <path
                    d="M5 5l10 10M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M3.5 6.5h13M3.5 10h13M3.5 13.5h13"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-b border-tx/10 bg-paper/95 backdrop-blur-xl md:hidden"
        >
          <nav aria-label="Mobile" className="px-3 pb-3 pt-1">
            <ul className="flex flex-col">
              {nav.links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center rounded-md px-3 text-base text-tx-2 transition-colors hover:text-tx focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href={nav.login.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-md px-3 text-base text-tx-2 transition-colors hover:text-tx focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {nav.login.label}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
