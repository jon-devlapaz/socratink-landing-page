# How It Works — Vertical Tabs + Window Mockup
**Status:** architecture spike for validation / prototyping  
**Date:** 2026-09-11  
**Repo:** `socratink-landing` (Next 16 App Router, React 19, Tailwind v4, GSAP 3.15, Lenis)  
**Not:** a green light to ship another Method fold. Prior Method spikes (2026-09-10) were scrapped.

## Goal
Place a 3-step “How a session works” block directly under the hero so the product loop is clear in ~5s:

1. **Pick one target** — curriculum / exam specimen  
2. **Explain it unaided** — free response, no autocomplete / MCQ  
3. **Inspect what holds** — held concepts, gaps, retention check  

Pattern under review: Linear / Magic UI–style **vertical feature tabs + window mockup** (left tabs with 5s progress; right synchronized lightweight preview).

---

## 1. Verdict

| Choice | Decision | Why |
|--------|----------|-----|
| Registry (Magic UI / 21st / Aceternity) | **No** | Pulls `framer-motion` / `motion`, Tailwind assumptions, and chrome we already rejected after Method failures. |
| Add `framer-motion` or `motion` v12 | **No** | Not in deps today; React 19 peer risk; duplicates GSAP already installed. |
| **Native GSAP 3.15 + CSS** | **Yes** | Zero new deps; Lenis-friendly; full control of reduced-motion and CLS. |

**CRO note (spike hypothesis, not doctrine):** Auto-cycling 5s tabs work for *recognition* of a 3-step loop, not for reading dense diagnostic copy. Default: auto-advance **only while the section is ≥50% in view**, pause on hover/focus/touch, click locks that tab until blur or next click. Prefer **not** scroll-scrub for v1 (Lenis + scrub fights INP and a11y). Validate with 5 cold watches: can a stranger name the 3 steps after one cycle?

**Do not** re-encode “show the whole Socratink loop (concept→targets→teach→attempt→metacog)” in this mock. Three steps only, as named above.

---

## 2. Component architecture

### Files (proposed)

```
src/components/site/how-it-works/
  HowItWorks.tsx          # section shell, layout, reduced-motion branch
  StepTabList.tsx         # tablist + progress + keyboard
  StepPreview.tsx         # window chrome + step panels
  useStepAutoAdvance.ts   # single timer owner
  steps.ts                # copy + preview content (data only)
  how-it-works.css        # or Tailwind tokens in module; reserved heights
```

Wire from the homepage fold order after hero (exact insertion point TBD in layout). Keep Method / EncounterStrip untouched until this spike is accepted.

### State model

```ts
type StepId = "target" | "explain" | "inspect";

type HowItWorksState = {
  active: StepId;
  /** user clicked / focused a tab — suppresses auto-advance until unlock */
  locked: boolean;
  /** section in view + not reduced-motion + not locked */
  advancing: boolean;
  /** 0..1 progress within current 5s window */
  progress: number;
};
```

- **One timer owner** in `useStepAutoAdvance`: `requestAnimationFrame` or single `setInterval` cleared on every `active` change. Never start a new interval without clearing the old one.  
- Click / Arrow keys set `active` + reset `progress` to 0 + set `locked` true.  
- Unlock: leave section, explicit “resume”, or timeout after idle (optional; default unlock on section leave only).  
- `prefers-reduced-motion: reduce` → `advancing` always false; show static panel for `active`; no progress animation.

### DOM schema (a11y)

```html
<section id="how-it-works" aria-labelledby="how-it-works-title">
  <h2 id="how-it-works-title">How a session works</h2>
  <div class="how-layout">
    <div role="tablist" aria-orientation="vertical" aria-label="Session steps">
      <button role="tab" id="tab-target" aria-selected="true"
              aria-controls="panel-target" tabindex="0">…</button>
      <!-- progress: decorative meter under active tab; aria-hidden -->
      <button role="tab" … tabindex="-1">…</button>
      <button role="tab" … tabindex="-1">…</button>
    </div>
    <div class="window-mock" aria-live="polite">
      <div role="tabpanel" id="panel-target" aria-labelledby="tab-target">…</div>
      <!-- inactive panels: hidden + inert, same reserved box -->
    </div>
  </div>
</section>
```

**Keyboard:** `ArrowUp` / `ArrowDown` (and `Home` / `End`) move selection within tablist; `Tab` moves focus into / out of the tablist as a composite widget (roving `tabindex`). Do **not** put every tab in the sequential tab order.

**Preview content:** CSS/DOM only (typed lines, chips, fake caret). No `<video>`, no canvas, no Three.js in this section (hero already owns WebGL budget).

### Motion (GSAP)

- Crossfade / 8–12px Y slide between panels, ≤280ms, ease already used elsewhere on the site.  
- Progress bar = CSS `transform: scaleX(progress)` on a reserved track (no width anim → less layout thrash).  
- Kill tweens on step change (`gsap.killTweensOf(...)`) to avoid overlap.

### Layout / CLS

- Right pane: **fixed min-height** at each breakpoint (measure tallest panel once, set `--preview-min-h`).  
- Left tabs: fixed column width from `sm+`; below `sm` stack tabs above preview, still no horizontal scroll at 320px.  
- Window chrome: border + title dots as CSS; content clips inside `overflow: hidden`.

---

## 3. Edge cases to guard

1. **320px wrap** — Long tab labels truncate or wrap to two lines inside the tab button; preview never forces `min-width` > viewport; no `translateX` that escapes the section. Manual check: 320 / 375 / 768.  
2. **Timer race** — Click at t=4.9s must cancel the pending advance; only one `active` transition per frame. Test: rapid click through all three + hover pause mid-bar.  
3. **Dark theme contrast** — Active tab + progress track meet WCAG AA on `--paper` / ink dark tokens; mock window border and muted UI text (`--tx-2`) checked in both themes; fake “diagnostic” red/green never sole channel (icon + text).

**Also:** pause when `document.hidden`; restore focus to the selected tab after panel swap if focus was inside a now-hidden panel.

---

## 4. Prototype acceptance (validation)

- [ ] Stranger can name 3 steps after ≤1 auto cycle (or 3 clicks)  
- [ ] Lighthouse / manual: no CLS when cycling; no console errors  
- [ ] Keyboard-only path works; VoiceOver announces tab + panel  
- [ ] `prefers-reduced-motion`: static, no auto-advance  
- [ ] 320px: no horizontal scroll  
- [ ] No new npm dependencies  

## 5. Explicit non-goals

- Full curriculum UI, real Flue session, React Flow / Rive  
- Scroll-tied scrub v1  
- Registry component bootstrap  

## Next

Thin interactive prototype behind a flag or local-only route → review with Jobs/Sal lenses **after** cold-watch pass → only then consider promoting past spike.
