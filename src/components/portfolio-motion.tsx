"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { MotionConfig, motion, useReducedMotion, useSpring, useInView } from "framer-motion";
import { Printer } from "lucide-react";

const MotionContext = createContext(false);

export function usePortfolioMotion() {
  return useContext(MotionContext);
}

export function PortfolioMotion({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced || !root.current) return;
    // Keep each text block tied to its viewport position in both directions.
    // Project sheets retain their separate 3D scroll sequence.
    const blocks = Array.from(root.current.querySelectorAll<HTMLElement>(
      "main h1, main h2, main h3, main h4, main p, .hero-location, .availability"
    )).filter(element => !element.closest(".project-stage, .project-list, .print-projects, .hero-stage") && !element.classList.contains("print-name"));
    let frame = 0;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const update = () => {
      frame = 0;
      const height = window.innerHeight;
      const headerBottom = root.current?.querySelector("header")?.getBoundingClientRect().bottom ?? 78;
      // Read all geometry first, then write styles to avoid layout thrashing.
      const states = blocks.map(element => {
        const rect = element.getBoundingClientRect();
        const previousShift = Number(element.dataset.textShift ?? 0);
        const top = rect.top - previousShift;
        const bottom = top + element.offsetHeight;
        const enter = clamp((height - top) / (height * 0.4));
        const leave = clamp((bottom - headerBottom) / (height * 0.22));
        const progress = Math.min(enter, leave);
        return { element, progress, shift: (1 - enter) * 96 - (1 - leave) * 48, scale: 0.94 + 0.06 * progress };
      });
      states.forEach(({ element, progress, shift, scale }) => {
        // Most blocks are fully on or fully off screen and have not changed; leave them alone
        // so scrolling only restyles the few that are actually moving.
        const stamp = `${progress.toFixed(3)}|${shift.toFixed(1)}`;
        if (element.dataset.textStamp === stamp) return;
        element.dataset.textStamp = stamp;
        element.style.setProperty("--text-opacity", String(progress));
        element.style.setProperty("--text-shift", `${shift}px`);
        element.style.setProperty("--text-scale", String(scale));
        element.dataset.textShift = String(shift);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    blocks.forEach(element => element.classList.add("scroll-text"));
    const resize = new ResizeObserver(schedule);
    resize.observe(root.current);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      blocks.forEach(element => {
        element.classList.remove("scroll-text");
        element.style.removeProperty("--text-opacity");
        element.style.removeProperty("--text-shift");
        element.style.removeProperty("--text-scale");
        delete element.dataset.textShift;
        delete element.dataset.textStamp;
      });
    };
  }, [reduced]);
  return (
    <MotionConfig reducedMotion="user">
      <MotionContext.Provider value={Boolean(reduced)}>
        <div ref={root} className="portfolio-root">{children}</div>
      </MotionContext.Provider>
    </MotionConfig>
  );
}

export function RevealSection({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={className}
    >
      {children}
    </section>
  );
}

export function HeroStage({ children }: { children: ReactNode }) {
  const reduced = usePortfolioMotion();
  const [paused, setPaused] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const visible = useInView(stage, { amount: 0.1 });
  const rotateX = useSpring(0, { stiffness: 110, damping: 22 });
  const rotateY = useSpring(0, { stiffness: 110, damping: 22 });
  const still = reduced || paused || !visible;
  return <div ref={stage} className={`hero-stage hero-scene${still ? " is-still" : ""}`}
    onPointerMove={event => {
      if (still || event.pointerType !== "mouse") return;
      const rect = event.currentTarget.getBoundingClientRect();
      rotateY.set(((event.clientX - rect.left) / rect.width - 0.5) * 12);
      rotateX.set(-((event.clientY - rect.top) / rect.height - 0.5) * 10);
    }}
    onPointerLeave={() => { rotateX.set(0); rotateY.set(0); }}>
    <div className="hero-orbit" aria-hidden="true"><span/><i/></div>
    <div className="hero-orbit orbit-secondary" aria-hidden="true"><span/></div>
    <div className="hero-cube" aria-hidden="true">{[0,1,2,3,4,5].map(face=><i key={face}/>)}</div>
    <div className="hero-glass-chip chip-code" aria-hidden="true">&lt;/&gt;<span>BUILD</span></div>
    <div className="hero-glass-chip chip-stack" aria-hidden="true"><i/><i/><i/><span>CREATE</span></div>
    <motion.div className="hero-tilt" style={{ rotateX: still ? 0 : rotateX, rotateY: still ? 0 : rotateY }}>
      <div className="hero-float">{children}<div className="hero-photo-shine" aria-hidden="true"/></div>
    </motion.div>
    {!reduced && <button className="hero-motion-toggle" type="button" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused ? "Resume motion" : "Pause motion"}</button>}
  </div>;
}

export function ResumeButton() {
  return (
    <button
      type="button"
      className="text-link resume-button"
      onClick={() => window.print()}
    >
      <Printer size={16} /> Print / save CV
    </button>
  );
}
