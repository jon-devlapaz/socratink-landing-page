export const THEME_STORAGE_KEY = "socratink-theme";
export const THEME_CHANGE_EVENT = "socratink-theme-change";

export type Theme = "light" | "dark";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return null;
}

/** Effective theme: stored preference, else system, else light. */
export function resolveTheme(stored: Theme | null): Theme {
  if (stored) return stored;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function themeColor(theme: Theme): string {
  return theme === "dark" ? "#100f0f" : "#fffcf0";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", themeColor(theme));
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function toggleTheme(): Theme {
  const next: Theme = resolveTheme(getStoredTheme()) === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

/** Inline boot script — mirrors app.socratink.ai head script to avoid flash. */
export const themeBootScript = `(function(){var k='${THEME_STORAGE_KEY}';var s=localStorage.getItem(k);if(s==='light'||s==='dark'){document.documentElement.dataset.theme=s;}var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',d?'#100f0f':'#fffcf0');})();`;
