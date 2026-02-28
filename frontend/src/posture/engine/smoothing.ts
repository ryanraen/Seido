import type { PoseLandmarks } from "../types";

export function smoothLandmarks(
  previous: PoseLandmarks | null,
  current: PoseLandmarks,
  alpha = 0.65,
): PoseLandmarks {
  if (!previous) return current;

  const out: PoseLandmarks = {};
  const keys = new Set([...Object.keys(previous), ...Object.keys(current)]);

  for (const key of keys) {
    const prev = previous[key as keyof PoseLandmarks];
    const cur = current[key as keyof PoseLandmarks];

    if (!cur && prev) {
      out[key as keyof PoseLandmarks] = prev;
      continue;
    }

    if (!cur) continue;
    if (!prev) {
      out[key as keyof PoseLandmarks] = cur;
      continue;
    }

    out[key as keyof PoseLandmarks] = {
      x: prev.x * alpha + cur.x * (1 - alpha),
      y: prev.y * alpha + cur.y * (1 - alpha),
      z: (prev.z ?? 0) * alpha + (cur.z ?? 0) * (1 - alpha),
      visibility:
        (prev.visibility ?? 1) * alpha + (cur.visibility ?? 1) * (1 - alpha),
    };
  }

  return out;
}
