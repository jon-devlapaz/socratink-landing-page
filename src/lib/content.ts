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
  tagline: "Know what you actually know",
  description:
    "A learning agent for hard material. It makes you do the thinking, keeps the evidence of what you produced, and is built to come back later to see whether the capability became yours.",
  url: "https://socratink.ai",
  appUrl: "https://app.socratink.ai/",
  year: new Date().getFullYear(),
} as const;

export const nav = {
  links: [
    { label: "Method", href: "#method" },
    { label: "Moves", href: "#moves" },
    { label: "Memory", href: "#memory" },
  ],
  login: { label: "Log in", href: site.appUrl },
  cta: { label: "Open Socratink", href: site.appUrl, kbd: "S" },
} as const;

export const hero = {
  eyebrowA: "Meet Socratink",
  eyebrowB: "a tutor that keeps the evidence",
  titleSans: "Know",
  titleSerif: "what you actually know.",
  subtitle:
    "A learning agent for material that has to hold: the exam, the license, the job. It makes you do the thinking, and the record it keeps is your work, not the AI's.",
  primary: { label: "Open Socratink", href: site.appUrl },
  secondary: { label: "Free to start", href: site.appUrl },
  demoHint: {
    strong: "Try the demo",
    rest: "Pick a move and watch Socratink hand the thinking back to you.",
  },
} as const;

export type DemoTurn = { role: "you" | "socratink"; text: string };

/** One bounded pedagogical move, in the sense of the Brain's Teaching Skills. */
export type Lens = {
  id: "reconstruct" | "repair" | "return";
  label: string;
  short: string;
  tagline: string;
  description: string;
  tiles: { icon: string; label: string }[];
  transcript: DemoTurn[];
};

export const lenses: readonly Lens[] = [
  {
    id: "reconstruct",
    label: "Reconstruct it",
    short: "Reconstruct",
    tagline: "Attempt first. Wrong is fine.",
    description:
      "Ask Socratink to explain something and it asks you to try first. A retrieval attempt, even a failed one, is worth more than a re-read, and it is the only thing that tells either of you what you can actually produce.",
    tiles: [
      { icon: "✎", label: "Say it in your words" },
      { icon: "◌", label: "Before any reveal" },
      { icon: "↯", label: "Wrong is useful" },
      { icon: "≡", label: "Attempt recorded as yours" },
    ],
    transcript: [
      { role: "you", text: "Can you explain what a p-value is again?" },
      { role: "socratink", text: "Before I do, write what you'd tell a colleague, in one sentence. Wrong is fine." },
      { role: "you", text: "The probability that the null hypothesis is true." },
      { role: "socratink", text: "That's the most common slip. A p-value is a probability of what, conditional on what? Try once more." },
    ],
  },
  {
    id: "repair",
    label: "Repair what's actually wrong",
    short: "Repair",
    tagline: "Targeted feedback, after your attempt.",
    description:
      "Once you've committed to an answer, Socratink corrects the specific piece that was missing, not the whole topic, and asks you to restate it. What was revealed is recorded alongside what you produced.",
    tiles: [
      { icon: "◎", label: "The one missing piece" },
      { icon: "→", label: "After you commit" },
      { icon: "⟲", label: "Restate it yourself" },
      { icon: "◑", label: "Reveal is recorded" },
    ],
    transcript: [
      { role: "you", text: "I keep mixing up when I need a NAT gateway versus an internet gateway." },
      { role: "socratink", text: "Take a shot: an instance in a private subnet needs to pull a package update. Which one, and why?" },
      { role: "you", text: "NAT gateway, because the instance has no public IP." },
      { role: "socratink", text: "Right. One piece you left out: the NAT gateway itself still needs a route through an internet gateway. Say why in your own words." },
    ],
  },
  {
    id: "return",
    label: "Come back to it",
    short: "Return",
    tagline: "Later, with no notes, in a new context.",
    description:
      "Knowing it once isn't knowing it. Socratink is built to return after a delay and ask again under harder conditions, and to treat the earlier claim as open until you do.",
    tiles: [
      { icon: "◷", label: "After a delay" },
      { icon: "⊘", label: "Without the notes" },
      { icon: "⇄", label: "A new problem, same idea" },
      { icon: "✓", label: "Claim closed by your work" },
    ],
    transcript: [
      { role: "socratink", text: "Nine days ago you explained why an inductor resists a change in current. No notes this time. Explain it again." },
      { role: "you", text: "A changing current makes a changing magnetic field, which induces a voltage that opposes the change." },
      { role: "socratink", text: "Cleaner than last time. Now the transfer: why does that make a motor draw more current under load?" },
    ],
  },
] as const;

export const method = {
  eyebrow: "The end of borrowed competence",
  titleSans: "Close the page.",
  titleSerif: "What remains?",
  body:
    "AI can make you look capable before you are. Fluent answers aren't learning; your own work is. Socratink asks you to attempt first, repairs what you actually got wrong, and keeps the record of what you produced, not what it produced for you.",
  transcript: [
    { role: "you", text: "Explain the central limit theorem to me." },
    { role: "socratink", text: "Before I do: last week you used it to justify a normal approximation. What had to be true about the sample?" },
    { role: "you", text: "It had to be big enough… like n greater than 30?" },
    { role: "socratink", text: "That's the rule of thumb. What is the rule of thumb standing in for?" },
    { role: "you", text: "…that the sampling distribution of the mean gets close to normal, whatever shape the population has." },
    { role: "socratink", text: "You just stated the theorem. Now: what does it not say about a single observation?" },
  ] satisfies DemoTurn[],
} as const;

export const lensesSection = {
  eyebrow: "Three moves",
  titleSans: "One move at a time.",
  titleSerif: "Attempt, repair, return.",
} as const;

export const evidence = {
  eyebrow: "Evidence, not exposure",
  titleSans: "Your work is the record.",
  titleSerif: "Not the AI's.",
  cards: {
    steps: {
      title: "Every attempt, kept.",
      sub: "What you wrote. What was revealed. In order.",
      body: "Each attempt is preserved with the conditions it was made under, what you produced and what had already been shown to you, so a later claim about what you can do traces back to your own work.",
      items: [
        "You: a p-value is P(null is true)",
        "Revealed: the conditional framing",
        "You: P(data this extreme | null is true)",
        "Recorded: correct, after one reveal",
      ],
    },
    bounded: {
      title: "Bounded, correctable.",
      sub: "Hypotheses about you, not verdicts.",
      body: "Socratink forms a limited view of what you can do from your work, says how it got there, and updates when new evidence says otherwise. No mastery percentage. Nothing you can't inspect or correct.",
      states: [
        { label: "Reconstructs the CLT unaided", level: 3, note: "observed" },
        { label: "Reads a conditional correctly", level: 2, note: "after 1 reveal" },
        { label: "Transfers to hypothesis tests", level: 1, note: "not yet" },
      ],
    },
    voice: {
      title: "Speak your thinking.",
      body: "Reason out loud when typing gets in the way. The orb's level meter runs on-device, and Socratink never receives or stores your audio.",
    },
    keyboard: {
      title: "Nothing between you and the next attempt.",
      body: "Keyboard-first. One shortcut sends. No feeds, no streaks, no confetti. Nothing optimized for anything but learning.",
      kbd: ["⌘", "Enter"],
    },
    model: {
      title: "The model is replaceable.",
      body: "Your evidence isn't. Swap what's underneath, Default, Chain, or whatever comes next, and the record of your work carries forward with its meaning intact.",
      chips: ["Default", "Chain"],
    },
  },
} as const;

export const orbit = {
  eyebrow: "For material that has to hold",
  titleSans: "Built for the hard stuff.",
  titleSerif: "When the exam, the license, or the job is real.",
  nodes: [
    "Statistics",
    "Organic chemistry",
    "Board exams",
    "Cloud certifications",
    "Contract law",
    "Signal processing",
    "Pathophysiology",
    "Real analysis",
    "Accounting",
    "Machine learning",
  ],
} as const;

export const memory = {
  eyebrow: "Capability that outlasts the session",
  titleSans: "It comes back to check.",
  titleSerif: "Because knowing it once isn't knowing it.",
  cards: [
    {
      title: "Remembers what you demonstrated.",
      sub: "Not what you were shown.",
      body: "Exposure is not evidence. Every record keeps what you produced and what help you had, so the history stays trustworthy, and stays yours to inspect, correct, or delete.",
    },
    {
      title: "Returns later.",
      sub: "To find out if it became yours.",
      body: "Durable capability shows up after a delay and in a new context. Socratink is built to schedule the return, ask under harder conditions, and treat the earlier claim as open until then.",
    },
  ],
  boundary: {
    title: "The line we hold.",
    sub: "Distinctions Socratink is built to keep obvious.",
    rules: [
      ["AI output quality", "learning quality"],
      ["assisted success", "independent capability"],
      ["exposure", "learner evidence"],
      ["immediate performance", "durable learning"],
      ["engagement", "learning"],
      ["reading gives context", "reconstruction gives evidence"],
    ],
  },
} as const;

export const wiseWords = {
  eyebrow: "Wise words",
  titleSans: "Why we ask instead of tell.",
  titleSerif: "Older than software.",
  quotes: [
    {
      text: "The unexamined life is not worth living.",
      who: "Socrates",
      where: "Plato, Apology",
    },
    {
      text: "The first principle is that you must not fool yourself, and you are the easiest person to fool.",
      who: "Richard Feynman",
      where: "Caltech commencement, 1974",
    },
    {
      text: "It is impossible for a man to learn what he thinks he already knows.",
      who: "Epictetus",
      where: "Discourses",
    },
  ],
} as const;

export const finalCta = {
  titleSans: "Know what you know.",
  titleSerif: "Open Socratink.",
  button: { label: "Start with an attempt", href: site.appUrl },
  sub: "Free to start. No streaks, no confetti. Just the next attempt.",
} as const;

export const footer = {
  links: [
    { label: "Open app", href: site.appUrl },
    { label: "Method", href: "#method" },
    { label: "Moves", href: "#moves" },
  ],
} as const;
