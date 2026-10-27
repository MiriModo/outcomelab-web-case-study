/*
 * EXCERPT from src/content/site.ts (about 760 lines in total).
 *
 * All the text on outcomelab.co.uk lives in this one file. A copy change
 * is a one line edit here and a push, no component has text inside it.
 *
 * Source: my website design, "Outcome Lab Website.pdf" (seven pages:
 * Home, What we do, Outcome Kit, How we work, Industries, About,
 * Contact). Voice: plain English, matter of fact, no exclamation
 * marks, never "trusted by".
 */

export const site = {
  name: "Outcome Lab",
  domain: "outcomelab.co.uk",
  url: "https://outcomelab.co.uk",
  tagline: "Success is a deliverable.",
  description:
    "An AI-native technology and transformation consultancy, paid for measurable outcomes rather than billable hours. Success is a deliverable.",
  markets: ["Romania", "United Kingdom", "Saudi Arabia"],
  founded: "2026",
  cta: { label: "Start a conversation", href: "/contact" },
  nav: [
    { label: "What we do", href: "/what-we-do" },
    { label: "Outcome Kit", href: "/outcome-kit" },
    { label: "How we work", href: "/how-we-work" },
    { label: "Industries", href: "/industries" },
    { label: "About", href: "/about" },
  ],
  // ...
} as const;

/* ------------------------------------------------------------------
   Shared blocks, used on more than one page. The five steps below feed
   the orbit on the home page, the orbit in the Outcome Kit hero, the
   step sections on /outcome-kit and the anchors they link to.
   ------------------------------------------------------------------ */

export const kit = {
  name: "Outcome Kit™",
  wheelTitle: "Outcome Kit™",
  wheelSubtitle: "Diagnose to Demonstrate",
  steps: [
    {
      id: "diagnose",
      name: "Diagnose",
      summary: "Understand the organisation, the problem, the technology, the market and the opportunity.",
      questions: "What is really going on, and what does it cost? Where is the opportunity, and who owns it?",
      ai: "Agents read the documents, data and market in days, so senior time goes to interviews and judgment.",
      output: "A diagnostic read-out: the problem stated plainly, the baseline, the options.",
    },
    {
      id: "define",
      name: "Define",
      summary: "Translate the challenge into a clear, measurable business outcome.",
      questions: "What should be different when we are done? How will we know? What is out of scope?",
      ai: "Scenario and value modelling at speed, so the target is tested before it is signed.",
      output: "The Outcome Contract™: result, measure, scope, investment and accountability.",
    },
    // ... Design, Deliver, Demonstrate
  ],
};

// ... then one export per page: home, services, kitPage, howWeWork,
// industries, about, contact, insights, footer and the legal pages.
