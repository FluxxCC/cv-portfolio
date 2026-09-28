export const projects = [
  {
    id: "rrl",
    name: "RRL Finder",
    category: "RESEARCH & AI",
    summary: "Less searching. More discovering.",
    description:
      "An academic research tool that brings scholarly sources into one place. Discover relevant papers, compare evidence, save literature, and build a more organized review workflow.",
    tags: ["Next.js", "API integration", "AI-assisted research"],
    features: [
      "Multi-source literature search",
      "Paper ranking and filtering",
      "Saved papers and literature matrices",
    ],
    url: "https://rrlfinder.vercel.app",
    tone: "blue",
  },
  {
    id: "tabulora",
    name: "Tabulora",
    category: "EVENTS & REAL-TIME DATA",
    summary: "Every score. One clear result.",
    description:
      "A web-based tabulation and scheduling system developed for university events. It brings event management, judging criteria, scores, and results into one coordinated workflow.",
    tags: ["Live tabulation", "Event management", "Dashboards"],
    features: [
      "Event and schedule management",
      "Judging criteria and scoring",
      "Consolidated event results",
    ],
    url: "https://tabulora.vercel.app",
    tone: "violet",
  },
  {
    id: "ojt",
    name: "OJTonTrack",
    category: "EDUCATION & OPERATIONS",
    summary: "A clearer picture of every internship.",
    description:
      "An OJT attendance and progress monitoring platform connecting students and coordinators through attendance validation, weekly reports, and evaluations.",
    tags: ["Role-based access", "Attendance", "Reporting"],
    features: [
      "Attendance validation",
      "Weekly progress reports",
      "Internship evaluations",
    ],
    url: "https://ojtontrack.vercel.app",
    tone: "green",
  },
  {
    id: "iguide",
    name: "Iguide",
    category: "STUDENT SUPPORT",
    summary: "Thoughtful tools for student guidance.",
    description:
      "A guidance management platform for organizing student records, appointments, and interventions, helping counselors keep student support workflows in one place.",
    tags: ["Student records", "Appointments", "Management system"],
    features: [
      "Organized student records",
      "Guidance appointments",
      "Intervention tracking",
    ],
    tone: "peach",
  },
  {
    id: "carw",
    name: "CARW",
    category: "RESEARCH & COLLABORATION",
    summary: "RRL Finder v2 — not shipped yet.",
    status: "Not shipped yet",
    description:
      "The Collaborative Academic Research Workspace brings projects, writing, and literature together. It builds on RRL Finder with a broader environment for individual researchers and research groups.",
    tags: ["Research workspace", "Academic writing", "Collaboration"],
    features: [
      "Research project organization",
      "Academic writing workspace",
      "Integrated RRL Finder",
    ],
    url: "https://rrlfinder.vercel.app",
    linkLabel: "Visit RRL Finder v1",
    tone: "navy",
  },
].sort((a, b) => {
  const order = ["rrl", "carw", "tabulora", "ojt", "iguide"];
  return order.indexOf(a.id) - order.indexOf(b.id);
});
