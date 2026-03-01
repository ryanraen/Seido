export type NormalizedLandmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

type PoseLandmarkerResult = {
  landmarks: NormalizedLandmark[][];
};

type PoseLandmarker = {
  detectForVideo: (video: HTMLVideoElement, timestampMs: number) => PoseLandmarkerResult;
};

type TasksVisionModule = {
  FilesetResolver: {
    forVisionTasks: (wasmRoot: string) => Promise<unknown>;
  };
  PoseLandmarker: {
    createFromOptions: (
      vision: unknown,
      options: {
        baseOptions: { modelAssetPath: string };
        numPoses: number;
        runningMode: "VIDEO";
      },
    ) => Promise<PoseLandmarker>;
  };
};

let singleton: Promise<PoseLandmarker> | null = null;

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";

const TASKS_VISION_ESM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/+esm";

export async function getPoseLandmarker(): Promise<PoseLandmarker> {
  if (!singleton) {
    singleton = (async () => {
      const tasksVision = (await import(
        /* @vite-ignore */ TASKS_VISION_ESM_URL
      )) as TasksVisionModule;

      const vision = await tasksVision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
      );

      return tasksVision.PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
        },
        numPoses: 1,
        runningMode: "VIDEO",
      });
    })();
  }

  return singleton;
}

export function extractFirstPose(result: PoseLandmarkerResult): NormalizedLandmark[] | null {
  return result.landmarks[0] ?? null;
}
