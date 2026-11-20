import { ISLAND_RADIUS, PATH_RADIUS, zones } from "./zones";

/** Deterministic pseudo-random number in [0, 1) so the island is identical on every visit. */
export function rand(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export type Prop = {
  key: string;
  type: "tree" | "blossom" | "bush" | "rock" | "flowers";
  x: number;
  z: number;
  scale: number;
  spin: number;
  variant: number;
};

export type Obstacle = { x: number; z: number; r: number };

/** Sign with the name, south of the plaza. */
export const SIGN = { x: 0, z: 8.6 };
export const SPAWN = { x: 0, z: 11.6 };

function distanceToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax;
  const dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}

function build() {
  const props: Prop[] = [];
  const obstacles: Obstacle[] = [];

  for (let i = 0; i < 420; i += 1) {
    const radius = 7 + rand(i * 1.71 + 3) * (ISLAND_RADIUS - 9);
    const angle = rand(i * 3.13 + 1) * Math.PI * 2;
    const x = Math.sin(angle) * radius;
    const z = -Math.cos(angle) * radius;

    if (Math.abs(radius - PATH_RADIUS) < 2.7) continue;
    if (Math.hypot(x - SIGN.x, z - SIGN.z) < 7.5) continue;
    if (Math.abs(x) < 2 && z > 0 && z < 16) continue;
    if (zones.some(zone => Math.hypot(x - zone.x, z - zone.z) < 6.2)) continue;
    if (zones.some(zone => distanceToSegment(x, z, 0, 0, zone.x, zone.z) < 2.3)) continue;
    if (props.some(prop => Math.hypot(x - prop.x, z - prop.z) < 1.9)) continue;

    const roll = rand(i * 7.7 + 2);
    const type: Prop["type"] = roll < 0.34 ? "tree" : roll < 0.44 ? "blossom" : roll < 0.64 ? "bush" : roll < 0.74 ? "rock" : "flowers";
    const scale = 0.8 + rand(i * 5.3) * 0.65;
    props.push({ key: `p${i}`, type, x, z, scale, spin: rand(i * 9.1) * Math.PI * 2, variant: Math.floor(rand(i * 2.9) * 3) });
    if (type === "tree" || type === "blossom") obstacles.push({ x, z, r: 0.55 * scale });
    if (type === "rock") obstacles.push({ x, z, r: 0.75 * scale });
  }

  for (const zone of zones) obstacles.push({ x: zone.x, z: zone.z, r: 3.3 });
  for (let offset = -5; offset <= 5; offset += 2) obstacles.push({ x: SIGN.x + offset, z: SIGN.z, r: 1.1 });

  return { props, obstacles };
}

export const scenery = build();
