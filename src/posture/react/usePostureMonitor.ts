import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPostureMonitor } from "../integration/createPostureMonitor";
import type {
  EngineConfig,
  PoseLandmarks,
  PostureFrameResult,
  PostureStatus,
} from "../types";

export type UsePostureMonitorOptions = {
  config: EngineConfig;
  useWorker?: boolean;
  workerUrl?: string;
};

export type UsePostureMonitorValue = {
  latestResult: PostureFrameResult | null;
  status: PostureStatus;
  score: number;
  issues: string[];
  processFrame: (timestamp: number, landmarks: PoseLandmarks) => void;
  updateConfig: (config: Partial<EngineConfig>) => void;
};

export function usePostureMonitor(
  options: UsePostureMonitorOptions,
): UsePostureMonitorValue {
  const [latestResult, setLatestResult] = useState<PostureFrameResult | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const monitorRef = useRef(
    createPostureMonitor({
      ...options,
      onResult: (result) => setLatestResult(result),
    }),
  );

  useEffect(() => {
    monitorRef.current.dispose();
    monitorRef.current = createPostureMonitor({
      ...optionsRef.current,
      onResult: (result) => setLatestResult(result),
    });

    return () => {
      monitorRef.current.dispose();
    };
  }, [options.config.exercise, options.useWorker, options.workerUrl]);

  useEffect(() => {
    monitorRef.current.updateConfig(options.config);
  }, [options.config]);

  const processFrame = useCallback((timestamp: number, landmarks: PoseLandmarks) => {
    monitorRef.current.processFrame(timestamp, landmarks);
  }, []);

  const updateConfig = useCallback((config: Partial<EngineConfig>) => {
    monitorRef.current.updateConfig(config);
  }, []);

  const value = useMemo<UsePostureMonitorValue>(() => {
    const status = latestResult?.status ?? "adjust";
    const score = latestResult?.score ?? 0;
    const issues = latestResult?.issues.map((i) => i.message) ?? [];

    return {
      latestResult,
      status,
      score,
      issues,
      processFrame,
      updateConfig,
    };
  }, [latestResult, processFrame, updateConfig]);

  return value;
}
