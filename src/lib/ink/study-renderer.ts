import { mountInk } from "./renderer";
import { inkStudyEntrance, inkStudyScene, type InkStudy } from "./studies";
import { getStoredTheme, resolveTheme, THEME_CHANGE_EVENT } from "@/lib/theme";

export function mountInkStudy(mount: HTMLElement, study: InkStudy, onReady: (ready: boolean) => void) {
  const renderer = mountInk(mount, inkStudyScene(study), undefined, onReady, {
    continuous: true, checkOcclusion: true,
    entrance: inkStudyEntrance(study),
  });
  const theme = window.matchMedia("(prefers-color-scheme: dark)");
  const updateTheme = () => renderer.setTheme(resolveTheme(getStoredTheme()));
  updateTheme();
  window.addEventListener(THEME_CHANGE_EVENT, updateTheme);
  window.addEventListener("storage", updateTheme);
  theme.addEventListener("change", updateTheme);

  return {
    setProgress: renderer.setEntranceProgress,
    destroy() {
      renderer.destroy();
      window.removeEventListener(THEME_CHANGE_EVENT, updateTheme);
      window.removeEventListener("storage", updateTheme);
      theme.removeEventListener("change", updateTheme);
    },
  };
}
