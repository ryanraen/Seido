import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PulsingOrb from "@/components/ui/PulsingOrb";
import { useVapi } from "@/hooks/useVapi";
import { fromMediaPipePose } from "@/posture/integration/mediapipeAdapter";
import { usePostureMonitor } from "@/posture/react/usePostureMonitor";
import {
  clearPoseOverlay,
  drawPoseOverlay,
  smoothPose,
} from "@/posture/demo/poseOverlay";
import {
  extractFirstPose,
  getPoseLandmarker,
  type NormalizedLandmark,
} from "@/posture/demo/poseLandmarker";
import {
  Leaf,
  LogOut,
  Send,
  Check,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Award,
  ArrowRight,
} from "lucide-react";

type Phase = "interview" | "movement" | "summary";

const phases = [
  { id: "interview" as Phase, label: "Interview", sublabel: "Initial Check" },
  { id: "movement" as Phase, label: "Movement Analysis", sublabel: "Analysis" },
  { id: "summary" as Phase, label: "Summary", sublabel: "Summary" },
];

const chatMessages = [
  {
    from: "ai",
    text: "Hi there! Before we start the plank analysis, how is your lower back feeling today on a scale of 1-10?",
  },
  { from: "user", text: "It feels okay, maybe a 3/10. Little stiff." },
  {
    from: "ai",
    text: "Noted. We will proceed gently. Please step back until you fit in the box.",
  },
];

const strengths = [
  "Excellent back alignment maintained throughout",
  "Steady breathing pattern observed",
  "Good shoulder positioning and stability",
  "Consistent form for majority of hold time",
];

const improvements = [
  "Hip tends to drop slightly after 20 seconds",
  "Core engagement could be more consistent",
  "Consider widening hand placement slightly",
];

type ScoreItem = {
  label: string;
  value: number;
  status: "good" | "moderate";
};

const Session = () => {
  const [currentPhase, setCurrentPhase] = useState<Phase>("interview");
  const vapi = useVapi();

  const goToNext = () => {
    if (currentPhase === "interview") setCurrentPhase("movement");
    else if (currentPhase === "movement") setCurrentPhase("summary");
  };

  useEffect(() => {
    if (currentPhase === "interview") {
      vapi.startCall(vapi.assistantIdDefault);
    } else if (currentPhase === "movement" || currentPhase === "summary") {
      vapi.startCall(vapi.assistantIdBackpain);
    }
    return () => {
      vapi.endCall();
    };
  }, [currentPhase, vapi.startCall, vapi.endCall, vapi.assistantIdDefault, vapi.assistantIdBackpain]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b-2 border-border bg-card flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold bg-peach/40 text-peach-foreground px-3 py-1 rounded-full uppercase tracking-wider border border-peach/60">
            Phase{" "}
            {currentPhase === "interview"
              ? 1
              : currentPhase === "movement"
                ? 2
                : 3}
          </span>
          <h1 className="text-lg md:text-xl font-serif text-foreground">
            {currentPhase === "interview"
              ? "The Interview & Setup"
              : currentPhase === "movement"
                ? "Movement Analysis"
                : "Session Summary"}
          </h1>
        </div>
        <Button
          variant="hero-outline"
          size="sm"
          onClick={goToNext}
          className={currentPhase === "summary" ? "hidden" : ""}
        >
          Next Phase <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {currentPhase === "interview" && <InterviewPhase vapi={vapi} />}
      {currentPhase === "movement" && <MovementPhase vapi={vapi} />}
      {currentPhase === "summary" && <SummaryPhase />}
    </div>
  );
};

const PhaseIndicator = ({ current }: { current: Phase }) => (
  <div className="p-5 md:p-6 space-y-1 flex flex-col h-full">
    <div className="flex items-center gap-2 mb-6">
      <div className="w-8 h-8 bg-sage rounded-full flex items-center justify-center">
        <Leaf className="w-4 h-4 text-primary" />
      </div>
      <span className="font-bold text-foreground">Rehabify</span>
    </div>
    {phases.map((phase, i) => {
      const isActive = phase.id === current;
      const isPast = phases.findIndex((p) => p.id === current) > i;
      return (
        <div key={phase.id}>
          <div className="flex items-start gap-3 py-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : isPast
                    ? "bg-sage-light text-sage border border-sage/30"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {isPast ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <div>
              <p
                className={`text-sm font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}
              >
                {phase.sublabel}
              </p>
              {isActive && (
                <p className="text-xs text-terracotta font-semibold">
                  In Progress
                </p>
              )}
            </div>
          </div>
          {i < phases.length - 1 && <div className="ml-4 w-px h-4 bg-border" />}
        </div>
      );
    })}
    <div className="mt-auto pt-8">
      <Link
        to="/"
        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 font-medium"
      >
        <LogOut className="w-4 h-4" /> Exit Session
      </Link>
    </div>
  </div>
);

const InterviewPhase = ({
  vapi,
}: {
  vapi: ReturnType<typeof useVapi>;
}) => {
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const smoothedPoseRef = useRef<NormalizedLandmark[] | null>(null);

  const posture = usePostureMonitor({
    config: {
      exercise: "plank",
      smoothingAlpha: 0.6,
      visibilityThreshold: 0.35,
      scoreFloor: 0,
    },
  });

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
    return () => window.removeEventListener("resize", resizeOverlay);
  }, []);

  useEffect(() => {
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
        if (!video) return;
        video.srcObject = stream;
        await video.play();
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
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      smoothedPoseRef.current = null;
      if (overlayRef.current) clearPoseOverlay(overlayRef.current);
      setCameraReady(false);
    };
  }, []);

  useEffect(() => {
    if (!cameraReady) return;

    let cancelled = false;

    async function startDetection() {
      const detector = await getPoseLandmarker();
      if (cancelled) return;

      const tick = () => {
        const video = videoRef.current;
        const overlay = overlayRef.current;

        if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        const detection = detector.detectForVideo(video, performance.now());
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

    startDetection().catch((error) => {
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
    };
  }, [cameraReady, posture.processFrame]);

  const issues = posture.latestResult?.issues ?? [];
  const poseDetected = Boolean(posture.latestResult);
  const inFrame = !issues.some((issue) => issue.id === "low-visibility" || issue.id === "missing-landmarks");
  const sideFacing = !issues.some((issue) => issue.id === "side-facing");
  const setupReady = cameraReady && poseDetected && inFrame && sideFacing;
  const needsFullBody = !inFrame || !sideFacing;
  const setupPrompt = cameraError
    ? `Camera error: ${cameraError}`
    : !cameraReady
      ? "Waiting for camera permission..."
      : needsFullBody
        ? "Keep at least one full body side visible to the camera."
        : null;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-57px)] md:h-[calc(100vh-65px)]">
      <div className="hidden md:flex w-56 border-r-2 border-border bg-card flex-col">
        <PhaseIndicator current="interview" />
      </div>

      <div className="md:hidden flex gap-2 p-3 bg-card border-b border-border overflow-x-auto">
        {phases.map((phase, i) => {
          const isActive = phase.id === "interview";
          return (
            <span
              key={phase.id}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {i + 1}. {phase.sublabel}
            </span>
          );
        })}
      </div>

      <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center bg-background">
        <div className="w-full max-w-3xl space-y-4">
          <div className="bg-foreground/95 rounded-2xl relative overflow-hidden shadow-xl h-[60vh] max-h-[680px] min-h-[460px]">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              playsInline
            />
            <canvas
              ref={overlayRef}
              className="absolute inset-0 h-full w-full pointer-events-none"
            />
            {setupPrompt && (
              <div className="absolute top-0 left-0 right-0 px-4 py-2 bg-foreground/70 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground font-medium">
                  {setupPrompt}
                </p>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-3 px-4 py-3 bg-foreground/70 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${cameraReady ? "bg-terracotta animate-pulse" : "bg-muted-foreground/60"}`} />
                <span className="text-xs text-muted-foreground font-medium">
                  {cameraReady ? "SETUP CHECK LIVE" : "CONNECTING CAMERA"}
                </span>
              </div>
              <span className={`text-xs font-semibold ${setupReady ? "text-success" : "text-muted-foreground"}`}>
                {setupReady ? "Setup Ready" : "Adjusting Setup"}
              </span>
            </div>
          </div>

        </div>
      </div>

      <div className="w-full md:w-80 border-t-2 md:border-t-0 md:border-l-2 border-border bg-card flex flex-col max-h-[40vh] md:max-h-none">
        <div className="p-3 md:p-4 border-b border-border bg-sage-light/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-terracotta-light flex items-center justify-center border border-terracotta/20">
              <Award className="w-5 h-5 text-terracotta" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Dr. AI Coach</p>
              <p className="text-xs text-success flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />{" "}
                {vapi.isActive ? "Session Live" : "Connecting"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="w-full flex justify-center">
              <PulsingOrb mode={vapi.orbMode} size="sm" className="py-2" />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="hero-outline"
                size="sm"
                onClick={vapi.endCall}
              >
                Stop Call
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.from === "ai" && (
                <div className="w-7 h-7 rounded-full bg-terracotta-light flex items-center justify-center mr-2 shrink-0 mt-1 border border-terracotta/20">
                  <span className="text-xs font-bold text-terracotta">AI</span>
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.from === "user"
                    ? "bg-peach/30 text-foreground rounded-br-sm border border-peach/40"
                    : "bg-sage-light text-foreground rounded-bl-sm border border-sage/20"
                }`}
              >
                {msg.text}
              </div>
              {msg.from === "user" && (
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center ml-2 shrink-0 mt-1">
                  <span className="text-xs font-bold text-primary-foreground">
                    Me
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 md:p-4 border-t border-border">
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2 border border-border">
            <input
              type="text"
              placeholder="Type your answer..."
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              readOnly
            />
            <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
              <Send className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MovementPhase = ({
  vapi,
}: {
  vapi: ReturnType<typeof useVapi>;
}) => {
  const [running, setRunning] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const smoothedPoseRef = useRef<NormalizedLandmark[] | null>(null);

  const posture = usePostureMonitor({
    config: {
      exercise: "plank",
      smoothingAlpha: 0.6,
      visibilityThreshold: 0.35,
      scoreFloor: 0,
    },
  });

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
    return () => window.removeEventListener("resize", resizeOverlay);
  }, []);

  useEffect(() => {
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
        if (!video) return;
        video.srcObject = stream;
        await video.play();
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
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      smoothedPoseRef.current = null;
      if (overlayRef.current) clearPoseOverlay(overlayRef.current);
      setCameraReady(false);
    };
  }, []);

  useEffect(() => {
    if (!running || !cameraReady) return;

    let cancelled = false;

    async function startDetection() {
      const detector = await getPoseLandmarker();
      if (cancelled) return;

      const tick = () => {
        const video = videoRef.current;
        const overlay = overlayRef.current;

        if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        const detection = detector.detectForVideo(video, performance.now());
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

    startDetection().catch((error) => {
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
    };
  }, [cameraReady, running, posture.processFrame]);

  const score = Math.round((posture.latestResult?.score ?? 0) * 100);
  const scoreBreakdown = useMemo(
    () => createScoreBreakdown(posture.latestResult?.metrics ?? {}, score),
    [posture.latestResult, score],
  );
  const tip =
    posture.issues[0] ?? "Keep your hips level with your shoulders for a better score.";
  const feedbackMessage =
    posture.issues[0] ??
    (cameraReady
      ? posture.status === "good"
        ? "Great form. Keep this alignment."
        : "Hold steady and maintain your alignment."
      : "Preparing movement analysis...");
  const feedbackToneClass =
    posture.status === "good"
      ? "bg-success text-success-foreground border-success"
      : posture.status === "bad"
        ? "bg-destructive text-destructive-foreground border-destructive"
        : "bg-amber-soft text-foreground border-amber-soft";
  const circumference = 2 * Math.PI * 52;
  const scoreArc = (circumference * score) / 100;

  return (
    <div className="flex flex-col md:flex-row md:items-stretch min-h-[calc(100vh-57px)] md:min-h-[calc(100vh-65px)]">
      <div className="hidden md:flex w-56 border-r-2 border-border bg-card flex-col self-stretch">
        <PhaseIndicator current="movement" />
      </div>

      <div className="md:hidden flex gap-2 p-3 bg-card border-b border-border overflow-x-auto">
        {phases.map((phase, i) => {
          const isActive = phase.id === "movement";
          return (
            <span
              key={phase.id}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {i + 1}. {phase.sublabel}
            </span>
          );
        })}
      </div>

      <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center bg-background">
        <div className="w-full max-w-3xl">
          <div className="bg-foreground/95 rounded-2xl relative overflow-hidden shadow-xl h-[70vh] max-h-[760px] min-h-[520px]">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              playsInline
            />
            <canvas
              ref={overlayRef}
              className="absolute inset-0 h-full w-full pointer-events-none"
            />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2">
              <div
                className={`rounded-full border px-4 py-2 text-xs md:text-sm font-semibold shadow-lg whitespace-nowrap max-w-[90vw] truncate ${feedbackToneClass}`}
                title={feedbackMessage}
              >
                {feedbackMessage}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-3 px-4 py-3 bg-foreground/70 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${running ? "bg-terracotta animate-pulse" : "bg-muted-foreground/60"}`} />
                <span className="text-xs text-muted-foreground font-medium">
                  {running ? "LIVE ANALYSIS" : "PAUSED"}
                </span>
              </div>
              <Button variant="hero-outline" size="sm" onClick={() => setRunning((value) => !value)}>
                {running ? "Pause" : "Resume"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-96 md:self-stretch border-t-2 md:border-t-0 md:border-l-2 border-border bg-card p-4 md:p-5">
        <div className="mb-4 rounded-lg border border-border bg-sage-light/30 p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-terracotta-light flex items-center justify-center border border-terracotta/20">
              <Award className="w-5 h-5 text-terracotta" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Dr. AI Coach</p>
              <p className="text-xs text-success flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />{" "}
                {vapi.isActive ? "Session Live" : "Connecting"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center gap-3">
            <PulsingOrb mode={vapi.orbMode} size="xs" className="py-1" />
            <div className="flex items-center gap-2">
              <Button
                variant="hero-outline"
                size="sm"
                onClick={vapi.endCall}
              >
                Stop Call
              </Button>
            </div>
          </div>
        </div>
        <h3 className="font-serif text-lg text-foreground mb-3">Posture Score</h3>

        <div className="flex flex-col items-center gap-2 mb-3">
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="hsl(var(--sage))"
                strokeWidth="8"
                strokeDasharray={`${scoreArc} ${Math.max(0, circumference - scoreArc)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-foreground">{score}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {scoreBreakdown.map((item) => (
            <div
              key={item.label}
              className="bg-background rounded-lg p-2 border border-border"
            >
              <div className="flex justify-between text-xs mb-1">
                <span className="text-foreground font-semibold">{item.label}</span>
                <span
                  className={
                    item.status === "good"
                      ? "text-sage font-bold"
                      : "text-amber-soft font-bold"
                  }
                >
                  {item.value}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${item.status === "good" ? "bg-sage" : "bg-amber-soft"}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SetupBadge = ({ label, ready }: { label: string; ready: boolean }) => (
  <div
    className={`rounded-lg border px-3 py-2 font-medium ${
      ready
        ? "border-success/30 bg-success-light text-success"
        : "border-border bg-muted text-muted-foreground"
    }`}
  >
    <span className="mr-1">{ready ? "✓" : "•"}</span>
    {label}
  </div>
);

function createScoreBreakdown(
  metrics: Record<string, number>,
  overallScore: number,
): ScoreItem[] {
  const trunkAlignment = scoreFromDelta(Math.abs(180 - (metrics.trunkAngle ?? 180)), 1.4);
  const hipPosition = scoreFromDelta((metrics.hipDelta ?? 0) * 1000, 1.7);
  const shoulderStability = scoreFromDelta(metrics.shoulderTilt ?? 0, 2.4);
  const coreControl = clampPercent(Math.round((overallScore + trunkAlignment) / 2));

  return [
    { label: "Back Alignment", value: trunkAlignment, status: statusFromScore(trunkAlignment) },
    { label: "Hip Position", value: hipPosition, status: statusFromScore(hipPosition) },
    {
      label: "Shoulder Stability",
      value: shoulderStability,
      status: statusFromScore(shoulderStability),
    },
    { label: "Core Engagement", value: coreControl, status: statusFromScore(coreControl) },
  ];
}

function scoreFromDelta(value: number, multiplier: number): number {
  return clampPercent(Math.round(100 - value * multiplier));
}

function statusFromScore(value: number): "good" | "moderate" {
  return value >= 80 ? "good" : "moderate";
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

const SummaryPhase = () => (
  <div className="flex flex-col md:flex-row min-h-[calc(100vh-65px)]">
    <div className="hidden md:flex w-56 border-r-2 border-border bg-card flex-col">
      <PhaseIndicator current="summary" />
    </div>

    <div className="md:hidden flex gap-2 p-3 bg-card border-b border-border overflow-x-auto">
      {phases.map((phase, i) => {
        const isActive = phase.id === "summary";
        return (
          <span
            key={phase.id}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {i + 1}. {phase.sublabel}
          </span>
        );
      })}
    </div>

    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-3xl w-full space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <p className="text-sm text-terracotta font-bold uppercase tracking-widest">
          Session Complete
        </p>
        <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-sage-light border-4 border-sage/30 mx-auto">
          <div className="text-center">
            <span className="text-4xl font-bold text-foreground block">82</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">
          Great effort! Here is your detailed breakdown.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
        <div className="bg-success-light rounded-2xl p-5 md:p-6 border-2 border-success/25 shadow-sm">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-success" />
            </div>
            What you did well
          </h3>
          <ul className="space-y-3">
            {strengths.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-soft-light rounded-2xl p-5 md:p-6 border-2 border-amber-soft/25 shadow-sm">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-soft/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-soft" />
            </div>
            Areas to improve
          </h3>
          <ul className="space-y-3">
            {improvements.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <ArrowRight className="w-4 h-4 text-amber-soft shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button variant="hero" size="lg">
            View Recovery Plan
          </Button>
          <Link to="/">
            <Button variant="hero-outline" size="lg" className="w-full sm:w-auto">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default Session;
