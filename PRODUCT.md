# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Socratink is for adults learning hard material. They may be preparing for an exam or certification, learning a technical skill at work, or studying a subject on their own. They want to explain an idea clearly when someone asks them about it.

## Product Purpose

Socratink helps one learner work through a question with an AI tutor. The learner tries an explanation, gets help where they need it, and sees what they can do on their own. The landing introduces this experience to people who study technical and academic subjects.

## Positioning

**Make the thinking your own.**

Pick something you wish you could explain to a friend. Talk it through with an AI tutor. Your skill map shows what you can do with help and what you can do on your own.

## Operating Context

1. Bring a question to the tutor. It breaks the topic into skills and asks about what the learner already knows.
2. Type or dictate an explanation. The tutor asks the learner to give reasons, make a prediction, or try an idea on a new problem. The learner can ask for a hint or a direct answer.
3. Look at the skill map. The tutor rates each skill from 0 to 5 based on the conversation. The learner uses the map to choose what to practice next. [Tutor’s skill scale](https://github.com/jon-devlapaz/socratink/blob/main/src/learning/socratic-tutor.ts#L55-L60)

The public site introduces the tutor. “Start learning” opens the app in the browser. A guest can start without an account. Signing in lets learners reopen their conversations across devices. [App capabilities](https://github.com/jon-devlapaz/socratink/blob/main/PRODUCT.md)

## Capabilities and Constraints

- Describe what the learner demonstrated in the conversation. A skill level is the tutor’s judgment about that work. Claims about retention on another day or readiness for an exam need separate evidence.
- Attribute explanations and answers to their author. The tutor records help such as hints and worked examples.
- Verify export and deletion features against the app before promising them. The privacy policy states that Socratink never uses private sessions to train public models. Describe data handling within the terms of that policy. [Privacy policy](https://socratink.ai/privacy)
- Use evidence for any testimonials, customers, benchmarks, learning gains, pricing, licensing, press, or deployment claims. Keep planned features and unverified outcomes out of current product descriptions.

## Brand Commitments

- **Name** Socratink, pronounced “so-cre-tink” (`soʊ krə tɪŋk`).
- **Voice** Speak to the learner in plain language. Give each chapter one short paragraph about what the learner can do. The reference guide holds the full skill scale.
- **Site and app** [socratink.ai](https://socratink.ai) introduces the method. The learner’s conversation takes place at [app.socratink.ai](https://app.socratink.ai/).

## Evidence on Hand

- `src/lib/content.ts` holds the landing copy. `src/app/page.tsx` puts the invitation, chapters, and closing link in reading order.
- `public/brand/` holds the wordmark and ink artwork. The hero and chapter renderers live in `src/components/ink/` and `src/lib/ink/`.

## Product Principles

- Learners own the work they write. The product aims to make their records permanent and portable in plain text.
- Learners choose when they want help. Keep the help they receive with the work it informed.
- In the long run, learners should be able to recall an idea later, apply it in a new setting, and explain it to another person. A later unaided attempt would provide evidence for that goal. [Product north star](https://github.com/jon-devlapaz/socratink/blob/main/NORTH-STAR.md)
