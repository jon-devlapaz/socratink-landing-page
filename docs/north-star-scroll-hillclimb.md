# Socratink north-star story: gated hill-climb spec

Status: READY FOR PHASE 0. No design phase is approved yet.
Owner and taste authority: Jon.
Requested executor: Muse Spark 1.3 Max.
Work branch: `codex/north-star-scroll-hillclimb`.
Date: 2026-09-12.
Branch base: `e90b2883535359bee04b482ce2a9745aaa8f20c1`, plus the inherited working-tree changes.

## Start here

Execute this spec in the existing Socratink landing repository. Start with Phase 0 only. Present its review packet to Jon and stop. Continue each subsequent phase only after his explicit approval of the named phase/version.

Jon explicitly requested Muse Spark 1.3 Max for this work. This task-specific choice supersedes the Luna/Astra model-routing policy in AGENTS.md. Use one executor; do not delegate to Astra, launch subagents, compare model policies, or silently substitute a model. The spec does not configure the host's model: if the requested model is unavailable, state that before executing. Retain the repo's other instructions, including reading relevant installed Next.js documentation before coding.

The current working tree contains uncommitted design work inherited from `main`. The spec commit does not capture that work. Use this same checkout to retain the intended starting state. A fresh worktree from this branch will contain a different page until the working changes are deliberately transferred. Do not reset, stash, clean, overwrite, or commit inherited work wholesale. Inspect status and separate your changes from the baseline before every checkpoint.

## The brief, in Jon's words

> “i want to avoid users having to type in anything or click through anything in the landing page.”

> “my goal is a beautiful expression of the products promise (doesnt have to exist today) sort of a north start embodied in a tasteful multistacking way for each section. a story if you will.”

> “i dont like reinvevnting wheels for things others have proven works and is 2035 UI”

The audience is university and certification learners preparing for hard exams. The intended offer is a free diagnostic without sign-up. Jon clarified that the product/login experience is hypothetical and asked us to assume its best version. Express the intended future product; do not spend this project implementing authentication, diagnostic evaluation, a backend, or proving present availability.

The page itself is a passive, scroll-led story. A conventional primary CTA is allowed. Essential story content requires no typing, clicking, tab selection, dragging, hovering, autoplay controls, or waiting for a timer. Optional navigation and accessibility controls may remain.

Treat “2035” as an art-direction goal: spatial coherence, effortless comprehension, precise materials, calm intelligence, and very little visible interface. Preserve the existing paper-and-ink identity. It is not permission to add speculative technology or generic futuristic decoration.

The earlier `docs/landing-positioning-2026-09-12.md`, `/positioning` route, its stylesheet, and `src/lib/positioning-content.ts` represent a rejected interactive-preview direction. They are not the brief or the incumbent. Do not build on them. Any cleanup must be isolated and reported; do not mistake their existence for approval. This spec governs the new work.

## Intended outcome

A visitor should understand: **Socratink helps what I study become understanding I can use, retain, and build on.**

Candidate story spine, to be refined and approved in Phase 1:

| Existing section | Narrative job | Candidate visual development |
| --- | --- | --- |
| Hero | Introduce the promise and emotional character | Living ink, strong typography, a composed opening with depth |
| How it works | Make the learner's thinking visible | One authored explanation, a precise observation, an important distinction becoming clear |
| Disciplines | Connect the promise to the learner's material | A curated set of disciplines revealed through scroll, with concrete content |
| Retention | Express what remains after help and time recede | The same reasoning applied to a different problem later |
| Memory | Show understanding accumulating | Earlier effort retained within a richer personal record; the emotional peak |
| Final invitation | Resolve the story and invite a first step | A quiet, complete composition and the primary CTA |

The stack must mean something: earlier thinking remains beneath later understanding. Carry a recognizable mark, explanation, or reasoning structure across selected scenes. One signature moment is enough. Outer section stacking should feel consistent; internal compositions should vary with the narrative. Do not force identical animations into every section.

Ambition is allowed. Invented measured efficacy, testimonials, guarantees, customer records, and competitor limitations are not. Authored learning examples should be identifiable as illustrations. Replace unsupported branded retention percentages with qualitative storytelling. Do not fill the visitor experience with engineering caveats.

LearnVector is strategic context, not the protagonist. Its personalization and mastery language overlaps with the category. The candidate emphasis is the learner's capability becoming tangible. This is a positioning hypothesis, not a claim of exclusive functionality or a validated advantage.

## Stand on existing work

Use a small reference set already researched in this conversation:

| Reference | Borrow this principle | Do not inherit automatically |
| --- | --- | --- |
| [Apple product presentation](https://www.apple.com/airpods-pro/) | A focused benefit paired with a concrete, carefully composed scene | Carousels, click-dependent reveals, product-specific visual styling |
| [Linear](https://linear.app/) | Typography, restrained surfaces, precise product illustrations | Its dark theme, SaaS grid, or entire page structure |
| [The Pudding](https://pudding.cool/process/how-to-implement-scrollytelling/) | A persistent visual changes as the reader advances the story | Its historical library recommendations |
| [Dieter Rams / Vitsœ](https://www.vitsoe.com/us/about/good-design) | Understandability, restraint, longevity, detail | A copied aesthetic or universal conversion claims |

These are craft and technique references, not experimental proof of Socratink conversion. Inspect only the relevant frames and transitions. Label observations separately from interpretation. No broad inspiration crawl; add a reference only to resolve a named design problem. Reuse the repository's landing-page and scroll skills selectively, without turning all of their generic deliverables into extra work. Jon's scroll-only requirement overrides interactive-demo or mandatory-widget defaults.

Existing foundations: Next.js, React, GSAP/ScrollTrigger, Lenis, Three.js, brand assets, theme tokens, and folio section wrappers. Prefer CSS sticky for document structure and the established animation tools for choreography. Audit existing scroll ownership before adding animation; avoid competing progress controllers. Keep text semantic and selectable. Reserve WebGL for visual effects that materially benefit from it. No new animation library, generic site generator, or custom scroll engine without a demonstrated need and Jon's approval.

Read progressively: first `AGENTS.md`, this spec, `DESIGN.md`, `src/app/page.tsx`, and `src/lib/content.ts`; then only the components relevant to the current phase. Existing key files include `Hero.tsx`, `how-it-works/`, `Orbit.tsx`, `RetentionCurve.tsx`, `Memory.tsx`, `FinalCta.tsx`, `CinematicScroller.tsx`, and their styles under `src/components/site/`.

## Hill-climb rule

Keep an **incumbent**: the last version Jon accepted for this phase. Each **challenger** changes one named design dimension, such as hierarchy, visual metaphor, or transition timing. A technical fix can touch several files; it must still serve that one hypothesis.

1. Name the largest visible weakness and the expected improvement in one sentence.
2. Make the smallest complete challenger. Do not generate several full-page alternatives.
3. Compare incumbent and challenger at matching viewport, theme, scroll positions, and content.
4. Run the applicable quality checks. Repair hard failures before presenting it.
5. Present the comparison and a recommendation. Jon decides whether to accept, revise, or keep the incumbent.
6. Record his decision. Approval applies only to the named scope/version; it is not permission to skip later gates.

After two rejected challengers on the same issue, stop generating variants. Summarize the disagreement and ask Jon what should feel different. Silence, elapsed time, an automated score, a passing build, and the executor's preference never count as approval. If a new constraint invalidates an earlier decision, reopen only the affected gate.

## Quality and taste checks

Hard gates are pass/fail: scroll-only comprehension; no invented evidence; readable essential text; no clipping or accidental overlap; no stuck scrolling or broken reverse states; usable mobile and reduced-motion versions; no introduced runtime errors. Apply relevant gates to each phase. Phase 0 records inherited failures without fixing them; still-frame phases cannot certify runtime behavior. No score can compensate for a failed hard gate in an implemented challenger.

Use these five taste dimensions in every review, scored 1–5 with one short piece of visual evidence each:

| Dimension | Question |
| --- | --- |
| Promise clarity | Can the visitor say what changes for them, without our narration? |
| Narrative continuity | Does this advance the story and connect to what came before? |
| Composition and material | Does the still frame have deliberate hierarchy, spacing, depth, and a coherent paper-and-ink character? |
| Motion meaning and pacing | Does movement explain a relationship, with enough time to read and a satisfying resting state? |
| Distinctiveness and restraint | Does it feel specific to Socratink, with one clear focal idea? |

Anchors: **1** obstructs or confuses; **3** coherent but ordinary; **5** precise, memorable, and ready to keep. Use N/A when a dimension cannot yet be assessed. Agent scores are diagnostic opinions. Jon's taste is authoritative; do not compute a weighted “quality” total or claim objective superiority. A challenger is worth keeping when it improves the target dimension without an unaccepted regression elsewhere.

## Phases and explicit review gates

### Phase 0 — Preserve the baseline and agree on the brief

Inspect branch/status and capture the actual current homepage at desktop and phone widths. Verify which process/checkout serves the preview; do not assume an existing production server reflects working files. Capture the current section sequence and identify inherited prototypes, unsupported illustrative numbers, and competing scroll behaviors. Do not modify product source yet.

Deliver: one contact sheet, a brief of at most 250 words, and the three largest gaps against Jon's intent. Note the baseline commit, dirty files relevant to the page, and preview command/URL. Ask: **“Is this the right starting point and promise?”** Stop for approval.

### Phase 1 — Settle six compositions

Produce six annotated still compositions using the existing sections and visual identity. Each has one promise, one focal visual, one transition intention, and its emotional role. Keep real copy legible; avoid six wireframe rectangles. Show them together so the arc can be judged. Include a phone composition for the most difficult scene. These are design artifacts, not a replacement app or another interactive landing route.

Deliver: the six-frame storyboard, a concise reference-to-design mapping, and the proposed signature moment. Taste checks: hierarchy, believable materials, continuity, restraint, and a clear emotional peak. Ask: **“Does this feel like Socratink's future, and which frame should change?”** Stop for approval of the revised storyboard before motion work.

### Phase 2 — Establish the motion standard with one slice

Implement one representative two-section transition within the existing page on this branch. Prefer the transition that carries thinking into retained understanding if Phase 1 supports it. Show its entry, middle, resolved state, and reverse behavior. Use final-quality type/materials for this slice. Do not rebuild the rest of the page.

Deliver: a short browser recording or an accessible live preview plus matched stills; desktop, phone, and reduced-motion evidence; targeted checks. Ask: **“Should this be the motion and material standard for the rest?”** Stop. A beautiful screenshot alone cannot pass this gate.

### Phase 3 — Extend the approved language, one section at a time

Apply the accepted standard to the remaining sections. Preserve variety inside the shared stacking behavior. Resolve visitor-facing prototype selectors and click-dependent story paths as their sections are revised. Keep inherited unrelated work intact. Do not add quizzes, inputs, tab flows, or a new conversion page.

Treat each remaining section as a subphase with its own review stop. Deliver its entry/rest/exit evidence, connection to its neighbors, and a short before/after explanation. Ask: **“Keep this section and continue to the next?”** Proceed only after approval. Do not batch all remaining sections behind one approval.

### Phase 4 — Judge the complete story

Review the entire page with no explanatory narration. Check first impression, sequence, reading room, repeated arguments, transitions, the peak, and the final invitation. Use one full recording and a contact sheet. Desktop and phone must tell the same story even when composed differently.

Deliver: full-page experience, taste comparison against the Phase 1 intent, and at most three material remaining weaknesses. Ask: **“Does this tell the story you wanted? What breaks the spell?”** Hill-climb the largest weakness, then stop for whole-story approval.

### Phase 5 — Harden and hand off

Verify 390, 768, 1024, and 1440px layouts, a narrow 320px check, both themes, reduced motion, keyboard navigation, 200% zoom, and WebGL fallback where used. Exercise slow scroll, fast flicks, reverse scroll, reload midway, and resize. Essential content must remain available without motion. Stop offscreen rendering and check loading states. Measure frame behavior on a stated browser/device rather than claiming universal smoothness.

Run `pnpm run check` and appropriate existing browser checks. Inspect scripts first: old text/section assertions may encode a design that Jon has now changed. Update only obsolete assertions affected by this work and preserve their behavioral purpose. Report inherited failures separately; do not weaken checks to get a green result. Add tests only for meaningful new behavior.

Deliver: final preview, concise validation results, known limitations, and a scoped diff. Ask: **“Approve this branch as the finished landing-page direction?”** Stop for final approval. Do not merge, push, publish, or deploy as part of this spec. A design approval is not evidence of conversion lift or learning efficacy.

## Compact review packet and state

Every gate shows the artifact first, then at most 200 words:

- Phase/version and incumbent identifier.
- What changed, why, and what to look at.
- Applicable hard gates and five taste checks, with evidence.
- One recommendation and one decision question.

Keep a single small companion file, `docs/north-star-scroll-hillclimb-state.md`, when execution begins. Record current phase, last approval in Jon's words, incumbent artifact/commit, current weakness, and next permitted action. Add one row per challenger:

`phase | version | model/config | hypothesis | files | validation | Jon's decision | rework | elapsed | observed usage`

Record unavailable usage as “unknown”; never infer token savings from wall time. Reference artifacts by path rather than embedding long transcripts. Store screenshots/recordings in one local review folder, not scattered across source. Do not commit large media by default. Commit only deliberately scoped changes; do not use `git add .`. A checkpoint involving an inherited dirty file must preserve and distinguish the original work rather than silently bundle it into this task's change.

## Efficiency and stopping conditions

Use one active candidate and one approved incumbent. Research once, read relevant files once, reuse the approved design language, and run checks proportional to the change. Do not spend the expensive model on repeated full-repo exploration, endless options, broad documentation, or test-output narration. Maintain an artifact/state handoff so a fresh context can resume without rereading the full conversation.

Stop a phase when Jon approves it. Stop iterating when remaining differences are unrequested preferences rather than identified weaknesses. If the model cannot produce or inspect the necessary visual evidence, report the exact gap and keep the gate pending. Never claim a taste check was completed from code alone.

The project is complete only when the scroll-only existing page expresses the approved north-star story, passes the applicable technical checks, and Jon explicitly approves Phase 5.

## Pasteable executor handoff

> Use Muse Spark 1.3 Max in the existing working checkout of this repository on `codex/north-star-scroll-hillclimb`. Read `AGENTS.md` and `docs/north-star-scroll-hillclimb.md`. Follow the task-specific model choice and preserve the inherited uncommitted work. Execute Phase 0 only, show me the concrete review packet, and stop for my approval. Do not implement later phases, build another landing page, or add visitor inputs/click-through interactions. Record the approved state so each later phase can resume cheaply.
