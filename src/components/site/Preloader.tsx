"use client";

import { useEffect, useState } from "react";

export function Preloader() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setActive(false), 900);
    return () => clearTimeout(timer);
  }, []);

  if (!active) return null;

  return (
    <div
      data-preloader
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[100] h-[2px] pointer-events-none bg-transparent"
    >
      <div
        data-preloader-bar
        className="h-full w-full bg-accent origin-left shadow-[0_0_8px_var(--color-accent)] animate-preloader-bar"
      />
    </div>
  );
}

