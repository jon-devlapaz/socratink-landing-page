# Socratink Landing

The official marketing and evidence demonstration landing site for [Socratink](https://socratink.ai).

## Tech Stack
* **Framework**: Next.js 16 (Turbopack, App Router, React 19)
* **Styling**: Tailwind CSS v4 + bespoke typography & scrollcraft tokens
* **Graphics**: Three.js (Organic Ink Sphere shader canvas)
* **Testing**: Playwright Core (headless browser smoke tests & a11y protocol audits)
* **Package Manager**: pnpm

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server on :3001
pnpm dev

# Build for production
pnpm build

# Serve production build on :3001
pnpm start
```

*(Port 3001 is default to avoid local collisions with services running on 3000).*

---

## Architectural Guide & Invariants

### 1. Single Source of Truth: `src/lib/content.ts`
All marketing copy, value propositions, syllabus learning targets, and Encounter dialogue live in [`src/lib/content.ts`](src/lib/content.ts).
* **Rule**: UI components render copy; they do not own or hardcode text strings.
* To add a new subject to the Orbit section, add an entry to `orbitDisciplines`.

### 2. Page Hierarchy (`src/app/page.tsx`)
1. **`<Nav />`**: Wordmark (with IPA pronunciation swap on hover), section anchors, and Appearance Toggle.
2. **`<Hero />`**: Value proposition, primary CTA, and WebGL `<OrganicSphere />`.
3. **`<EncounterStrip />` (`#method`)**: The primary interactive contract-slip spine (Cold → Ghost Cost → Ink Line → Bound Climax → Exit CTA).
4. **`<Orbit />` (`#material`)**: 10-discipline interactive syllabus switcher with rotating satellite geometry.
5. **`<Memory />` (`#memory`)**: Macro-loop continuity record (Accumulation Arc, Model Independence, Agency Keys).
6. **`<FinalCta />` + `<Footer />`**: Final invitation and 3-band footer.
7. **`<ScrollCraft />`**: Background engine coordinating scroll flow and accessibility focus.

### 3. Theme & Appearance
* Supports **Light** (Cream Paper `#fffcf0`) and **Dark** (`#100f0f`) themes.
* Managed via [`src/lib/theme.ts`](src/lib/theme.ts) and toggled via [`AppearanceToggle.tsx`](src/components/theme/AppearanceToggle.tsx).
* A zero-flash boot script (`themeBootScript`) runs in `<head>` to immediately match stored preferences or system settings.

### 4. Authentication Launchpad
* Authentication lives on the product app (`https://app.socratink.ai/login`).
* Visiting `/login` triggers a 307 redirect directly to the product app.
* Draft auth UI and components are preserved in Git tag `auth-preview-draft` and mirrored in the `socratink` product repository.

---

## Testing & Quality Gates

Run these commands before opening a PR or deploying:

| Command | Description |
| :--- | :--- |
| `pnpm run typecheck` | Validates TypeScript contracts (`tsc --noEmit`) |
| `pnpm run lint` | ESLint checks with zero tolerance for warnings |
| `pnpm run check` | Unified gate: runs typecheck, lint, and production build |
| `pnpm run test:smoke` | Playwright test verifying the EncounterStrip interaction sequence |
| `pnpm run test:a11y` | Chrome DevTools Protocol automated accessibility audit |
