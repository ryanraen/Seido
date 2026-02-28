import type { Landmark } from "../types";

export function angleAtPoint(a: Landmark, b: Landmark, c: Landmark): number {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;

  const dot = abx * cbx + aby * cby;
  const magAB = Math.hypot(abx, aby);
  const magCB = Math.hypot(cbx, cby);

  if (magAB === 0 || magCB === 0) return 0;

  const cosTheta = clamp(dot / (magAB * magCB), -1, 1);
  return radiansToDegrees(Math.acos(cosTheta));
}

export function lineAngle(a: Landmark, b: Landmark): number {
  return radiansToDegrees(Math.atan2(b.y - a.y, b.x - a.x));
}

export function midpoint(a: Landmark, b: Landmark): Landmark {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: ((a.z ?? 0) + (b.z ?? 0)) / 2,
    visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1),
  };
}

export function absDelta(a: number, b: number): number {
  return Math.abs(a - b);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function radiansToDegrees(value: number): number {
  return (value * 180) / Math.PI;
}
