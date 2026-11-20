import { Code2, Database, Sparkles, Wrench } from "lucide-react";
import { RevealSection } from "./portfolio-motion";
import { skillGroups } from "@/data/skills";

const icons = [Code2, Database, Sparkles, Wrench];

export function SkillsSection() {
  return <section id="skills" className="shell integrated-skills" aria-labelledby="skills-title">
    <div className="section-heading"><div><p className="eyebrow">04 / MY TOOLKIT</p><h2 id="skills-title">Skills & knowledge.</h2></div><p>The technologies and practical skills behind my projects.</p></div>
    {skillGroups.map(({title, description, skills}, index) => {
      const Icon = icons[index % icons.length];
      return <RevealSection key={title} className="skill-category">
        <div className="skill-category-heading"><Icon size={22} aria-hidden="true"/><h3>{title}</h3><p>{description}</p></div>
        <ul className="skill-detail-list">{skills.map(([name, detail]) => <li key={name}><h4>{name}</h4><p>{detail}</p></li>)}</ul>
      </RevealSection>;
    })}
  </section>;
}
