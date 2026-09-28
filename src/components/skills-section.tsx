import { Code2, Database, Sparkles, Wrench } from "lucide-react";
import { RevealSection } from "./portfolio-motion";
const groups = [
  { title: "Frontend development", icon: Code2, description: "Building clear, responsive interfaces for the web.", skills: [
    ["React.js", "Component-based interfaces and interactive application flows."],
    ["Next.js", "Full stack React applications and page routing."],
    ["TypeScript", "Typed JavaScript for clearer application code."],
    ["JavaScript", "Application logic, events, and browser interactions."],
    ["HTML", "Structured, semantic content for web pages."],
    ["CSS", "Layouts, styling, responsive design, and transitions."],
    ["Tailwind CSS", "Utility-based styling and consistent interfaces."],
    ["Responsive design", "Layouts that adapt across desktop and mobile screens."],
  ] },
  { title: "Backend & data", icon: Database, description: "Connecting interfaces to data and practical workflows.", skills: [
    ["Node.js", "Server-side JavaScript and application logic."],
    ["Supabase", "Application data and backend integration."],
    ["PostgreSQL", "Relational data and database-backed applications."],
    ["API integration", "Connecting services and working with application data."],
    ["Role-based access", "Different workflows for different types of users."],
  ] },
  { title: "AI agents & research", icon: Sparkles, description: "Using coding agents for development and integrating AI into research workflows.", skills: [
    ["Codex", "AI-assisted coding, debugging, and project iteration."],
    ["Claude Code", "Agent-assisted implementation, code review, and refinement."],
    ["LLM API integration", "Connecting language models to application workflows."],
    ["OpenRouter", "Integrating model access through an API."],
    ["AI-assisted development", "Using AI tools to support implementation and iteration."],
    ["Research workflows", "Literature search, saved papers, and organized evidence."],
  ] },
  { title: "Tools & delivery", icon: Wrench, description: "Taking an idea through implementation and refinement.", skills: [
    ["Git", "Version control for application development."],
    ["Vercel", "Deploying and previewing web applications."],
    ["Full stack development", "Connecting frontend, backend, and data layers."],
    ["Dashboard development", "Presenting records and operational information clearly."],
  ] },
];

export function SkillsSection() {
  return <section id="skills" className="shell integrated-skills" aria-labelledby="skills-title">
    <div className="section-heading"><div><p className="eyebrow">04 / MY TOOLKIT</p><h2 id="skills-title">Skills & knowledge.</h2></div><p>The technologies and practical skills behind my projects.</p></div>
    {groups.map(({title, icon: Icon, description, skills}) => <RevealSection key={title} className="skill-category">
      <div className="skill-category-heading"><Icon size={22} aria-hidden="true"/><h3>{title}</h3><p>{description}</p></div>
      <ul className="skill-detail-list">{skills.map(([name, detail]) => <li key={name}><h4>{name}</h4><p>{detail}</p></li>)}</ul>
    </RevealSection>)}
  </section>;
}