/**
 * Live input shared between the DOM controls (keyboard, joystick, menu) and the
 * 3D scene. It is read every frame, so it lives outside React state on purpose.
 */
export const input = {
  /** Steering from keys or joystick, each axis in [-1, 1]. */
  x: 0,
  z: 0,
  /** A point to travel to (click-to-move or fast travel). */
  target: null as null | { x: number; z: number; fast: boolean },
  jump: false,
};

export function resetInput() {
  input.x = 0;
  input.z = 0;
  input.target = null;
  input.jump = false;
}
