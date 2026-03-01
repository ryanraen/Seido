import type {
  EngineConfig,
  PoseLandmarks,
  PostureFrameResult,
  PostureIssue,
} from "../types";
import { smoothLandmarks } from "./smoothing";
import { computeMetrics, DEFAULT_THRESHOLDS, evaluateIssues } from "./rules";

const DEFAULT_CONFIG: Required<Pick<EngineConfig, "scoreFloor" | "smoothingAlpha" | "visibilityThreshold">> = {
  scoreFloor: 0,
  smoothingAlpha: 0.65,
  visibilityThreshold: 0.35,
};

export class PostureEngine {
  private config: EngineConfig;
  private previousLandmarks: PoseLandmarks | null = null;
  private previousResult: PostureFrameResult | undefined;

  constructor(config: EngineConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  updateConfig(nextConfig: Partial<EngineConfig>) {
    this.config = {
      ...this.config,
      ...nextConfig,
    };
  }

  processFrame(timestamp: number, rawLandmarks: PoseLandmarks): PostureFrameResult {
    const landmarks = smoothLandmarks(
      this.previousLandmarks,
      rawLandmarks,
      this.config.smoothingAlpha,
    );

    this.previousLandmarks = landmarks;

    if (!this.hasRequiredVisibility(landmarks)) {
      return this.buildResult(timestamp, 0.2, [
        {
          id: "low-visibility",
          message: "Keep at least one full body side visible to the camera.",
          severity: "warn",
          confidence: 0.95,
        },
      ]);
    }

    const metrics = computeMetrics(landmarks);

    if (!metrics) {
      return this.buildResult(timestamp, 0.2, [
        {
          id: "missing-landmarks",
          message: "Unable to detect enough joints. Adjust camera angle.",
          severity: "warn",
          confidence: 0.9,
        },
      ]);
    }

    const mergedThresholds = {
      ...DEFAULT_THRESHOLDS[this.config.exercise],
      ...this.config.thresholds?.[this.config.exercise],
    };

    const issues = evaluateIssues(this.config.exercise, metrics, mergedThresholds);
    const score = scoreFromIssues(issues, this.config.scoreFloor ?? 0);

    const result: PostureFrameResult = {
      timestamp,
      score,
      status: score >= 0.85 ? "good" : score >= 0.6 ? "adjust" : "bad",
      issues,
      metrics: {
        trunkAngle: metrics.trunkAngle,
        trunkLean: metrics.trunkLean,
        leftKneeAngle: metrics.leftKneeAngle,
        rightKneeAngle: metrics.rightKneeAngle,
        kneeBendMean: metrics.kneeBendMean,
        shoulderTilt: metrics.shoulderTilt,
        hipDelta: metrics.hipDelta,
        bodyWidth: metrics.bodyWidth,
      },
    };

    this.previousResult = result;
    return result;
  }

  private hasRequiredVisibility(landmarks: PoseLandmarks): boolean {
    const minimum = this.config.visibilityThreshold ?? DEFAULT_CONFIG.visibilityThreshold;
    const leftSideVisible = this.sideVisible(landmarks, minimum, "left");
    const rightSideVisible = this.sideVisible(landmarks, minimum, "right");

    return leftSideVisible || rightSideVisible;
  }

  private sideVisible(
    landmarks: PoseLandmarks,
    minimum: number,
    side: "left" | "right",
  ): boolean {
    const required = [
      `${side}Shoulder`,
      `${side}Hip`,
      `${side}Knee`,
      `${side}Ankle`,
    ] as const;

    return required.every((name) => {
      const lm = landmarks[name as keyof PoseLandmarks];
      return lm && (lm.visibility ?? 1) >= minimum;
    });
  }

  private buildResult(
    timestamp: number,
    score: number,
    issues: PostureIssue[],
  ): PostureFrameResult {
    const result: PostureFrameResult = {
      timestamp,
      status: score >= 0.85 ? "good" : score >= 0.6 ? "adjust" : "bad",
      score,
      issues,
      metrics: {},
    };

    this.previousResult = result;
    return result;
  }
}

function scoreFromIssues(issues: PostureIssue[], scoreFloor: number): number {
  if (issues.length === 0) return 1;

  let deduction = 0;

  for (const issue of issues) {
    if (issue.severity === "error") deduction += 0.35;
    else if (issue.severity === "warn") deduction += 0.2;
    else deduction += 0.1;
  }

  const score = 1 - deduction;
  return Math.max(scoreFloor, Math.min(1, score));
}
