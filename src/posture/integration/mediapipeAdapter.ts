import type { PoseLandmarks } from "../types";

export type MediaPipeLandmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

export function fromMediaPipePose(
  landmarks: MediaPipeLandmark[],
): PoseLandmarks {
  return {
    nose: landmarks[0],
    leftShoulder: landmarks[11],
    rightShoulder: landmarks[12],
    leftElbow: landmarks[13],
    rightElbow: landmarks[14],
    leftWrist: landmarks[15],
    rightWrist: landmarks[16],
    leftHip: landmarks[23],
    rightHip: landmarks[24],
    leftKnee: landmarks[25],
    rightKnee: landmarks[26],
    leftAnkle: landmarks[27],
    rightAnkle: landmarks[28],
  };
}
