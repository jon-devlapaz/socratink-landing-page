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
  pronunciation: {
    respell: "so-cre-tink",
    syllables: ["soʊ", "krə", "tɪŋk"],
  },
} as const;

export const nav = {
  links: [
    { label: "Method", href: "#method" },
    { label: "Disciplines", href: "#material" },
    { label: "Memory", href: "#memory" },
  ],
  login: { label: "Log in", href: site.appUrl },
  cta: { label: "Start a free attempt", href: site.appUrl },
} as const;

export const hero = {
  eyebrow: "a tutor that keeps the evidence",
  titleSans: "Know",
  titleSerif: "what you actually know.",
  subtitle:
    "A learning agent for medical boards, the bar exam, cloud certs, and consequential STEM. Unassisted attempts become evidence of what you can hold under pressure — your work, not the AI's.",
  primary: { label: "Start a free attempt", href: site.appUrl },
  secondary: { label: "Free to start", href: site.appUrl },
  demoHint: {
    strong: "Watch an example conversation",
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
    "You can ask a chatbot to quiz you. Socratink is built around the evidence: what you produced, what help you received, and what you can reconstruct later.",
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
  hint: "Choose a move to see a scripted example.",
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

export type OrbitDisciplineId =
  | "stats"
  | "biochem"
  | "boards"
  | "cloud"
  | "law"
  | "signals"
  | "med"
  | "analysis"
  | "accounting"
  | "ml";

export type OrbitDiscipline = {
  id: OrbitDisciplineId;
  label: string;
  target: string;
  aiTrap: string;
  transferAsk: string;
};

/** In-place Orbit switcher cards — Gemini DISCIPLINE_CARDS, labels match prior orbit.nodes. */
export const orbitDisciplines: readonly OrbitDiscipline[] = [
  {
    id: "stats",
    label: "Statistics",
    target: "Sampling Bias Invariance under Sample Size",
    aiTrap:
      "AI fluently increases n, conflating standard error reduction with the correction of systematic sampling frame flaws.",
    transferAsk:
      "A medical survey polls 25,000 opt-in app users to estimate national diabetes rates. Explain why tighter variance does not cure the estimate — without multiple choice.",
  },
  {
    id: "biochem",
    label: "Organic chemistry",
    target: "Steric Hindrance vs. Nucleophilicity in SN2 Pathways",
    aiTrap:
      "AI recites 'backside attack causes inversion', leaving the student unaware that a sterically hindered tertiary carbon forces an E2 elimination instead.",
    transferAsk:
      "Predict the major product when (R)-2-bromobutane is treated with sodium cyanide in DMSO vs. potassium tert-butoxide in tert-butanol. Explain the governing divergence unprompted.",
  },
  {
    id: "boards",
    label: "Board exams",
    target: "Bayesian Positive Predictive Value in Low-Prevalence Screening",
    aiTrap:
      "AI praises a 99% test sensitivity, while the candidate forgets that when disease prevalence is 0.1%, false positives vastly outnumber true positives.",
    transferAsk:
      "A test with 99% sensitivity and 95% specificity tests positive in an asymptomatic screening population (prevalence 0.1%). Calculate without notes why the patient still only has a ~2% chance of disease.",
  },
  {
    id: "cloud",
    label: "Cloud certifications",
    target: "Consistency Boundaries under Network Partition (CAP Theorem)",
    aiTrap:
      "AI recommends multi-region read replicas, obscuring the reality that replicas only scale reads and introduce split-brain write conflicts when the cross-region link drops.",
    transferAsk:
      "A fiber cut isolates two availability zones handling a banking ledger. Prove why the database cannot maintain both zero-downtime balance deductions and ledger consistency.",
  },
  {
    id: "law",
    label: "Contract law",
    target: "Pre-Existing Duty Rule vs. Promissory Estoppel",
    aiTrap:
      "AI gives a generic definition of detrimental reliance, missing whether a subcontractor's verbal promise is unenforceable due to an existing contractual obligation.",
    transferAsk:
      "A contractor promises an electrician a $10,000 bonus to finish an on-time completion they were already legally bound to deliver. Analyze whether the electrician can enforce payment without reference notes.",
  },
  {
    id: "signals",
    label: "Signal processing",
    target: "Analog Anti-Aliasing Filtration prior to Sampling",
    aiTrap:
      "AI quotes the Nyquist limit (fs > 2fmax), while the engineer forgets that high-frequency noise folds permanently into the baseband unless an analog low-pass filter precedes the ADC.",
    transferAsk:
      "A sensor samples a 1 kHz acoustic signal at 1.5 kHz. What spurious alias frequency appears in the output, and explain why no downstream DSP algorithm can remove it.",
  },
  {
    id: "med",
    label: "Pathophysiology",
    target: "Hemodynamic Divergence in Cardiogenic vs. Hypovolemic Shock",
    aiTrap:
      "AI explains the Frank-Starling curve fluently, while the learner reflexively orders IV fluid boluses for a patient whose lungs are already filling with fluid.",
    transferAsk:
      "A hypotensive patient presents with cold extremities, elevated jugular venous pressure, and bilateral pulmonary crackles. Explain why standard fluid resuscitation will precipitate respiratory arrest.",
  },
  {
    id: "analysis",
    label: "Real analysis",
    target: "Pointwise vs. Uniform Convergence of Function Sequences",
    aiTrap:
      "AI proves fn(x) = x^n converges pointwise to 0 on [0, 1), masking the failure of the limit function to preserve continuity on the closed interval [0, 1].",
    transferAsk:
      "Construct a sequence of continuous functions on [0, 1] that converges to 0 pointwise, but whose integrals converge to 1. State unprompted why uniform convergence fails.",
  },
  {
    id: "accounting",
    label: "Accounting",
    target: "Performance Obligation Bundling under ASC 606",
    aiTrap:
      "AI lists the 5-step revenue framework, while missing whether ongoing proprietary security patches make software licenses a single bundled service rather than upfront point-in-time revenue.",
    transferAsk:
      "A SaaS vendor sells a 3-year term license with essential daily proprietary vulnerability updates. Defend why revenue cannot be recognized upfront on key delivery.",
  },
  {
    id: "ml",
    label: "Machine learning",
    target: "Data Leakage across Cross-Validation Splits",
    aiTrap:
      "AI writes a clean scikit-learn preprocessing block, but fits standard scalers across the full dataset prior to k-fold splitting, leaking test-fold distribution parameters into training.",
    transferAsk:
      "Explain why fitting a TF-IDF vectorizer before train/test partitioning produces an artificially inflated evaluation metric, even if target labels were excluded.",
  },
] as const;

export const orbit = {
  eyebrow: "For material that has to hold",
  titleSans: "Built for the hard stuff.",
  titleSerif: "When the exam, the license, or the job is real.",
  defaultId: "stats" as const satisfies OrbitDisciplineId,
  cta: {
    label: "Open this prompt in Socratink",
    href: site.appUrl,
  },
  /** Ordered to match the decorative orbit ring (prior nodes list). */
  disciplines: orbitDisciplines,
  /** Label list for ring geometry / legacy readers — same order as disciplines. */
  nodes: orbitDisciplines.map((d) => d.label),
} as const;

export const memory = {
  eyebrow: "Continuity across months",
  titleSans: "Months of attempts.",
  titleSerif: "One profile you can read.",
  cards: [
    {
      title: "Attempts accumulate.",
      sub: "Into an inspectable capability profile.",
      body: "Each session stays bounded. Over a six-month arc they compose a picture of what you can produce — not a score, a record built from your work.",
    },
    {
      title: "The model can change.",
      sub: "The meaning of your work does not.",
      body: "Swap the runtime underneath — Default, Chain, or whatever comes next. The evidence of what you produced carries forward with its conditions intact.",
    },
    {
      title: "You hold the record.",
      sub: "Inspect, correct, export, delete.",
      body: "Learner-owned continuity: review how an inference was formed, correct what is wrong, take your history with you, or erase it.",
    },
  ],
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
  button: { label: "Start a free attempt", href: site.appUrl },
  sub: "Instant in-browser · No account required · Free to start",
} as const;

export const footer = {
  links: [
    { label: "Open Socratink", href: site.appUrl },
    { label: "Method", href: "#method" },
    { label: "Disciplines", href: "#material" },
    { label: "Memory", href: "#memory" },
  ],
} as const;

/** Approved hero presentation, retained while restoring the original page story. */
export const notebook = {
  heroTitle: "Know what you\nactually know.",
  heroBody:
    "For medical boards, the bar exam, cloud certs, and consequential STEM: make the attempt yourself. Socratink keeps unassisted evidence of what you can hold under pressure — your work, not the AI's.",
  heroForm: "A web app for unassisted attempts — open the workspace in your browser.",
  heroTrust: "Instant in-browser · No account required · Free to start",
  heroNote: "The thinking stays yours.",
} as const;

/** Encounter framing micro-copy (candidate 16). */
export const encounterFrame = {
  walkthrough: "Interactive walkthrough — how fluent help becomes your retrieval",
  scaffoldCap: "Day 0 Training Scaffold",
  cta: { label: "Start a free attempt", href: site.appUrl },
  ctaSub: "Instant in-browser · No account required · Free to start",
} as const;
