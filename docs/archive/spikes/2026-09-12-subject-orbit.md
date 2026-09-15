# Subject orbit spike

Local preview: http://localhost:3002/#material. Port 3001 is an older production build.

Replaces the technical dossier with one approachable example question per subject, pairs the copy with a larger two-ring orbit, and moves the section after How a session works. Navigation and the folio stacking order follow the new placement. Phones use wrapping stationary tabs. The CTA still opens the app's existing entry point; selecting a subject previews an example locally and does not preselect an app session.

## Validation

- TypeScript and ESLint on changed TypeScript files passed; git diff whitespace check passed.
- Browser checks: desktop 1440px, phones 390px and 320px, light/dark themes, reduced motion.
- All 10 tabs select matching panels and distinct questions; no CTA movement during switching at 1440px and 390px.
- Arrow keys, Home/End, focus pause, explicit pause/resume, and keyboard travel into the question panel checked.
- 769 animation samples at 250ms intervals over the full 192-second repeating cycle: no overlapping labels, clipped text, or horizontal overflow at 1440px.
- 320px phone: no horizontal overflow and every subject target at least 44px high. Reduced motion: no orbit animations.
- No browser errors reported by the verification session. This is visual and interaction validation, not conversion or learning evidence. No production build or deployment performed.

## Run record

- Configuration: single agent in the inherited task configuration; no delegation or model switch. Exact host model and reasoning setting were not available for this record.
- Task class: bounded landing-page design spike.
- Implementation: complete. Validation: passed within the scope above.
- Rework: one batch to align source order with mobile reading and keyboard order, and remove retired orbit CSS.
- Elapsed from implementation baseline capture to this record: 258 seconds. Recorded 2026-09-12T00:21:31-05:00.
- Quota usage: unavailable; no cost or policy-comparison conclusion drawn from this run.
