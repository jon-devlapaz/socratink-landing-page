"use client";

import { useCallback, useSyncExternalStore } from "react";
import { applyTheme, getStoredTheme, resolveTheme, THEME_CHANGE_EVENT, type Theme } from "@/lib/theme";

function subscribeTheme(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === "socratink-theme") callback();
  };
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener("storage", onStorage);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  media.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    media.removeEventListener("change", callback);
  };
}

function readTheme(): Theme {
  return resolveTheme(getStoredTheme());
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15.4 13.6A6.4 6.4 0 0 1 10.2 5.4 6.9 6.9 0 1 0 18.6 14a6.4 6.4 0 0 1-3.2-.4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Compact appearance toggle matching app.socratink.ai: circular orb, moon/sun swap,
 * label underneath. Cycles light ↔ dark and persists to `socratink-theme`.
 */
export function AppearanceToggle() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "light" as Theme);
  const isNight = theme === "dark";

  const onToggle = useCallback(() => {
    applyTheme(isNight ? "light" : "dark");
  }, [isNight]);

  return (
    <button
      type="button"
      className={`appearance-toggle${isNight ? " is-night" : ""}`}
      onClick={onToggle}
      aria-pressed={isNight}
      aria-label={isNight ? "Switch to light appearance" : "Switch to dark appearance"}
    >
      <span className="appearance-orb" aria-hidden="true">
        <span className="theme-icon is-sun">
          <SunIcon />
        </span>
        <span className="theme-icon is-moon">
          <MoonIcon />
        </span>
      </span>
      <span className="appearance-label">Appearance</span>
    </button>
  );
}
