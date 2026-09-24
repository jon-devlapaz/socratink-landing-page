# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: adults facing consequential performance demands in difficult technical or academic material — "stakes learners" preparing for exams, certifications, or professional performance where guessing fails.

Confirmed subtypes (all in scope, not ranked against each other):

- Self-directed learners working through hard material on their own.
- University and certification learners (medical boards, bar outlines, cloud certifications, and similar).
- Professionals acquiring hard bodies of knowledge for work.

Situation and job: before test day, the learner must find out what they actually know. The job is proving durable capability through unaided recall — producing an explanation from memory, seeing which parts of the reasoning hold up and where the gaps are, and getting a useful next practice step.

## Product Purpose

Socratink is a learning agent for hard material. It makes the learner do the thinking, keeps the evidence of what they produced, and is built to come back later to see whether the capability became theirs.

It exists to optimize for independently demonstrated durable capability: exposure is not evidence, and immediate performance is not durable learning. Learner-authored work is the evidence, and assistance provenance survives.

Success means the learner knows what they actually know before the exam begins — they can name what held, what didn't, and what to try next. This repository is the marketing and evidence-demonstration landing site for Socratink; the product app lives at `https://app.socratink.ai/`.

## Positioning

Cold-recall evidence of durable capability — the mechanism a neighboring product could not truthfully copy without changing what it is:

- The learner produces free-response work from memory: no multiple choice, no notes, no AI autocomplete.
- Assistance conditions are recorded honestly and survive with the work.
- A later unaided check tests whether the capability became durable, because immediate correctness is not durability.

Tagline: "Know what you actually know." Built for subjects where guessing is not an option.

## Operating Context

The core session loop (3 steps):

1. Pick one target — a curriculum concept, exam specimen, or the learner's own pasted syllabus/outline.
2. Explain it unaided — write the mechanism from memory, free response.
3. Inspect what holds — compare against the benchmark: held concepts, identified gaps, and a follow-up check.

Entry point: a free diagnostic (about 5 minutes) that runs directly in the browser with no sign-up, no account, and no credit card. The landing offers sample prompts from 10 technical disciplines; the app also accepts the learner's own study outline. Authentication lives on the product app (`https://app.socratink.ai/login`); visiting `/login` on the landing redirects there (307).

Evaluation facts: a cold attempt starts the evidence; feedback is honest self-comparison ("Compare your reasoning"), never generic copy presented as personalized diagnosis of free text; examples are labeled as examples for their full duration and never masquerade as the learner's work. The landing walkthrough itself stores nothing; durable records live in the app.

## Capabilities and Constraints

Confirmed capabilities:

- Free in-browser diagnostic; no account required to start.
- 10 supported sample disciplines, each with a learning target, an "AI trap" (fluent assistance that hides the gap), and a transfer ask answered from memory without notes.
- Long-term review: a log of what the learner produced cold, saved in plain readable text.
- Ownership: export study logs as Markdown or JSON; edit or delete history anytime. Socratink never uses private sessions to train public models.

Durable constraints (user-confirmed, strict):

- Product language must never exceed available evidence. Describe the method and what Socratink is built to do; no mastery scores, manufactured progress, engagement language, or inflated claims.
- No fabricated proof: no invented testimonials, customers, benchmarks, pricing, licensing, press, or deployment claims.
- Learner-authored work is first-class evidence; assistance provenance (including "before/after help" conditions) survives with it.
- Records stay permanent and portable plain text the learner owns.

Terminology: diagnostic, target, cold recall (unassisted attempt from memory), held concept, identified gap, follow-up / retention check, transfer ask, AI trap.

Explicitly undecided: the exact retention-scheduling mechanism, any adaptive diagnosis or automatic grading behavior, and pricing/licensing. Future work must use aspirational/plan language for app behaviors not yet verified, and must not promise scheduled checks, persistent records, adaptive diagnosis, or grading unless the real handoff supports them.

## Brand Commitments

- Name: Socratink. Pronunciation: "so-cre-tink" (`soʊ krə tɪŋk`).
- Tagline: "Know what you actually know."
- Description: "A learning agent for hard material. It makes you do the thinking, keeps the evidence of what you produced, and is built to come back later to see whether the capability became yours."
- Site: `https://socratink.ai`. App: `https://app.socratink.ai/`.
- Voice (confirmed): precise and evidence-honest; plain about the method and its limits; no sales language, stock claims, or engagement copy.
- Assets on hand: `public/brand/socratink_wordmark.png`, `public/brand/living-ink-poster.png`, `public/brand/ink-map-light.png`, `public/brand/ink-speak-light.png`, `public/brand/ink-teacher-light.png`.

## Evidence on Hand

Real, with paths:

- Live marketing copy in `src/lib/content.ts` — site, hero, notebook invitation, map/speak/keep chapters, colophon, footer, 404.
- Visitor page in `src/app/page.tsx` — nav, hero, folio sheets, colophon.
- Living-ink renderer used by the hero and chapter marks: `src/lib/ink/`, `src/components/ink/InkSphere.tsx`, `src/components/ink/ChapterInk.tsx`.

Absences future work must not fabricate: testimonials, customers, case studies, benchmarks or learning-gain numbers, mastery scores, pricing, licensing, press, and deployment claims.

## Product Principles

1. Durable capability over assisted fluency: the unit of evidence is unaided recall, not fluent-looking output produced with help.
2. Evidence honesty: language never exceeds what is established; show what holds, what doesn't, and what a result does not establish.
3. Learner authorship with provenance: the learner's own attempts are first-class; assistance conditions and example labels survive with the work.
4. Ownership and portability: study records belong to the learner in plain text — reviewable anywhere, exportable, deletable, never used to train public models.
5. Later verification over immediate performance: being right once is not knowing; a later unaided check decides what became yours.
