export type SpotId = "projects" | "skills" | "about" | "experience" | "contact";

type Vec3 = [number, number, number];

export type Spot = {
  id: SpotId;
  /** One word, shown on the tag and the dock. */
  label: string;
  title: string;
  tone: string;
  /** Where the floating tag sits in the room. */
  tag: Vec3;
  /** Camera position and look-at target when this spot is open. */
  camera: Vec3;
  look: Vec3;
};

export const spots: Spot[] = [
  { id: "projects", label: "Work", title: "Work", tone: "#4f8df5", tag: [1.1, 2.85, -3.5], camera: [1.1, 1.94, -1.2], look: [1.1, 1.9, -3.46] },
  { id: "skills", label: "Skills", title: "Skills", tone: "#3fae8c", tag: [-4.5, 3.9, -0.8], camera: [1, 2, -0.8], look: [-4.6, 1.8, -0.8] },
  { id: "about", label: "About", title: "About", tone: "#e2936b", tag: [-2.9, 3.62, -3.9], camera: [-2.9, 2.6, -0.3], look: [-2.9, 2.6, -4] },
  { id: "experience", label: "Path", title: "Path", tone: "#d9a521", tag: [-4.9, 3.6, 2.7], camera: [-0.9, 2.5, 2.7], look: [-5, 2.5, 2.7] },
  { id: "contact", label: "Contact", title: "Say hello", tone: "#e0607e", tag: [-1.3, 2.45, 3.9], camera: [1.4, 2.3, 7.2], look: [-1.7, 1.2, 3.8] },
];

export const overview = {
  look: [0, 2.3, -0.5] as Vec3,
  /** Direction from the look-at point towards the camera. */
  offset: [6.2, 3.9, 8] as Vec3,
};
