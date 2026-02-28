import type { PoseLandmarks } from "../types";

export type DemoQuality = "good" | "adjust" | "bad";

const BASE: PoseLandmarks = {
  nose: { x: 0.5, y: 0.2, visibility: 1 },
  leftShoulder: { x: 0.45, y: 0.35, visibility: 1 },
  rightShoulder: { x: 0.52, y: 0.35, visibility: 1 },
  leftElbow: { x: 0.4, y: 0.45, visibility: 1 },
  rightElbow: { x: 0.6, y: 0.45, visibility: 1 },
  leftWrist: { x: 0.38, y: 0.55, visibility: 1 },
  rightWrist: { x: 0.62, y: 0.55, visibility: 1 },
  leftHip: { x: 0.47, y: 0.6, visibility: 1 },
  rightHip: { x: 0.51, y: 0.6, visibility: 1 },
  leftKnee: { x: 0.46, y: 0.78, visibility: 1 },
  rightKnee: { x: 0.54, y: 0.78, visibility: 1 },
  leftAnkle: { x: 0.45, y: 0.95, visibility: 1 },
  rightAnkle: { x: 0.55, y: 0.95, visibility: 1 },
};

export function makeDemoLandmarks(
  quality: DemoQuality,
  frame: number,
): PoseLandmarks {
  const t = frame / 60;
  const bob = Math.sin(t * 3) * 0.01;
  const breath = Math.sin(t * 2) * 0.008;

  const clone: PoseLandmarks = {
    ...BASE,
    leftShoulder: { ...BASE.leftShoulder! },
    rightShoulder: { ...BASE.rightShoulder! },
    leftHip: { ...BASE.leftHip! },
    rightHip: { ...BASE.rightHip! },
    leftKnee: { ...BASE.leftKnee! },
    rightKnee: { ...BASE.rightKnee! },
    leftAnkle: { ...BASE.leftAnkle! },
    rightAnkle: { ...BASE.rightAnkle! },
  };

  clone.leftShoulder!.y += breath;
  clone.rightShoulder!.y += breath;
  clone.leftHip!.y += bob;
  clone.rightHip!.y += bob;

  if (quality === "adjust") {
    clone.rightShoulder!.y += 0.03;
    clone.rightHip!.y += 0.02;
  }

  if (quality === "bad") {
    clone.leftShoulder!.y -= 0.06;
    clone.rightShoulder!.y += 0.06;
    clone.leftHip!.y -= 0.07;
    clone.rightHip!.y += 0.07;
    clone.leftKnee!.x -= 0.08;
    clone.rightKnee!.x += 0.08;
  }

  return clone;
}
