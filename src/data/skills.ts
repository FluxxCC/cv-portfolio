export type SkillGroup = {
  title: string;
  description: string;
  skills: [name: string, detail: string][];
};

export const skillGroups: SkillGroup[] = [
  { title: "Frontend development", description: "Building clear, responsive interfaces for the web.", skills: [
    ["React.js", "Component-based interfaces and interactive application flows."],
    ["Next.js", "Full stack React applications and page routing."],
    ["TypeScript", "Typed JavaScript for clearer application code."],
    ["JavaScript", "Application logic, events, and browser interactions."],
    ["HTML", "Structured, semantic content for web pages."],
    ["CSS", "Layouts, styling, responsive design, and transitions."],
    ["Tailwind CSS", "Utility-based styling and consistent interfaces."],
    ["Responsive design", "Layouts that adapt across desktop and mobile screens."],
  ] },
  { title: "Backend & data", description: "Connecting interfaces to data and practical workflows.", skills: [
    ["Node.js", "Server-side JavaScript and application logic."],
    ["Supabase", "Application data and backend integration."],
    ["PostgreSQL", "Relational data and database-backed applications."],
    ["API integration", "Connecting services and working with application data."],
    ["Role-based access", "Different workflows for different types of users."],
  ] },
  { title: "AI agents & research", description: "Using coding agents for development and integrating AI into research workflows.", skills: [
    ["Codex", "AI-assisted coding, debugging, and project iteration."],
    ["Claude Code", "Agent-assisted implementation, code review, and refinement."],
    ["LLM API integration", "Connecting language models to application workflows."],
    ["OpenRouter", "Integrating model access through an API."],
    ["AI-assisted development", "Using AI tools to support implementation and iteration."],
    ["Research workflows", "Literature search, saved papers, and organized evidence."],
  ] },
  { title: "Tools & delivery", description: "Taking an idea through implementation and refinement.", skills: [
    ["Git", "Version control for application development."],
    ["Vercel", "Deploying and previewing web applications."],
    ["Full stack development", "Connecting frontend, backend, and data layers."],
    ["Dashboard development", "Presenting records and operational information clearly."],
  ] },
];
