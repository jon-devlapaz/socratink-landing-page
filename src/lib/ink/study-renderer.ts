import { mountInk } from "./renderer";
import { inkStudyScene, inkStudyDropScene, STUDY_HOLD_SECONDS, STUDY_MORPH_SECONDS, type InkStudy } from "./studies";
import { getStoredTheme, resolveTheme, THEME_CHANGE_EVENT } from "@/lib/theme";

const SURFACE_MOTION = { map: "sap", speak: "voice", teacher: "thought" } as const;

// The comparison and the landing chapters share their recipes and timing.
export function mountInkStudy(mount: HTMLElement, study: InkStudy, onReady: (ready: boolean) => void) {
  let remaining = STUDY_HOLD_SECONDS;
  let phase: "rest" | "gesture" | "drop" = "rest";
  mount.dataset.phase = "Holding form";
  const renderer = mountInk(mount, inkStudyScene(study), (dt) => {
    if (phase !== "drop" && study !== "map") return;
    remaining -= dt;
    if (remaining > 0) return;
    if (phase === "drop") {
      phase = "rest";
      renderer.setScene(inkStudyScene(study));
      mount.dataset.phase = "Unfolding";
    } else {
      phase = phase === "rest" ? "gesture" : "rest";
      renderer.setScene(inkStudyScene(study, phase === "gesture"));
      mount.dataset.phase = phase === "gesture" ? "Extending" : "Returning";
    }
    remaining = STUDY_MORPH_SECONDS + STUDY_HOLD_SECONDS;
  }, onReady, {
    continuous: true, morphDuration: STUDY_MORPH_SECONDS, respectReducedMotion: false,
    surfaceMotion: SURFACE_MOTION[study], checkOcclusion: true,
  });
  const theme = window.matchMedia("(prefers-color-scheme: dark)");
  const updateTheme = () => renderer.setTheme(resolveTheme(getStoredTheme()));
  updateTheme();
  window.addEventListener(THEME_CHANGE_EVENT, updateTheme);
  window.addEventListener("storage", updateTheme);
  theme.addEventListener("change", updateTheme);

  return {
    replay() {
      phase = "drop";
      remaining = STUDY_MORPH_SECONDS + 4;
      renderer.setScene(inkStudyDropScene(study));
      mount.dataset.phase = "Gathering into one drop";
    },
    destroy() {
      renderer.destroy();
      window.removeEventListener(THEME_CHANGE_EVENT, updateTheme);
      window.removeEventListener("storage", updateTheme);
      theme.removeEventListener("change", updateTheme);
    },
  };
}
