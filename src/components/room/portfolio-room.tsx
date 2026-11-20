"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Mail, MapPin, Phone, X } from "lucide-react";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { profile } from "@/data/profile";
import { spots, type SpotId } from "./spots";
import "@/app/room.css";

const RoomScene = dynamic(() => import("./room-scene"), { ssr: false });

const LITE_QUERY = "(max-width: 900px), (pointer: coarse)";
const subscribeLite = (notify: () => void) => {
  const query = window.matchMedia(LITE_QUERY);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

const EASE = [0.22, 1, 0.36, 1] as const;

function ProjectCard({ project, onProject }: { project: number; onProject: (index: number) => void }) {
  const item = projects[project];
  const total = projects.length;
  const go = (step: number) => onProject((project + step + total) % total);

  return (
    <div className="ro-project" style={{ "--tone": item.color } as CSSProperties}>
      <div className="ro-progress" role="tablist" aria-label="Projects">
        {projects.map((entry, index) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={index === project}
            aria-label={entry.name}
            title={entry.name}
            className={index === project ? "is-current" : ""}
            onClick={() => onProject(index)}
          />
        ))}
      </div>

      <div key={item.id} className="ro-project-body">
        <h2>{item.name}</h2>
        <p className="ro-line">{item.subtitle}</p>
        <div className="ro-chips">
          {item.tags.map(tag => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>

      <div className="ro-actions">
        {item.url ? (
          <a className="ro-button" href={item.url} target="_blank" rel="noopener noreferrer">
            {item.linkLabel ?? "Visit"} <ArrowUpRight size={16} />
          </a>
        ) : (
          <span className="ro-status">{item.status}</span>
        )}
        <div className="ro-pager">
          <button type="button" onClick={() => go(-1)} aria-label="Previous project">
            <ArrowLeft size={17} />
          </button>
          <span aria-live="polite">
            {project + 1} / {total}
          </span>
          <button type="button" className="is-next" onClick={() => go(1)} aria-label="Next project">
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ id }: { id: Exclude<SpotId, "projects"> }) {
  if (id === "skills") {
    return (
      <>
        <h2>Skills</h2>
        {skillGroups.map(group => (
          <section key={group.title} className="ro-group">
            <h3>{group.title}</h3>
            <div className="ro-chips">
              {group.skills.map(([name]) => (
                <span key={name}>{name}</span>
              ))}
            </div>
          </section>
        ))}
      </>
    );
  }
  if (id === "about") {
    return (
      <>
        <h2>Charles Xander Panis</h2>
        <p className="ro-line">Full stack developer building web apps and AI-assisted tools.</p>
        <div className="ro-chips">
          <span>
            <MapPin size={13} /> Philippines
          </span>
          <span>BS Information Technology</span>
          <span>Open to opportunities</span>
        </div>
      </>
    );
  }
  if (id === "experience") {
    return (
      <>
        <h2>Path</h2>
        <ol className="ro-steps">
          {profile.experience.map(item => (
            <li key={item.title}>
              <span>{item.kind}</span>
              <strong>{item.title}</strong>
              <small>{item.place}</small>
            </li>
          ))}
        </ol>
      </>
    );
  }
  const { contact } = profile;
  return (
    <>
      <h2>Say hello</h2>
      <a className="ro-button" href={contact.compose} target="_blank" rel="noopener noreferrer">
        Email me <ArrowUpRight size={16} />
      </a>
      <ul className="ro-links">
        <li>
          <Mail size={15} />
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </li>
        <li>
          <Phone size={15} />
          <a href={contact.phoneHref}>{contact.phone}</a>
        </li>
        <li>
          <ArrowUpRight size={15} />
          <a href={contact.facebook} target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
        </li>
      </ul>
    </>
  );
}

export function PortfolioRoom() {
  const reduced = useReducedMotion() ?? false;
  const lite = useSyncExternalStore(
    subscribeLite,
    () => window.matchMedia(LITE_QUERY).matches,
    () => false,
  );
  const [active, setActive] = useState<SpotId | null>(null);
  const [project, setProject] = useState(0);
  const [ready, setReady] = useState(false);
  const card = useRef<HTMLElement>(null);

  const handleReady = useCallback(() => setReady(true), []);
  const handleClose = useCallback(() => setActive(null), []);
  const index = active ? spots.findIndex(spot => spot.id === active) : -1;
  const spot = index >= 0 ? spots[index] : null;

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (active !== "projects") return;
      if (event.key === "ArrowRight") setProject(value => (value + 1) % projects.length);
      if (event.key === "ArrowLeft") setProject(value => (value - 1 + projects.length) % projects.length);
    };
    window.addEventListener("keydown", onKey);
    card.current?.focus({ preventScroll: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <div className={`ro-root${ready ? " is-ready" : ""}${active ? " is-focused" : ""}`}>
      <h1 className="ro-sr">
        {profile.name} — {profile.role}. Interactive 3D office portfolio.
      </h1>

      <div className="ro-canvas">
        <RoomScene active={active} project={project} reduced={reduced} lite={lite} onProject={setProject} onSelect={setActive} onClose={handleClose} onReady={handleReady} />
      </div>

      <nav className="ro-tags" aria-label="Room">
        {spots.map(item => (
          <button
            key={item.id}
            id={`ro-tag-${item.id}`}
            type="button"
            className="ro-tag"
            style={{ "--tone": item.tone } as CSSProperties}
            tabIndex={active ? -1 : 0}
            onClick={() => setActive(item.id)}
          >
            <i />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="ro-loader" aria-hidden={ready}>
        <span className="ro-wordmark">
          charles<b>.</b>
        </span>
        <span className="ro-loader-bar" />
      </div>

      <AnimatePresence mode="wait">
        {spot && (
          <motion.aside
            key={spot.id}
            ref={card}
            className="ro-card"
            style={{ "--tone": spot.tone } as CSSProperties}
            tabIndex={-1}
            aria-label={spot.title}
            initial={reduced ? false : { x: "125%" }}
            animate={{ x: 0, transition: { duration: 0.55, ease: EASE, delay: 0.1 } }}
            exit={reduced ? { x: 0, transition: { duration: 0 } } : { x: "125%", transition: { duration: 0.25, ease: "easeIn" } }}
          >
            <div className="ro-card-top">
              <span className="ro-kicker">
                0{index + 1} · {spot.label}
              </span>
              <button type="button" className="ro-close" onClick={() => setActive(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            {spot.id === "projects" ? <ProjectCard project={project} onProject={setProject} /> : <Card id={spot.id} />}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
