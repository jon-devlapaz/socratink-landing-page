/*
  All marketing copy lives here. Components render it; they don't own it.

  Grounded in the Socratink Brain (CONSTITUTION → NORTH-STAR → Canon):
  - optimize for independently demonstrated durable capability;
  - learner-authored work is the evidence; assistance provenance survives;
  - exposure ≠ evidence, immediate performance ≠ durable learning;
  - product language must not exceed available evidence (DEC-0003), so this
    copy describes the method and what Socratink is built to do, and avoids
    mastery scores, manufactured progress, or engagement language.

  Wedge (Company Thesis): adults facing consequential performance demands in
  difficult technical or academic material: self-directed learners, university
  and certification learners, professionals acquiring hard bodies of knowledge.
*/

export const site = {
  name: "Socratink",
  tagline: "The learning engine that refuses to do the thinking for you",
  description:
    "An AI tutor that asks one question at a time and won't hand you the answer.",
  url: "https://socratink.ai",
  appUrl: "https://app.socratink.ai/",
  year: new Date().getFullYear(),
  pronunciation: {
    respell: "so-cre-tink",
    syllables: ["soʊ", "krə", "tɪŋk"],
  },
} as const;

export const hero = {
  primary: { label: "Start learning", href: site.appUrl },
  secondary: { label: "See how it works", href: "#how-it-works" },
  subline: "You think · It asks · You earn it",
} as const;

/** Chapter 1. Title is facet 1 of the accepted direction; journey lines are the live How-it-works path. */
export const mapChapter = {
  title: "A map\nyou earn",
  journey: [
    "Start with the question you actually have.",
    "It breaks the idea into skills, each earned from 0 to 5.",
  ],
} as const;

/** Chapter 2. Facet 2 of the accepted direction. The constraint line lives here, not on the title page. */
export const speakChapter = {
  title: "You explain.\nIt asks.",
  body: "One question at a time, typed or dictated.",
  constraint: "A lucky guess gets another question, not a pass.",
} as const;

/** Chapter 3, the peak. Facet 3 of the accepted direction: the work stays yours and stays reachable. */
export const keepChapter = {
  title: "Pick up where\nyou left off",
  journey: [
    "Hints are marked, so every level is your own thinking.",
    "Reopen past conversations on any device once you sign in.",
    "Or just start. No account needed.",
  ],
} as const;

export const inkArtwork = {
  hero: {
    label: "Living ink",
    reshape: "Click or press Enter to reshape. Escape returns to the sphere.",
    pause: "Press Space to pause animation.",
    play: "Press Space to resume animation.",
  },
  studies: [
    { id: "map", name: "Map", description: "A crescent of ink above a bent trunk. One long branch tapers to the right." },
    { id: "speak", name: "Speak", description: "A broad brushstroke, a pause, and a smaller answering gesture. The first voice remains its own." },
    { id: "teacher", name: "Teacher", description: "An anchored ink stone and a smaller companion settling beside it. Separate forms, held in quiet relation." },
  ],
} as const;

export const footer = {
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Contact", href: "mailto:support@socratink.ai" },
  ],
  legalNote: "All rights reserved.",
} as const;


/** Minimal hero invitation: the learner does the thinking. */
export const notebook = {
  heroTitle: "Make the thinking\nyour own.",
  heroBody:
    "An AI tutor that asks one question at a time and won't hand you the answer.",
} as const;

export const notFound = {
  cue: "404",
  title: "You walked off\nthe edge of the paper.",
  body: "There is no inquiry recorded at this address. The ink has not touched this sheet.",
  action: { label: "Return to the map", href: "/" },
} as const;
