
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## This repo

Public marketing site for [Socratink](https://socratink.ai). The product app lives at `https://app.socratink.ai/`.

- Copy lives in `src/lib/content.ts`. Components render it; they do not own it.
- Product truth: `PRODUCT.md`. Design tokens and craft: `DESIGN.md`.
- Do not invent testimonials, scores, customers, pricing, or colors.
- Do not add workshop routes, skill copies, or hillclimb packets to this tree.

## Testing

- Never write unit tests after you write code.
- Highly prefer E2E tests as the sole testing mechanism. Use them to verify complex features work. At the end of E2E tests, produce a verifiable and repeatable artifact.
- If you must test a system in isolation, first write down all the ways it could fail, then write the code.
