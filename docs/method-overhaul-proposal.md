# Method section: proposed overhaul

2026-09-09. Proposal, not implemented or validated with visitors.

The section should leave a visitor thinking: “I found a gap in my reasoning, and I know what to try next.” The current sequence leaves them with a record of what the experience cannot establish.

## Recommended experience

**Find the gap in your understanding.**

Try a question. Work through the missing idea. Use it in a new situation.

Keep the statistics concept, but introduce it through an everyday situation:

> A university asks students leaving its gym how often they exercise. It plans to ask 10,000 students instead of 100. Will that make the results representative of the whole university? Explain why.

Three visible steps, advanced with buttons:

1. **Your attempt.** Show the concrete question and a comfortably sized multiline answer field immediately. Primary action: “Compare your reasoning”. Secondary actions: “I’m not sure yet” and “See an example”. Reveal no answer before the visitor attempts or explicitly requests help. Preserve the draft when scrolling or going back.
2. **Work through it.** Keep the original response visible. Reveal the central question: “Who is less likely to be included, even if we ask 10,000 people?” Offer a short explanation on request: “A larger survey still samples people who go to the gym. Students who rarely go remain underrepresented. To represent the university, change how students are selected.” Let the visitor revise their answer without overwriting the first attempt.
3. **Try a different case.** “A company estimates customer satisfaction using only people who contact support. It collects ten times as many responses. What would you change about the survey, and why?” Keep the explanation hidden until the visitor attempts or requests it. Finish with the actual attempt and assistance conditions, plus a clear route into the app.

Use a plain closing qualification: “This is one practice attempt. Remembering it later still needs a later check.” Do not promise a scheduled check, persistent record, adaptive diagnosis, or automatic grading unless the real handoff supports it and has been verified.

### Feedback integrity

The first landing version can use authored prompts and self-comparison. Call the feedback “Compare your reasoning”; do not claim that generic copy diagnoses a visitor’s free text. A curated walkthrough can show a specific sample response and its corresponding follow-up, with “Example response” visible throughout. Genuine individualized evaluation is a separate implementation dependency, not something to imply with a simulated typing animation.

Show “Before viewing help”, “After a hint”, or “After viewing an explanation” according to actual actions. A new problem after teaching is practice in applying the idea, not evidence of durable learning. “I’m not sure yet” opens a useful first prompt rather than a refusal label.

## Visual direction

- Retain warm paper, dark ink, the serif headline, and one restrained accent for actions.
- Replace the narrow full-height slip with a wider reading surface. Put a brief promise and the three step names beside it on wide screens; stack the introduction above it on small screens.
- Keep question, response area, and next action together in ordinary document flow. Avoid blank full-screen holding states, scroll-controlled form transitions, and nested scrolling.
- Use a legible sans serif for instructions, feedback, and entered text. Reserve the expressive serif for the main question or section heading. Start body/input text at 16px.
- Use the living ink sparingly to mark an actual transition, such as an attempt being submitted or a new question appearing. Keep all meaning in persistent text. Do not treat a decorative form as a diagnostic result.
- Give the visitor an immediate useful view even if they never interact. “See an example” supplies a clearly labeled walkthrough without impersonating their work.

The memorable moment should be the missing idea becoming clear. Fading letters and crossed-out claims currently compete with that job.

## Scope and coverage of the current interface review

Inspected the existing localhost Method sequence from the explanation through a typed response, its settled conclusion, and the exit. Read the cold/sample/uncertainty paths in source. Surrounding page copy was used for context; other sections and the product app were not audited.

Stack: Next.js 16, React, Tailwind v4, bespoke CSS and paper/ink theme tokens. Conventions found: AGENTS.md, README.md, docs/encounter-contract-slip-ship.md, and src/lib/content.ts. The old ship spec explicitly makes claim refusal the climax. This proposal changes that decision; it retains honest assistance labels and limited claims.

| Domain | Evidence inspected | Result |
| --- | --- | --- |
| Accessibility | Native controls, input naming, inert panels, live-region markup, focus CSS, reduced-motion branch, live accessibility tree | Source-level focus issue below; full keyboard/screen-reader and reduced-motion behavior not verified |
| Layout | Supplied desktop screenshot, live smaller viewport, sticky shell, card geometry, scroll spacers | Finding below; 320px and 200% zoom not verified |
| Writing | Section and surrounding copy, typed response conditions, full settled result | Two findings below |
| Typography | Live explanation and result, per-character spans, font and line-height declarations | Finding below |
| Colors | Existing light/dark tokens and local color declarations | Rendered contrast not measured; no contrast verdict |
| UI polish | Live ghost, answer, claim animation and exit; transition CSS | Result treatment finding below; slow-motion replay not verified |

## Findings

| Severity | Domain | Location | Before | After | Why |
| --- | --- | --- | --- | --- | --- |
| HIGH | Writing | `src/components/site/EncounterStrip.tsx:211`, `src/components/site/EncounterStrip.tsx:308` | Explanation appears before the answer field; typed work is labeled “unassisted on this slip · no answer key” | Ask first; label help according to actual exposure | The stated conditions contradict the experienced sequence |
| HIGH | Accessibility | `src/components/site/encounter-strip.css:251`, `src/app/globals.css:586` | Input removes its outline; shared focus rule names links, buttons and textareas but omits inputs | Include the answer input in a visible focus treatment | Source confirms missing focus treatment on a keyboard-reachable control; live keyboard walkthrough remains unverified |
| MEDIUM | Writing | `src/lib/content.ts:261`, `src/components/site/EncounterStrip.tsx:316`, `src/components/site/EncounterStrip.tsx:469` | A submitted response receives fixed non-inferences, with no answer-specific teaching; controls say “Commit ink” and “Bound” | Provide honest self-comparison or real supported feedback, a next question, and literal action names | User effort currently buys little understanding or direction |
| MEDIUM | Layout | `src/components/site/encounter-strip.css:37`, `src/components/site/encounter-strip.css:55`, `src/components/site/encounter-strip.css:415` | A 28rem rail sits in a full-height sticky shell; five spacers total 412vh; scrolling chooses the active form stage | Content-sized learning surface with explicit next/back controls | Large empty intervals obscure progress and separate the visitor’s actions from advancement |
| MEDIUM | Typography | `src/components/site/EncounterStrip.tsx:393`, `src/components/site/encounter-strip.css:217` | Every character gets an inline-block transform; the live explanation has crowded words and breaks inside words while dissolving | Render normal paragraphs; if needed, transition an entire completed block after an explicit action | Decorative text treatment interferes with reading the lesson |
| MEDIUM | UI polish | `src/components/site/encounter-strip.css:389` | The settled result strikes through “Does not establish…” statements | Use one readable qualification beside a useful result | Crossing out a negative statement makes the intended meaning ambiguous; it also conflicts with the existing ship spec |

## Verification

- Opened the existing `http://localhost:3001/` tab and observed the explanation fading.
- Scrolled to the answer field, entered “A bigger sample can still leave people out.” and selected “Commit ink”. The field became read-only and the hint changed to “Ink recorded. Keep scrolling.”
- Scrolled to the result. The exact response appeared with “Visitor ink · unassisted on this slip · no answer key”, followed by three crossed-out non-inferences. No response-specific explanation or next learning question appeared.
- Scrolled to the exit. It offered the app CTA and stated that this walkthrough stores nothing. Did not follow the external CTA.
- No automated tests or build were run for this proposal. No application source was edited. Sample/uncertainty paths, reload, narrow/mobile, dark mode, zoom, keyboard completion and actual screen-reader announcements remain unverified.

## Acceptance experiment

Before committing to a broader rebuild, test this single sequence with five unfamiliar target visitors. Proposed decision rule: at least four can explain what Socratink asks them to do, begin without help navigating, and identify one useful change to their reasoning or next practice step. No visitor should mistake an example or generic self-check for personalized grading.

Check keyboard completion, small screens, zoom, reduced motion, back navigation, and honest help labels as implementation acceptance criteria. These establish usability and integrity, not a tenfold learning improvement. Durable learning remains a separate question requiring later unaided checks.

## Current-interface verdict

**Block** within the inspected scope: correct the contradictory assistance label and missing answer-input focus treatment before shipping this sequence. The broader redesign is a proposed product direction, with visitor testing still pending.
