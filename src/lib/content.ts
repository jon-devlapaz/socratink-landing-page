const headline = "Make the thinking\nyour own.";

export const site = {
  name: "Socratink",
  tagline: headline.replace("\n", " "),
  description:
    "Pick something you wish you could explain to a friend. Talk it through with an AI tutor. Your skill map shows what you can do with help and what you can do on your own.",
  features: [
    "A skill map that shows what you can do with help and on your own",
    "Questions about your reasoning, with hints and direct answers on request",
    "Typed or dictated explanations",
    "Conversation history across devices when signed in",
  ],
  url: "https://socratink.ai",
  appUrl: "https://app.socratink.ai/",
  year: new Date().getFullYear(),
  pronunciation: {
    respell: "so-cre-tink",
    syllables: ["soʊ", "krə", "tɪŋk"],
  },
} as const;

export const hero = {
  title: headline,
  primary: { label: "Start learning", href: site.appUrl },
  secondary: { label: "See how it works", href: "#how-it-works" },
  subline: "No account needed to start.",
} as const;

export const mapChapter = {
  title: "A map of\nwhat you know",
  journey: [
    "Say you’ve just explained how the Moon blocks the Sun. A friend asks, “Why don’t we get a solar eclipse every month?”",
    "Your tutor maps the skills behind your answer. A 3 means you worked it out with help. At 4, you can explain it yourself.",
  ],
} as const;

export const speakChapter = {
  title: "Put it in\nyour own words",
  journey: [
    "Type what you think, or say it out loud. The tutor might ask, “What makes you think that?”",
    "Ask for a hint when you want one. If you’d rather see the answer, ask the tutor to walk you through it.",
  ],
} as const;

export const keepChapter = {
  title: "Pick up where\nyou left off",
  journey: [
    "Open History to revisit your answers and the hints you asked for.",
    "If you’re signed in, you can start on your laptop and pick up on your phone.",
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

export const notFound = {
  cue: "404",
  title: "Page not found",
  body: "Check the address for a typo, or head back to the home page.",
  action: { label: "Back to Socratink", href: "/" },
} as const;
