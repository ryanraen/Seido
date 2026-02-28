import type {
  ExerciseThresholds,
  ExerciseType,
  PoseLandmarks,
  PostureIssue,
} from "../types";
import { absDelta, angleAtPoint, lineAngle, midpoint } from "./math";

export const DEFAULT_THRESHOLDS: Record<ExerciseType, ExerciseThresholds> = {
  squat: {
    trunkAngle: { min: 70, max: 115 },
    kneeBend: { min: 70, max: 135 },
    shoulderTilt: { min: 0, max: 10 },
  },
  plank: {
    trunkAngle: { min: 165, max: 195 },
    hipDrop: { min: 0, max: 0.08 },
    shoulderTilt: { min: 0, max: 8 },
  },
  bridge: {
    trunkAngle: { min: 155, max: 200 },
    hipDrop: { min: 0, max: 0.09 },
    kneeBend: { min: 60, max: 130 },
  },
  birdDog: {
    trunkAngle: { min: 160, max: 200 },
    hipDrop: { min: 0, max: 0.1 },
    shoulderTilt: { min: 0, max: 12 },
  },
  deadBug: {
    trunkAngle: { min: 150, max: 200 },
    shoulderTilt: { min: 0, max: 10 },
    hipDrop: { min: 0, max: 0.12 },
  },
};

export type ComputedMetrics = {
  trunkAngle: number;
  leftKneeAngle: number;
  rightKneeAngle: number;
  kneeBendMean: number;
  shoulderTilt: number;
  hipDelta: number;
};

export function computeMetrics(landmarks: PoseLandmarks): ComputedMetrics | null {
  const ls = landmarks.leftShoulder;
  const rs = landmarks.rightShoulder;
  const lh = landmarks.leftHip;
  const rh = landmarks.rightHip;
  const lk = landmarks.leftKnee;
  const rk = landmarks.rightKnee;
  const la = landmarks.leftAnkle;
  const ra = landmarks.rightAnkle;

  if (!ls || !rs || !lh || !rh || !lk || !rk || !la || !ra) return null;

  const shoulderMid = midpoint(ls, rs);
  const hipMid = midpoint(lh, rh);

  const trunkAngle = Math.abs(lineAngle(hipMid, shoulderMid));
  const leftKneeAngle = angleAtPoint(lh, lk, la);
  const rightKneeAngle = angleAtPoint(rh, rk, ra);
  const kneeBendMean = (leftKneeAngle + rightKneeAngle) / 2;
  const shoulderTilt = absDelta(ls.y, rs.y) * 100;
  const hipDelta = absDelta(lh.y, rh.y);

  return {
    trunkAngle,
    leftKneeAngle,
    rightKneeAngle,
    kneeBendMean,
    shoulderTilt,
    hipDelta,
  };
}

export function evaluateIssues(
  exercise: ExerciseType,
  metrics: ComputedMetrics,
  thresholds: ExerciseThresholds,
): PostureIssue[] {
  const issues: PostureIssue[] = [];

  if (thresholds.trunkAngle) {
    if (
      metrics.trunkAngle < thresholds.trunkAngle.min ||
      metrics.trunkAngle > thresholds.trunkAngle.max
    ) {
      issues.push({
        id: "trunk-angle",
        message: trunkMessage(exercise),
        severity: "warn",
        confidence: 0.8,
      });
    }
  }

  if (thresholds.kneeBend) {
    if (
      metrics.kneeBendMean < thresholds.kneeBend.min ||
      metrics.kneeBendMean > thresholds.kneeBend.max
    ) {
      issues.push({
        id: "knee-bend",
        message: "Adjust knee bend to stay in a safe range.",
        severity: "warn",
        confidence: 0.75,
      });
    }
  }

  if (thresholds.shoulderTilt) {
    if (
      metrics.shoulderTilt < thresholds.shoulderTilt.min ||
      metrics.shoulderTilt > thresholds.shoulderTilt.max
    ) {
      issues.push({
        id: "shoulder-tilt",
        message: "Keep shoulders level.",
        severity: "info",
        confidence: 0.7,
      });
    }
  }

  if (thresholds.hipDrop) {
    if (metrics.hipDelta > thresholds.hipDrop.max) {
      issues.push({
        id: "hip-drop",
        message: "Keep hips square and steady.",
        severity: "error",
        confidence: 0.85,
      });
    }
  }

  return issues;
}

function trunkMessage(exercise: ExerciseType): string {
  switch (exercise) {
    case "squat":
      return "Keep your chest up and spine neutral.";
    case "plank":
      return "Keep your back straight from shoulders to hips.";
    case "bridge":
      return "Drive through the hips and avoid over-arching your back.";
    case "birdDog":
      return "Brace your core and keep your torso aligned.";
    case "deadBug":
      return "Keep your lower back controlled against the floor.";
    default:
      return "Maintain neutral trunk alignment.";
  }
}
