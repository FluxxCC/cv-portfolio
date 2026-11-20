import { projects } from "@/data/projects";

export type ZoneKind = "project" | "about" | "skills" | "experience" | "contact";

export type Zone = {
  id: string;
  kind: ZoneKind;
  label: string;
  kicker: string;
  /** Accent colour for the landmark, its marker and its card. */
  tone: string;
  /** Landmark position on the island (x, z). */
  x: number;
  z: number;
  /** Where the visitor stands to view it. */
  spotX: number;
  spotZ: number;
  /** Rotation that turns the landmark to face the plaza. */
  facing: number;
  projectId?: string;
};

export const ISLAND_RADIUS = 27;
const LANDMARK_RADIUS = 18.5;
export const PATH_RADIUS = 13.5;

export const TONES: Record<string, string> = {
  blue: "#4f9dff",
  navy: "#6c8cff",
  violet: "#a078ff",
  green: "#3fc98a",
  peach: "#ff9d6c",
};

function place(degrees: number) {
  const angle = (degrees * Math.PI) / 180;
  const x = Math.sin(angle);
  const z = -Math.cos(angle);
  return {
    x: x * LANDMARK_RADIUS,
    z: z * LANDMARK_RADIUS,
    spotX: x * PATH_RADIUS,
    spotZ: z * PATH_RADIUS,
    facing: Math.atan2(-x, -z),
  };
}

/** Spread the project pavilions evenly across the north arc. */
const projectAngle = (index: number) => (projects.length < 2 ? 0 : -65 + (130 * index) / (projects.length - 1));

export const zones: Zone[] = [
  ...projects.map((project, index) => ({
    id: `project-${project.id}`,
    kind: "project" as const,
    label: project.name,
    kicker: project.category,
    tone: project.color,
    projectId: project.id,
    ...place(projectAngle(index)),
  })),
  { id: "skills", kind: "skills", label: "Skills", kicker: "The crystal garden", tone: "#22c3e6", ...place(108) },
  { id: "contact", kind: "contact", label: "Contact", kicker: "The balloon dock", tone: "#ff6f91", ...place(152) },
  { id: "experience", kind: "experience", label: "Experience", kicker: "The graduate gate", tone: "#f5b83d", ...place(208) },
  { id: "about", kind: "about", label: "About me", kicker: "The portrait court", tone: "#2fc4a8", ...place(252) },
];

export const zoneById = (id: string | null) => zones.find(zone => zone.id === id) ?? null;
