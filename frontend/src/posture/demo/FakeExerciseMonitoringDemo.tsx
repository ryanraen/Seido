import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { fromMediaPipePose } from "../integration/mediapipeAdapter";
import { usePostureMonitor } from "../react/usePostureMonitor";
import type { ExerciseType } from "../types";
import { makeDemoLandmarks, type DemoQuality } from "./mockLandmarks";
import {
  clearPoseOverlay,
  drawPoseOverlay,
  smoothPose,
} from "./poseOverlay";
import {
  extractFirstPose,
  getPoseLandmarker,
  type NormalizedLandmark,
} from "./poseLandmarker";

type DemoMode = "camera" | "fake";

const EXERCISES: { value: ExerciseType; label: string }[] = [
  { value: "squat", label: "squat" },
  { value: "forwardExtension", label: "forward extension" },
  { value: "backExtension", label: "back extension" },
  { value: "plank", label: "plank" },
  { value: "bridge", label: "bridge" },
];

export function FakeExerciseMonitoringDemo() {
  const [exercise, setExercise] = useState<ExerciseType>("plank");
  const [quality, setQuality] = useState<DemoQuality>("good");
  const [running, setRunning] = useState(true);
  const [mode, setMode] = useState<DemoMode>("camera");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const smoothedPoseRef = useRef<NormalizedLandmark[] | null>(null);

  useEffect(() => {
    const resizeOverlay = () => {
      const canvas = overlayRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width));
      canvas.height = Math.max(1, Math.round(rect.height));
    };

    resizeOverlay();
    window.addEventListener("resize", resizeOverlay);
    return () => {
      window.removeEventListener("resize", resizeOverlay);
    };
  }, []);

  const posture = usePostureMonitor({
    config: {
      exercise,
      smoothingAlpha: 0.6,
      visibilityThreshold: 0.35,
      scoreFloor: 0,
    },
  });

  useEffect(() => {
    if (mode !== "camera") return;

    let isMounted = true;

    async function setupCamera() {
      setCameraError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 720 },
            height: { ideal: 1280 },
            aspectRatio: { ideal: 9 / 16 },
            facingMode: "user",
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        const canvas = overlayRef.current;
        if (!video) return;

        video.srcObject = stream;
        await video.play();
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          canvas.width = Math.max(1, Math.round(rect.width));
          canvas.height = Math.max(1, Math.round(rect.height));
        }
        setCameraReady(true);
      } catch (error) {
        setCameraReady(false);
        setCameraError(
          error instanceof Error
            ? error.message
            : "Failed to access camera. Check browser permissions.",
        );
      }
    }

    setupCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      smoothedPoseRef.current = null;
      if (overlayRef.current) clearPoseOverlay(overlayRef.current);
      setCameraReady(false);
    };
  }, [mode]);

  useEffect(() => {
    if (!running || mode !== "fake") return;

    const timer = window.setInterval(() => {
      frameRef.current += 1;
      const landmarks = makeDemoLandmarks(quality, frameRef.current);
      posture.processFrame(Date.now(), landmarks);
    }, 100);

    return () => {
      window.clearInterval(timer);
    };
  }, [mode, quality, running, posture.processFrame]);

  useEffect(() => {
    if (!running || mode !== "camera" || !cameraReady) return;

    let cancelled = false;

    async function startLoop() {
      const detector = await getPoseLandmarker();
      if (cancelled) return;

      const tick = () => {
        const video = videoRef.current;
        const overlay = overlayRef.current;

        if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        const timestamp = performance.now();
        const detection = detector.detectForVideo(video, timestamp);
        const pose = extractFirstPose(detection);

        if (pose && overlay) {
          const smoothed = smoothPose(smoothedPoseRef.current, pose, 0.72);
          smoothedPoseRef.current = smoothed;
          drawPoseOverlay(
            overlay,
            smoothed,
            video.videoWidth || 1,
            video.videoHeight || 1,
          );
          posture.processFrame(Date.now(), fromMediaPipePose(smoothed));
        } else if (overlay) {
          smoothedPoseRef.current = null;
          clearPoseOverlay(overlay);
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    }

    startLoop().catch((error) => {
      setCameraError(
        error instanceof Error
          ? error.message
          : "Failed to initialize pose detector.",
      );
    });

    return () => {
      cancelled = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      smoothedPoseRef.current = null;
      if (overlayRef.current) clearPoseOverlay(overlayRef.current);
    };
  }, [cameraReady, mode, running, posture.processFrame]);

  const summary = useMemo(() => {
    const scorePercent = Math.round(posture.score * 100);
    const statusColor =
      posture.status === "good"
        ? "#0f9d58"
        : posture.status === "adjust"
          ? "#d97706"
          : "#dc2626";

    return { scorePercent, statusColor };
  }, [posture.score, posture.status]);

  const metrics = posture.latestResult?.metrics ?? {};

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>Posture Engine Demo (Camera + Fake)</h1>

      <section style={styles.controls}>
        <label style={styles.label}>
          Input mode
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as DemoMode)}
            style={styles.select}
          >
            <option value="camera">camera</option>
            <option value="fake">fake</option>
          </select>
        </label>

        <label style={styles.label}>
          Exercise
          <select
            value={exercise}
            onChange={(e) => setExercise(e.target.value as ExerciseType)}
            style={styles.select}
          >
            {EXERCISES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        {mode === "fake" && (
          <label style={styles.label}>
            Fake quality
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as DemoQuality)}
              style={styles.select}
            >
              <option value="good">good</option>
              <option value="adjust">adjust</option>
              <option value="bad">bad</option>
            </select>
          </label>
        )}

        <button onClick={() => setRunning((v) => !v)} style={styles.button}>
          {running ? "Pause stream" : "Resume stream"}
        </button>
      </section>

      {mode === "camera" && (
        <section style={styles.panel}>
          <h2 style={styles.subtitle}>Camera Feed</h2>
          <div style={styles.feedShell}>
            <video ref={videoRef} style={styles.video} muted playsInline />
            <canvas ref={overlayRef} style={styles.overlay} />
          </div>
          {cameraError && <p style={styles.error}>Camera error: {cameraError}</p>}
          {!cameraError && !cameraReady && <p>Waiting for camera permission...</p>}
        </section>
      )}

      <section style={styles.panel}>
        <p>
          Status: <strong style={{ color: summary.statusColor }}>{posture.status}</strong>
        </p>
        <p>
          Score: <strong>{summary.scorePercent}%</strong>
        </p>
      </section>

      <section style={styles.panel}>
        <h2 style={styles.subtitle}>Issues</h2>
        {posture.issues.length === 0 ? (
          <p>None</p>
        ) : (
          <ul>
            {posture.issues.map((issue, index) => (
              <li key={`${issue}-${index}`}>{issue}</li>
            ))}
          </ul>
        )}
      </section>

      <section style={styles.panel}>
        <h2 style={styles.subtitle}>Metrics</h2>
        <pre style={styles.pre}>{JSON.stringify(metrics, null, 2)}</pre>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    margin: "0 auto",
    maxWidth: "900px",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    lineHeight: 1.4,
    padding: "24px",
  },
  title: {
    fontSize: "1.8rem",
    marginBottom: "16px",
  },
  subtitle: {
    fontSize: "1.1rem",
    marginBottom: "8px",
  },
  controls: {
    alignItems: "end",
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "16px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontSize: "0.95rem",
    gap: "6px",
  },
  select: {
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "0.95rem",
    padding: "8px 10px",
  },
  button: {
    background: "#0f172a",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.95rem",
    height: "38px",
    padding: "0 14px",
  },
  panel: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    marginBottom: "12px",
    padding: "12px 14px",
  },
  video: {
    background: "#020617",
    borderRadius: "8px",
    display: "block",
    height: "100%",
    objectFit: "contain",
    width: "100%",
  },
  feedShell: {
    background: "#020617",
    borderRadius: "8px",
    height: "640px",
    maxWidth: "100%",
    overflow: "hidden",
    position: "relative",
    width: "360px",
  },
  overlay: {
    height: "100%",
    left: 0,
    pointerEvents: "none",
    position: "absolute",
    top: 0,
    width: "100%",
  },
  pre: {
    background: "#f8fafc",
    borderRadius: "6px",
    fontSize: "0.85rem",
    overflowX: "auto",
    padding: "10px",
  },
  error: {
    color: "#b91c1c",
    marginTop: "8px",
  },
};
