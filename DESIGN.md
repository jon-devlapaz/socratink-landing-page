---
name: Socratink
description: Know what you actually know
colors:
  paper: "#fffcf0"
  paper-2: "#f2f0e9"
  ui: "#e6e4d9"
  ui-2: "#dad8ce"
  tx: "#100f0f"
  tx-2: "#575653"
  tx-3: "#686762"
  accent: "#1f7a72"
  accent-ink: "#fffcf0"
  error: "#d14d41"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(2.5rem, 4vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem (sm 2.6rem, lg 3rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "1.5rem / 1.875rem / 2.25rem"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem (detail 0.875rem)"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.18em"
rounded:
  button: "0.6rem"
  tile: "0.875rem"
  window: "1rem"
  panel: "18px"
  pill: "9999px"
components:
  button-primary:
    backgroundColor: "color-mix(in srgb, {colors.paper-2} 88%, {colors.paper})"
    textColor: "{colors.tx}"
    rounded: "{rounded.button}"
    padding: "0.55rem 0.9rem"
  button-primary-hover:
    backgroundColor: "color-mix(in srgb, {colors.ui} 75%, {colors.paper})"
    textColor: "{colors.tx}"
    rounded: "{rounded.button}"
    padding: "0.55rem 0.9rem"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.button}"
    padding: "0.75rem 1.25rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.tx-2}"
    rounded: "{rounded.button}"
    padding: "0.55rem 0.9rem"
  button-ghost-hover:
    backgroundColor: "color-mix(in srgb, {colors.ui} 50%, {colors.paper})"
    textColor: "{colors.tx}"
    rounded: "{rounded.button}"
    padding: "0.55rem 0.9rem"
---

# Design System: Socratink

## Overview

**Creative North Star: "The Archival Ink Folio"**

Socratink reads as a restrained archival instrument: cream paper with real grain tooth, carbon ink set with scholarly patience, and a single verdigris accent that appears only where action, selection, or confirmed evidence lives. The page is an instrument for evidence, not a stage — quiet, precise, and exact, with generous whitespace and hairline structure doing the organizing work that louder sites hand to color and shadow.

Density is editorial and unhurried. Each section is a full folio sheet in a bound stack, separated from its neighbor by a hairline rule and one upward curtain shadow; inside, content reads top-down as a record — kicker rules, two-voice headlines, ledger rows, annotated specimens. Motion is restrained throughout (180ms presses, slow orbital drifts, scroll-drawn ink), and every animated decision honors reduced-motion with a static, fully readable fallback. The dark theme is a true ink inversion of the same ramp, never a dimmed afterthought.

The visual language encodes the product's epistemic stance: solid verdigris marks what is durable and confirmed, while dashed rings, muted ink, and evaporating particles mark what is passive, assisted, or fading. Nothing on the page claims more than the evidence supports — there are no score badges, progress rings, or mastery meters anywhere in the system.

**Key Characteristics:**

- Warm archival paper with SVG grain tooth; true-ink dark inversion.
- One verdigris accent, rare by doctrine; everywhere else is ink on paper.
- Two-voice headlines: a plain sans line answered by a serif line.
- Hairline rules and ledger structure instead of boxes and shadows.
- Folio-deck sections with a single upward curtain seam between sheets.
- Monospace reserved for instrument labels; serif reserved for display.
- Solid ink means durable; dashed and muted means passive or fading.

## Colors

A single verdigris accent on a warm Flexoki paper-and-ink ramp, inverted for dark. Neutrals carry every surface; the accent is spent only on action, selection, focus, and confirmed-evidence marks.

### Primary

- **Verdigris Teal** (#1f7a72): the one accent. Primary CTAs, active and selected states, focus rings, "held" and "recorded" evidence marks, progress fills, and the unaided-retention ink on the chart. Its rarity is the point — most screens show it on fewer than a handful of elements.

### Neutral

- **Archival Cream** (#fffcf0): the page ground and the default text that sits on the accent.
- **Parchment** (#f2f0e9): raised surfaces — window shells, orbit hub, toggle wells, button fills.
- **Linen** (#e6e4d9): recessed wells, tile fills, and hover washes mixed back toward paper.
- **Linen Deep** (#dad8ce): the deepest neutral step in live use; key-chip fills and button-hover mixes.
- **Carbon Ink** (#100f0f): primary text, the wordmark dot, the orbit hub core, rules at full strength.
- **Soft Graphite** (#575653): secondary text, descriptions, nav links at rest, muted captions.
- **Faint Graphite** (#686762): tertiary micro-labels, quiet annotations, the passive-decay curve.
- **Accent Ink** (#fffcf0): text and glyphs that sit on Verdigris Teal; inverts with the theme.
- **Signal Red** (#d14d41, functional only): "Common trap" labels and failure-state marks. Never a second accent, never decoration.

Dark theme remaps the ramp in place (`:root[data-theme="dark"]`, mirrored by a `prefers-color-scheme` fallback): paper becomes Carbon Ink (#100f0f), tx becomes pale ink (#cecdc3), the accent brightens to #3aa99f with dark accent-ink (#100f0f), and the neutral steps deepen (paper-2 #1c1b1a, ui #282726, ui-2 #343331, tx-2 #aaa69e, tx-3 #8f8c85). Signal Red is unchanged across themes. Text selection is a 35% accent wash in both themes.

Two defined reserves (`--ui-3`, `--accent-deep` in `src/app/globals.css`) exist for deeper UI steps but have no live call sites yet; reach for them before inventing new values.

### Named Rules (optional, powerful)

**The One Accent Rule.** Verdigris appears only on action, selection, focus, and confirmed-evidence marks. If an element is none of those, it is ink on paper.
**The Hairline Rule.** Borders and rules are ink at 5–20% via `color-mix`, never solid grays. Dividers sit at 10% by default; interactive borders rest near 7% and rise toward 16–24% on hover.

## Typography

**Display Font:** Instrument Serif (with Georgia fallback)
**Body Font:** Inter (with system sans fallback)
**Label/Mono Font:** system monospace stack (ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)

**Character:** a scholarly duet — Inter states the plain fact in weight 400 with tight tracking, and Instrument Serif answers with the voice worth remembering. Both render at weight 400 almost everywhere; emphasis comes from the voice switch, size, and position, never from bold shouting. Antialiased, synthesis off, paragraphs wrapped pretty and display lines balanced.

### Hierarchy

- **Display** (400, clamp(2.5rem, 4vw, 4rem), 1.06, −0.025em): hero and close headlines in Instrument Serif. The hero card sets it slightly smaller (clamp(2.15rem, 3.2vw, 2.75rem), 1.08); phones drop to clamp(2rem, 8.5vw, 2.5rem).
- **Headline** (400, 2rem → 3rem across sm/lg, 1.08): section headings as a two-voice pair — a plain Inter line at −0.03em stacked over an Instrument Serif line at −0.01em. A compact variant sets 1.5rem → 1.75rem at 1.15.
- **Title** (serif, 400–500, 2xl → 4xl, tight): standalone serif section titles ("How a session works", "Why studying without notes sticks under pressure") and specimen targets (serif medium, snug, 1.25–1.85rem for questions and dossiers).
- **Body** (400, 1rem/1.6, −0.01em): reading text in Inter, held to narrow measures (hero 42ch, ledger 54ch, dossier 65ch). Detail text steps down to 0.875rem; captions, trust lines, and quiet notes to 0.75rem.
- **Label** (400, 0.75rem, 0.18em, uppercase): eyebrows and kickers in tracked-out sans — graphite at rest, semibold Verdigris in the hero card. Footer kickers shrink to 0.62rem at 0.14em.
- **Instrument mono** (0.62–0.75rem monospace): day tags, diagnostic kickers, window titles, legends, chart annotations, and citation footers. Uppercase with wide tracking for tags; plain for data.

### Named Rules (optional)

**The Two Voices Rule.** Section headlines always pair one plain sans line with one serif line — never two sans, never two serif, never a single shout.
**The Serif Reserve Rule.** Instrument Serif is for display, questions, quotations, and specimen targets. Body copy, UI chrome, and buttons are always Inter.
**The Mono Instrument Rule.** Monospace is for instrument labels only — kickers, tags, legends, chart annotations, citations. It never sets prose, and prose never sets labels.

## Layout

One centered measure governs the page: `.content-wrap` (max 72rem/1152px, 1rem gutters widening to 2rem at 640px). Sections below the hero are folio sheets in a bound deck — each shell holds near-viewport height (100svh minus the 3.5rem nav allowance), stacks in a rising z-ladder (retention 20, how-it-works 25, disciplines 30, memory 35, takeaway 40), and meets its neighbor with a top hairline plus the upward curtain shadow. The takeaway sheet is the deliberate exception: it top-aligns and caps at 44rem so the CTA and footer stack from the top instead of trapping slack between them.

Composition is two-column editorial that collapses honestly. The hero pairs copy (max 490px card) with the ink subject at 1.15fr/0.85fr, stacking to one column under 768px with the scene first and compacted. Disciplines, retention, and how-it-works all use 12-column grids on desktop (picker/ledger/tabs at 5, dossier/canvas/window at 7); memory runs three hairline-topped columns from 768px up. The close pairs the display headline with the CTA block at 1.2fr/0.8fr until 900px, then stacks.

Breakpoints are content-driven, not device-driven: 420px swaps the nav CTA to its short label; 640px widens gutters and lifts type steps; 768px collapses the hero, memory, and retention grids; 860–900px stacks the close and hides the horizon oval on phones; 1024px opens the discipline and window grids. Touch targets hold 44px minimums throughout, and every anchor section carries scroll margin for the fixed nav.

## Elevation & Depth

Flat folio, seamed. Surfaces rest flat and depth is carried by tonal steps, hairline rules, and the paper grain itself — a fixed full-page SVG turbulence layer (multiply at 38% opacity on light, overlay at 50% on dark) that gives every sheet tooth, with backdrop blur on the hero card so grain shows through frosted glass. Shadows are small, few, and functional: inset top highlights sell light on paper, 1px token rings (`--shadow-border`) bound the hero card and toggle glyph, and buttons carry a shallow press lift. The single large shadow in the system is the upward curtain seam (`0 -28px 56px -12px`) thrown where each folio sheet overlaps the last — depth as binding, not floating.

### Shadow Vocabulary (if applicable)

- **Token ring** (`--shadow-border`: 1px ink ring at 8% + 1–2px drops at 4–6%): the hero card, the appearance-toggle glyph. Hover deepens the ring toward 12–14% (`--shadow-border-hover`).
- **Card rest** (`--card-shadow`: inset 1px paper highlight + `0 20px 60px -30px` diffuse at 7%): raised panels at rest.
- **Button press** (inset 1px highlight + 1–2px drop + `0 6px 20px -10px` at 8%, deepening on hover): primary buttons; the accent button uses a single `0 4px 14px -3px` drop at 16% instead.
- **Folio seam** (`0 -28px 56px -12px` at 13% + top hairline): the curtain edge between stacked sections; 55% black in dark theme.
- **Window shell** (15% ink border + `0 4px 20px -4px` at 8%): the diagnostic window mockup.
- **Dial accents** (`0 4px 16px -6px` at 15% on orbit pills, `0 4px 20px -4px` at 18% on the orbit hub): small floats that keep the dial legible over paper.

### Named Rules (optional)

**The Flat-by-Default Rule.** Surfaces are flat at rest. A shadow must answer which state it belongs to — hover, press, selection, or the folio seam — or it does not ship.
**The No-Halo Rule.** Never put a drop shadow on the WebGL sphere container: it composites a visible rectangular halo against paper. Depth there comes from the shader lighting plus the radial paper underlay beneath the orb.

## Shapes

Soft rectangles, full pills, and circles — the geometry of paper, seals, and ink drops. Buttons and chips use a small, confident radius (0.6rem); tiles step up (0.875rem); window shells and panels are generous (1rem, hero card 18px relaxing to 16px on phones); orbit tabs, badges, and the appearance toggle go fully round (9999px). Circles recur as meaning: the wordmark dot, the orbit hub and its ink core, rail nodes, chart beads, and the fine-pointer cursor orb — the last drawn as an organic blob (`48% 52% 49% 51% / 52% 48%`) filled with the radial mark gradient.

Edges are hairlines, not outlines: 1px ink-at-low-alpha rules divide, frame, and underline. A heavier 2px left rail annotates specimens and evidence — Verdigris for held, recorded, and selected matter; plain ink at 25% for prompts; amber reserved for the identified-gap block inside the diagnostic mock. Dashed strokes are a semantic register of their own: dashed orbit rings, dashed "passive" legend beads, and the dashed open-format tile all mean provisional, evaporating, or not-yet-yours. The close horizon — a 220vw circle rising behind the CTA — is the system's one monumental curve, and it is killed entirely on phones rather than compromised.

## Components

Refined and restrained: controls answer every press in 180ms with a 0.96 scale settle, and nothing shouts. All interactive elements hold 44px touch minimums and show a 2px Verdigris focus outline at 2px offset.

### Buttons

- **Shape:** small confident rounding (0.6rem), Inter 500 at 0.8125rem (0.875rem on final CTAs), 44px minimum height.
- **Primary:** tonal ink-on-paper — parchment-mix fill, 10% ink border, inset highlight plus shallow press shadow (0.55rem 0.9rem padding). Hover deepens fill and border; press settles to 0.96 scale. The nav CTA.
- **Accent:** solid Verdigris with accent-ink text (0.75rem 1.25rem padding), a single soft drop, and a 1.08 brightness lift on hover. Reserved for the one action per region that leaves the page — always paired with a ↗ glyph. Press settles to 0.96.
- **Ghost:** transparent with graphite text; hover washes in a 50% linen fill with a 7% border and ink text. The quiet choice (Log in, secondary links-as-buttons). Press settles to 0.96.
- **Hover / Focus:** 180ms `cubic-bezier(0.2, 0, 0, 1)` on background, border, and shadow; visible Verdigris focus ring; disabled elements fade to 55% opacity with a not-allowed cursor.

### Text links

- **Style:** graphite body links brighten to ink on hover (hero secondary, nav links); accent links (dossier CTA with →, footer attempt link, underlined at 0.2em offset) deepen toward ink on hover. Footer band links transition color in 150ms.

### Navigation

- **Bar:** fixed, paper at 80% with extra-large backdrop blur, a 5% bottom hairline, and a 2.5rem inner row inside the 72rem measure. Safe-area aware.
- **Links:** small graphite items that warm to ink on hover; keyboard focus shows the standard ring. Under 768px they collapse behind a 20px three-line menu button (1.75px rounded strokes) into a paper-95% dropdown with 44px rows.
- **Trailing cluster:** appearance toggle, ghost Log in (hidden on small phones), and the primary CTA — which swaps to its short label under 420px.

### Wordmark

- **Lockup:** a solid ink dot (0.625rem, softly shadowed) beside the ink-on-transparent wordmark image (0.95rem tall, 1.25rem in larger sizes; inverted via filter in dark theme).
- **Behavior:** hover or keyboard focus crossfades the mark into its IPA pronunciation (`/ˈsoʊ·krə·tɪŋk/`, italic Inter 0.75rem) with a 300ms blur dissolve — so the name is sayable. The link carries an accessible "pronounced so-cre-tink" label.

### Appearance toggle

- **Control:** a 44px round icon-only button. The sun/moon glyphs crossfade inside a small orb well with a 300ms blur-and-scale dissolve; hover lifts the well to the hover tint with the hover ring, and focus adds the 3px 22%-accent halo. Press settles to 0.96. Honors reduced-motion with an instant swap.

### Tiles, chips, and badges

- **Tile:** linen-mix fill, 6% border, 0.875rem radius — the base for orbit pills and format tags.
- **Selection badge:** full-pill Verdigris tint (30% border, 10% fill, accent text, 0.75rem medium) for states like "Active Selection".
- **Neutral chips:** small rounded rectangles (paper-2 fill, 15% border, graphite text) for condition badges ("Free response", "No multiple choice").
- **Mono tags:** uppercase tracked monospace kickers ("Diagnostic prompt", "Target curriculum") that head specimens and panels.

### Orbit dial and dossier (signature)

- **Dial:** two dashed orbit rings (4px dashes at 12–15% ink) carry ten pill tabs that counter-rotate almost imperceptibly — inner ring counter-clockwise over 42s, outer clockwise over 62s. Motion pauses on hover or focus-within and freezes entirely under reduced-motion. A parchment hub with an ink core anchors the center.
- **Tabs:** tile-based pills (0.75rem, 44px touch area) in graphite; the selected tab takes a Verdigris border, a 20% accent wash, semibold ink text, and a soft drop. Full roving-tabindex keyboard support with arrow/Home/End travel.
- **Dossier:** the selected discipline renders as a specimen panel — a kicker rule with accent bead and mono stamp, a serif target headline, then two annotated blocks divided by a hairline: the trap (Signal Red label, italic graphite body) and the exam prompt (Verdigris label, ink body). A footer rule closes with a mono colophon and the accent CTA. The panel announces politely to assistive tech.

### Retention ledger and chart (signature)

- **Ledger:** a milestone timeline on a 1px rail — mono day tags that ignite to semibold Verdigris when active, serif headlines that grow from graphite small to ink large, and accordion disclosures (grid-rows, zero layout shift) pairing each summary with solid-accent "unaided" and dashed-outline "passive" data points.
- **Chart:** a high-DPI canvas drafting plane — 0.5px coordinate grid, monospace axis labels, a three-pass Verdigris ink stroke (aura, saturated core, fine spine) for unaided retrieval against a dashed graphite decay curve that sheds evaporating particles past the crossover. A dashed drafting leader calls out "The Crossover · ~Day 2"; end labels, a mono legend bar, and an academic citation footer complete the instrument. Scroll scrubs the drawing on a pinned stage; reduced-motion renders the finished chart statically.

### How-it-works tabs and window

- **Tabs:** vertical step cards (1rem padding, 0.875rem radius) pairing a mono step number — graphite at rest, Verdigris when active — with a serif title and graphite description. The active tab fills parchment with a 14% border and soft drop; a 2.5px Verdigris progress bar sweeps each 5s cycle and an explicit pause control governs auto-advance.
- **Window:** a 1rem diagnostic mockup shell — parchment body, traffic-dot chrome, mono title with Verdigris indicator — whose panels annotate with the 2px left rail: Verdigris for the selected target and recorded submission, ink-at-25% for the prompt, Signal-adjacent amber reserved for the identified-gap block. Panel swaps crossfade 220ms with a 6px rise, or instantly under reduced-motion.

### Memory columns

- **Record:** three hairline-topped columns, each opening with a plain 1.25rem sans title answered by a 1.1rem serif sub-line, a bespoke small illustration (accumulation timeline, open-format tiles, agency ledger rows), and graphite body. No cards, no boxes — the rule and the rhythm are the container.

### Footer bands

- **Rail:** brand lockup and a 0.72rem copyright line beside three bands (index, legal, attempt) divided by a 10% left rule on wider screens. Kickers are 0.62rem tracked capitals; links are graphite warming to ink; the legal band holds only the quiet line ("No newsletter. No social grid."); the attempt band closes the page with the underlined Verdigris CTA.

### Preloader and cursor

- **Preloader:** a 2px Verdigris bar sweeping the viewport top over 0.85s on first paint — compositor-only, pointer-transparent, hidden under reduced-motion.
- **Cursor (fine pointers only):** a 10px organic ink-orb that trails the pointer with heavy easing; over type it dissolves into an 18px ink caret, over clickables it blooms to 1.6×, and every press breathes. The native cursor hides while it lives.

## Do's and Don'ts

### Do:

- **Do** resolve every theme color through the token ramp; the retention canvas is the one sanctioned exception, mirroring literal hexes per theme behind a theme observer.
- **Do** pair section headlines as one plain sans line over one serif line, and keep both at weight 400.
- **Do** build borders and dividers from ink `color-mix` hairlines (5–20%); let tonal steps and the grain carry depth before reaching for shadow.
- **Do** give every motion decision a reduced-motion branch that leaves content fully readable — static chart, frozen dial, instant swaps, no auto-advance.
- **Do** hold 44px touch minimums and the 2px Verdigris focus treatment on everything interactive.
- **Do** use dashed strokes and muted ink to mean provisional or fading, and solid Verdigris to mean durable and confirmed.
- **Do** keep body measures narrow (40–65ch) and let sections breathe at near-viewport height.

### Don't:

- **Don't** introduce a second accent — Signal Red is functional (traps, failures), amber and the traffic-dot hues live only inside the diagnostic mock, and lab-only greens, violets, and ambers never leave `/ink-lab`.
- **Don't** set body copy, UI chrome, or buttons in Instrument Serif, and don't set prose or headlines in monospace.
- **Don't** put drop shadows on the WebGL sphere container or invent shadows outside the Shadow Vocabulary.
- **Don't** draw proof the product doesn't have: no score badges, progress rings, mastery meters, or testimonial cards — evidence honesty is a visual constraint too.
- **Don't** use solid gray borders, flat gray text, or unthemed hard-coded hexes in new UI.
- **Don't** trap closing content in vertically centered shells; the takeaway stacks CTA and footer from the top.
- **Don't** auto-advance, auto-play, or scroll-jack without an explicit, reachable pause or off-ramp.
