/** Candidate copy for /positioning. Separate from the in-progress homepage. */
export const positioning = {
  preview: "Concept preview · Illustrative diagnostic",
  currentPage: "Current page",
  cta: "Try the free diagnostic",
  hero: {
    audience: "For university & certification exams",
    title: "Find the gaps.\nBefore the exam does.",
    body: "Socratink is an AI study partner that tests your reasoning. Explain a concept in your own words, see where your understanding breaks down, and know what to study next.",
    trust: "One question to start · Free · No sign-up required",
    note: "Your explanation comes first. The feedback follows.",
  },
  sample: {
    label: "Inside a diagnostic · Illustrative example",
    title: "More responses.\nA better answer?",
    question: "A university surveys 1,000 students leaving the campus gym to estimate how often its students exercise. Would surveying 10,000 students at the same gym solve the problem? Explain why.",
    inputLabel: "Your reasoning, without looking it up",
    placeholder: "I think… because…",
    privacy: "Your text stays in this page. It is not sent or saved, and disappears when you reload.",
    reveal: "Compare your reasoning",
    comparisonLabel: "Reference explanation · Self-comparison",
    explanation: "A larger survey at the gym still misses students who rarely or never go there. More responses can reduce random sampling error, but they do not fix this selection problem. Change who has a chance to be surveyed—for example, sample from the university’s student roster.",
    checks: [
      "Did you name who the survey is likely to miss?",
      "Did you separate sample size from how people are selected?",
      "Did you suggest changing the sampling method?",
    ],
    next: "If your explanation missed the distinction, revisit sampling bias before adding more practice questions.",
    boundary: "This is an authored example. Socratink has not evaluated your answer.",
  },
  benefits: {
    label: "Make your next study session count",
    title: "An explanation can feel clear.\nCan you produce one?",
    body: "When the answer is in front of you, it is hard to tell which parts you could explain yourself. Start with your own reasoning, then use the comparison to decide what deserves another look.",
    items: [
      { title: "Make the gap visible.", body: "A written explanation gives you something concrete to inspect, beyond a feeling of familiarity." },
      { title: "Understand where you went wrong.", body: "See which part of your explanation holds and which needs another look. Get a specific distinction to work on." },
      { title: "Know what to study next.", body: "Leave with a focused next step. Revisit the missing concept, work through it, then try again without help." },
    ],
  },
  how: {
    label: "How the diagnostic works",
    title: "One question. Your own words.\nA clearer next step.",
    items: [
      { title: "Choose what you are studying.", body: "Start with one concept from your course or certification. Get a question that asks you to explain why." },
      { title: "Explain it in your own words.", body: "Try without notes or hints first. Show your reasoning. If you are unsure, say where you get stuck." },
      { title: "See the gap and your next step.", body: "Inspect feedback on your explanation, then focus your practice on the part that needs work." },
    ],
  },
  faq: {
    label: "Before you begin",
    title: "A few fair questions.",
    items: [
      { question: "Who is Socratink for?", answer: "University and certification learners studying material they will need to explain or apply. Start with a concept you have already studied and want to check before your exam." },
      { question: "What does the free diagnostic include?", answer: "A question on a concept you are studying, room to explain your reasoning, feedback on what held and what needs work, and a suggested next step. You can try it without creating an account." },
      { question: "Can I do this with an AI chatbot?", answer: "Yes. You can ask a chatbot to quiz you and critique your answer. Socratink puts that study routine at the center: your attempt first, feedback tied to your reasoning, and a next step based on the gap." },
      { question: "What if I do not know the answer?", answer: "Write what you understand and where you get stuck. That gives you a starting point for practice. You do not need a polished answer to begin." },
      { question: "Does this replace my course or question bank?", answer: "Use Socratink alongside them. Your course supplies the material and your question bank supplies practice. The diagnostic helps you inspect a concept you can recognize but struggle to explain." },
      { question: "Does one good answer mean I am exam-ready?", answer: "One answer shows what you can do on that question at that moment. Check yourself on different problems, and again later without help. A diagnostic gives you a place to focus; it cannot guarantee an exam result." },
    ],
  },
  close: {
    title: "Start with the part\nyou think you know.",
    body: "One question. A look at your reasoning. A place to start.",
  },
  seo: {
    title: "Find your reasoning gaps before the exam | Socratink preview",
    description: "Preparing for a university or certification exam? Try Socratink’s free reasoning diagnostic to find gaps in your understanding and decide what to study next.",
  },
} as const;
