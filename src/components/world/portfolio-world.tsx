"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Compass, Play, X } from "lucide-react";
import { profile } from "@/data/profile";
import { input, resetInput } from "./input";
import { PanelBody, panelTitle } from "./panels";
import { SPAWN } from "./scenery";
import { zoneById, zones, type ZoneKind } from "./zones";
import type { WorldMode } from "./world-scene";
import "@/app/world.css";

const WorldScene = dynamic(() => import("./world-scene"), { ssr: false });

const LITE_QUERY = "(max-width: 900px), (pointer: coarse)";
const subscribeLite = (notify: () => void) => {
  const query = window.matchMedia(LITE_QUERY);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

const menu: { label: string; kind: ZoneKind }[] = [
  { label: "Projects", kind: "project" },
  { label: "About", kind: "about" },
  { label: "Skills", kind: "skills" },
  { label: "Experience", kind: "experience" },
  { label: "Contact", kind: "contact" },
];

const KEYS: Record<string, [number, number]> = {
  w: [0, -1],
  arrowup: [0, -1],
  s: [0, 1],
  arrowdown: [0, 1],
  a: [-1, 0],
  arrowleft: [-1, 0],
  d: [1, 0],
  arrowright: [1, 0],
};

function Joystick() {
  const knob = useRef<HTMLSpanElement>(null);
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const box = event.currentTarget.getBoundingClientRect();
    const reach = box.width / 2 - 18;
    let dx = event.clientX - (box.left + box.width / 2);
    let dy = event.clientY - (box.top + box.height / 2);
    const length = Math.hypot(dx, dy);
    if (length > reach) {
      dx *= reach / length;
      dy *= reach / length;
    }
    input.x = dx / reach;
    input.z = dy / reach;
    if (knob.current) knob.current.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const release = () => {
    input.x = 0;
    input.z = 0;
    if (knob.current) knob.current.style.transform = "";
  };
  return (
    <div
      className="vo-stick"
      aria-hidden="true"
      onPointerDown={event => {
        event.currentTarget.setPointerCapture(event.pointerId);
        move(event);
      }}
      onPointerMove={move}
      onPointerUp={release}
      onPointerCancel={release}
    >
      <span ref={knob} />
    </div>
  );
}

export function PortfolioWorld() {
  const reduced = useReducedMotion() ?? false;
  const lite = useSyncExternalStore(
    subscribeLite,
    () => window.matchMedia(LITE_QUERY).matches,
    () => false,
  );
  const [mode, setMode] = useState<WorldMode>("intro");
  const [active, setActive] = useState<string | null>(null);
  const [near, setNear] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [visited, setVisited] = useState<string[]>([]);
  const panel = useRef<HTMLElement>(null);
  const pressed = useRef(new Set<string>());

  const handleReady = useCallback(() => setReady(true), []);
  const zone = zoneById(active);
  const nearZone = zoneById(near);
  const activeIndex = zone ? zones.indexOf(zone) : -1;

  const open = (id: string) => {
    const target = zoneById(id);
    if (!target) return;
    input.target = { x: target.spotX, z: target.spotZ, fast: true };
    setMode("explore");
    setActive(id);
    setVisited(list => (list.includes(id) ? list : [...list, id]));
  };
  const close = () => setActive(null);
  const start = () => setMode("explore");
  const home = () => {
    setActive(null);
    setMode("explore");
    input.target = { x: SPAWN.x, z: SPAWN.z, fast: true };
  };
  const step = (direction: 1 | -1) => open(zones[(activeIndex + direction + zones.length) % zones.length].id);

  const onKey = useEffectEvent((event: KeyboardEvent, down: boolean) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (KEYS[key]) {
      if (down) pressed.current.add(key);
      else pressed.current.delete(key);
      let x = 0;
      let z = 0;
      pressed.current.forEach(name => {
        x += KEYS[name][0];
        z += KEYS[name][1];
      });
      input.x = Math.sign(x);
      input.z = Math.sign(z);
      if (mode === "explore" && !active && key.startsWith("arrow")) event.preventDefault();
      return;
    }
    if (!down) return;
    if (key === "escape") close();
    else if (mode === "intro" && key === "enter") start();
    else if (mode === "explore" && !active) {
      if ((key === "e" || key === "enter") && near) open(near);
      else if (key === " ") {
        input.jump = true;
        event.preventDefault();
      }
    }
  });

  useEffect(() => {
    const down = (event: KeyboardEvent) => onKey(event, true);
    const up = (event: KeyboardEvent) => onKey(event, false);
    const blur = () => {
      pressed.current.clear();
      input.x = 0;
      input.z = 0;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      resetInput();
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    panel.current?.focus();
    panel.current?.scrollTo({ top: 0 });
  }, [active]);

  const rootClass = ["vo-root", ready && "is-ready", active && "is-focused", `is-${mode}`].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <h1 className="vo-sr">
        {profile.name} — {profile.role}. Explorable 3D portfolio world.
      </h1>

      <div className="vo-canvas" aria-hidden="true">
        <WorldScene mode={mode} active={active} near={near} reduced={reduced} lite={lite} onSelect={open} onNear={setNear} onReady={handleReady} />
      </div>

      <div className="vo-tags" aria-hidden="true">
        {zones.map(item => (
          <button
            key={item.id}
            id={`vo-tag-${item.id}`}
            type="button"
            className={`vo-tag${visited.includes(item.id) ? " is-seen" : ""}${near === item.id ? " is-hot" : ""}`}
            style={{ "--tone": item.tone } as CSSProperties}
            tabIndex={-1}
            onClick={() => open(item.id)}
          >
            <i />
            {item.label}
          </button>
        ))}
      </div>

      <div className="vo-loader" aria-hidden={ready}>
        <span className="vo-wordmark">
          charles<b>.</b>
        </span>
        <span className="vo-loader-bar" />
        <span>Building the island…</span>
      </div>

      <header className="vo-hud">
        <button type="button" className="vo-brand" onClick={home} aria-label="Return to the start of the island">
          <span className="vo-wordmark">
            charles<b>.</b>
          </span>
          <small>
            {visited.length} of {zones.length} places discovered
          </small>
        </button>
        <nav className="vo-nav" aria-label="Fast travel">
          {menu.map(item => {
            const target = zones.find(entry => entry.kind === item.kind);
            if (!target) return null;
            const current = zone?.kind === item.kind;
            return (
              <button key={item.kind} type="button" className={current ? "is-current" : ""} aria-pressed={current} onClick={() => open(target.id)}>
                {item.label}
              </button>
            );
          })}
          <Link href="/classic" className="vo-classic">
            Classic view
          </Link>
        </nav>
      </header>

      {/* Welcome card */}
      <div className="vo-welcome" aria-hidden={mode !== "intro"}>
        <span className="vo-available">
          <i /> Open to opportunities
        </span>
        <p className="vo-name">
          Charles Xander <em>Panis.</em>
        </p>
        <p className="vo-intro-copy">
          {profile.role}. {profile.intro} This island is my portfolio — walk around it, or jump straight to what you need.
        </p>
        <div className="vo-actions">
          <button type="button" className="vo-button" onClick={start} tabIndex={mode === "intro" ? 0 : -1}>
            <Play size={16} /> Start exploring
          </button>
          <button type="button" className="vo-ghost" onClick={() => open(zones[0].id)} tabIndex={mode === "intro" ? 0 : -1}>
            <Compass size={16} /> Take the quick tour
          </button>
        </div>
      </div>

      {/* Bottom bar: prompt or controls */}
      <div className="vo-dock">
        {nearZone && !active ? (
          <button type="button" className="vo-prompt" style={{ "--tone": nearZone.tone } as CSSProperties} onClick={() => open(nearZone.id)}>
            <kbd>E</kbd> Open {nearZone.label}
          </button>
        ) : (
          <p className="vo-help">
            <span className="vo-help-keys">
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd> move · click the ground to walk · <kbd>Space</kbd> jump
            </span>
            <span className="vo-help-touch">Drag the stick to move · tap a sign to open it</span>
          </p>
        )}
      </div>
      <Joystick />

      <AnimatePresence>
        {zone && (
          <motion.aside
            key="panel"
            ref={panel}
            className="vo-panel"
            style={{ "--tone": zone.tone } as CSSProperties}
            tabIndex={-1}
            aria-label={panelTitle(zone)}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: 60 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="vo-panel-top">
              <span className="vo-kicker">
                {String(activeIndex + 1).padStart(2, "0")} / {zone.kicker}
              </span>
              <button type="button" className="vo-icon" onClick={close} aria-label="Close and keep exploring">
                <X size={18} />
              </button>
            </div>
            <h2>{panelTitle(zone)}</h2>
            <div className="vo-panel-body" key={zone.id}>
              <PanelBody zone={zone} />
            </div>
            <div className="vo-panel-foot">
              <button type="button" onClick={() => step(-1)}>
                <ArrowLeft size={15} /> Previous
              </button>
              <button type="button" onClick={close}>
                Keep exploring
              </button>
              <button type="button" onClick={() => step(1)}>
                Next <ArrowRight size={15} />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
