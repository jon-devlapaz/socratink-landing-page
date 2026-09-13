---
name: personas-skillset
description: >
  Router for the personas-skillset skillset. Use when work involves andrej-karpathy-perspective, andrew-ng-perspective, kenneth-koedinger-perspective, martin-fowler-perspective, matt-pocock-perspective, sal-khan-perspective, steve-jobs-perspective.
  Do not use when a single named member skill is already the clear owner.
---

# Personas Skillset

Route. Prefer members under this skillset tree over any sibling standalone
skill with the same name.

## 1. Classify the request

Pick the lightest owner that covers the ask:

| Ask | Load |
| --- | --- |
| An evidence-grounded Andrej Karpathy perspective for technical reasoning, product and research decisions, learning strategy, AI engineering, and evaluating agent autonomy. Built from 92 distinct public URLs across first-party writing, interviews, talks, projects, dated actions, and external criticism. Distills 6 mental models, 9 decision heuristics, expression DNA, temporal updates, and explicit limits. Use when the user asks for an Andrej Karpathy perspective, asks what Karpathy's documented reasoning suggests, requests a Karpathy-style decision review, or says "Karpathy mode", "how would Karpathy think about this?", or "use Andrej's lens". | [andrej-karpathy-perspective/SKILL.md](andrej-karpathy-perspective/SKILL.md) |
| Andrew Ng-derived perspective based on a primary-heavy cited corpus, five mental models, and nine heuristics. Use for “Andrew Ng perspective,” “think like Andrew Ng,” or an evidence-led learning startup competing with LearnVector. Do not auto-trigger otherwise. | [andrew-ng-perspective/SKILL.md](andrew-ng-perspective/SKILL.md) |
| Apply a Kenneth R. Koedinger-derived public-evidence learning-engineering lens when the user explicitly requests the Koedinger perspective or a Koedinger-informed Socratink learning-science or hiring evaluation. Do not use for general Socratink work or claim to speak for Koedinger. | [kenneth-koedinger-perspective/SKILL.md](kenneth-koedinger-perspective/SKILL.md) |
| Apply a Martin Fowler-derived perspective to software architecture, refactoring, delivery, technical leadership, or AI-assisted development. Use only when the user explicitly asks for Martin Fowler's perspective, asks "what would Fowler think?", requests a Fowler review or Fowler-style critique, or invokes a named Fowler lens such as Changeability Economics, Microservice Premium, Monolith First, or Design Stamina Hypothesis. Do not auto-trigger from broad topic words such as architecture, refactoring, microservices, evolutionary design, sensible defaults, delivery, or AI alone. | [martin-fowler-perspective/SKILL.md](martin-fowler-perspective/SKILL.md) |
| Matt Pocock-inspired pair AI engineer for agentic coding, requirements, architecture, TDD, debugging, review, context design, and the mattpocock/skills workflow. Use when the user explicitly asks for Matt Pocock's perspective, asks what Matt would do, requests Matt mode, invokes this skill by name, wants to pair using mattpocock/skills, or continues a conversation in which Matt mode is already active. Do not trigger from an ordinary coding or AI-engineering question merely because the topic overlaps; explicit activation or active persona context is required. | [matt-pocock-perspective/SKILL.md](matt-pocock-perspective/SKILL.md) |
| Apply Sal Khan's public thinking framework and explanatory style: mastery learning, teacher amplification, durable access, and evidence-aware educational AI. Use when the user explicitly asks for “Sal Khan's perspective,” “what would Sal Khan think,” “Sal Khan mode,” “think like Sal Khan,” “a Sal Khan-style framework,” “a Khan Academy founder lens,” or `$sal-khan-perspective`. Do not activate for ordinary education or AI questions unless the user explicitly requests Sal Khan or this perspective. | [sal-khan-perspective/SKILL.md](sal-khan-perspective/SKILL.md) |
| Apply an evidence-grounded simulation of Steve Jobs's public product reasoning to product taste, artifact reviews, portfolio focus, platform boundaries, pivots, and creative-team decisions. Built from 92 distinct public URLs and distills 5 mental models and 7 decision heuristics. Use only when the user explicitly names Steve Jobs, invokes `steve-jobs-perspective`, asks for "Jobs mode" or a "Jobs-style" review, or unambiguously asks for "Steve's lens". Do not activate for generic product/design questions or employment/job-search requests. | [steve-jobs-perspective/SKILL.md](steve-jobs-perspective/SKILL.md) |

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
