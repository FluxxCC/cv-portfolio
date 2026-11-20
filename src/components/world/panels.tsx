import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { profile } from "@/data/profile";
import { ProjectMark } from "@/components/project-mark";
import type { Zone } from "./zones";

function ProjectPanel({ projectId }: { projectId?: string }) {
  const project = projects.find(item => item.id === projectId) ?? projects[0];
  return (
    <>
      <div className="vo-hero">
        <ProjectMark id={project.id} />
        <div>
          <p className="vo-summary">{project.summary}</p>
          {project.status && <span className="vo-status">{project.status}</span>}
        </div>
      </div>
      <p className="vo-lede">{project.description}</p>
      <h3 className="vo-sub">What it does</h3>
      <ul className="vo-features">
        {project.features.map((feature, index) => (
          <li key={feature}>
            <b>{String(index + 1).padStart(2, "0")}</b>
            {feature}
          </li>
        ))}
      </ul>
      <h3 className="vo-sub">Built around</h3>
      <div className="vo-chips">
        {project.tags.map(tag => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      {project.url && (
        <a className="vo-button" href={project.url} target="_blank" rel="noopener noreferrer">
          {project.linkLabel ?? "Visit live site"} <ArrowUpRight size={17} />
        </a>
      )}
    </>
  );
}

function SkillsPanel() {
  return (
    <>
      <p className="vo-lede">The technologies and practical skills behind my projects.</p>
      {skillGroups.map(group => (
        <section key={group.title} className="vo-group">
          <h3>{group.title}</h3>
          <p>{group.description}</p>
          <div className="vo-chips vo-chips-lg">
            {group.skills.map(([name, detail]) => (
              <span key={name} title={detail}>
                {name}
              </span>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function AboutPanel() {
  return (
    <>
      <p className="vo-lede">{profile.about[0]}</p>
      <p>{profile.about[1]}</p>
      <p className="vo-meta">
        <MapPin size={14} /> {profile.location}
      </p>
      <ul className="vo-cards">
        {profile.capabilities.map(item => (
          <li key={item.title}>
            <strong>{item.title}</strong>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function ExperiencePanel() {
  return (
    <>
      <p className="vo-lede">Hands-on development shaped by real academic and administrative needs.</p>
      {profile.experience.map(item => (
        <section key={item.title} className="vo-group">
          <span className="vo-kicker">
            {item.kind} · {item.place}
          </span>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
          {item.tags.length > 0 && (
            <div className="vo-chips">
              {item.tags.map(tag => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}
        </section>
      ))}
    </>
  );
}

function ContactPanel() {
  const { contact } = profile;
  return (
    <>
      <p className="vo-lede">{contact.pitch}</p>
      <a className="vo-button" href={contact.compose} target="_blank" rel="noopener noreferrer">
        Email me <ArrowUpRight size={17} />
      </a>
      <ul className="vo-contact">
        <li>
          <Mail size={16} />
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </li>
        <li>
          <Phone size={16} />
          <a href={contact.phoneHref}>{contact.phone}</a>
        </li>
        <li>
          <ArrowUpRight size={16} />
          <a href={contact.facebook} target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
        </li>
      </ul>
    </>
  );
}

const titles: Record<Zone["kind"], string> = {
  project: "",
  skills: "Skills & knowledge.",
  about: "A little about me.",
  experience: "Experience & education.",
  contact: "Let’s work together.",
};

export function panelTitle(zone: Zone) {
  return zone.kind === "project" ? zone.label : titles[zone.kind];
}

export function PanelBody({ zone }: { zone: Zone }) {
  switch (zone.kind) {
    case "project":
      return <ProjectPanel projectId={zone.projectId} />;
    case "skills":
      return <SkillsPanel />;
    case "about":
      return <AboutPanel />;
    case "experience":
      return <ExperiencePanel />;
    case "contact":
      return <ContactPanel />;
  }
}
