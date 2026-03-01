import type {
  EngineConfig,
  PoseLandmarks,
  PostureFrameResult,
  WorkerConfigMessage,
  WorkerInputMessage,
  WorkerOutputMessage,
} from "../types";
import { PostureEngine } from "../engine/postureEngine";

export type PostureMonitorOptions = {
  config: EngineConfig;
  useWorker?: boolean;
  workerUrl?: string;
  onResult: (result: PostureFrameResult) => void;
};

export type PostureMonitor = {
  processFrame: (timestamp: number, landmarks: PoseLandmarks) => void;
  updateConfig: (config: Partial<EngineConfig>) => void;
  dispose: () => void;
};

export function createPostureMonitor(options: PostureMonitorOptions): PostureMonitor {
  if (options.useWorker && options.workerUrl) {
    return createWorkerMonitor(options);
  }

  const engine = new PostureEngine(options.config);

  return {
    processFrame: (timestamp, landmarks) => {
      const result = engine.processFrame(timestamp, landmarks);
      options.onResult(result);
    },
    updateConfig: (config) => {
      engine.updateConfig(config);
    },
    dispose: () => {
      // no-op for in-thread mode
    },
  };
}

function createWorkerMonitor(options: PostureMonitorOptions): PostureMonitor {
  const worker = new Worker(options.workerUrl as string, { type: "module" });
  let currentConfig = options.config;

  worker.onmessage = (event: MessageEvent<WorkerOutputMessage>) => {
    if (event.data.type === "RESULT") {
      options.onResult(event.data.payload);
    }
  };

  const configMessage: WorkerConfigMessage = {
    type: "CONFIG",
    payload: currentConfig,
  };

  worker.postMessage(configMessage);

  return {
    processFrame: (timestamp, landmarks) => {
      const message: WorkerInputMessage = {
        type: "FRAME",
        payload: { timestamp, landmarks },
      };
      worker.postMessage(message);
    },
    updateConfig: (config) => {
      currentConfig = {
        ...currentConfig,
        ...config,
      };
      const message: WorkerConfigMessage = {
        type: "CONFIG",
        payload: currentConfig,
      };
      worker.postMessage(message);
    },
    dispose: () => {
      worker.terminate();
    },
  };
}
