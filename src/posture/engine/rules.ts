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
    bodyWidth: { min: 0, max: 0.11 },
  },
  plank: {
    trunkAngle: { min: 165, max: 195 },
    hipDrop: { min: 0, max: 0.08 },
    shoulderTilt: { min: 0, max: 8 },
    bodyWidth: { min: 0, max: 0.11 },
  },
  forwardExtension: {
    trunkAngle: { min: 70, max: 180},
    hipDrop: { min: 0, max: 0.08 },
    shoulderTilt: { min: 0, max: 10 },
    bodyWidth: { min: 0, max: 0.11 },
  },
  backExtension: {
    trunkAngle: { min: -180, max: -20 },
    hipDrop: { min: 0, max: 0.09 },
    shoulderTilt: { min: 0, max: 10 },
    bodyWidth: { min: 0, max: 0.11 },
  },
  bridge: {
    trunkAngle: { min: 155, max: 200 },
    hipDrop: { min: 0, max: 0.09 },
    kneeBend: { min: 60, max: 130 },
    bodyWidth: { min: 0, max: 0.11 },
  },
};

export type ComputedMetrics = {
  trunkAngle: number;
  trunkLean: number;
  leftKneeAngle: number;
  rightKneeAngle: number;
  kneeBendMean: number;
  shoulderTilt: number;
  hipDelta: number;
  bodyWidth: number;
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

  const hasLeftSide = Boolean(ls && lh && lk && la);
  const hasRightSide = Boolean(rs && rh && rk && ra);

  if (!hasLeftSide && !hasRightSide) return null;

  const trunkAngle = computeTrunkAngle({
    ls,
    rs,
    lh,
    rh,
    hasLeftSide,
    hasRightSide,
  });
  const trunkLean = computeSignedTrunkLean({
    nose: landmarks.nose,
    ls,
    rs,
    lh,
    rh,
    hasLeftSide,
    hasRightSide,
  });

  const leftKneeAngle = hasLeftSide ? angleAtPoint(lh!, lk!, la!) : NaN;
  const rightKneeAngle = hasRightSide ? angleAtPoint(rh!, rk!, ra!) : NaN;
  const fallbackKnee = Number.isFinite(leftKneeAngle)
    ? leftKneeAngle
    : Number.isFinite(rightKneeAngle)
      ? rightKneeAngle
      : 0;
  const normalizedLeftKnee = Number.isFinite(leftKneeAngle) ? leftKneeAngle : fallbackKnee;
  const normalizedRightKnee = Number.isFinite(rightKneeAngle) ? rightKneeAngle : fallbackKnee;
  const kneeBendMean = (normalizedLeftKnee + normalizedRightKnee) / 2;
  const shoulderTilt = ls && rs ? absDelta(ls.y, rs.y) * 100 : 0;
  const hipDelta = lh && rh ? absDelta(lh.y, rh.y) : 0;
  const bodyWidth = computeBodyWidth(ls, rs, lh, rh);

  return {
    trunkAngle,
    trunkLean,
    leftKneeAngle: normalizedLeftKnee,
    rightKneeAngle: normalizedRightKnee,
    kneeBendMean,
    shoulderTilt,
    hipDelta,
    bodyWidth,
  };
}

function computeBodyWidth(
  ls?: PoseLandmarks["leftShoulder"],
  rs?: PoseLandmarks["rightShoulder"],
  lh?: PoseLandmarks["leftHip"],
  rh?: PoseLandmarks["rightHip"],
): number {
  const spans: number[] = [];
  if (ls && rs) spans.push(absDelta(ls.x, rs.x));
  if (lh && rh) spans.push(absDelta(lh.x, rh.x));

  if (spans.length === 0) return 0;
  return spans.reduce((sum, span) => sum + span, 0) / spans.length;
}

function computeTrunkAngle(input: {
  ls?: PoseLandmarks["leftShoulder"];
  rs?: PoseLandmarks["rightShoulder"];
  lh?: PoseLandmarks["leftHip"];
  rh?: PoseLandmarks["rightHip"];
  hasLeftSide: boolean;
  hasRightSide: boolean;
}): number {
  const { ls, rs, lh, rh, hasLeftSide, hasRightSide } = input;

  if (ls && rs && lh && rh) {
    const shoulderMid = midpoint(ls, rs);
    const hipMid = midpoint(lh, rh);
    return Math.abs(lineAngle(hipMid, shoulderMid));
  }

  if (hasLeftSide && ls && lh) {
    return Math.abs(lineAngle(lh, ls));
  }

  if (hasRightSide && rs && rh) {
    return Math.abs(lineAngle(rh, rs));
  }

  return 0;
}

function computeSignedTrunkLean(input: {
  nose?: PoseLandmarks["nose"];
  ls?: PoseLandmarks["leftShoulder"];
  rs?: PoseLandmarks["rightShoulder"];
  lh?: PoseLandmarks["leftHip"];
  rh?: PoseLandmarks["rightHip"];
  hasLeftSide: boolean;
  hasRightSide: boolean;
}): number {
  const { nose, ls, rs, lh, rh, hasLeftSide, hasRightSide } = input;

  const shoulderRef =
    ls && rs
      ? midpoint(ls, rs)
      : hasLeftSide && ls
        ? ls
        : hasRightSide && rs
          ? rs
          : null;
  const hipRef =
    lh && rh
      ? midpoint(lh, rh)
      : hasLeftSide && lh
        ? lh
        : hasRightSide && rh
          ? rh
          : null;

  if (!shoulderRef || !hipRef) return 0;

  const dx = shoulderRef.x - hipRef.x;
  const dy = shoulderRef.y - hipRef.y;
  if (dy === 0) return 0;

  const leanMagnitude = (Math.atan2(Math.abs(dx), Math.abs(dy)) * 180) / Math.PI;
  const torsoDirection = Math.sign(dx) || 1;
  const facingDirection = nose
    ? Math.sign(nose.x - shoulderRef.x) || torsoDirection
    : torsoDirection;

  return leanMagnitude * torsoDirection * facingDirection;
}

export function evaluateIssues(
  exercise: ExerciseType,
  metrics: ComputedMetrics,
  thresholds: ExerciseThresholds,
): PostureIssue[] {
  const issues: PostureIssue[] = [];

  if (thresholds.trunkAngle) {
    const trunkValue =
      exercise === "forwardExtension" || exercise === "backExtension"
        ? metrics.trunkLean
        : metrics.trunkAngle;

    if (
      trunkValue < thresholds.trunkAngle.min ||
      trunkValue > thresholds.trunkAngle.max
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

  if (thresholds.bodyWidth) {
    if (metrics.bodyWidth > thresholds.bodyWidth.max) {
      issues.push({
        id: "side-facing",
        message: "Turn sideways and keep your profile to the camera.",
        severity: "error",
        confidence: 0.9,
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
    case "forwardExtension":
      return "Extend forward with a neutral spine and controlled reach.";
    case "backExtension":
      return "Extend backward slowly and keep movement controlled.";
    default:
      return "Maintain neutral trunk alignment.";
  }
}
