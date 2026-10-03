// CSS supplies the same URLs without JavaScript; the boot hint respects saved themes.
export const inkPosterPreloadScript = `(function(){if(location.pathname!=='/')return;var t=document.documentElement.dataset.theme;var d=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches);var s=matchMedia('(max-width: 767px)').matches?(matchMedia('(min-resolution: 2.01dppx)').matches?768:512):1120;var l=document.createElement('link');l.rel='preload';l.as='image';l.href='/brand/living-ink-'+(d?'dark':'light')+'-'+s+'.webp';l.fetchPriority='high';l.dataset.inkPreload='';document.head.appendChild(l);})();`;

export function afterInkPosterPaint(poster: HTMLElement, start: () => void) {
  const src = getComputedStyle(poster).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
  if (!src) throw new Error("Hero ink requires a poster before enhancement");
  let cancelled = false;
  let frame = 0;
  let idle: number | undefined;
  let paint: PerformanceObserver | undefined;
  const run = () => {
    if (cancelled) return;
    if (PerformanceObserver.supportedEntryTypes.includes("paint") &&
      !performance.getEntriesByName("first-contentful-paint").length) {
      paint = new PerformanceObserver((entries) => {
        if (!entries.getEntries().some(entry => entry.name === "first-contentful-paint")) return;
        paint?.disconnect();
        if (!cancelled) start();
      });
      paint.observe({ type: "paint", buffered: true });
    } else {
      start();
    }
  };
  const painted = () => {
    if (cancelled) return;
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (typeof window.requestIdleCallback === "function") {
          idle = window.requestIdleCallback(run, { timeout: 500 });
        } else {
          run();
        }
      });
    });
  };
  const image = new Image();
  image.src = src;
  // An unavailable still must not prevent the live renderer from recovering it.
  image.decode().then(painted, painted);
  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
    paint?.disconnect();
    if (idle !== undefined) window.cancelIdleCallback(idle);
  };
}
