export type Landmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

export type PoseLandmarks = Partial<Record<PoseLandmarkName, Landmark>>;

export type PoseLandmarkName =
  | "nose"
  | "leftShoulder"
  | "rightShoulder"
  | "leftElbow"
  | "rightElbow"
  | "leftWrist"
  | "rightWrist"
  | "leftHip"
  | "rightHip"
  | "leftKnee"
  | "rightKnee"
  | "leftAnkle"
  | "rightAnkle";

export type IssueSeverity = "info" | "warn" | "error";

export type PostureIssue = {
  id: string;
  message: string;
  severity: IssueSeverity;
  confidence: number;
};

export type PostureStatus = "good" | "adjust" | "bad";

export type PostureFrameResult = {
  timestamp: number;
  status: PostureStatus;
  score: number;
  issues: PostureIssue[];
  metrics: Record<string, number>;
};

export type ExerciseType =
  | "squat"
  | "forwardExtension"
  | "backExtension"
  | "plank"
  | "bridge";

export type PostureRuleContext = {
  exercise: ExerciseType;
  landmarks: PoseLandmarks;
  previous?: PostureFrameResult;
};

export type PostureRule = {
  id: string;
  evaluate: (ctx: PostureRuleContext) => PostureIssue | null;
};

export type ThresholdRange = {
  min: number;
  max: number;
};

export type ExerciseThresholds = {
  trunkAngle?: ThresholdRange;
  hipDrop?: ThresholdRange;
  kneeBend?: ThresholdRange;
  shoulderTilt?: ThresholdRange;
  bodyWidth?: ThresholdRange;
};

export type EngineConfig = {
  exercise: ExerciseType;
  scoreFloor?: number;
  smoothingAlpha?: number;
  visibilityThreshold?: number;
  thresholds?: Partial<Record<ExerciseType, ExerciseThresholds>>;
};

export type WorkerInputMessage = {
  type: "FRAME";
  payload: {
    timestamp: number;
    landmarks: PoseLandmarks;
  };
};

export type WorkerConfigMessage = {
  type: "CONFIG";
  payload: EngineConfig;
};

export type WorkerOutputMessage = {
  type: "RESULT";
  payload: PostureFrameResult;
};
