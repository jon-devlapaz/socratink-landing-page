"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

type Engine = { instances: unknown[]; mount: (root: HTMLElement) => { layout: () => void } };

export function ScrollCraft() {
  const observer = useRef<ResizeObserver | null>(null);
  useEffect(() => {
    const revealFocus = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement) || !event.target.matches(":focus-visible")) return;
      const rect = event.target.getBoundingClientRect();
      if (rect.top < 72 || rect.bottom > innerHeight) {
        event.target.scrollIntoView({ block: "center", behavior: "instant" });
      }
    };
    document.addEventListener("focusin", revealFocus);
    return () => {
      document.removeEventListener("focusin", revealFocus);
      observer.current?.disconnect();
    };
  }, []);
  return <Script src="/scrollcraft/scrollcraft.js" onReady={() => {
    const engine = (window as Window & { ScrollCraft?: Engine }).ScrollCraft;
    if (engine && !engine.instances.length) {
      const instance = engine.mount(document.body);
      observer.current = new ResizeObserver(() => instance.layout());
      observer.current.observe(document.body);
    }
  }} />;
}
