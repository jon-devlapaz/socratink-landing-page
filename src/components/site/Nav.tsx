"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect } from "react";
import { INTRO, useIntro } from "@/components/site/Intro";
import { Wordmark } from "@/components/ui/Wordmark";
import { nav } from "@/lib/content";

export function Nav() {
  const { phase } = useIntro();
  // lazy.so's "Get Lazy [L]" shortcut; here a bare "S" jumps to the app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target && (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable);
      if (typing || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (e.key.toLowerCase() === nav.cta.kbd.toLowerCase()) {
        window.location.assign(nav.cta.href);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={{ opacity: 0, y: -8 }}
      animate={phase === "drop" ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: INTRO.ease }}
    >
      <div className="border-b border-tx/6 bg-paper/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Wordmark />

          <ul className="hidden items-center gap-7 text-[0.8125rem] text-tx-2 md:flex">
            {nav.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-tx">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <Link href={nav.login.href} className="btn-ghost hidden sm:inline">
              {nav.login.label}
            </Link>
            <Link href={nav.cta.href} className="btn-primary">
              {nav.cta.label}
              <span className="kbd">{nav.cta.kbd}</span>
            </Link>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
