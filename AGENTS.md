
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Token-efficient Luna/Astra workflow

Luna is the primary orchestrator. Use Astra only for a bounded implementation
subtask in a fresh context; never fork the current task for delegation.

When delegating to Astra:

- Include only the relevant files, the concrete goal, constraints, and acceptance checks.
- Ask Astra to implement the smallest complete change and stop immediately afterward.
- Do not ask Astra to run broad tests, explain unrelated architecture, or continue iterating.
- Luna must inspect the diff, run tests, and validate the result after Astra returns.
- Keep routine planning, repository exploration, testing, and final decisions in Luna.

### Pareto-knee protocol

For repeated coding work, treat model configuration as an experiment rather
than an assumption. Record each run's configuration, task class, implementation
success, validation success, rework required, elapsed time, and observed quota
usage. Compare at least these policies on representative tasks:

1. Luna xhigh alone.
2. Luna xhigh with one Astra implementation subtask.
3. Luna xhigh with Astra only for the hardest bounded subtask.

Prefer the knee: the least expensive policy that preserves the validation
success rate of the best policy. Do not increase delegation depth or use Astra
for testing unless the measurements show a material benefit. A passing check
proves software behavior covered by that check; it does not prove broader
product or learning claims.
