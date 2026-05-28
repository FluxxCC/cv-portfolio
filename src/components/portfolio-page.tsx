"use client";

import Image from "next/image";
import {
  ArrowRight,
  BriefcaseBusiness,
  Cpu,
  DatabaseZap,
  Globe2,
  Layers3,
  Mail,
  Rocket,
  Sparkles,
  Workflow,
  FileSignature,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { FaFacebook, FaPhoneAlt } from "react-icons/fa";
import {
  SiGmail,
  SiGit,
  SiNextdotjs,
  SiPostgresql,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "react-icons/si";
import {
  AnimatePresence,
  LayoutGroup,
  MotionValue,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";

import ojtonTrackJson from "../../public/OJTonTrack.json";
import citeReportJson from "../../public/CITE Report.json";
import tabuloraJson from "../../public/Tabulora.json";
import rrlFinderJson from "../../public/RRL Finder.json";
import kabawJson from "../../public/KABAW.json";
import iGuidanceJson from "../../public/iGuidance.json";

const portraitTransition = {
  duration: 0.95,
  ease: [0.22, 1, 0.36, 1] as const,
};

function ScrollReveal({ children, className = "", delay = 0, yOffset = 20, xOffset = 0, duration = 0.8 }: { children: React.ReactNode; className?: string; delay?: number; yOffset?: number; xOffset?: number; duration?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: yOffset, x: xOffset, filter: "blur(4px)" }}
      animate={isInView ? { opacity: 1, y: 0, x: 0, filter: "blur(0px)" } : { opacity: 0, y: yOffset, x: xOffset, filter: "blur(4px)" }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

const experience = [
  {
    range: "2026 - Present",
    role: "Software Engineer Intern",
    company: "CITE College",
    summary:
      "Developing, deploying, and maintaining specialized web applications for the CITE College. Managing end-to-end workflows including database design, frontend architecture with Next.js, and creating robust administrative dashboards to solve real-world departmental problems.",
  },
  {
    range: "2024 - 2025",
    role: "Independent Full Stack Developer",
    company: "Freelance",
    summary:
      "Developed and maintained full-stack web and mobile applications. Focused on rapid prototyping, seamless deployment, and creating scalable offline-first solutions.",
  },
];

const productStories = [
  {
    title: "OJTonTrack",
    description:
      "A comprehensive tracking platform built to manage and monitor student internships, featuring real-time attendance logging and automated reporting.",
    animationData: ojtonTrackJson,
    tags: ["Next.js", "Supabase", "Real-time"],
  },
  {
    title: "Cite Report",
    description:
      "A digital reporting system that streamlines document submissions and approvals using integrated e-signatures and automated routing.",
    animationData: citeReportJson,
    tags: ["React", "E-Signature", "Workflows"],
  },
  {
    title: "Tabulora",
    description:
      "A highly responsive scoring system designed for real-time tabulation, ensuring accuracy, speed, and reliability during live events.",
    animationData: tabuloraJson,
    tags: ["WebSockets", "Dashboard", "Live Data"],
  },
  {
    title: "RRL Finder",
    description:
      "An academic tool built to help researchers quickly discover, aggregate, and generate review of related literature (RRL) efficiently.",
    animationData: rrlFinderJson,
    tags: ["API Integration", "Data Parsing", "Next.js"],
  },
  {
    title: "KABAW",
    description:
      "A mobile application providing reliable, offline-first task management and reminders, built with React Native for cross-platform use.",
    animationData: kabawJson,
    tags: ["React Native", "Offline-First", "Mobile"],
  },
  {
    title: "iGuidance",
    description:
      "A secure management platform designed for guidance counselors to track student records, appointments, and interventions effectively.",
    animationData: iGuidanceJson,
    tags: ["Security", "Management", "Database"],
  },
];

const serviceHighlights = [
  {
    title: "Full Stack Web Development",
    description: "Fast, polished web platforms built from frontend interactions down to backend logic and deployment.",
    stat: "Web apps",
    accent: "From concept to launch",
    icon: Layers3,
  },
  {
    title: "Mobile App Development",
    description: "Cross-platform mobile experiences designed to stay intuitive, reliable, and lightweight on real devices.",
    stat: "Mobile-ready",
    accent: "iOS and Android",
    icon: Smartphone,
  },
  {
    title: "Admin Dashboard Systems",
    description: "Operational dashboards with strong information hierarchy, filtering, and role-aware workflows.",
    stat: "Ops focus",
    accent: "Decision-friendly interfaces",
    icon: BriefcaseBusiness,
  },
  {
    title: "Real-Time Systems",
    description: "Live scoring, tracking, and collaboration flows backed by responsive event-driven interfaces.",
    stat: "Live data",
    accent: "Immediate updates",
    icon: DatabaseZap,
  },
  {
    title: "System Deployment and Setup",
    description: "Production deployment, environment setup, and release workflows that keep systems dependable after launch.",
    stat: "Launch support",
    accent: "Stable handoff",
    icon: Rocket,
  },
  {
    title: "Custom Management Systems",
    description: "Purpose-built internal tools shaped around the actual process instead of forcing teams into generic software.",
    stat: "Custom fit",
    accent: "Built around your workflow",
    icon: ShieldCheck,
  },
];

const coreStack = [
  { label: "Next.js", icon: SiNextdotjs },
  { label: "React", icon: SiReact },
  { label: "TypeScript", icon: SiTypescript },
  { label: "Tailwind CSS", icon: SiTailwindcss },
  { label: "Supabase", icon: SiSupabase },
  { label: "PostgreSQL", icon: SiPostgresql },
  { label: "Git", icon: SiGit },
  { label: "Vercel", icon: SiVercel },
  { label: "React Native", icon: SiReact },
];

const toolkitHighlights = [
  {
    icon: Layers3,
    label: "Full Stack Architecture",
    detail: "Clear system structure, scalable UI flows, and maintainable frontend foundations.",
  },
  {
    icon: Cpu,
    label: "API & Backend Integration",
    detail: "Smooth data pipelines, auth-aware flows, and practical backend connectivity.",
  },
  {
    icon: Globe2,
    label: "Deployment & Setup",
    detail: "Reliable launches with hosting, environments, and production-minded configuration.",
  },
  {
    icon: Workflow,
    label: "Rapid Prototyping",
    detail: "Fast iteration from rough concept to clickable, testable product direction.",
  },
];

const navItems = [
  { href: "#work", label: "Work", icon: BriefcaseBusiness },
  { href: "#experience", label: "Experience", icon: FileSignature },
  { href: "#contact", label: "Contact", icon: Mail },
];

function ProductCard({
  story,
  index,
  progress,
  totalItems,
}: {
  story: (typeof productStories)[number];
  index: number;
  progress: MotionValue<number>;
  totalItems: number;
}) {
  const step = 1 / totalItems;
  const segmentMid = (index + 0.5) * step;
  const segmentStart = segmentMid - step;
  const segmentEnd = segmentMid + step;

  const x = useTransform(progress, [segmentStart, segmentMid, segmentEnd], [60, 0, -60]);
  const y = useTransform(progress, [segmentStart, segmentMid, segmentEnd], [80, 0, -70]);
  const z = useTransform(progress, [segmentStart, segmentMid, segmentEnd], [-180, 100, -80]);
  const rotateX = useTransform(progress, [segmentStart, segmentMid, segmentEnd], [18, 1, -12]);
  const rotateY = useTransform(
    progress,
    [segmentStart, segmentMid, segmentEnd],
    [index === 1 ? -18 : 16, 0, index === 1 ? 10 : -10],
  );
  const scale = useTransform(progress, [segmentStart, segmentMid, segmentEnd], [0.82, 1, 0.88]);
  const opacity = useTransform(progress, [segmentStart, segmentMid, segmentEnd], [0.15, 1, 0.3]);
  const transform = useMotionTemplate`translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;

  return (
    <motion.article
      className="absolute inset-x-0 mx-auto flex w-[min(92vw,36rem)] flex-col rounded-[2rem] p-2 [will-change:transform,opacity] bg-white border border-slate-200 shadow-sm overflow-hidden group"
      style={{ transform, opacity }}
    >
      <div className={`relative h-40 w-full rounded-[1.5rem] bg-slate-950 p-6 overflow-hidden flex flex-col justify-end`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-500 group-hover:opacity-80" />
        
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400 drop-shadow-sm">
              System 0{index + 1}
            </p>
            <h3 className="font-display text-2xl font-black tracking-tight text-white drop-shadow-md md:text-3xl">
              {story.title}
            </h3>
          </div>
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.25rem] bg-white border border-slate-200 shadow-md overflow-hidden">
            <Lottie animationData={story.animationData} loop={true} className="w-[120%] h-[120%]" />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-4 p-6">
        <p className="text-sm leading-relaxed text-slate-600 font-medium">
          {story.description}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {story.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-100 px-3 py-1 text-[11px] font-bold tracking-wide text-slate-600 border border-slate-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function Preloader({ visible, shouldReduceMotion }: { visible: boolean; shouldReduceMotion: boolean }) {
  const [progress, setProgress] = useState(0);
  const [currentWord, setCurrentWord] = useState(0);
  const loadWords = ["Initializing", "Loading dependencies", "Fetching projects", "Compiling", "Ready"];

  useEffect(() => {
    if (!visible) return;
    const startedAt = performance.now();
    const duration = 2200;
    let frame = window.requestAnimationFrame(function update(now) {
      const elapsed = now - startedAt;
      const next = Math.min(100, (elapsed / duration) * 100);
      const eased = 1 - Math.pow(1 - next / 100, 3);
      setProgress(Math.round(eased * 100));
      if (next < 100) frame = window.requestAnimationFrame(update);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const wordIndex = Math.min(loadWords.length - 1, Math.floor((progress / 100) * loadWords.length));
    setCurrentWord(wordIndex);
  }, [progress, visible, loadWords.length]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.05),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(59,130,246,0.05),_transparent_22%)]" />
          <div className="relative flex w-full max-w-2xl flex-col items-center gap-10 px-6">
            <motion.div
              className="relative h-28 w-28"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-300"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                layoutId={shouldReduceMotion ? undefined : "charles-portrait"}
                transition={portraitTransition}
                className="absolute inset-3 overflow-hidden rounded-full border border-slate-100 bg-white shadow-[0_12px_30px_-18px_rgba(15,23,42,0.6)]"
              >
                <Image
                  src="/charles.png"
                  alt="Profile"
                  fill
                  sizes="88px"
                  className="object-cover object-top"
                  priority
                />
              </motion.div>
            </motion.div>

            <div className="w-full space-y-6">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-500">
                <motion.span
                  key={currentWord}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {loadWords[currentWord]}
                </motion.span>
                <span className="font-display text-blue-600">{String(progress).padStart(3, "0")}%</span>
              </div>
              <div className="relative overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                <motion.div
                  className="h-1.5 bg-blue-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                />
              </div>
            </div>

            <motion.div
              className="space-y-3 text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Welcome
              </p>
              <h2 className="max-w-3xl font-display text-3xl font-black text-slate-900 md:text-5xl tracking-tight">
                Loading <span className="text-blue-600">Charles</span> Portfolio
              </h2>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function MagneticButton({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function PortfolioPage() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [isLoading, setIsLoading] = useState(!shouldReduceMotion);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const showcaseRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: showcaseRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 28,
    mass: 0.4,
    restDelta: 0.001,
  });
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltX = useSpring(useTransform(pointerY, [-0.5, 0.5], [10, -10]), {
    stiffness: 80,
    damping: 24,
    mass: 0.5,
  });
  const tiltY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 80,
    damping: 24,
    mass: 0.5,
  });
  const stageTransform = useMotionTemplate`rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  const heroY = useTransform(smoothProgress, [0, 0.18], [0, -34]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.16], [1, 0.7]);
  const progressWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    // Force scroll to top on mount/refresh
    window.scrollTo(0, 0);
    
    if (shouldReduceMotion) return;
    const timeout = window.setTimeout(() => setIsLoading(false), 2400);
    return () => window.clearTimeout(timeout);
  }, [shouldReduceMotion]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useMotionValueEvent(smoothProgress, "change", (value) => {
    if (productStories.length === 0) return;
    const nextIndex = Math.min(
      productStories.length - 1,
      Math.max(0, Math.round(value * (productStories.length - 1))),
    );
    setActiveIndex(nextIndex);
  });

  function handleStageMove(event: React.PointerEvent<HTMLDivElement>) {
    if (shouldReduceMotion || !stageRef.current) return;
    const bounds = stageRef.current.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }

  function resetStageTilt() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <LayoutGroup>
      <Preloader visible={isLoading} shouldReduceMotion={shouldReduceMotion} />
      
      {/* Animated Background Layers */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-white">
        <motion.div 
          animate={{ backgroundPosition: ["0px 0px", "32px 32px"] }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" 
        />
      </div>

      <main className="relative pb-16">
        <section className="relative min-h-screen pt-6 md:pt-8">
          <motion.header
            className="sticky top-0 z-30 mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6 md:px-12 md:py-6"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/80 px-4 py-3 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur md:px-5">
              <div className="flex items-center justify-between gap-3 sm:gap-5 md:gap-8">
                <div className="font-display text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                  CHARLES
                </div>
                
                <div className="flex items-center gap-3 sm:gap-5 md:gap-8">
                  <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
                    {navItems.map(({ href, label, icon: Icon }) => (
                      <a key={href} href={href} className="flex items-center gap-2 transition hover:text-blue-600">
                        <Icon size={16} /> <span className="hidden lg:inline">{label}</span>
                      </a>
                    ))}
                  </nav>
                  <button
                    type="button"
                    aria-expanded={mobileMenuOpen}
                    aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    onClick={() => setMobileMenuOpen((open) => !open)}
                    className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:bg-slate-50 md:hidden"
                  >
                    <div className="relative h-4 w-5">
                      <span className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition ${mobileMenuOpen ? "translate-y-[7px] rotate-45" : ""}`}></span>
                      <span className={`absolute left-0 top-[7px] h-0.5 w-5 bg-current transition ${mobileMenuOpen ? "opacity-0" : ""}`}></span>
                      <span className={`absolute left-0 top-[14px] h-0.5 w-5 bg-current transition ${mobileMenuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}></span>
                    </div>
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {mobileMenuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="md:hidden"
                  >
                    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-950 text-white shadow-xl">
                      <div className="space-y-2 p-3">
                        {navItems.map(({ href, label, icon: Icon }) => (
                          <a
                            key={href}
                            href={href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between rounded-[1.15rem] border border-white/8 bg-white/5 px-4 py-4 transition hover:bg-white/10"
                          >
                            <span className="flex items-center gap-3 text-sm font-bold tracking-wide">
                              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                                <Icon size={18} />
                              </span>
                              {label}
                            </span>
                            <ArrowRight size={16} className="text-white/70" />
                          </a>
                        ))}
                      </div>
                      <div className="border-t border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_45%)] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-blue-200/80">
                          Available for new projects
                        </p>
                        <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-200">
                          Need a fast system, dashboard, or mobile-ready product? Let&apos;s build something useful.
                        </p>
                        <a
                          href="#contact"
                          onClick={() => setMobileMenuOpen(false)}
                          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-slate-950"
                        >
                          Contact Me
                          <ArrowRight size={15} />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.header>

          <motion.div
            ref={heroRef}
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-[1100px] flex-col-reverse items-center justify-center gap-8 px-4 pb-8 sm:px-6 md:min-h-[calc(100vh-8rem)] lg:flex-row lg:gap-12 lg:px-12"
          >
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative flex w-full justify-center lg:w-1/2 lg:justify-start"
            >
              <div className="relative w-full max-w-[280px] sm:max-w-[340px] md:max-w-[400px] xl:max-w-[450px] mix-blend-darken group">
                <motion.div
                  initial={{ rotate: 0, opacity: 0 }}
                  animate={!isLoading ? { rotate: -6, opacity: 1 } : { rotate: 0, opacity: 0 }}
                  transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                  className="absolute inset-0 z-0 bg-slate-100 rounded-[3rem] transition-transform duration-700 group-hover:-rotate-2"
                />
                <motion.div
                  initial={{ rotate: 0, opacity: 0 }}
                  animate={!isLoading ? { rotate: 3, opacity: 1 } : { rotate: 0, opacity: 0 }}
                  transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 z-0 bg-blue-50/50 rounded-[3rem] transition-transform duration-700 group-hover:rotate-6"
                />
                <motion.div
                  animate={!isLoading ? { y: [-10, 10, -10] } : { y: 0 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="relative z-10 w-full"
                >
                  <AnimatePresence initial={false}>
                    {!isLoading ? (
                      <motion.div
                        key="hero-portrait"
                        layoutId={shouldReduceMotion ? undefined : "charles-portrait"}
                        transition={portraitTransition}
                        initial={shouldReduceMotion ? false : { opacity: 0.9, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full"
                      >
                        <Image
                          src="/charles.png"
                          alt="Charles"
                          width={800}
                          height={1000}
                          className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
                          priority
                        />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>

            <div className="flex w-full flex-col items-center pt-8 text-center sm:pt-12 lg:w-1/2 lg:pt-0 lg:items-start lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={!isLoading ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-5 w-full flex flex-col items-center lg:items-start relative z-10"
              >
                <MagneticButton>
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 shadow-sm cursor-pointer transition-colors hover:bg-blue-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-600"></span>
                    </span>
                    Available for new projects
                  </div>
                </MagneticButton>
                
                <div className="space-y-1">
                  <p className="pl-1 text-xs font-bold uppercase tracking-[0.35em] text-slate-500 sm:text-sm md:text-base">
                    Hey! I&apos;m
                  </p>
                  
                  <div className="relative inline-block">
                    <h1 className="flex overflow-visible pb-2 font-display text-[3.35rem] font-black leading-[0.95] tracking-tighter text-slate-900 sm:text-7xl md:text-8xl lg:text-[80px] xl:text-[100px]">
                      {"CHARLES".split("").map((char, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                          animate={!isLoading ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 40, filter: "blur(8px)" }}
                          transition={{ duration: 0.8, delay: 0.3 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                          className="inline-block"
                        >
                          {char}
                        </motion.span>
                      ))}
                    </h1>
                    <motion.div
                      className="absolute -right-10 -top-8 hidden md:block"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={!isLoading ? { opacity: 1, scale: 1, rotate: 360 } : { opacity: 0, scale: 0 }}
                      transition={{ 
                        opacity: { duration: 0.5, delay: 0.8 },
                        scale: { duration: 0.5, delay: 0.8, type: "spring" },
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                      }}
                    >
                      <Sparkles className="h-10 w-10 text-slate-300/80" />
                    </motion.div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 lg:justify-start">
                  <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 shadow-sm sm:px-4 sm:text-xs">
                    Software Engineer Intern
                  </span>
                  <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 shadow-sm sm:px-4 sm:text-xs">
                    Graduating Class of 2026
                  </span>
                </div>

                <div className="flex w-full flex-col items-stretch justify-center gap-3 pt-6 sm:flex-row sm:flex-wrap sm:items-center lg:justify-start">
                  <MagneticButton>
                    <a href="#work" className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-[13px] font-bold text-white shadow-md transition-colors hover:bg-slate-800 sm:w-auto">
                      View Work <ArrowRight size={14} />
                    </a>
                  </MagneticButton>
                  <MagneticButton>
                    <a href="#contact" className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-[13px] font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:w-auto">
                      Contact Me
                    </a>
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section id="profile" className="section-shell py-12 md:py-32 relative z-10">
          <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <motion.div
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 1.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Profile
                </p>
                <h2 className="max-w-lg font-display text-3xl font-black leading-tight text-slate-900 md:text-5xl drop-shadow-sm">
                  Building robust systems from the ground up.
                </h2>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 56 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.45, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            >
              <motion.div 
                whileHover={{ y: -2, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" }}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 md:p-10"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 bg-slate-50 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  whileInView={{ width: "100%", opacity: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-0 h-px bg-gradient-to-r from-blue-300 via-slate-200 to-transparent"
                />
                
                <div className="relative z-10">
                  <motion.p
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 1.25, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-2xl text-[15px] leading-relaxed text-slate-600 font-medium"
                  >
                    I am a graduating software engineer intern at CITE College (Class of 2026), focused on creating functional, production-ready web applications. I specialize in full stack development, taking projects from rapid prototyping to deployment. My approach values clean architecture, reliable databases, and seamless workflows to solve real-world problems.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-8 flex items-center gap-4 border-t border-slate-100 pt-6"
                  >
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-2 ring-white shadow-sm"
                    >
                      <Image
                        src="/charles.png"
                        alt="Profile"
                        fill
                        sizes="48px"
                        className="object-cover object-top"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p className="text-base font-bold text-slate-900">Charles Xander Panis</p>
                      <p className="text-xs font-medium text-slate-500">Software Engineer Intern</p>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section
          id="work"
          ref={showcaseRef}
          className="section-shell relative py-12 md:py-20 lg:h-[600vh] lg:py-0"
        >
          <div className="sticky top-0 hidden h-screen w-full items-center justify-center lg:flex">
            <div className="grid w-full gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="flex max-w-lg flex-col justify-center gap-12">
                <div>
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                    Portfolio
                  </p>
                  <h2 className="font-display text-4xl font-black leading-tight text-slate-900 md:text-5xl">
                    Web & Apps I&apos;ve Built
                  </h2>
                  <p className="mt-6 text-base leading-relaxed text-slate-500 font-medium">
                    A collection of systems I&apos;ve designed and deployed. From real-time admin dashboards to offline-first mobile applications, these projects highlight my focus on solving actual problems through clean, scalable code.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm font-bold text-slate-400">
                    0{activeIndex + 1} / 0{productStories.length}
                  </div>
                  <div className="h-0.5 w-full bg-slate-100 overflow-hidden rounded-full">
                    <motion.div
                      className="h-full bg-slate-900"
                      style={{ width: progressWidth }}
                    />
                  </div>
                </div>
              </div>

              <div
                ref={stageRef}
                onPointerMove={handleStageMove}
                onPointerLeave={resetStageTilt}
                className="perspective-stage relative min-h-[38rem] w-full"
              >
                <div className="absolute inset-0 rounded-[3rem] bg-slate-50/50" />
                <motion.div
                  style={{ transform: stageTransform }}
                  className="preserve-3d relative flex h-full items-center justify-center"
                >
                  {productStories.map((story, index) => (
                    <ProductCard
                      key={story.title}
                      story={story}
                      index={index}
                      progress={smoothProgress}
                      totalItems={productStories.length}
                    />
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
          <div className="space-y-8 lg:hidden">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                Portfolio
              </p>
              <h2 className="font-display text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                Web & Apps I&apos;ve Built
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
                Selected systems I&apos;ve designed and launched, presented in a cleaner mobile format for quick browsing.
              </p>
            </div>
            <div className="grid gap-5">
              {productStories.map((story, index) => (
                <ScrollReveal key={`${story.title}-mobile`} delay={index * 0.08} yOffset={18}>
                  <motion.article
                    whileHover={{ y: -2 }}
                    className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="relative flex items-end justify-between overflow-hidden bg-slate-950 p-5">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.22),_transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.2),rgba(15,23,42,0.85))]" />
                      <div className="relative z-10">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                          Project 0{index + 1}
                        </p>
                        <h3 className="font-display text-2xl font-black text-white">
                          {story.title}
                        </h3>
                      </div>
                      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/95 shadow-lg">
                        <Lottie animationData={story.animationData} loop={true} className="h-[110%] w-[110%]" />
                      </div>
                    </div>
                    <div className="space-y-4 p-5">
                      <p className="text-sm leading-relaxed text-slate-600">
                        {story.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {story.tags.map((tag) => (
                          <span
                            key={`${story.title}-${tag}`}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="section-shell py-12 md:py-32 relative z-10">
          <ScrollReveal duration={1.2}>
            <div className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Experience
                </p>
                <h2 className="font-display text-3xl font-black leading-tight text-slate-900 md:text-6xl drop-shadow-sm">
                  Professional Journey
                </h2>
              </div>
            </div>
          </ScrollReveal>
          <div className="grid gap-6">
            {experience.map((item, i) => (
              <ScrollReveal key={`${item.range}-${item.role}`} delay={i * 0.3} duration={1.2} yOffset={30}>
                <motion.div 
                  whileHover={{ scale: 1.005, backgroundColor: "rgba(248,250,252,1)" }}
                  className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all md:grid-cols-[0.25fr_0.75fr] md:gap-6 md:p-8"
                >
                  <div className="text-xs font-bold tracking-widest text-slate-400 mt-2 uppercase">
                    {item.range}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-black text-slate-900 md:text-2xl">
                      {item.role}
                    </h3>
                    <p className="mt-2 inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                      {item.company}
                    </p>
                    <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-slate-600 font-medium">
                      {item.summary}
                    </p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="section-shell relative z-10 py-12 md:py-24">
          <ScrollReveal>
            <div className="mb-10 flex flex-col gap-5 md:mb-14 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-slate-400">
                  Services
                </p>
                <h2 className="font-display text-3xl font-black leading-[1.02] text-slate-900 sm:text-4xl md:text-5xl">
                  Practical services with a calm, product-first approach.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
                I focus on building clean, dependable systems that feel easy to use, easy to maintain, and ready for real work.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {serviceHighlights.map(({ title, description, stat, accent, icon: Icon }, idx) => (
              <ScrollReveal key={title} delay={0.06 * idx} yOffset={22}>
                <motion.article
                  whileHover={{ y: -4 }}
                  className="group relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white px-6 py-6 shadow-sm transition-all"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,252,0.75),rgba(255,255,255,0))]"
                  />
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    whileInView={{ width: "100%", opacity: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.75, delay: 0.08 * idx, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 top-0 h-px bg-gradient-to-r from-blue-300 via-slate-200 to-transparent"
                  />
                  <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: 0.06 * idx }}
                        whileHover={{ rotate: -4, scale: 1.03 }}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white"
                      >
                        <Icon size={22} />
                      </motion.div>
                      <div className="space-y-2 text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                          0{idx + 1}
                        </p>
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">
                          {stat}
                        </span>
                      </div>
                    </div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.32em] text-slate-400">
                      {accent}
                    </p>
                    <h3 className="max-w-xs text-2xl font-black leading-tight text-slate-900">
                      {title}
                    </h3>
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
                      {description}
                    </p>
                  </div>
                </motion.article>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="section-shell relative z-10 py-12 md:py-28">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 px-6 py-8 shadow-sm sm:px-8 md:px-10 md:py-10">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(248,250,252,0.9))]" />
              <div className="relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                <div className="max-w-xl">
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-slate-400">
                    Toolkit
                  </p>
                  <h3 className="font-display text-3xl font-black leading-tight text-slate-900 sm:text-4xl md:text-5xl">
                    The stack behind the delivery.
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
                    A focused set of tools I use to design, build, deploy, and maintain reliable products without unnecessary complexity.
                  </p>
                  <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-black text-slate-900">
                      Core Stack
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Technologies I reach for most often
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {coreStack.map(({ label, icon: Icon }, idx) => (
                        <ScrollReveal key={label} delay={0.04 * idx} yOffset={10}>
                          <motion.div
                            whileHover={{ scale: 1.03, y: -1 }}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.7 }}
                            transition={{ duration: 0.45, delay: 0.04 * idx }}
                            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-[11px] font-bold tracking-wide text-slate-700 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-900"
                          >
                            <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                            <span>{label}</span>
                          </motion.div>
                        </ScrollReveal>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:auto-rows-fr sm:grid-cols-2">
                  {toolkitHighlights.map(({ icon: Icon, label, detail }, idx) => (
                    <ScrollReveal key={label} delay={0.08 * idx} yOffset={20}>
                      <motion.div 
                        whileHover={{ y: -3 }}
                        className="group relative h-full min-h-[15.5rem] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition-all"
                      >
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true, amount: 0.5 }}
                          transition={{ duration: 0.6 }}
                          className="absolute inset-0 bg-[linear-gradient(160deg,rgba(248,250,252,0.65),rgba(255,255,255,1))]"
                        />
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          whileInView={{ width: "100%", opacity: 1 }}
                          viewport={{ once: true, amount: 0.4 }}
                          transition={{ duration: 0.7, delay: 0.06 * idx, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute left-0 top-0 h-px bg-gradient-to-r from-slate-300 via-slate-200 to-transparent"
                        />
                        <div className="relative z-10">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, amount: 0.6 }}
                            transition={{ duration: 0.5, delay: 0.07 * idx }}
                            whileHover={{ rotate: -4, scale: 1.03 }}
                            className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white"
                          >
                            <Icon size={18} />
                          </motion.div>
                          <p className="text-lg font-black leading-snug text-slate-900">
                            {label}
                          </p>
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.7 }}
                            transition={{ duration: 0.55, delay: 0.12 + 0.05 * idx }}
                            className="mt-3 text-sm leading-relaxed text-slate-600"
                          >
                            {detail}
                          </motion.p>
                        </div>
                      </motion.div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        <section id="contact" className="section-shell py-12 md:py-32 relative z-10">
          <ScrollReveal duration={1.2}>
            <div className="relative mx-auto flex max-w-4xl flex-col items-center space-y-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10 md:space-y-10 md:p-20">
              <div className="absolute inset-0 bg-slate-50 opacity-50" />
              
              <div className="relative z-10 space-y-6">
                <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full bg-slate-100 ring-4 ring-white shadow-sm">
                  <Image
                    src="/charles.png"
                    alt="Profile"
                    fill
                    sizes="96px"
                    className="object-cover object-top"
                  />
                </div>
                <h2 className="font-display text-3xl font-black leading-tight text-slate-900 md:text-6xl tracking-tight">
                  Let&apos;s build a website or app that works for your business.
                </h2>
              </div>
              
              <div className="relative z-10 flex w-full flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 sm:pt-4">
                <motion.a
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                  whileHover={{ scale: 1.08, rotate: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=xandercharles08@gmail.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-slate-800 sm:w-auto sm:px-6"
                >
                  <SiGmail size={16} />
                  xandercharles08@gmail.com
                </motion.a>
                <motion.a
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  whileHover={{ scale: 1.08, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  href="tel:+639391985981"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 sm:w-auto sm:px-6"
                >
                  <FaPhoneAlt size={14} className="text-slate-500" />
                  09391985981
                </motion.a>
                <motion.a
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
                  whileHover={{ scale: 1.08, rotate: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://www.facebook.com/CharlesXander.08/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1877F2] px-5 py-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#166FE5] sm:w-auto sm:px-6"
                >
                  <FaFacebook size={18} />
                  Charles Xander I. Panis
                </motion.a>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>
    </LayoutGroup>
  );
}
