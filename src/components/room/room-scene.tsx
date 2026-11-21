"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { BakeShadows, Center, Environment, Float, Html, Instance, Instances, Lightformer, PerformanceMonitor, RoundedBox, Text3D, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { projects } from "@/data/projects";
import { overview, spots, type SpotId } from "./spots";

type SceneProps = {
  active: SpotId | null;
  /** Index of the project shown on the monitor. */
  project: number;
  reduced: boolean;
  /** Phones and tablets: lighter shadows and a slower window repaint. */
  lite: boolean;
  /** Cheaper lighting: a plain sky light stands in for the reflected environment. */
  eco: boolean;
  /** Whether the monitor may run live pages (off on phones and tablets). */
  canBrowse: boolean;
  onProject: (index: number) => void;
  onSelect: (id: SpotId) => void;
  /** Clicking empty space steps back to the whole room. */
  onClose: () => void;
  onReady: () => void;
};

const OAK = "#d8b488";
const OAK_DARK = "#b98d5f";
const WHITE = "#f3efe8";
const WALL = "#e9e2d6";
const SAGE = "#8fb9a8";
const INK = "#2b3140";
const UI_FONT = "Inter, 'Segoe UI', system-ui, sans-serif";

/** Deterministic pseudo-random number in [0, 1) so renders stay pure. */
function rand(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

/* ---------- textures ---------- */

function makeTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void, animated = false) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  if (animated) {
    // Repainted many times a second: skip rebuilding the mipmap chain on every upload.
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.anisotropy = 1;
  }
  return texture;
}

function drawScreen(ctx: CanvasRenderingContext2D, index: number) {
  const project = projects[index];
  const tone = project.color;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.fillStyle = "#fbfaf7";
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.85, h * 0.15, 0, w * 0.85, h * 0.15, w * 0.7);
  glow.addColorStop(0, `${tone}55`);
  glow.addColorStop(1, `${tone}00`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Window chrome
  ["#f0766f", "#f2c14e", "#62c779"].forEach((color, dot) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(44 + dot * 30, 44, 9, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = tone;
  ctx.font = `700 24px ${UI_FONT}`;
  ctx.fillText(`0${index + 1} / 0${projects.length}`, 64, 150);
  ctx.fillStyle = "#1c2230";
  ctx.font = `800 120px ${UI_FONT}`;
  ctx.fillText(project.name, 58, 290);
  ctx.fillStyle = "#6a7386";
  ctx.font = `500 38px ${UI_FONT}`;
  ctx.fillText(project.status ?? project.summary, 64, 362);

  // Abstract chart so the screen reads as a product without more words.
  for (let bar = 0; bar < 9; bar += 1) {
    const height = 40 + rand(index * 13 + bar) * 120;
    ctx.fillStyle = bar % 3 === 0 ? tone : `${tone}44`;
    ctx.beginPath();
    ctx.roundRect(64 + bar * 58, 540 - height, 38, height, 10);
    ctx.fill();
  }
}

function drawDiploma(ctx: CanvasRenderingContext2D) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.fillStyle = "#fdfaf2";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#d9b25a";
  ctx.lineWidth = 6;
  ctx.strokeRect(28, 28, w - 56, h - 56);
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, w - 84, h - 84);
  ctx.textAlign = "center";
  ctx.fillStyle = "#a07a2c";
  ctx.font = `600 22px ${UI_FONT}`;
  ctx.fillText("NUEVA VIZCAYA STATE UNIVERSITY", w / 2, 120);
  ctx.fillStyle = "#1f2a3a";
  ctx.font = "700 44px Georgia, serif";
  ctx.fillText("Bachelor of Science", w / 2, 210);
  ctx.fillText("in Information Technology", w / 2, 268);
  ctx.fillStyle = "#d9b25a";
  ctx.beginPath();
  ctx.arc(w / 2, 370, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fdfaf2";
  ctx.beginPath();
  ctx.arc(w / 2, 370, 22, 0, Math.PI * 2);
  ctx.fill();
}

const TAU = Math.PI * 2;
/** 0 → 1 → 0 as `p` goes 0 → 1 → 2, forever. */
const pingPong = (p: number) => 1 - Math.abs((p % 2) - 1);

function drawKid(ctx: CanvasRenderingContext2D, x: number, feet: number, shirt: string, stride: number, facing = 1, size = 1) {
  ctx.save();
  ctx.translate(x, feet);
  ctx.scale(facing * size, size);
  const step = Math.sin(stride) * 5;
  ctx.lineCap = "round";
  ctx.lineWidth = 3.2;
  ctx.strokeStyle = "#4f5d7a";
  ctx.beginPath();
  ctx.moveTo(-1.5, -11);
  ctx.lineTo(-1.5 - step, 0);
  ctx.moveTo(1.5, -11);
  ctx.lineTo(1.5 + step, 0);
  ctx.stroke();
  ctx.strokeStyle = shirt;
  ctx.beginPath();
  ctx.moveTo(-4, -21);
  ctx.lineTo(-8 + step * 0.7, -13);
  ctx.moveTo(4, -21);
  ctx.lineTo(8 - step * 0.7, -13);
  ctx.stroke();
  ctx.fillStyle = shirt;
  ctx.fillRect(-5, -24, 10, 14);
  ctx.fillStyle = "#f3cba5";
  ctx.beginPath();
  ctx.arc(0, -29.5, 5.6, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#4a3528";
  ctx.beginPath();
  ctx.arc(0, -30.5, 5.8, Math.PI, TAU);
  ctx.fill();
  ctx.restore();
}

function drawVehicle(ctx: CanvasRenderingContext2D, x: number, road: number, color: string, facing: number, bus = false) {
  const length = bus ? 98 : 62;
  const half = length / 2;
  const top = bus ? -36 : -25;
  ctx.save();
  ctx.translate(x, road);
  ctx.scale(facing, 1);
  ctx.fillStyle = color;
  if (bus) {
    ctx.fillRect(-half, top, length, 30);
    ctx.fillStyle = "#2f9c95";
    ctx.fillRect(-half, -16, length, 4);
  } else {
    ctx.fillRect(-half, -17, length, 12);
    ctx.beginPath();
    ctx.moveTo(-half + 10, -17);
    ctx.lineTo(-half + 18, top);
    ctx.lineTo(half - 20, top);
    ctx.lineTo(half - 8, -17);
    ctx.fill();
  }
  ctx.fillStyle = "#d9efff";
  if (bus) for (let pane = 0; pane < 5; pane += 1) ctx.fillRect(-half + 6 + pane * 18, top + 5, 13, 10);
  else {
    ctx.fillRect(-half + 20, top + 3, 9, 6);
    ctx.fillRect(-half + 31, top + 3, 9, 6);
  }
  ctx.fillStyle = "#ffe08a";
  ctx.fillRect(half - 3, -14, 3, 4);
  ctx.fillStyle = "#2f3542";
  [-half + 14, half - 14].forEach(wheel => {
    ctx.beginPath();
    ctx.arc(wheel, -5, 6, 0, TAU);
    ctx.fill();
  });
  ctx.restore();
}

/** Everything that moves outside the window: birds, a small park, and the street. */
function drawStreetLife(ctx: CanvasRenderingContext2D, t: number) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  // Birds
  ctx.strokeStyle = "#55627a";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  for (let bird = 0; bird < 3; bird += 1) {
    const x = ((t * 22 + bird * 150) % (w + 80)) - 40;
    const y = 64 + bird * 24 + Math.sin(t * 1.3 + bird) * 6;
    const flap = Math.sin(t * 9 + bird * 2) * 5;
    ctx.beginPath();
    ctx.moveTo(x - 9, y - flap);
    ctx.quadraticCurveTo(x - 4, y - 3, x, y);
    ctx.quadraticCurveTo(x + 4, y - 3, x + 9, y - flap);
    ctx.stroke();
  }

  // Trees, leaning a little in the breeze
  [
    [92, 1],
    [468, 0.8],
  ].forEach(([x, size]) => {
    const lean = Math.sin(t * 0.8 + x) * 2.5;
    ctx.fillStyle = "#9a6b4b";
    ctx.fillRect(x - 4 * size, 360 - 46 * size, 8 * size, 46 * size);
    ctx.fillStyle = "#6fb07a";
    [
      [0, -62, 30],
      [-20, -50, 20],
      [20, -50, 20],
    ].forEach(([dx, dy, radius]) => {
      ctx.beginPath();
      ctx.arc(x + dx * size + lean, 360 + dy * size, radius * size, 0, TAU);
      ctx.fill();
    });
  });

  // Swing set
  ctx.strokeStyle = "#c2855a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(158, 362);
  ctx.lineTo(174, 298);
  ctx.lineTo(206, 298);
  ctx.lineTo(222, 362);
  ctx.stroke();
  const swing = Math.sin(t * 2.4) * 0.55;
  const seatX = 190 + Math.sin(swing) * 44;
  const seatY = 298 + Math.cos(swing) * 44;
  ctx.strokeStyle = "#8a8f9c";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(190, 298);
  ctx.lineTo(seatX, seatY);
  ctx.stroke();
  ctx.save();
  ctx.translate(seatX, seatY);
  ctx.rotate(-swing);
  drawKid(ctx, 0, 12, "#f2a03d", swing * 1.6, 1, 0.85);
  ctx.restore();

  // Two kids passing a ball
  const pass = pingPong(t / 1.3);
  drawKid(ctx, 276, 376 - Math.max(0, 1 - pass * 5) * 4, "#e8674f", 0, 1);
  drawKid(ctx, 354, 376 - Math.max(0, 1 - (1 - pass) * 5) * 4, "#5b8def", 0, -1);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#e8674f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(288 + pass * 54, 370 - Math.sin(pass * Math.PI) * 30, 5, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // A kid running back and forth with a kite
  const lap = t / 9;
  const heading = Math.floor(lap) % 2 === 0 ? 1 : -1;
  const runner = 60 + pingPong(lap) * 390;
  const kiteX = runner - heading * 46;
  const kiteY = 292 + Math.sin(t * 1.7) * 8;
  ctx.strokeStyle = "#ffffffcc";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(runner + heading * 7, 368);
  ctx.quadraticCurveTo(runner - heading * 10, 330, kiteX, kiteY + 9);
  ctx.stroke();
  ctx.fillStyle = "#f25f8a";
  ctx.beginPath();
  ctx.moveTo(kiteX, kiteY - 12);
  ctx.lineTo(kiteX + 9, kiteY);
  ctx.lineTo(kiteX, kiteY + 12);
  ctx.lineTo(kiteX - 9, kiteY);
  ctx.fill();
  drawKid(ctx, runner, 383, "#8b5cf6", t * 11, heading);

  // Pavement and road
  ctx.fillStyle = "#ece5d6";
  ctx.fillRect(0, 384, w, 7);
  ctx.fillStyle = "#8d93a1";
  ctx.fillRect(0, 391, w, h - 391);
  ctx.fillStyle = "#f4f1e8";
  for (let dash = 0; dash < w; dash += 52) ctx.fillRect(dash + 8, 415, 26, 3);

  // Traffic: far lane heads right, near lane heads left
  const span = w + 240;
  drawVehicle(ctx, ((t * 46) % span) - 120, 412, "#e8674f", 1);
  drawVehicle(ctx, ((t * 46 + 300) % span) - 120, 412, "#f2c14e", 1);
  drawVehicle(ctx, w + 120 - ((t * 58 + 100) % span), 437, "#fbfaf7", -1, true);
  drawVehicle(ctx, w + 120 - ((t * 58 + 440) % span), 437, "#5b8def", -1);
}

function drawSky(ctx: CanvasRenderingContext2D, t = 0) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#8fc7ff");
  sky.addColorStop(0.75, "#e3f3ff");
  sky.addColorStop(1, "#fff6e6");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  const sun = ctx.createRadialGradient(w * 0.74, h * 0.26, 0, w * 0.74, h * 0.26, 150);
  sun.addColorStop(0, "#ffffff");
  sun.addColorStop(0.25, "#fff6d6");
  sun.addColorStop(1, "#fff6d600");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#ffffffd9";
  [
    [110, 120, 46],
    [160, 104, 58],
    [220, 124, 44],
    [330, 250, 34],
    [372, 238, 44],
    [420, 254, 32],
  ].forEach(([x, y, radius]) => {
    ctx.beginPath();
    // Clouds drift across and come back round.
    ctx.ellipse(((x + 90 + t * 5) % (w + 180)) - 90, y, radius * 1.3, radius * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  // Soft hills
  ctx.fillStyle = "#b7d9b1";
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.bezierCurveTo(w * 0.2, h * 0.68, w * 0.4, h * 0.74, w * 0.55, h * 0.82);
  ctx.bezierCurveTo(w * 0.7, h * 0.7, w * 0.9, h * 0.72, w, h * 0.8);
  ctx.lineTo(w, h);
  ctx.fill();
  ctx.fillStyle = "#9cc99a";
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.8);
  ctx.bezierCurveTo(w * 0.3, h * 0.77, w * 0.6, h * 0.82, w, h * 0.79);
  ctx.lineTo(w, h);
  ctx.fill();
  drawStreetLife(ctx, t);
}

/* ---------- camera ---------- */

const tmpPosition = new THREE.Vector3();
const tmpLook = new THREE.Vector3();
const tmpTag = new THREE.Vector3();
const tagCache: Record<string, string> = {};
const tagElements: Record<string, HTMLElement | null> = {};

const tmpCamera = new THREE.Vector3();
const tmpAhead = new THREE.Vector3();
const tmpRight = new THREE.Vector3();
const tmpUp = new THREE.Vector3();
const tmpPan = new THREE.Vector3();
const tmpAim = new THREE.Vector3();
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const MOVE_SECONDS = 1.5;
/** Side-by-side layout (card on the right). Must match the media query in room.css. */
const isWide = (width: number, height: number) => width > 900 || (width >= 640 && width > height);
/** Width the open card takes up on the right, in pixels. Matches the card width in room.css. */
const cardSpace = (width: number) => Math.min(380, width * 0.42) + 60;
/** Slow start, slow stop: no sudden jump when the camera sets off. */
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function CameraRig({ active, reduced }: { active: SpotId | null; reduced: boolean }) {
  const rig = useRef({
    key: "start" as string,
    progress: 1,
    fromPosition: new THREE.Vector3(14, 11, 18),
    fromLook: new THREE.Vector3(...overview.look),
    position: new THREE.Vector3(14, 11, 18),
    look: new THREE.Vector3(...overview.look),
    sway: new THREE.Vector2(),
    shiftX: 0,
    shiftY: 0,
  });

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const camera = state.camera as THREE.PerspectiveCamera;
    const { width, height } = state.size;
    const aspect = width / Math.max(height, 1);
    const wide = isWide(width, height);
    const CARD_SPACE = cardSpace(width);
    const spot = active ? spots.find(item => item.id === active) : null;
    const r = rig.current;

    // Where the camera should end up.
    if (spot) {
      // Step back on narrower screens so the object still fits beside the card.
      const pull = wide ? Math.max(1, 1.9 / aspect) : 1.6;
      tmpLook.set(...spot.look);
      tmpPosition.set(...spot.camera).sub(tmpLook).multiplyScalar(pull).add(tmpLook);
      if (spot.id === "projects" && wide) {
        // Far enough that the 1.92-wide monitor fits the room left over beside the card.
        const free = Math.max(0.35, (width - CARD_SPACE - 40) / width);
        const depth = Math.max(2.25, 1.92 / (0.63 * aspect * free * 0.94), 1.3 / 0.63);
        tmpPosition.set(tmpLook.x, tmpLook.y + 0.04, tmpLook.z + depth);
      }
    } else {
      const distance = Math.max(1.2, (wide ? 2.45 : 2.1) / aspect);
      tmpLook.set(...overview.look);
      tmpPosition.set(...overview.offset).multiplyScalar(distance).add(tmpLook);
    }

    // A new destination starts a fresh move from wherever the camera is now.
    const key = spot ? spot.id : "overview";
    if (key !== r.key) {
      r.key = key;
      r.progress = 0;
      r.fromPosition.copy(r.position);
      r.fromLook.copy(r.look);
    }
    r.progress = reduced ? 1 : Math.min(1, r.progress + delta / MOVE_SECONDS);
    const eased = easeInOut(r.progress);
    r.position.lerpVectors(r.fromPosition, tmpPosition, eased);
    r.look.lerpVectors(r.fromLook, tmpLook, eased);

    // Gentle drift with the pointer, eased separately so it never fights the move.
    const reach = spot ? 0.14 : 1;
    const follow = reduced ? 1 : 1 - Math.exp(-delta * 2.5);
    r.sway.x += ((reduced ? 0 : state.pointer.x) * reach - r.sway.x) * follow;
    r.sway.y += ((reduced ? 0 : state.pointer.y) * reach - r.sway.y) * follow;
    tmpCamera.copy(r.position);
    tmpCamera.x += r.sway.x * 1.1;
    tmpCamera.y += r.sway.y * 0.5;
    tmpCamera.z -= r.sway.x * 0.6;

    // Step sideways (or down, on phones) so the object sits clear of the open card.
    // A plain sidestep keeps the page inside the monitor lined up with its glass.
    const settle = reduced ? 1 : 1 - Math.exp(-delta * 3);
    r.shiftX += ((spot && wide ? CARD_SPACE / 2 : 0) - r.shiftX) * settle;
    r.shiftY += ((spot && !wide ? height * 0.2 : 0) - r.shiftY) * settle;
    tmpAhead.copy(r.look).sub(r.position);
    const reachTo = tmpAhead.length();
    const unitsPerPixel = (2 * reachTo * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)) / Math.max(height, 1);
    tmpAhead.normalize();
    tmpRight.crossVectors(tmpAhead, WORLD_UP).normalize();
    tmpUp.crossVectors(tmpRight, tmpAhead);
    tmpPan.copy(tmpRight).multiplyScalar(r.shiftX * unitsPerPixel).addScaledVector(tmpUp, -r.shiftY * unitsPerPixel);
    camera.position.copy(tmpCamera).add(tmpPan);
    tmpAim.copy(r.look).add(tmpPan);
    camera.lookAt(tmpAim);
    camera.updateMatrixWorld();

    // Pin the DOM tags (rendered outside the canvas) to their objects.
    for (const item of spots) {
      let element = tagElements[item.id];
      if (!element?.isConnected) {
        element = tagElements[item.id] = document.getElementById(`ro-tag-${item.id}`);
        delete tagCache[item.id];
      }
      if (!element) continue;
      tmpTag.set(...item.tag).project(camera);
      const x = (tmpTag.x * 0.5 + 0.5) * width;
      const y = (-tmpTag.y * 0.5 + 0.5) * height;
      const next = tmpTag.z < 1 ? `translate3d(calc(${x.toFixed(1)}px - 50%), calc(${y.toFixed(1)}px - 50%), 0)` : "";
      if (tagCache[item.id] === next) continue;
      tagCache[item.id] = next;
      element.style.transform = next;
      element.style.visibility = next ? "visible" : "hidden";
    }
  });

  return null;
}

/* ---------- static batching ---------- */

/** Put on a group that moves on its own, so StaticBatch leaves it alone. */
const LIVE = { live: true };
const tmpMatrix = new THREE.Matrix4();

type Bucket = { basic: boolean; roughness: number; cast: boolean; receive: boolean; parts: THREE.BufferGeometry[] };

/**
 * Each separate mesh is one draw call, and on modest laptops and phones the room is
 * limited by draw calls, not pixels. This welds every plain, unmoving mesh inside it
 * into a few meshes (one per surface finish, colours stored per vertex) and hides the
 * originals. The originals stay in the scene, so pointer picking still works on them.
 */
function StaticBatch({ children }: { children: ReactNode }) {
  const source = useRef<THREE.Group>(null);
  const target = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const root = source.current;
    const out = target.current;
    if (!root || !out) return;
    root.updateWorldMatrix(true, true);
    const toLocal = root.matrixWorld.clone().invert();
    const buckets = new Map<string, Bucket>();
    const hidden: THREE.Mesh[] = [];

    const visit = (object: THREE.Object3D) => {
      if (object.userData.live || !object.visible) return;
      const mesh = object as THREE.Mesh;
      const material = mesh.material as THREE.MeshStandardMaterial & THREE.MeshBasicMaterial;
      const standard = Boolean(material?.isMeshStandardMaterial);
      const plain =
        mesh.isMesh &&
        !(mesh as THREE.InstancedMesh).isInstancedMesh &&
        !Array.isArray(mesh.material) &&
        (standard || material.isMeshBasicMaterial) &&
        !material.map &&
        !material.transparent &&
        material.toneMapped &&
        material.side === THREE.FrontSide &&
        (!standard || (material.metalness === 0 && material.emissive.getHex() === 0)) &&
        Boolean(mesh.geometry.attributes.normal);
      if (plain) {
        const part = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
        for (const name of Object.keys(part.attributes)) if (name !== "position" && name !== "normal") part.deleteAttribute(name);
        part.applyMatrix4(tmpMatrix.multiplyMatrices(toLocal, mesh.matrixWorld));
        const count = part.attributes.position.count;
        const colors = new Float32Array(count * 3);
        for (let index = 0; index < count; index += 1) material.color.toArray(colors, index * 3);
        part.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        // Finishes are grouped in quarter steps; the difference is not visible on these matte surfaces.
        const roughness = standard ? Math.max(0.25, Math.round(material.roughness * 4) / 4) : 1;
        const key = `${standard}|${roughness}|${mesh.castShadow}|${mesh.receiveShadow}`;
        let bucket = buckets.get(key);
        if (!bucket) buckets.set(key, (bucket = { basic: !standard, roughness, cast: mesh.castShadow, receive: mesh.receiveShadow, parts: [] }));
        bucket.parts.push(part);
        hidden.push(mesh);
      }
      object.children.forEach(visit);
    };
    visit(root);

    const made: THREE.Mesh[] = [];
    for (const bucket of buckets.values()) {
      const geometry = mergeGeometries(bucket.parts, false);
      bucket.parts.forEach(part => part.dispose());
      if (!geometry) continue;
      const material = bucket.basic ? new THREE.MeshBasicMaterial({ vertexColors: true }) : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: bucket.roughness });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = bucket.cast;
      mesh.receiveShadow = bucket.receive;
      mesh.raycast = () => {};
      out.add(mesh);
      made.push(mesh);
    }
    hidden.forEach(mesh => (mesh.visible = false));

    return () => {
      hidden.forEach(mesh => (mesh.visible = true));
      made.forEach(mesh => {
        out.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
    };
  }, []);

  return (
    <group>
      <group ref={source}>{children}</group>
      <group ref={target} />
    </group>
  );
}

/* ---------- interactive wrapper ---------- */

type HotspotProps = {
  id: SpotId;
  position: [number, number, number];
  rotation?: [number, number, number];
  hovered: SpotId | null;
  active: SpotId | null;
  onHover: (id: SpotId | null) => void;
  onSelect: (id: SpotId) => void;
  children: ReactNode;
};

function Hotspot({ id, position, rotation, hovered, active, onHover, onSelect, children }: HotspotProps) {
  const group = useRef<THREE.Group>(null);
  const lifted = hovered === id && active === null;

  useFrame((_, delta) => {
    if (!group.current) return;
    const next = THREE.MathUtils.damp(group.current.scale.x, lifted ? 1.05 : 1, 10, delta);
    group.current.scale.setScalar(next);
  });

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      onPointerOver={event => {
        event.stopPropagation();
        onHover(id);
      }}
      onPointerOut={() => onHover(null)}
      onClick={event => {
        event.stopPropagation();
        onSelect(id);
      }}
    >
      <StaticBatch>{children}</StaticBatch>
    </group>
  );
}

/* ---------- room shell ---------- */

function Shell() {
  return (
    <group>
      <RoundedBox args={[44, 0.5, 44]} radius={0.12} smoothness={4} position={[16.85, -0.25, 17.85]} receiveShadow>
        <meshStandardMaterial color={OAK} roughness={0.7} />
      </RoundedBox>
      {/* Floorboard seams: one instanced draw call for all 48. */}
      <Instances limit={48} frustumCulled={false}>
        <planeGeometry args={[0.018, 44]} />
        <meshBasicMaterial color={OAK_DARK} transparent opacity={0.55} />
        {Array.from({ length: 48 }, (_, index) => (
          <Instance key={index} position={[-4.5 + index * 0.9, 0.004, 17.85]} rotation={[-Math.PI / 2, 0, 0]} />
        ))}
      </Instances>
      <RoundedBox args={[44, 16, 0.3]} radius={0.1} smoothness={4} position={[16.85, 7.75, -4.15]} receiveShadow>
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[0.3, 16, 44]} radius={0.1} smoothness={4} position={[-5.15, 7.75, 17.85]} receiveShadow>
        <meshStandardMaterial color="#e4dccf" roughness={0.95} />
      </RoundedBox>
      {/* Skirting */}
      <mesh position={[17, 0.1, -3.97]}>
        <boxGeometry args={[44, 0.2, 0.06]} />
        <meshStandardMaterial color={WHITE} roughness={0.6} />
      </mesh>
      <mesh position={[-4.97, 0.1, 18]}>
        <boxGeometry args={[0.06, 0.2, 44]} />
        <meshStandardMaterial color={WHITE} roughness={0.6} />
      </mesh>
      {/* Rug */}
      <mesh position={[1.4, 0.012, -1.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.2, 64]} />
        <meshStandardMaterial color="#f1ebe0" roughness={1} />
      </mesh>
      <mesh position={[1.4, 0.016, -1.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[1.72, 1.86, 64]} />
        <meshStandardMaterial color={SAGE} roughness={1} />
      </mesh>
    </group>
  );
}

type PaintProps = { color: string; position: [number, number, number]; side?: boolean; children: React.ReactNode };

/** A patch of paint lying flat on a wall (`side` = the left wall). */
function Paint({ color, position, side, children }: PaintProps) {
  return (
    <mesh position={position} rotation={[0, side ? Math.PI / 2 : 0, 0]} receiveShadow>
      {children}
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

const BACK = -3.99;
const LEFT = -4.99;
const RAIL = 1.3;

/** Board-and-batten panelling along the lower walls. */
function WallDecor() {
  return (
    <group>
      {/* Board-and-batten panelling */}
      <Paint color={WHITE} position={[17, 0.75, BACK]}>
        <planeGeometry args={[44, 1.1]} />
      </Paint>
      <Paint color={WHITE} position={[LEFT, 0.75, 18]} side>
        <planeGeometry args={[44, 1.1]} />
      </Paint>
      <mesh position={[17, RAIL, -3.97]} castShadow>
        <boxGeometry args={[44, 0.07, 0.06]} />
        <meshStandardMaterial color={WHITE} roughness={0.6} />
      </mesh>
      <mesh position={[-4.97, RAIL, 18]} castShadow>
        <boxGeometry args={[0.06, 0.07, 44]} />
        <meshStandardMaterial color={WHITE} roughness={0.6} />
      </mesh>
      <Instances limit={48}>
        <boxGeometry args={[0.06, 1.1, 0.03]} />
        <meshStandardMaterial color={WHITE} roughness={0.6} />
        {Array.from({ length: 24 }, (_, index) => (
          <Instance key={`back-${index}`} position={[-4.55 + index * 0.85, 0.75, -3.983]} />
        ))}
        {Array.from({ length: 24 }, (_, index) => (
          <Instance key={`left-${index}`} position={[-4.983, 0.75, -3.55 + index * 0.85]} rotation={[0, Math.PI / 2, 0]} />
        ))}
      </Instances>
    </group>
  );
}

/** The name, lettered straight onto the back wall like a painted mural. */
function WallName() {
  return (
    <group position={[-1.75, 4.5, -3.975]}>
      <Center>
        <Text3D font="/fonts/helvetiker_bold.typeface.json" size={1} height={0.012} letterSpacing={-0.02} curveSegments={10} receiveShadow>
          Charles
          <meshStandardMaterial color="#d98a62" roughness={1} />
        </Text3D>
      </Center>
      {/* Painted full stop, in the accent green */}
      <mesh position={[2.5, -0.4, 0.008]}>
        <circleGeometry args={[0.12, 40]} />
        <meshStandardMaterial color="#6fa893" roughness={1} />
      </mesh>
    </group>
  );
}

function WindowView({ reduced, lite }: { reduced: boolean; lite: boolean }) {
  const texture = useMemo(() => makeTexture(512, 440, ctx => drawSky(ctx, 4), true), []);
  const glass = useRef<THREE.MeshBasicMaterial>(null);
  const drawn = useRef(0);

  // Repaint the view outside about 30 times a second (20 on phones); it is one small canvas.
  const interval = lite ? 1 / 20 : 1 / 30;
  useFrame(state => {
    const now = state.clock.elapsedTime;
    const map = glass.current?.map;
    if (reduced || !map || now - drawn.current < interval) return;
    drawn.current = now;
    const ctx = (map.image as HTMLCanvasElement).getContext("2d");
    if (!ctx) return;
    drawSky(ctx, now + 4);
    map.needsUpdate = true;
  });

  return (
    <group position={[4.3, 2.75, -3.98]}>
      <RoundedBox args={[2.6, 2.3, 0.1]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color={WHITE} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.055]}>
        <planeGeometry args={[2.34, 2.04]} />
        <meshBasicMaterial ref={glass} map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[0.06, 2.04, 0.04]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      <mesh position={[0, 0.2, 0.07]}>
        <boxGeometry args={[2.34, 0.06, 0.04]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      <RoundedBox args={[2.9, 0.08, 0.42]} radius={0.03} position={[0, -1.18, 0.2]} castShadow>
        <meshStandardMaterial color={WHITE} roughness={0.5} />
      </RoundedBox>
      <Plant position={[0.9, -1.14, 0.2]} scale={0.3} />
    </group>
  );
}

function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const count = scale < 0.5 ? 6 : 9;
  const leaves = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2 + rand(index) * 0.5;
        const reach = 0.28 + rand(index + 4) * 0.34;
        const height = 1.05 + rand(index + 9) * 0.85;
        return { angle, reach, height, tilt: 0.5 + rand(index + 2) * 0.5, size: 0.3 + rand(index + 6) * 0.14 };
      }),
    [count],
  );
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.27, 0.64, 40]} />
        <meshStandardMaterial color={WHITE} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.63, 0]}>
        <cylinderGeometry args={[0.33, 0.33, 0.04, 40]} />
        <meshStandardMaterial color="#6b5343" roughness={1} />
      </mesh>
      {leaves.map((leaf, index) => (
        <group key={index} rotation={[0, leaf.angle, 0]}>
          <mesh position={[leaf.reach / 2, 0.62 + (leaf.height - 0.62) / 2, 0]} rotation={[0, 0, -Math.atan2(leaf.reach, leaf.height - 0.62)]}>
            <cylinderGeometry args={[0.015, 0.02, Math.hypot(leaf.reach, leaf.height - 0.62), 6]} />
            <meshStandardMaterial color="#5d9c6f" roughness={0.8} />
          </mesh>
          <mesh position={[leaf.reach + 0.12, leaf.height + 0.05, 0]} rotation={[0, 0, -leaf.tilt]} scale={[1, 0.12, 0.62]} castShadow>
            <sphereGeometry args={[leaf.size, 16, 10]} />
            <meshStandardMaterial color={index % 3 === 0 ? "#6fb07f" : "#4f9667"} roughness={0.65} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FloorLamp() {
  return (
    <group position={[-4.35, 0, 1.0]}>
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.34, 0.06, 40]} />
        <meshStandardMaterial color={WHITE} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 2.8, 12]} />
        <meshStandardMaterial color={OAK_DARK} roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.95, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.42, 0.56, 40, 1, true]} />
        <meshStandardMaterial color="#fff3df" emissive="#ffd9a3" emissiveIntensity={0.7} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
      <pointLight position={[0, 2.8, 0]} color="#ffd9a8" intensity={5} distance={6} />
    </group>
  );
}

function Clock({ reduced }: { reduced: boolean }) {
  const hour = useRef<THREE.Group>(null);
  const minute = useRef<THREE.Group>(null);
  const second = useRef<THREE.Group>(null);
  useFrame(() => {
    const now = new Date();
    const seconds = now.getSeconds() + (reduced ? 0 : now.getMilliseconds() / 1000);
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;
    if (second.current) second.current.rotation.z = -(seconds / 60) * Math.PI * 2;
    if (minute.current) minute.current.rotation.z = -(minutes / 60) * Math.PI * 2;
    if (hour.current) hour.current.rotation.z = -(hours / 12) * Math.PI * 2;
  });
  return (
    <group position={[-0.75, 3.45, -3.96]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.08, 64]} />
        <meshStandardMaterial color={OAK} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.042]}>
        <circleGeometry args={[0.43, 64]} />
        <meshStandardMaterial color="#fbf8f2" roughness={0.6} />
      </mesh>
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.sin(angle) * 0.36, Math.cos(angle) * 0.36, 0.046]}>
            <circleGeometry args={[index % 3 === 0 ? 0.022 : 0.012, 12]} />
            <meshBasicMaterial color={INK} />
          </mesh>
        );
      })}
      <group ref={hour} position={[0, 0, 0.05]} userData={LIVE}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.03, 0.22, 0.01]} />
          <meshBasicMaterial color={INK} />
        </mesh>
      </group>
      <group ref={minute} position={[0, 0, 0.055]} userData={LIVE}>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.02, 0.32, 0.01]} />
          <meshBasicMaterial color={INK} />
        </mesh>
      </group>
      <group ref={second} position={[0, 0, 0.06]} userData={LIVE}>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.008, 0.36, 0.01]} />
          <meshBasicMaterial color="#e0607e" />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- furniture ---------- */

function Desk() {
  return (
    <group>
      <RoundedBox args={[3.5, 0.1, 1.5]} radius={0.04} smoothness={4} position={[0, 1, 0.3]} castShadow receiveShadow>
        <meshStandardMaterial color={OAK} roughness={0.55} />
      </RoundedBox>
      {[
        [-1.55, -0.3],
        [-1.55, 0.9],
        [1.55, -0.3],
        [1.55, 0.9],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.48, z]} castShadow>
          <cylinderGeometry args={[0.05, 0.035, 0.96, 20]} />
          <meshStandardMaterial color={WHITE} roughness={0.4} />
        </mesh>
      ))}
      {/* Drawer unit */}
      <RoundedBox args={[0.8, 0.82, 1.15]} radius={0.05} smoothness={4} position={[1.0, 0.5, 0.3]} castShadow>
        <meshStandardMaterial color={WHITE} roughness={0.5} />
      </RoundedBox>
      {[0.7, 0.38].map(y => (
        <mesh key={y} position={[1.0, y, 0.89]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.018, 0.22, 6, 12]} />
          <meshStandardMaterial color={OAK_DARK} roughness={0.5} />
        </mesh>
      ))}
      {/* Keyboard, mouse, mug */}
      <RoundedBox args={[0.95, 0.04, 0.32]} radius={0.018} position={[0, 1.07, 0.6]} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.45} />
      </RoundedBox>
      <mesh position={[0.72, 1.075, 0.6]} scale={[1, 0.45, 1.5]} castShadow>
        <sphereGeometry args={[0.075, 24, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      <group position={[-1.25, 1.05, 0.55]}>
        <mesh position={[0, 0.11, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.22, 32]} />
          <meshStandardMaterial color="#e2936b" roughness={0.4} />
        </mesh>
        <mesh position={[0.11, 0.11, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <torusGeometry args={[0.06, 0.016, 10, 24, Math.PI]} />
          <meshStandardMaterial color="#e2936b" roughness={0.4} />
        </mesh>
      </group>
      {/* Notebook stack */}
      {["#8fb9a8", "#f1d9a0", "#ffffff"].map((color, index) => (
        <RoundedBox key={color} args={[0.52 - index * 0.04, 0.06, 0.38]} radius={0.015} position={[-1.15, 1.085 + index * 0.065, 0.2]} rotation={[0, 0.2 - index * 0.22, 0]} castShadow>
          <meshStandardMaterial color={color} roughness={0.7} />
        </RoundedBox>
      ))}
      {/* Desk lamp */}
      <group position={[1.4, 1.05, -0.05]}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.17, 0.04, 32]} />
          <meshStandardMaterial color={WHITE} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.68, 10]} />
          <meshStandardMaterial color={OAK_DARK} roughness={0.5} />
        </mesh>
        <mesh position={[-0.16, 0.72, 0.06]} rotation={[0.3, 0, 0.9]} castShadow>
          <coneGeometry args={[0.18, 0.26, 32, 1, true]} />
          <meshStandardMaterial color="#f2c14e" side={THREE.DoubleSide} roughness={0.5} />
        </mesh>
      </group>
      <Plant position={[-1.45, 1.05, -0.3]} scale={0.26} />
    </group>
  );
}

const SHOTS = projects.filter(item => item.image).map(item => item.image as string);
/** The screen is 1.82 units wide and the page inside it is laid out 1024px wide. */
const SCREEN_PX = { width: 1024, height: 574 };
const SCREEN_FACTOR = (1.82 / SCREEN_PX.width) * 400;

type BrowserProps = { project: number; on: boolean; onProject: (index: number) => void };

/** A small working browser: one tab per project, live page where the site allows it. */
function Browser({ project, on, onProject }: BrowserProps) {
  const [reloads, setReloads] = useState(0);
  const item = projects[project % projects.length];
  const total = projects.length;
  const address = item.url ? item.url.replace(/^https?:\/\//, "") : item.name.toLowerCase();
  const live = on && Boolean(item.url) && item.embed !== false;

  return (
    // Clicks inside the browser stay inside it. Left to bubble, they reach the 3D
    // canvas behind, which reads them as a click on the wall and closes the view.
    <div
      className={`ro-browser${on ? " is-on" : ""}`}
      style={{ width: SCREEN_PX.width, height: SCREEN_PX.height, "--tone": item.color } as CSSProperties}
      onClick={event => event.stopPropagation()}
      onPointerDown={event => event.stopPropagation()}
      onPointerUp={event => event.stopPropagation()}
      onPointerMove={event => event.stopPropagation()}
    >
      <div className="ro-browser-tabs" role="tablist" aria-label="Projects">
        {projects.map((entry, index) => (
          <button key={entry.id} type="button" role="tab" aria-selected={index === project} className={index === project ? "is-current" : ""} onClick={() => onProject(index)}>
            <i style={{ background: entry.color }} />
            {entry.name}
          </button>
        ))}
      </div>
      <div className="ro-browser-bar">
        <button type="button" aria-label="Previous project" onClick={() => onProject((project - 1 + total) % total)}>
          ‹
        </button>
        <button type="button" aria-label="Next project" onClick={() => onProject((project + 1) % total)}>
          ›
        </button>
        <button type="button" aria-label="Reload" onClick={() => setReloads(value => value + 1)}>
          ↻
        </button>
        <span className="ro-browser-url">
          <b>https://</b>
          {address}
        </span>
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            Open ↗
          </a>
        )}
      </div>
      <div className="ro-browser-view">
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered outside the Next tree, inside the 3D screen */}
        {item.image && <img src={item.image} alt="" />}
        {live && <iframe key={`${item.id}-${reloads}`} src={item.url} title={item.name} loading="lazy" />}
        {on && item.url && item.embed === false && (
          <a className="ro-browser-open" href={item.url} target="_blank" rel="noopener noreferrer">
            Open {item.name} ↗
          </a>
        )}
      </div>
    </div>
  );
}

function Monitor({ project, browsing, onProject }: { project: number; browsing: boolean; onProject: (index: number) => void }) {
  // Live-site screenshots where they exist, a drawn placeholder otherwise.
  const shots = useTexture(SHOTS);
  const textures = useMemo(
    () =>
      projects.map((item, index) => {
        const shot = item.image ? shots[SHOTS.indexOf(item.image)] : null;
        return shot ?? makeTexture(1024, 576, ctx => drawScreen(ctx, index));
      }),
    [shots],
  );
  return (
    <group>
      <mesh position={[0, 1.07, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.32, 0.03, 40]} />
        <meshStandardMaterial color={WHITE} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.27, -0.03]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.4, 20]} />
        <meshStandardMaterial color={WHITE} roughness={0.35} />
      </mesh>
      <RoundedBox args={[1.92, 1.14, 0.07]} radius={0.035} smoothness={5} position={[0, 1.9, 0]} castShadow>
        <meshStandardMaterial color="#f7f5f1" roughness={0.3} />
      </RoundedBox>
      <mesh position={[0, 1.9, 0.037]}>
        <planeGeometry args={[1.82, 1.02]} />
        <meshBasicMaterial map={textures[project % textures.length]} toneMapped={false} />
      </mesh>
      {/* The real browser sits exactly on the glass and only shows while the desk is in focus. */}
      {/* Mounted only then: otherwise its 3D-positioned DOM layer is re-placed on every frame for nothing. */}
      {browsing && (
        <Html transform position={[0, 1.9, 0.04]} distanceFactor={SCREEN_FACTOR} zIndexRange={[8, 1]}>
          <Browser project={project} on onProject={onProject} />
        </Html>
      )}
    </group>
  );
}

function Chair() {
  const fabric = "#7fa8d9";
  return (
    <group position={[2.9, 0, -1.55]} rotation={[0, -0.75, 0]}>
      {[0, 1, 2, 3, 4].map(spoke => {
        const angle = (spoke / 5) * Math.PI * 2;
        return (
          <group key={spoke} rotation={[0, angle, 0]}>
            <mesh position={[0.2, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <capsuleGeometry args={[0.03, 0.36, 6, 12]} />
              <meshStandardMaterial color={WHITE} roughness={0.4} />
            </mesh>
            <mesh position={[0.4, 0.05, 0]} castShadow>
              <sphereGeometry args={[0.05, 16, 12]} />
              <meshStandardMaterial color={INK} roughness={0.5} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.56, 16]} />
        <meshStandardMaterial color={WHITE} roughness={0.4} />
      </mesh>
      <RoundedBox args={[0.82, 0.16, 0.78]} radius={0.075} smoothness={5} position={[0, 0.74, 0]} castShadow>
        <meshStandardMaterial color={fabric} roughness={0.9} />
      </RoundedBox>
      <mesh position={[0, 1.0, 0.38]} rotation={[0.12, 0, 0]}>
        <capsuleGeometry args={[0.035, 0.44, 6, 12]} />
        <meshStandardMaterial color={WHITE} roughness={0.4} />
      </mesh>
      <RoundedBox args={[0.78, 0.78, 0.14]} radius={0.068} smoothness={5} position={[0, 1.45, 0.42]} rotation={[0.12, 0, 0]} castShadow>
        <meshStandardMaterial color={fabric} roughness={0.9} />
      </RoundedBox>
    </group>
  );
}

const BOOK_COLORS = ["#8fb9a8", "#e2936b", "#f2c14e", "#7fa8d9", "#f1ebe0", "#d98ca1", "#b7c9a8", "#ffffff"];

function Bookshelf() {
  const books = useMemo(() => {
    const list: { key: string; position: [number, number, number]; size: [number, number, number]; color: string; lean: number }[] = [];
    [0.13, 0.93, 1.73, 2.53].forEach((shelfY, shelf) => {
      // Each shelf leaves one stretch empty for an ornament.
      const gapStart = -0.9 + rand(shelf + 60) * 1.2;
      let z = -1.05;
      let index = 0;
      while (z < 1.0) {
        const seed = shelf * 40 + index;
        const thickness = 0.08 + rand(seed) * 0.09;
        const height = 0.4 + rand(seed + 0.5) * 0.24;
        if (z < gapStart || z > gapStart + 0.55) {
          list.push({
            key: `${shelf}-${index}`,
            position: [0.04, shelfY + height / 2, z + thickness / 2],
            size: [0.4, height, thickness],
            color: BOOK_COLORS[Math.floor(rand(seed + 0.2) * BOOK_COLORS.length)],
            lean: rand(seed + 0.9) > 0.92 ? 0.16 : 0,
          });
        }
        z += thickness + 0.012;
        index += 1;
      }
    });
    return list;
  }, []);
  const ornaments = [0, 1, 2, 3].map(shelf => ({ y: [0.13, 0.93, 1.73, 2.53][shelf], z: -0.9 + rand(shelf + 60) * 1.2 + 0.28 }));

  return (
    <group>
      <RoundedBox args={[0.06, 3.3, 2.4]} radius={0.02} position={[-0.27, 1.65, 0]} castShadow>
        <meshStandardMaterial color={WHITE} roughness={0.6} />
      </RoundedBox>
      {[-1.2, 1.2].map(z => (
        <RoundedBox key={z} args={[0.6, 3.36, 0.08]} radius={0.03} position={[0, 1.66, z]} castShadow>
          <meshStandardMaterial color={WHITE} roughness={0.6} />
        </RoundedBox>
      ))}
      {[0.1, 0.9, 1.7, 2.5, 3.3].map(y => (
        <RoundedBox key={y} args={[0.6, 0.06, 2.4]} radius={0.02} position={[0, y, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={OAK} roughness={0.6} />
        </RoundedBox>
      ))}
      <Instances limit={books.length} castShadow frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial roughness={0.75} />
        {books.map(book => (
          <Instance key={book.key} position={book.position} rotation={[book.lean, 0, 0]} scale={book.size} color={book.color} />
        ))}
      </Instances>
      <mesh position={[0.02, ornaments[0].y + 0.17, ornaments[0].z]} castShadow>
        <sphereGeometry args={[0.17, 32, 24]} />
        <meshStandardMaterial color="#f2c14e" roughness={0.3} />
      </mesh>
      <Plant position={[0.02, ornaments[1].y, ornaments[1].z]} scale={0.24} />
      <mesh position={[0.02, ornaments[2].y + 0.2, ornaments[2].z]} castShadow>
        <coneGeometry args={[0.15, 0.4, 32]} />
        <meshStandardMaterial color="#e2936b" roughness={0.4} />
      </mesh>
      <mesh position={[0.02, ornaments[3].y + 0.16, ornaments[3].z]} rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.13, 0.05, 16, 32]} />
        <meshStandardMaterial color={SAGE} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Portrait() {
  const texture = useTexture("/charles.png");
  return (
    <group>
      <RoundedBox args={[1.7, 1.7, 0.1]} radius={0.04} smoothness={4} castShadow>
        <meshStandardMaterial color={OAK} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.052]}>
        <planeGeometry args={[1.46, 1.46]} />
        <meshStandardMaterial color="#f6ead9" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.056]}>
        <planeGeometry args={[1.46, 1.46]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function Diploma() {
  const texture = useMemo(() => makeTexture(900, 500, drawDiploma), []);
  return (
    <group>
      <RoundedBox args={[2.1, 1.25, 0.09]} radius={0.035} smoothness={4} castShadow>
        <meshStandardMaterial color={OAK} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.047]}>
        <planeGeometry args={[1.9, 1.05]} />
        <meshStandardMaterial map={texture} roughness={0.85} />
      </mesh>
      {/* Graduation cap resting on a small ledge beneath */}
      <RoundedBox args={[1.3, 0.06, 0.34]} radius={0.02} position={[0, -0.95, 0.18]} castShadow>
        <meshStandardMaterial color={OAK} roughness={0.5} />
      </RoundedBox>
      <group position={[0, -0.72, 0.2]} rotation={[0, 0.5, 0]} scale={0.42}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.56, 0.42, 32]} />
          <meshStandardMaterial color={INK} roughness={0.5} />
        </mesh>
        <RoundedBox args={[1.6, 0.1, 1.6]} radius={0.04} castShadow>
          <meshStandardMaterial color={INK} roughness={0.5} />
        </RoundedBox>
        <mesh position={[0.7, -0.3, 0.7]}>
          <capsuleGeometry args={[0.05, 0.5, 6, 12]} />
          <meshStandardMaterial color="#d9a521" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

function Armchair() {
  const fabric = "#efe6d6";
  return (
    <group position={[-3.6, 0, 3.9]} rotation={[0, Math.PI / 2 - 0.25, 0]}>
      {[
        [-0.55, -0.45],
        [0.55, -0.45],
        [-0.55, 0.45],
        [0.55, 0.45],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.12, z]} castShadow>
          <cylinderGeometry args={[0.045, 0.03, 0.24, 16]} />
          <meshStandardMaterial color={OAK_DARK} roughness={0.5} />
        </mesh>
      ))}
      <RoundedBox args={[1.4, 0.42, 1.2]} radius={0.16} smoothness={6} position={[0, 0.45, 0]} castShadow>
        <meshStandardMaterial color={fabric} roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[1.4, 1.0, 0.36]} radius={0.16} smoothness={6} position={[0, 0.98, -0.5]} rotation={[-0.1, 0, 0]} castShadow>
        <meshStandardMaterial color={fabric} roughness={0.95} />
      </RoundedBox>
      {[-0.62, 0.62].map(x => (
        <RoundedBox key={x} args={[0.3, 0.62, 1.2]} radius={0.14} smoothness={6} position={[x, 0.66, 0]} castShadow>
          <meshStandardMaterial color={fabric} roughness={0.95} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.56, 0.5, 0.2]} radius={0.09} smoothness={6} position={[0.05, 0.92, -0.26]} rotation={[-0.25, 0, 0.12]} castShadow>
        <meshStandardMaterial color={SAGE} roughness={0.95} />
      </RoundedBox>
    </group>
  );
}

function ContactTable({ reduced }: { reduced: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.32, 0.06, 40]} />
        <meshStandardMaterial color={WHITE} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.74, 16]} />
        <meshStandardMaterial color={WHITE} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.79, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.06, 64]} />
        <meshStandardMaterial color={OAK} roughness={0.55} />
      </mesh>
      {/* Letter tray */}
      <RoundedBox args={[0.5, 0.08, 0.36]} radius={0.03} position={[-0.08, 0.86, 0.02]} castShadow>
        <meshStandardMaterial color="#e0607e" roughness={0.5} />
      </RoundedBox>
      <Float speed={reduced ? 0 : 2.2} rotationIntensity={reduced ? 0 : 0.5} floatIntensity={reduced ? 0 : 0.9} floatingRange={[0, 0.25]}>
        <group position={[-0.05, 1.35, 0.02]} rotation={[0.2, 0.5, 0.12]} userData={LIVE}>
          <RoundedBox args={[0.66, 0.44, 0.045]} radius={0.02} castShadow>
            <meshStandardMaterial color="#ffffff" roughness={0.6} />
          </RoundedBox>
          <mesh position={[0, 0.065, 0.024]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.31, 0.2, 3]} />
            <meshStandardMaterial color="#efe8dc" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.02, 0.03]}>
            <circleGeometry args={[0.055, 24]} />
            <meshStandardMaterial color="#e0607e" roughness={0.4} />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

/* ---------- scene ---------- */

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

function Room({ active, project, reduced, lite, eco, canBrowse, onProject, onSelect, onClose, onReady }: SceneProps) {
  const [hovered, setHovered] = useState<SpotId | null>(null);
  const hot = { hovered, active, onHover: setHovered, onSelect };
  // Fixed at start: the shadows are baked once, so their resolution must not change later.
  const [shadowSize] = useState(lite ? 1024 : 2048);

  useEffect(() => {
    for (const spot of spots) {
      document.getElementById(`ro-tag-${spot.id}`)?.classList.toggle("is-hot", hovered === spot.id);
    }
    document.body.style.cursor = hovered && active === null ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered, active]);

  return (
    <>
      <color attach="background" args={["#ece6dc"]} />
      <CameraRig active={active} reduced={reduced} />
      {/* Without the environment the sky light carries the fill; 2.65 matches its brightness. */}
      <hemisphereLight args={["#ffffff", "#e6d5b8", eco ? 2.65 : 0.55]} />
      <directionalLight position={[7, 11, -4]} intensity={1.7} color="#fff1dc" castShadow shadow-mapSize={[shadowSize, shadowSize]} shadow-bias={-0.0004} shadow-normalBias={0.03}>
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 1, 40]} />
      </directionalLight>
      {!eco && (
      <Environment resolution={64} environmentIntensity={0.42}>
        <color attach="background" args={["#f1ebe1"]} />
        <Lightformer form="rect" intensity={3} position={[0, 10, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[20, 20, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[10, 4, 6]} rotation={[0, -Math.PI / 2, 0]} scale={[14, 8, 1]} color="#ffe9cc" />
        <Lightformer form="rect" intensity={1.2} position={[0, 4, 12]} rotation={[0, Math.PI, 0]} scale={[14, 8, 1]} color="#e6f1ff" />
      </Environment>
      )}

      <group
        onClick={event => {
          if (event.delta > 6) return;
          event.stopPropagation();
          if (active) onClose();
        }}
      >
        <StaticBatch>
          <Shell />
          <WallDecor />
          <WallName />
        </StaticBatch>
      </group>
      <StaticBatch>
        <WindowView reduced={reduced} lite={lite} />
        <FloorLamp />
        <Clock reduced={reduced} />
        <Chair />
        <Armchair />
        <Plant position={[-4.25, 0, -3.3]} scale={1.15} />
        <Plant position={[6.1, 0, -3.05]} scale={1} />
        <group position={[1.1, 0, -3.5]}>
          <Desk />
        </group>
      </StaticBatch>
      <Hotspot id="projects" position={[1.1, 0, -3.5]} {...hot}>
        <Monitor project={project} browsing={canBrowse && active === "projects"} onProject={onProject} />
      </Hotspot>
      <Hotspot id="skills" position={[-4.65, 0, -0.8]} {...hot}>
        <Bookshelf />
      </Hotspot>
      <Hotspot id="about" position={[-2.9, 2.6, -3.95]} {...hot}>
        <Portrait />
      </Hotspot>
      <Hotspot id="experience" position={[-4.96, 2.5, 2.7]} rotation={[0, Math.PI / 2, 0]} {...hot}>
        <Diploma />
      </Hotspot>
      <Hotspot id="contact" position={[-1.7, 0, 3.8]} {...hot}>
        <ContactTable reduced={reduced} />
      </Hotspot>

      {/* The room never moves, so its shadows are drawn once instead of every frame. */}
      <BakeShadows />
      <Ready onReady={onReady} />
    </>
  );
}

/** Tone mapping straight on the renderer; there is no post-processing pass. */
function RendererTone() {
  const gl = useThree(state => state.gl);
  useEffect(() => {
    const previous = gl.toneMapping;
    // eslint-disable-next-line react-hooks/immutability -- the renderer is a mutable three.js object
    gl.toneMapping = THREE.NeutralToneMapping;
    return () => {
      gl.toneMapping = previous;
    };
  }, [gl]);
  return null;
}

/** Most pixels the canvas may draw, so huge or very dense screens stay smooth. */
const PIXEL_BUDGET = { full: 5_000_000, lite: 2_600_000 };

function startingDpr(lite: boolean) {
  const cap = lite ? 1.5 : 2;
  const fits = Math.sqrt((lite ? PIXEL_BUDGET.lite : PIXEL_BUDGET.full) / Math.max(1, window.innerWidth * window.innerHeight));
  return Math.max(1, Math.min(window.devicePixelRatio || 1, cap, fits));
}

export default function RoomScene(props: Omit<SceneProps, "canBrowse" | "eco">) {
  const { lite } = props;
  // Start as sharp as the screen allows (up to 2x, within a pixel budget). Each time
  // the device fails to hold a steady frame rate, quality steps down once and never
  // back up, so the picture settles instead of flickering between qualities.
  // Step 1 swaps the reflected environment for a plain sky light, which looks almost
  // the same and is the most expensive thing per pixel. Later steps lower resolution.
  const [start] = useState(() => startingDpr(lite));
  const [step, setStep] = useState(lite ? 1 : 0);
  const dpr = Math.max(Math.min(start, 1), start * Math.pow(0.8, Math.max(0, step - 1)));
  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ fov: 35, near: 0.1, far: 80, position: [14, 11, 18] }}
      gl={{ antialias: true, powerPreference: "high-performance", stencil: false }}
      fallback={
        <p className="ro-fallback">
          This browser cannot draw the 3D room. <a href="/classic">Open the classic portfolio</a>.
        </p>
      }
    >
      <PerformanceMonitor bounds={() => [45, 1000]} onDecline={() => setStep(value => Math.min(value + 1, 6))} />
      <Suspense fallback={null}>
        <Room {...props} eco={step > 0} canBrowse={!lite} />
        <RendererTone />
      </Suspense>
    </Canvas>
  );
}
