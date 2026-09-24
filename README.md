# Socratink Landing

The public site for [Socratink](https://socratink.ai). The product app is [app.socratink.ai](https://app.socratink.ai/).

## Stack

- Next.js 16 (App Router, Turbopack, React 19)
- Tailwind CSS v4 plus tokens in `src/app/globals.css`
- Three.js living-ink renderer for the hero and chapter marks

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3001
pnpm check        # typecheck, lint, hygiene, production build
```

## What ships

`src/app/page.tsx` is the visitor path:

1. **Nav** — wordmark and appearance toggle
2. **Hero** — invitation, CTAs, living ink
3. **Folio** — map, speak, keep
4. **Colophon** — start-learning close and legal links

Copy is in [`src/lib/content.ts`](src/lib/content.ts). Privacy and terms are separate routes. `/login` redirects to the product app.

## Checks

| Command | What it covers |
| :--- | :--- |
| `pnpm run typecheck` | TypeScript |
| `pnpm run lint` | ESLint |
| `pnpm run test:hygiene` | Dead workshop files stay gone; live copy and metadata stay intact |
| `pnpm run test:hero-se` | iPhone SE hero clearance (needs the dev server) |
| `pnpm run check` | typecheck, lint, hygiene, production build |
