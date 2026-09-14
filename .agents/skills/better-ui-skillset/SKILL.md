---
name: better-ui-skillset
description: >
  Router for the better-ui-skillset skillset. Use when work involves better-accessibility, better-colors, better-interface, better-layout, better-typography, better-ui, better-writing, break, explain-interface, interface-review, variant.
  Do not use when a single named member skill is already the clear owner.
---

# Better Ui Skillset

Route. Prefer members under this skillset tree over any sibling standalone
skill with the same name.

## 1. Classify the request

Pick the lightest owner that covers the ask:

| Ask | Load |
| --- | --- |
| Helps your project comply with accessibility standards and best practices. | [better-accessibility/SKILL.md](better-accessibility/SKILL.md) |
| Helps you build a color system and answer anything about color in your project. You can generate palettes, use semantic tokens, convert between formats, check contrast and more. | [better-colors/SKILL.md](better-colors/SKILL.md) |
| Combines all of the `better-*` skills into a single review across accessibility, layout, writing, typography, color and UI polish. | [better-interface/SKILL.md](better-interface/SKILL.md) |
| Helps with grouping, alignment, reading order, progressive disclosure and other details that make a good layout. | [better-layout/SKILL.md](better-layout/SKILL.md) |
| Focuses on type scale, spacing, sizing, variable fonts, OpenType features, wrapping, truncation and other details that make typography feel great across your product. | [better-typography/SKILL.md](better-typography/SKILL.md) |
| Polishes and improves the UI in your project. Covers concentric border radius, optical alignment, surface depth, contextual icons, hit areas and more. | [better-ui/SKILL.md](better-ui/SKILL.md) |
| Focuses on improving product copy in your project. | [better-writing/SKILL.md](better-writing/SKILL.md) |
| Renders a component you choose in every state and scenario on a temporary page and stress tests it. | [break/SKILL.md](break/SKILL.md) |
| Helps you figure out how something was built on the web. | [explain-interface/SKILL.md](explain-interface/SKILL.md) |
| Reviews your work across multiple categories like UI, typography, layout, color, writing and accessibility and gives you a detailed analysis of the findings. | [interface-review/SKILL.md](interface-review/SKILL.md) |
| Builds multiple variants of a component you're working on and helps you iterate and pick one. | [variant/SKILL.md](variant/SKILL.md) |

If the user names a member, load that member only.

If several domains are in play and a coordinator owns that workflow, load it.
Otherwise load only the owners needed for the change.

## 2. Hand off

1. Read the chosen member `SKILL.md` in full.
2. Follow that skill's procedure, references, and reporting format.
3. Load sibling members only when the chosen skill names a handoff, or when a
coordinator requires its workers.

## 3. Boundaries

- Leave `.tink-skillset.json` untouched. It is ownership and digest evidence.
- Skillset install, refresh, and remove stay with `manage-tink`.
