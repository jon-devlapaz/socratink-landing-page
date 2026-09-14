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
    "Work through hard ideas with an AI learning partner that asks you to explain, question, and think for yourself.",
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
  subline: "You think · One teacher · It stays",
} as const;

/** Chapter 1. Title is facet 1 of the accepted direction; journey lines are the live How-it-works path. */
export const mapChapter = {
  cue: "01",
  title: "A map\nof the work",
  journey: [
    "Start with the question you actually have.",
    "Use an explanation, a picture, or a counterexample when it helps.",
    "Return later, in a different setting, and see what still holds.",
  ],
  mapAlt: "A small ink map. A few places joined by one path that runs off the edge of the paper.",
} as const;

/** Chapter 2. Facet 2 of the accepted direction. The constraint line lives here, not on the title page. */
export const speakChapter = {
  cue: "02",
  title: "You speak.\nIt teaches.",
  body: "The work is spoken. It listens for what you actually understand.",
  constraint: "It does not answer for you.",
  markAlt: "One brushstroke. It starts faint and broken, then turns to solid ink and stops.",
} as const;

/** Chapter 3, the peak. Facet 3 of the accepted direction; the engram is how you are taught. */
export const keepChapter = {
  cue: "03",
  title: "A teacher\nyou keep",
  body: "It stays, it pushes, it remembers.",
  engram: "You choose its engram, the personality it teaches with.",
} as const;

export const colophon = {
  button: { label: hero.primary.label, href: site.appUrl },
  subline: hero.subline,
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
    "Work through hard ideas with an AI learning partner that asks you to explain, question, and think for yourself.",
} as const;

export const notFound = {
  cue: "404",
  title: "You walked off\nthe edge of the paper.",
  body: "There is no inquiry recorded at this address. The ink has not touched this sheet.",
  action: { label: "Return to the map", href: "/" },
} as const;
