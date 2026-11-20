"use client";

import { Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Environment, Float, Instance, Instances, Lightformer, RoundedBox, Sparkles, Text3D, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer, HueSaturation, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { projects } from "@/data/projects";
import { input } from "./input";
import { rand, scenery, SIGN, SPAWN } from "./scenery";
import { ISLAND_RADIUS, PATH_RADIUS, zoneById, zones, type Zone } from "./zones";

export type WorldMode = "intro" | "explore";

type SceneProps = {
  mode: WorldMode;
  active: string | null;
  near: string | null;
  reduced: boolean;
  onSelect: (id: string) => void;
  onNear: (id: string | null) => void;
  onReady: () => void;
};

const FONT_URL = "/fonts/helvetiker_bold.typeface.json";
const UI_FONT = "Inter, 'Segoe UI', system-ui, sans-serif";
const STONE = "#d8c8a2";
const GLOW = (hex: string, strength = 2.2) => new THREE.Color(hex).multiplyScalar(strength);

/** Shared between the character, the camera and the sun so they stay in step. */
const playerPosition = new THREE.Vector3(SPAWN.x, 0, SPAWN.z);
const focusPosition = new THREE.Vector3(0, 0, 0);

/* ---------- textures ---------- */

function makeTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function drawPoster(ctx: CanvasRenderingContext2D, project: (typeof projects)[number], tone: string, index: number) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#0d1424");
  bg.addColorStop(1, "#1a2540");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.82, h * 0.2, 0, w * 0.82, h * 0.2, w * 0.6);
  glow.addColorStop(0, `${tone}aa`);
  glow.addColorStop(1, `${tone}00`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = tone;
  ctx.font = `700 26px ${UI_FONT}`;
  ctx.fillText(`0${index + 1}  ·  ${project.category}`, 64, 96);

  ctx.fillStyle = "#ffffff";
  ctx.font = `800 118px ${UI_FONT}`;
  ctx.fillText(project.name, 60, 232);

  ctx.fillStyle = "#c9d5ea";
  ctx.font = `500 38px ${UI_FONT}`;
  ctx.fillText(project.summary, 64, 306);

  project.features.forEach((feature, row) => {
    const y = 392 + row * 62;
    ctx.fillStyle = "#ffffff14";
    ctx.beginPath();
    ctx.roundRect(64, y - 38, 560, 50, 25);
    ctx.fill();
    ctx.fillStyle = tone;
    ctx.beginPath();
    ctx.arc(92, y - 13, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#eaf0fb";
    ctx.font = `500 27px ${UI_FONT}`;
    ctx.fillText(feature, 116, y - 4);
  });

  // A small abstract "app window" so the screen reads as a product.
  ctx.fillStyle = "#ffffff12";
  ctx.beginPath();
  ctx.roundRect(680, 352, 290, 216, 20);
  ctx.fill();
  for (let bar = 0; bar < 5; bar += 1) {
    const height = 36 + rand(index * 11 + bar) * 110;
    ctx.fillStyle = bar % 2 ? "#ffffff55" : tone;
    ctx.beginPath();
    ctx.roundRect(708 + bar * 50, 540 - height, 32, height, 8);
    ctx.fill();
  }

  ctx.fillStyle = tone;
  ctx.fillRect(0, h - 10, w, 10);
}

/* ---------- sky, light, island ---------- */

function Sky() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          top: { value: new THREE.Color("#2f8cff") },
          middle: { value: new THREE.Color("#bfe4ff") },
          bottom: { value: new THREE.Color("#ffe9cf") },
        },
        vertexShader: "varying vec3 vDirection; void main() { vDirection = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader:
          "uniform vec3 top; uniform vec3 middle; uniform vec3 bottom; varying vec3 vDirection; void main() { float h = normalize(vDirection).y; vec3 color = h > 0.0 ? mix(middle, top, pow(h, 0.55)) : mix(middle, bottom, pow(-h, 0.45)); gl_FragColor = vec4(color, 1.0); }",
      }),
    [],
  );
  return (
    <mesh material={material} scale={220}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  );
}

function Sun() {
  const light = useRef<THREE.DirectionalLight>(null);
  useFrame(() => {
    if (!light.current) return;
    light.current.position.set(focusPosition.x + 18, 26, focusPosition.z - 7);
    light.current.target.position.copy(focusPosition);
    light.current.target.updateMatrixWorld();
  });
  return (
    <directionalLight
      ref={light}
      intensity={1.5}
      color="#fff0d2"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.04}
    >
      <orthographicCamera attach="shadow-camera" args={[-32, 32, 32, -32, 1, 110]} />
    </directionalLight>
  );
}

function Cloud({ position, scale, seed }: { position: [number, number, number]; scale: number; seed: number }) {
  const puffs = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => ({
        position: [(index - 2.5) * 1.5, rand(seed + index) * 0.9, rand(seed + index + 0.5) * 1.6 - 0.8] as [number, number, number],
        radius: 1.1 + rand(seed + index + 0.2) * 1.2,
      })),
    [seed],
  );
  return (
    <group position={position} scale={scale}>
      {puffs.map((puff, index) => (
        <mesh key={index} position={puff.position} scale={[1, 0.72, 1]}>
          <sphereGeometry args={[puff.radius, 20, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={1} emissive="#ffffff" emissiveIntensity={0.22} fog={false} />
        </mesh>
      ))}
    </group>
  );
}

function Clouds({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const clouds = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => {
        const angle = (index / 16) * Math.PI * 2 + rand(index) * 0.5;
        const radius = 44 + rand(index + 3) * 34;
        return {
          position: [Math.sin(angle) * radius, -12 + rand(index + 7) * 26, Math.cos(angle) * radius] as [number, number, number],
          scale: 1.1 + rand(index + 5) * 1.6,
        };
      }),
    [],
  );
  useFrame((_, delta) => {
    if (group.current && !reduced) group.current.rotation.y += delta * 0.012;
  });
  return (
    <group ref={group}>
      {clouds.map((cloud, index) => (
        <Cloud key={index} position={cloud.position} scale={cloud.scale} seed={index * 13} />
      ))}
    </group>
  );
}

function Island({ canWalk }: { canWalk: boolean }) {
  return (
    <group>
      <mesh
        position={[0, -0.6, 0]}
        receiveShadow
        onClick={event => {
          if (!canWalk || event.delta > 6) return;
          event.stopPropagation();
          input.target = { x: event.point.x, z: event.point.z, fast: false };
        }}
      >
        <cylinderGeometry args={[ISLAND_RADIUS, ISLAND_RADIUS, 1.2, 96]} />
        <meshStandardMaterial color="#8fd86a" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[ISLAND_RADIUS + 0.45, ISLAND_RADIUS + 0.2, 0.9, 96]} />
        <meshStandardMaterial color="#6cc152" roughness={1} />
      </mesh>
      <mesh position={[0, -6.3, 0]}>
        <cylinderGeometry args={[ISLAND_RADIUS + 0.1, 10, 10, 64]} />
        <meshStandardMaterial color="#c79a6a" roughness={1} />
      </mesh>
      <mesh position={[0, -14.3, 0]}>
        <cylinderGeometry args={[10, 1.4, 6, 48]} />
        <meshStandardMaterial color="#a9794f" roughness={1} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6].map(index => {
        const angle = (index / 7) * Math.PI * 2 + 0.4;
        const radius = 12 + rand(index + 20) * 9;
        return (
          <mesh key={index} position={[Math.sin(angle) * radius, -9 - rand(index + 30) * 4, Math.cos(angle) * radius]} scale={[1, 1.5, 1]}>
            <dodecahedronGeometry args={[2.4 + rand(index + 40) * 2, 1]} />
            <meshStandardMaterial color="#b5855a" roughness={1} />
          </mesh>
        );
      })}

      {/* Plaza and paths */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6.2, 64]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.6, 4.9, 64]} />
        <meshStandardMaterial color="#73d4ec" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.5, 48]} />
        <meshStandardMaterial color="#73d4ec" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[PATH_RADIUS - 1.5, PATH_RADIUS + 1.5, 128]} />
        <meshStandardMaterial color="#dcc48a" roughness={1} />
      </mesh>
      {zones.map(zone => (
        <group key={zone.id}>
          <group rotation={[0, Math.atan2(zone.x, zone.z), 0]}>
            <mesh position={[0, 0.012, 10.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[2.3, 9.6]} />
              <meshStandardMaterial color="#dcc48a" roughness={1} />
            </mesh>
          </group>
          <mesh position={[zone.x, 0.02, zone.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[4.6, 56]} />
            <meshStandardMaterial color={STONE} roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Walkway from the start to the plaza */}
      <mesh position={[0, 0.012, 9.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.3, 7]} />
        <meshStandardMaterial color="#dcc48a" roughness={1} />
      </mesh>
    </group>
  );
}

const LEAVES = ["#5fc25a", "#48b06c", "#7dd45e"];
const BLOSSOM = ["#ff9fc4", "#ffb9d3", "#ff8fb5"];
const PETALS = ["#ff7aa8", "#ffd34f", "#ffffff", "#8f7cf0", "#ff9d6c"];

function Scenery() {
  const flowers = useMemo(() => {
    const list: { key: string; position: [number, number, number]; color: string }[] = [];
    scenery.props
      .filter(prop => prop.type === "flowers")
      .forEach((prop, index) => {
        for (let petal = 0; petal < 7; petal += 1) {
          const angle = rand(index * 17 + petal) * Math.PI * 2;
          const radius = rand(index * 31 + petal) * 1.1;
          list.push({
            key: `${prop.key}-${petal}`,
            position: [prop.x + Math.sin(angle) * radius, 0.16, prop.z + Math.cos(angle) * radius],
            color: PETALS[Math.floor(rand(index * 3 + petal * 7) * PETALS.length)],
          });
        }
      });
    return list;
  }, []);

  return (
    <group>
      {scenery.props.map(prop => {
        if (prop.type === "tree" || prop.type === "blossom") {
          const palette = prop.type === "tree" ? LEAVES : BLOSSOM;
          return (
            <group key={prop.key} position={[prop.x, 0, prop.z]} scale={prop.scale} rotation={[0, prop.spin, 0]}>
              <mesh position={[0, 0.8, 0]} castShadow>
                <cylinderGeometry args={[0.16, 0.26, 1.6, 12]} />
                <meshStandardMaterial color="#9b6d4c" roughness={0.9} />
              </mesh>
              <mesh position={[0, 2.1, 0]} castShadow>
                <sphereGeometry args={[1.05, 24, 18]} />
                <meshStandardMaterial color={palette[prop.variant]} roughness={0.85} />
              </mesh>
              <mesh position={[0.45, 2.75, 0.2]} castShadow>
                <sphereGeometry args={[0.72, 20, 16]} />
                <meshStandardMaterial color={palette[(prop.variant + 1) % 3]} roughness={0.85} />
              </mesh>
              <mesh position={[-0.4, 2.9, -0.25]} castShadow>
                <sphereGeometry args={[0.6, 20, 16]} />
                <meshStandardMaterial color={palette[(prop.variant + 2) % 3]} roughness={0.85} />
              </mesh>
            </group>
          );
        }
        if (prop.type === "bush") {
          return (
            <group key={prop.key} position={[prop.x, 0, prop.z]} scale={prop.scale} rotation={[0, prop.spin, 0]}>
              <mesh position={[0, 0.4, 0]} scale={[1, 0.8, 1]} castShadow>
                <sphereGeometry args={[0.65, 20, 16]} />
                <meshStandardMaterial color={LEAVES[prop.variant]} roughness={0.9} />
              </mesh>
              <mesh position={[0.55, 0.3, 0.15]} scale={[1, 0.8, 1]} castShadow>
                <sphereGeometry args={[0.45, 18, 14]} />
                <meshStandardMaterial color={LEAVES[(prop.variant + 1) % 3]} roughness={0.9} />
              </mesh>
            </group>
          );
        }
        if (prop.type === "rock") {
          return (
            <mesh key={prop.key} position={[prop.x, 0.3 * prop.scale, prop.z]} scale={[prop.scale, prop.scale * 0.7, prop.scale * 0.85]} rotation={[0, prop.spin, 0]} castShadow receiveShadow>
              <dodecahedronGeometry args={[0.8, 2]} />
              <meshStandardMaterial color="#c9cdd6" roughness={0.9} />
            </mesh>
          );
        }
        return null;
      })}
      <Instances limit={flowers.length} castShadow={false}>
        <sphereGeometry args={[0.13, 10, 8]} />
        <meshStandardMaterial roughness={0.6} />
        {flowers.map(flower => (
          <Instance key={flower.key} position={flower.position} color={flower.color} />
        ))}
      </Instances>
    </group>
  );
}

function NameSign() {
  return (
    <group position={[SIGN.x, 0, SIGN.z]}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[13, 0.4, 1.6]} />
        <meshStandardMaterial color={STONE} roughness={0.8} />
      </mesh>
      <Center top position={[0, 0.4, 0]}>
        <Text3D font={FONT_URL} size={2.1} height={0.7} bevelEnabled bevelSize={0.05} bevelThickness={0.08} curveSegments={10} castShadow>
          CHARLES
          <meshStandardMaterial color="#ffffff" roughness={0.25} metalness={0.05} />
        </Text3D>
      </Center>
      <Center top position={[0, 2.95, 0]}>
        <Text3D font={FONT_URL} size={0.46} height={0.14} letterSpacing={0.09} curveSegments={8} castShadow>
          FULL STACK DEVELOPER
          <meshStandardMaterial color="#1ea7c9" roughness={0.4} />
        </Text3D>
      </Center>
    </group>
  );
}

/* ---------- character ---------- */

function Player({ mode, active, reduced, onNear }: Pick<SceneProps, "mode" | "active" | "reduced" | "onNear">) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const marker = useRef<THREE.Mesh>(null);
  const motion = useRef({ vx: 0, vz: 0, heading: Math.PI, lift: 0, vy: 0, near: null as string | null });

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const self = group.current;
    if (!self) return;
    const m = motion.current;
    const zone = zoneById(active);
    const free = mode === "explore" && !zone;

    let ix = 0;
    let iz = 0;
    let boost = 1;
    if (free && (input.x !== 0 || input.z !== 0)) {
      const length = Math.max(1, Math.hypot(input.x, input.z));
      ix = input.x / length;
      iz = input.z / length;
      input.target = null;
    } else if (input.target && (free || input.target.fast)) {
      const dx = input.target.x - self.position.x;
      const dz = input.target.z - self.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance < 0.3) {
        input.target = null;
      } else {
        boost = input.target.fast ? Math.min(4, 1 + distance / 3) : Math.min(1, 0.35 + distance / 3);
        ix = dx / distance;
        iz = dz / distance;
      }
    }

    const speed = 7.2 * boost;
    m.vx = THREE.MathUtils.damp(m.vx, ix * speed, 9, delta);
    m.vz = THREE.MathUtils.damp(m.vz, iz * speed, 9, delta);
    self.position.x += m.vx * delta;
    self.position.z += m.vz * delta;

    if (!input.target?.fast) {
      for (const obstacle of scenery.obstacles) {
        const dx = self.position.x - obstacle.x;
        const dz = self.position.z - obstacle.z;
        const distance = Math.hypot(dx, dz);
        const minimum = obstacle.r + 0.6;
        if (distance < minimum && distance > 0.0001) {
          self.position.x = obstacle.x + (dx / distance) * minimum;
          self.position.z = obstacle.z + (dz / distance) * minimum;
        }
      }
    }
    const fromCentre = Math.hypot(self.position.x, self.position.z);
    const limit = ISLAND_RADIUS - 1.4;
    if (fromCentre > limit) {
      self.position.x *= limit / fromCentre;
      self.position.z *= limit / fromCentre;
    }

    // Face the direction of travel, or the landmark being viewed.
    const moving = Math.hypot(m.vx, m.vz);
    let wanted = m.heading;
    if (moving > 0.4) wanted = Math.atan2(m.vx, m.vz);
    else if (zone) wanted = Math.atan2(zone.x - self.position.x, zone.z - self.position.z);
    const turn = Math.atan2(Math.sin(wanted - m.heading), Math.cos(wanted - m.heading));
    m.heading += turn * Math.min(1, delta * 10);
    self.rotation.y = m.heading;

    if (input.jump) {
      if (m.lift <= 0.001 && free) m.vy = 7.5;
      input.jump = false;
    }
    m.vy -= 22 * delta;
    m.lift = Math.max(0, m.lift + m.vy * delta);
    if (m.lift === 0) m.vy = 0;

    const time = state.clock.elapsedTime;
    if (body.current) {
      body.current.position.y = 1.05 + m.lift + (reduced ? 0 : Math.sin(time * 2.6) * 0.09);
      body.current.rotation.x = THREE.MathUtils.damp(body.current.rotation.x, Math.min(moving / 7.2, 1.4) * 0.28, 8, delta);
    }
    if (eyes.current) eyes.current.scale.y = !reduced && time % 3.6 < 0.12 ? 0.15 : 1;
    if (marker.current) {
      const walking = input.target && !input.target.fast;
      marker.current.visible = Boolean(walking);
      if (input.target) marker.current.position.set(input.target.x - self.position.x, 0.06, input.target.z - self.position.z);
      marker.current.rotation.z += delta * 2;
    }

    playerPosition.copy(self.position);

    let near: string | null = null;
    for (const item of zones) {
      if (Math.hypot(self.position.x - item.spotX, self.position.z - item.spotZ) < 3.4) near = item.id;
    }
    if (near !== m.near) {
      m.near = near;
      onNear(near);
    }
  });

  return (
    <group ref={group} position={[SPAWN.x, 0, SPAWN.z]}>
      <group ref={body} position={[0, 1.05, 0]}>
        <mesh castShadow scale={[1, 0.94, 1]}>
          <sphereGeometry args={[0.62, 40, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.18} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.06, 0.2]} scale={[1, 0.6, 0.82]}>
          <sphereGeometry args={[0.5, 32, 24]} />
          <meshStandardMaterial color="#0f1728" roughness={0.08} metalness={0.3} />
        </mesh>
        <group ref={eyes} position={[0, 0.09, 0.6]}>
          {[-0.17, 0.17].map(x => (
            <mesh key={x} position={[x, 0, 0]} scale={[1, 1.5, 0.5]}>
              <sphereGeometry args={[0.07, 16, 12]} />
              <meshBasicMaterial color={GLOW("#5fe3ff", 2.4)} toneMapped={false} />
            </mesh>
          ))}
        </group>
        {[-1, 1].map(side => (
          <mesh key={side} position={[side * 0.62, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.17, 0.17, 0.12, 24]} />
            <meshStandardMaterial color="#22c3e6" roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.32, 8]} />
          <meshStandardMaterial color="#c9d3e3" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.92, 0]}>
          <sphereGeometry args={[0.08, 16, 12]} />
          <meshBasicMaterial color={GLOW("#ff8fb5", 2.2)} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.56, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.36, 0.07, 16, 40]} />
          <meshBasicMaterial color={GLOW("#5fe3ff", 2)} toneMapped={false} />
        </mesh>
        <pointLight position={[0, -0.8, 0]} color="#5fe3ff" intensity={5} distance={4} />
      </group>
      <mesh ref={marker} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.45, 0.62, 6]} />
        <meshBasicMaterial color={GLOW("#5fe3ff", 1.6)} toneMapped={false} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

/* ---------- camera ---------- */

const tmpPosition = new THREE.Vector3();
const tmpLook = new THREE.Vector3();
const tmpTag = new THREE.Vector3();

function CameraRig({ mode, active, reduced }: Pick<SceneProps, "mode" | "active" | "reduced">) {
  const look = useRef(new THREE.Vector3(0, 1, 0));
  const shift = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const { width, height } = state.size;
    const aspect = width / Math.max(height, 1);
    const wide = width > 900;
    const zone = zoneById(active);
    const pointer = reduced ? { x: 0, y: 0 } : state.pointer;

    if (zone) {
      const length = Math.hypot(zone.x, zone.z);
      const back = (wide ? Math.max(10.5, 19 / aspect) : 23) / length;
      tmpLook.set(zone.x, 2.9, zone.z);
      tmpPosition.set(zone.x - zone.x * back, 4.6, zone.z - zone.z * back);
      tmpPosition.x += pointer.x * 0.3;
      tmpPosition.y += pointer.y * 0.2;
    } else if (mode === "intro") {
      const angle = reduced ? 0.5 : state.clock.elapsedTime * 0.07 + 0.5;
      const radius = Math.max(50, 76 / aspect);
      tmpLook.set(0, 1.5, 0);
      tmpPosition.set(Math.sin(angle) * radius, radius * 0.46, Math.cos(angle) * radius);
    } else {
      const zoom = Math.max(1, 1.25 / aspect);
      tmpLook.set(playerPosition.x, 1.3, playerPosition.z);
      tmpPosition.set(playerPosition.x + pointer.x * 0.8, 11 * zoom + pointer.y * 0.4, playerPosition.z + 13.5 * zoom);
    }

    const ease = reduced ? 1 : 1 - Math.exp(-delta * 3.2);
    camera.position.lerp(tmpPosition, ease);
    look.current.lerp(tmpLook, ease);
    camera.lookAt(look.current);
    focusPosition.copy(mode === "intro" && !zone ? tmpLook : look.current).setY(0);

    // Slide the picture aside so the open card never covers the landmark.
    // During the intro the island sits clear of the welcome card instead.
    const intro = mode === "intro" && !zone;
    const targetX = wide ? (zone ? width * 0.2 : intro ? -width * 0.13 : 0) : 0;
    const targetY = wide ? 0 : zone ? height * 0.26 : intro ? height * 0.22 : 0;
    shift.current.x += (targetX - shift.current.x) * ease;
    shift.current.y += (targetY - shift.current.y) * ease;
    camera.setViewOffset(width, height, shift.current.x, shift.current.y, width, height);
    camera.updateMatrixWorld();

    // Pin the DOM name tags (rendered outside the canvas) above each landmark.
    for (const item of zones) {
      const element = document.getElementById(`vo-tag-${item.id}`);
      if (!element) continue;
      tmpTag.set(item.x, 7.4, item.z).project(camera);
      const x = (tmpTag.x * 0.5 + 0.5) * width;
      const y = (-tmpTag.y * 0.5 + 0.5) * height;
      element.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      element.style.visibility = tmpTag.z < 1 ? "visible" : "hidden";
    }
  });

  return null;
}

/* ---------- landmarks ---------- */

type LandmarkProps = { zone: Zone; lit: boolean; reduced: boolean; onSelect: (id: string) => void; title: string; children: ReactNode };

function Landmark({ zone, lit, reduced, onSelect, title, children }: LandmarkProps) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(state => {
    if (!ring.current) return;
    const pulse = reduced ? 1 : 1 + Math.sin(state.clock.elapsedTime * 2.4) * 0.06;
    ring.current.scale.setScalar(lit ? pulse * 1.12 : pulse);
  });
  return (
    <>
      <group
        position={[zone.x, 0, zone.z]}
        rotation={[0, zone.facing, 0]}
        onClick={event => {
          if (event.delta > 6) return;
          event.stopPropagation();
          onSelect(zone.id);
        }}
        onPointerOver={event => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3.3, 3.5, 0.36, 64]} />
          <meshStandardMaterial color="#e2dccd" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.37, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.0, 3.18, 64]} />
          <meshBasicMaterial color={GLOW(zone.tone, lit ? 2.2 : 1.1)} toneMapped={false} />
        </mesh>
        <Center top position={[0, 0.36, 2.55]}>
          <Text3D font={FONT_URL} size={0.44} height={0.16} bevelEnabled bevelSize={0.012} bevelThickness={0.02} curveSegments={8} castShadow>
            {title}
            <meshStandardMaterial color={zone.tone} roughness={0.35} />
          </Text3D>
        </Center>
        {children}
      </group>
      {/* Standing spot on the path */}
      <mesh ref={ring} position={[zone.spotX, 0.05, zone.spotZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.25, 1.5, 48]} />
        <meshBasicMaterial color={GLOW(zone.tone, lit ? 2.4 : 1.2)} toneMapped={false} transparent opacity={0.95} />
      </mesh>
    </>
  );
}

function Sculpture({ index, tone }: { index: number; tone: string }) {
  const material = <meshStandardMaterial color={tone} roughness={0.15} metalness={0.25} emissive={tone} emissiveIntensity={0.35} />;
  switch (index % 5) {
    case 0: // Magnifier: search
      return (
        <group rotation={[0, 0, -0.5]}>
          <mesh castShadow>
            <torusGeometry args={[0.5, 0.11, 20, 48]} />
            {material}
          </mesh>
          <mesh position={[0, -0.95, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
            {material}
          </mesh>
        </group>
      );
    case 1: // Knot: collaboration
      return (
        <mesh castShadow>
          <torusKnotGeometry args={[0.45, 0.14, 160, 24]} />
          {material}
        </mesh>
      );
    case 2: // Podium: scores
      return (
        <group position={[0, -0.5, 0]}>
          {[0.6, 1.05, 0.8].map((height, bar) => (
            <mesh key={bar} position={[(bar - 1) * 0.46, height / 2, 0]} castShadow>
              <capsuleGeometry args={[0.17, height - 0.34, 8, 20]} />
              {material}
            </mesh>
          ))}
        </group>
      );
    case 3: // Clock: attendance
      return (
        <group>
          <mesh castShadow>
            <torusGeometry args={[0.55, 0.1, 20, 48]} />
            {material}
          </mesh>
          <mesh position={[0, 0.17, 0]}>
            <capsuleGeometry args={[0.05, 0.3, 6, 12]} />
            {material}
          </mesh>
          <mesh position={[0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.05, 0.2, 6, 12]} />
            {material}
          </mesh>
        </group>
      );
    default: // Compass: guidance
      return (
        <group rotation={[0, 0, 0.6]}>
          <mesh position={[0, 0.42, 0]} castShadow>
            <coneGeometry args={[0.26, 0.84, 32]} />
            {material}
          </mesh>
          <mesh position={[0, -0.42, 0]} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[0.26, 0.84, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
        </group>
      );
  }
}

function ProjectPavilion({ zone, index, reduced }: { zone: Zone; index: number; reduced: boolean }) {
  const project = projects.find(item => item.id === zone.projectId) ?? projects[0];
  const texture = useMemo(() => makeTexture(1024, 600, ctx => drawPoster(ctx, project, zone.tone, index)), [project, zone.tone, index]);
  return (
    <>
      {[-1.9, 1.9].map(x => (
        <mesh key={x} position={[x, 1.1, -0.4]} castShadow>
          <capsuleGeometry args={[0.13, 1.6, 8, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.2} />
        </mesh>
      ))}
      <group position={[0, 3.35, -0.4]} rotation={[-0.07, 0, 0]}>
        <RoundedBox args={[5.5, 3.4, 0.34]} radius={0.16} smoothness={6} castShadow>
          <meshStandardMaterial color="#141b2c" roughness={0.25} metalness={0.3} />
        </RoundedBox>
        <mesh position={[0, 0, 0.176]}>
          <planeGeometry args={[5.18, 3.04]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
      <Float speed={reduced ? 0 : 2} rotationIntensity={reduced ? 0 : 1.2} floatIntensity={reduced ? 0 : 1.4}>
        <group position={[0, 6.05, -0.4]}>
          <Sculpture index={index} tone={zone.tone} />
        </group>
      </Float>
    </>
  );
}

function AboutCourt({ zone }: { zone: Zone }) {
  const texture = useTexture("/charles.png");
  return (
    <>
      <mesh position={[0, 1, -0.5]} castShadow>
        <cylinderGeometry args={[0.5, 0.75, 1.3, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      <group position={[0, 3.65, -0.5]}>
        <mesh castShadow>
          <torusGeometry args={[2.1, 0.19, 24, 80]} />
          <meshStandardMaterial color="#f5c453" roughness={0.2} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0, -0.02]}>
          <circleGeometry args={[2.05, 64]} />
          <meshStandardMaterial color={zone.tone} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[2.0, 64]} />
          <meshBasicMaterial map={texture} transparent toneMapped={false} />
        </mesh>
      </group>
    </>
  );
}

const CRYSTALS = ["#22c3e6", "#8f7cf0", "#ff9d6c", "#3fc98a"];

function SkillGarden({ reduced }: { reduced: boolean }) {
  return (
    <>
      {CRYSTALS.map((color, index) => {
        const x = (index - 1.5) * 1.55;
        return (
          <group key={color} position={[x, 0.36, -0.3 - Math.abs(index - 1.5) * 0.25]}>
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.42, 0.52, 0.5, 32]} />
              <meshStandardMaterial color="#ffffff" roughness={0.4} />
            </mesh>
            <Float speed={reduced ? 0 : 1.6 + index * 0.3} rotationIntensity={reduced ? 0 : 0.6} floatIntensity={reduced ? 0 : 1}>
              <mesh position={[0, 2.2 + (index % 2) * 0.7, 0]} scale={[1, 1.75, 1]} castShadow>
                <octahedronGeometry args={[0.6, 0]} />
                <meshPhysicalMaterial color={color} roughness={0.05} metalness={0.1} clearcoat={1} emissive={color} emissiveIntensity={0.45} flatShading />
              </mesh>
              <mesh position={[0, 2.2 + (index % 2) * 0.7, 0]} rotation={[Math.PI / 2.4, 0, 0]}>
                <torusGeometry args={[0.95, 0.025, 8, 64]} />
                <meshBasicMaterial color={GLOW(color, 1.8)} toneMapped={false} />
              </mesh>
            </Float>
          </group>
        );
      })}
    </>
  );
}

function GraduateGate() {
  return (
    <>
      {[-2.1, 2.1].map(x => (
        <mesh key={x} position={[x, 1.6, -0.5]} castShadow>
          <cylinderGeometry args={[0.32, 0.38, 2.6, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 2.9, -0.5]} castShadow>
        <torusGeometry args={[2.1, 0.32, 24, 64, Math.PI]} />
        <meshStandardMaterial color="#f5b83d" roughness={0.25} metalness={0.5} />
      </mesh>
      {/* Mortarboard */}
      <group position={[0, 5.75, -0.5]} rotation={[0.12, 0.6, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.56, 0.42, 32]} />
          <meshStandardMaterial color="#1b2233" roughness={0.5} />
        </mesh>
        <RoundedBox args={[1.7, 0.1, 1.7]} radius={0.04} castShadow>
          <meshStandardMaterial color="#1b2233" roughness={0.5} />
        </RoundedBox>
        <mesh position={[0.75, -0.3, 0.75]}>
          <capsuleGeometry args={[0.05, 0.5, 6, 12]} />
          <meshStandardMaterial color="#f5b83d" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>
      {/* Diploma scroll */}
      <group position={[0, 1.7, -0.5]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.22, 0.22, 1.7, 32]} />
          <meshStandardMaterial color="#fffaf0" roughness={0.6} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.235, 0.235, 0.22, 32]} />
          <meshStandardMaterial color="#e85d75" roughness={0.4} />
        </mesh>
      </group>
    </>
  );
}

function BalloonDock({ zone, reduced }: { zone: Zone; reduced: boolean }) {
  return (
    <Float speed={reduced ? 0 : 1.4} rotationIntensity={reduced ? 0 : 0.25} floatIntensity={reduced ? 0 : 1.2} floatingRange={[0, 0.5]}>
      <group position={[0, 0.4, -0.4]}>
        <mesh position={[0, 5, 0]} scale={[1, 1.14, 1]} castShadow>
          <sphereGeometry args={[1.9, 48, 36]} />
          <meshStandardMaterial color={zone.tone} roughness={0.35} />
        </mesh>
        {[0.55, -0.35].map(y => (
          <mesh key={y} position={[0, 5 + y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[Math.sqrt(1.9 * 1.9 - (y / 1.14) * (y / 1.14)) + 0.02, 0.13, 12, 64]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 2.85, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.3, 0.5, 32, 1, true]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
        {[0, 1, 2, 3].map(rope => (
          <mesh key={rope} position={[Math.sin((rope * Math.PI) / 2 + 0.78) * 0.36, 2.15, Math.cos((rope * Math.PI) / 2 + 0.78) * 0.36]}>
            <cylinderGeometry args={[0.018, 0.018, 1.1, 6]} />
            <meshStandardMaterial color="#8a6a4f" />
          </mesh>
        ))}
        <RoundedBox args={[0.95, 0.75, 0.95]} radius={0.12} smoothness={5} position={[0, 1.25, 0]} castShadow>
          <meshStandardMaterial color="#c98b55" roughness={0.8} />
        </RoundedBox>
        {/* Envelope */}
        <group position={[1.9, 2.3, 0.8]} rotation={[0.2, -0.5, 0.2]}>
          <RoundedBox args={[1, 0.68, 0.07]} radius={0.03} castShadow>
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0.02, 0.04]}>
            <circleGeometry args={[0.1, 24]} />
            <meshBasicMaterial color={GLOW(zone.tone, 1.6)} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

/* ---------- scene ---------- */

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

function Effects({ lite }: { lite: boolean }) {
  if (lite) {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom mipmapBlur luminanceThreshold={1} intensity={0.6} radius={0.7} />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <N8AO aoRadius={1.8} intensity={2.4} distanceFalloff={1} quality="medium" halfRes />
      <Bloom mipmapBlur luminanceThreshold={1.1} intensity={0.5} radius={0.6} />
      <HueSaturation saturation={0.18} />
      <Vignette offset={0.3} darkness={0.38} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
    </EffectComposer>
  );
}

function World({ mode, active, near, reduced, onSelect, onNear, onReady }: SceneProps) {
  const lit = (id: string) => active === id || (!active && near === id);
  const titles: Record<string, string> = { about: "ABOUT", skills: "SKILLS", experience: "EXPERIENCE", contact: "CONTACT" };

  return (
    <>
      <CameraRig mode={mode} active={active} reduced={reduced} />
      <Sky />
      <fog attach="fog" args={["#cfeaff", 120, 380]} />
      <hemisphereLight args={["#dff0ff", "#8fcf7a", 0.4]} />
      <Sun />
      <Environment resolution={64} environmentIntensity={0.32}>
        <color attach="background" args={["#cfe9ff"]} />
        <Lightformer form="rect" intensity={3} position={[0, 12, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[30, 30, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[14, 4, 8]} rotation={[0, -Math.PI / 2, 0]} scale={[16, 8, 1]} color="#ffe2b8" />
        <Lightformer form="rect" intensity={1.2} position={[-14, 4, -8]} rotation={[0, Math.PI / 2, 0]} scale={[16, 8, 1]} color="#bfe0ff" />
      </Environment>

      <Clouds reduced={reduced} />
      <Island canWalk={mode === "explore" && !active} />
      <Scenery />
      <NameSign />

      {zones.map((zone, index) => (
        <Landmark key={zone.id} zone={zone} lit={lit(zone.id)} reduced={reduced} onSelect={onSelect} title={zone.kind === "project" ? zone.label.toUpperCase() : titles[zone.kind]}>
          {zone.kind === "project" && <ProjectPavilion zone={zone} index={index} reduced={reduced} />}
          {zone.kind === "about" && <AboutCourt zone={zone} />}
          {zone.kind === "skills" && <SkillGarden reduced={reduced} />}
          {zone.kind === "experience" && <GraduateGate />}
          {zone.kind === "contact" && <BalloonDock zone={zone} reduced={reduced} />}
        </Landmark>
      ))}

      <Player mode={mode} active={active} reduced={reduced} onNear={onNear} />
      {!reduced && <Sparkles count={60} scale={[50, 8, 50]} position={[0, 5, 0]} size={3} speed={0.3} opacity={0.5} color="#fff6c9" />}
      <Ready onReady={onReady} />
    </>
  );
}

export default function WorldScene(props: SceneProps & { lite: boolean }) {
  const { lite, ...scene } = props;
  return (
    <Canvas
      shadows
      dpr={lite ? [1, 1.25] : [1, 1.6]}
      camera={{ fov: 38, near: 0.5, far: 600, position: [40, 34, 60] }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      fallback={
        <p className="vo-fallback">
          This browser cannot draw the 3D world. <a href="/classic">Open the classic portfolio</a> instead.
        </p>
      }
    >
      <Suspense fallback={null}>
        <World {...scene} />
        <Effects lite={lite} />
      </Suspense>
    </Canvas>
  );
}
