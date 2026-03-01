import { PostureEngine } from "../engine/postureEngine";
import type {
  EngineConfig,
  WorkerConfigMessage,
  WorkerInputMessage,
  WorkerOutputMessage,
} from "../types";

let engine: PostureEngine | null = null;

self.onmessage = (
  event: MessageEvent<WorkerConfigMessage | WorkerInputMessage>,
) => {
  const { data } = event;

  if (data.type === "CONFIG") {
    const payload = data.payload as EngineConfig;
    if (engine) {
      engine.updateConfig(payload);
    } else {
      engine = new PostureEngine(payload);
    }
    return;
  }

  if (data.type === "FRAME" && engine) {
    const result = engine.processFrame(
      data.payload.timestamp,
      data.payload.landmarks,
    );

    const out: WorkerOutputMessage = {
      type: "RESULT",
      payload: result,
    };

    self.postMessage(out);
  }
};
