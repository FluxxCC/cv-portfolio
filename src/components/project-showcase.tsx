"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  List,
} from "lucide-react";
import { usePortfolioMotion } from "./portfolio-motion";
import { ProjectMark } from "./project-mark";

type Project = {
  id: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  tags: string[];
  features: string[];
  url?: string;
  status?: string;
  linkLabel?: string;
  tone: string;
};
const desktopQuery =
  "(min-width: 960px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)";
function subscribeViewport(callback: () => void) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const getDesktop = () => window.matchMedia(desktopQuery).matches;
const getServerDesktop = () => false;

function ProjectContent({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <>
      <div className="project-sheet-top">
        <span>{project.category}</span>
        <span>0{index + 1} / 05</span>
      </div>
      <div className="project-sheet-body">
        <div className="project-sheet-copy">
          <div className="project-title-row"><span className="project-mobile-mark" aria-hidden="true"><ProjectMark id={project.id} /></span><h3>{project.name}</h3></div>
          <p className="project-summary">{project.summary}</p>
          {project.status && <p className="project-release-status">{project.status}</p>}
          <p className="project-description">{project.description}</p>
          <ul className="project-features">
            {project.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
        <div
          className={`project-emblem emblem-${project.id}`}
          aria-hidden="true"
        >
          <span className="emblem-index">0{index + 1}</span>
          <ProjectMark id={project.id} />
          <span className="emblem-label">{project.name}</span>
        </div>
      </div>
      <div className="project-sheet-bottom">
        <div>
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        {project.url && (
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            {project.linkLabel ?? "Visit project"} <ArrowUpRight size={16} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
    </>
  );
}

function ScrollProject({
  project,
  index,
  total,
  progress,
  active,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
  active: boolean;
}) {
  // Transform motion values update outside React; only the selected index re-renders.
  const position = useTransform(
    progress,
    (value) => value * (total - 1) - index,
  );
  const y = useTransform(
    position,
    [-4, -1, 0, 0.75, 1],
    [60, 20, 0, -300, -520],
  );
  const z = useTransform(position, [-4, -1, 0, 1], [-340, -85, 0, 120]);
  const rotateX = useTransform(position, [-4, -1, 0, 1], [12, 5, 0, -28]);
  const rotateY = useTransform(position, [-1, 0, 1], [-3, 0, -9]);
  const opacity = useTransform(
    position,
    [-4, -2, -1, 0, 0.5, 1],
    [0, 0.55, 1, 1, 0.5, 0],
  );
  return (
    <motion.article
      className={`project-sheet tone-${project.tone}`}
      style={{
        y,
        z,
        rotateX,
        rotateY,
        opacity,
        zIndex: total - index,
        pointerEvents: active ? "auto" : "none",
      }}
      inert={!active}
      aria-hidden={!active}
      aria-label={project.name}
    >
      <ProjectContent project={project} index={index} />
    </motion.article>
  );
}

export function ProjectShowcase({ projects }: { projects: Project[] }) {
  const isDesktop = useSyncExternalStore(
    subscribeViewport,
    getDesktop,
    getServerDesktop,
  );
  const reduced = usePortfolioMotion();
  const [listView, setListView] = useState(false);
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const viewChanged = useRef(false);
  const use3D = isDesktop && !reduced && !listView && projects.length > 1;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (use3D)
      setActive(
        Math.max(
          0,
          Math.min(
            projects.length - 1,
            Math.floor(value * (projects.length - 1) + 0.55),
          ),
        ),
      );
  });
  function goToProject(index: number) {
    const section = sectionRef.current;
    if (!section) return;
    if (use3D) {
      const start = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top:
          start +
          ((section.offsetHeight - window.innerHeight) * index) /
            Math.max(1, projects.length - 1),
        behavior: reduced ? "instant" : "smooth",
      });
    } else
      document
        .getElementById(`project-${projects[index].id}`)
        ?.scrollIntoView({
          behavior: reduced ? "instant" : "smooth",
          block: "start",
        });
  }
  useEffect(() => {
    if (!viewChanged.current) return;
    viewChanged.current = false;
    const section = sectionRef.current;
    if (!section) return;
    if (use3D) {
      const start = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top:
          start +
          ((section.offsetHeight - window.innerHeight) * active) /
            Math.max(1, projects.length - 1),
        behavior: "instant",
      });
    } else
      document
        .getElementById(`project-${projects[active].id}`)
        ?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [use3D, active, projects]);
  return (
    <section
      id="work"
      ref={sectionRef}
      className={`work-section ${use3D ? "work-3d" : "work-list"}`}
      style={{ "--project-count": projects.length } as CSSProperties}
    >
      <div className="work-sticky shell">
        <div className="work-heading">
          <div>
            <p className="eyebrow">01 / PROJECTS</p>
            <h2>
              Projects created<span>.</span>
            </h2>
          </div>
          <div className="work-view-controls">
            {isDesktop && !reduced && (
              <button
                type="button"
                onClick={() => {
                  viewChanged.current = true;
                  setListView(!listView);
                }}
              >
                <List size={15} />
                {listView ? "View in 3D" : "View as list"}
              </button>
            )}
            <a href="#about">
              Skip projects <ArrowRight size={14} />
            </a>
          </div>
        </div>
        <div className="work-layout">
          <aside className="work-aside">
            <p>
              Practical applications for research, education, and everyday
              workflows.
            </p>
            <nav className="project-index" aria-label="Choose a project">
              {projects.map((project, index) => (
                <button
                  type="button"
                  key={project.id}
                  onClick={() => goToProject(index)}
                  aria-current={use3D && index === active ? "step" : undefined}
                >
                  <span>0{index + 1}</span>
                  {project.name}
                  <ArrowUpRight size={14} />
                </button>
              ))}
            </nav>
            {use3D && (
              <div className="scroll-cue">
                <ArrowDown size={14} />
                <span>
                  Scroll to explore
                  <br />
                  <small>
                    0{active + 1} of 0{projects.length}
                  </small>
                </span>
              </div>
            )}
          </aside>
          {use3D ? (
            <div
              className="project-stage"
              aria-label="Scroll-driven project showcase"
            >
              {projects.map((project, index) => (
                <ScrollProject
                  key={project.id}
                  project={project}
                  index={index}
                  total={projects.length}
                  progress={scrollYProgress}
                  active={index === active}
                />
              ))}
            </div>
          ) : (
            <div className="project-list">
              {projects.map((project, index) => (
                <article
                  key={project.id}
                  id={`project-${project.id}`}
                  className={`project-sheet tone-${project.tone}`}
                >
                  <ProjectContent project={project} index={index} />
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
      {use3D && (
        <div className="print-projects">
          {projects.map((project, index) => (
            <article className="project-sheet" key={project.id}>
              <ProjectContent project={project} index={index} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
