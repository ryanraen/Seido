import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PulsingOrb from "@/components/ui/PulsingOrb";
import { useVapi } from "@/hooks/useVapi";
import { generateGeminiText } from "@/lib/gemini";
import jsPDF from "jspdf";
import { fromMediaPipePose } from "@/posture/integration/mediapipeAdapter";
import { usePostureMonitor } from "@/posture/react/usePostureMonitor";
import type { ExerciseType } from "@/posture/types";
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
  ArrowRight,
} from "lucide-react";
import botAvatar from "@/assets/pfpPic.png";

type Phase = "interview" | "movement" | "summary";
type MovementExerciseSnapshot = {
  exercise: ExerciseType;
  score: number;
  status: "good" | "adjust" | "bad";
  issues: string[];
};
type MovementSummary = {
  averageScore: number;
  exercises: MovementExerciseSnapshot[];
};

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

const MOVEMENT_EXERCISES: ExerciseType[] = [
  "squat",
  "forwardExtension",
  "backExtension",
];

const EXERCISE_LABELS: Record<ExerciseType, string> = {
  squat: "Squat",
  forwardExtension: "Forward Extension",
  backExtension: "Back Extension",
  plank: "Plank",
  bridge: "Bridge",
};

const HANDOFF_LINE =
  "Please step back until you fit in the box";
const SUMMARY_TRIGGER_LINE =
  "Take care of yourself";

const Session = () => {
  const [currentPhase, setCurrentPhase] = useState<Phase>("interview");
  const [hasVoiceHandoff, setHasVoiceHandoff] = useState(false);
  const [hasSummaryHandoff, setHasSummaryHandoff] = useState(false);
  const [movementSummary, setMovementSummary] = useState<MovementSummary | null>(null);
  const vapi = useVapi();
  const activeAssistantRef = useRef<string | null>(null);
  const requestedAssistantRef = useRef<string | null>(null);
  const isSwitchingAssistantRef = useRef(false);

  const goToNext = () => {
    if (currentPhase === "interview") setCurrentPhase("movement");
    else if (currentPhase === "movement") setCurrentPhase("summary");
  };

  useEffect(() => {
    const targetAssistant =
      currentPhase === "interview"
        ? vapi.assistantIdDefault
        : currentPhase === "movement"
          ? vapi.assistantIdBackpain
          : null;

    if (!targetAssistant) {
      if (activeAssistantRef.current) {
        vapi.endCall();
        activeAssistantRef.current = null;
        requestedAssistantRef.current = null;
        isSwitchingAssistantRef.current = false;
      }
      return;
    }
    if (activeAssistantRef.current === targetAssistant) return;
    if (requestedAssistantRef.current === targetAssistant) return;
    if (isSwitchingAssistantRef.current) return;

    let cancelled = false;
    requestedAssistantRef.current = targetAssistant;
    isSwitchingAssistantRef.current = true;

    const switchAssistant = async () => {
      try {
        if (
          activeAssistantRef.current &&
          activeAssistantRef.current !== targetAssistant
        ) {
          vapi.endCall();
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
        if (cancelled) return;
        await vapi.startCall(targetAssistant);
        if (!cancelled) {
          activeAssistantRef.current = targetAssistant;
        }
      } catch (error) {
        requestedAssistantRef.current = null;
        console.error("Failed to switch voice assistant", error);
      } finally {
        isSwitchingAssistantRef.current = false;
      }
    };

    switchAssistant();

    return () => {
      cancelled = true;
    };
  }, [
    currentPhase,
    vapi.startCall,
    vapi.endCall,
    vapi.assistantIdDefault,
    vapi.assistantIdBackpain,
  ]);

  useEffect(() => {
    return () => {
      requestedAssistantRef.current = null;
      isSwitchingAssistantRef.current = false;
      activeAssistantRef.current = null;
      vapi.endCall();
    };
  }, [vapi.endCall]);

  useEffect(() => {
    if (currentPhase !== "interview" || hasVoiceHandoff) return;
    if (vapi.transcript.length === 0) return;

    const latestAssistant = [...vapi.transcript]
      .reverse()
      .find((entry) => isAssistantRole(entry.role));
    if (!latestAssistant) return;

    const text = normalizeForMatch(latestAssistant.text);
    const handoffLine = normalizeForMatch(HANDOFF_LINE);
    const shouldHandoff = text.includes(handoffLine);

    if (!shouldHandoff) return;

    setHasVoiceHandoff(true);
    setCurrentPhase("movement");
  }, [currentPhase, hasVoiceHandoff, vapi.transcript]);

  useEffect(() => {
    if (currentPhase !== "movement" || hasSummaryHandoff) return;
    if (vapi.transcript.length === 0) return;

    const latestAssistant = [...vapi.transcript]
      .reverse()
      .find((entry) => isAssistantRole(entry.role));
    if (!latestAssistant) return;

    const text = normalizeForMatch(latestAssistant.text);
    const triggerLine = normalizeForMatch(SUMMARY_TRIGGER_LINE);
    const shouldHandoff = text.includes(triggerLine);

    if (!shouldHandoff) return;

    setHasSummaryHandoff(true);
    setCurrentPhase("summary");
  }, [currentPhase, hasSummaryHandoff, vapi.transcript]);

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

      {currentPhase === "interview" && (
        <InterviewPhase vapi={vapi} assistantId={vapi.assistantIdDefault} />
      )}
      {currentPhase === "movement" && (
        <MovementPhase
          vapi={vapi}
          assistantId={vapi.assistantIdBackpain}
          onSummaryReady={setMovementSummary}
        />
      )}
      {currentPhase === "summary" && (
        <SummaryPhase summary={movementSummary} />
      )}
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
  assistantId,
}: {
  vapi: ReturnType<typeof useVapi>;
  assistantId?: string;
}) => {
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [vapi.transcript.length, chatMessages.length]);
  const transcriptMessages = vapi.transcript
    .filter((entry) => typeof entry.text === "string" && entry.text.trim().length > 0)
    .map((entry) => ({
      from: isAssistantRole(entry.role) ? "ai" : "user",
      text: entry.text.trim(),
    }));

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
              className="absolute inset-0 h-full w-full object-contain"
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
            <div className="w-10 h-10 rounded-full overflow-hidden border border-terracotta/20 bg-terracotta-light">
              <img
                src={botAvatar}
                alt="Dr. AI Coach"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Dr. Hyde</p>
              <p className="text-xs text-success flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />{" "}
                {vapi.isActive ? "Session Live" : "Connecting"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="w-full flex justify-center">
              <PulsingOrb
                mode={vapi.isConnected ? vapi.orbMode : "idle"}
                size="sm"
                className="py-2"
                connected={vapi.isConnected}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="hero-outline"
                size="sm"
                onClick={() =>
                  vapi.isActive
                    ? vapi.endCall()
                    : assistantId && vapi.startCall(assistantId)
                }
              >
                {vapi.isActive ? "Stop Call" : "Start Call"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4" ref={chatScrollRef}>
          {transcriptMessages.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                Waiting for live transcript...
              </p>
            </div>
          ) : (
            transcriptMessages.map((msg, i) => (
              <div
                key={`${msg.from}-${i}-${msg.text.slice(0, 16)}`}
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
            ))
          )}
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
  assistantId,
  onSummaryReady,
}: {
  vapi: ReturnType<typeof useVapi>;
  assistantId?: string;
  onSummaryReady: (summary: MovementSummary) => void;
}) => {
  const [running, setRunning] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [successPopup, setSuccessPopup] = useState<string | null>(null);
  const [isRoutineComplete, setIsRoutineComplete] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const smoothedPoseRef = useRef<NormalizedLandmark[] | null>(null);
  const goodStreakRef = useRef(0);
  const lastAdviceAtRef = useRef(0);
  const lastTransitionAtRef = useRef(0);
  const lastExerciseAnnouncedRef = useRef<number | null>(null);
  const successPopupTimerRef = useRef<number | null>(null);
  const exerciseSnapshotsRef = useRef<Map<ExerciseType, MovementExerciseSnapshot>>(
    new Map(),
  );

  const currentExercise = MOVEMENT_EXERCISES[exerciseIndex];
  const currentExerciseLabel = EXERCISE_LABELS[currentExercise];

  const showSuccessPopup = (message: string, durationMs = 2800) => {
    setSuccessPopup(message);
    if (successPopupTimerRef.current !== null) {
      window.clearTimeout(successPopupTimerRef.current);
    }
    successPopupTimerRef.current = window.setTimeout(() => {
      setSuccessPopup(null);
      successPopupTimerRef.current = null;
    }, durationMs);
  };

  const posture = usePostureMonitor({
    config: {
      exercise: currentExercise,
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
    return () => {
      if (successPopupTimerRef.current !== null) {
        window.clearTimeout(successPopupTimerRef.current);
        successPopupTimerRef.current = null;
      }
    };
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
    if (!vapi.isActive) return;
    if (lastExerciseAnnouncedRef.current === exerciseIndex) return;

    setSuccessPopup(null);
    const total = MOVEMENT_EXERCISES.length;
    vapi.speak(
      `Exercise ${exerciseIndex + 1} of ${total}: ${currentExerciseLabel}. Hold steady and follow the on-screen guidance.`,
    );
    lastExerciseAnnouncedRef.current = exerciseIndex;
  }, [exerciseIndex, currentExerciseLabel, vapi.isActive, vapi.speak]);

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

  useEffect(() => {
    if (!running || !cameraReady || isRoutineComplete) return;
    const latest = posture.latestResult;
    if (!latest) return;

    const now = Date.now();
    const goodEnough = latest.status === "good" && latest.score >= 0.88;
    const visibilityIssueIds = new Set(["low-visibility", "missing-landmarks", "side-facing"]);
    const primaryFormIssue = latest.issues.find(
      (item) => !visibilityIssueIds.has(item.id),
    );
    const issue = primaryFormIssue?.message ?? null;

    if (goodEnough) {
      goodStreakRef.current += 1;
      if (goodStreakRef.current >= 18 && now - lastTransitionAtRef.current > 7000) {
        const nextIndex = exerciseIndex + 1;
        if (nextIndex < MOVEMENT_EXERCISES.length) {
          lastTransitionAtRef.current = now;
          goodStreakRef.current = 0;
          const nextLabel = EXERCISE_LABELS[MOVEMENT_EXERCISES[nextIndex]];
          const transitionMessage = `Great form on ${currentExerciseLabel}. Let's move to ${nextLabel}.`;
          showSuccessPopup(`Great form on ${currentExerciseLabel}!`);
          if (vapi.isActive) vapi.speak(transitionMessage);
          setExerciseIndex(nextIndex);
        } else {
          setIsRoutineComplete(true);
          const completionMessage =
            "Excellent work. You completed all exercises in this movement session.";
          showSuccessPopup("Excellent work. Routine complete.");
          if (vapi.isActive) vapi.speak(completionMessage);
        }
      }
      return;
    }

    goodStreakRef.current = 0;
    if (issue && now - lastAdviceAtRef.current > 8000) {
      const coaching = issue;
      lastAdviceAtRef.current = now;
      if (vapi.isActive) vapi.speak(coaching);
    }
  }, [
    posture.latestResult,
    running,
    cameraReady,
    isRoutineComplete,
    exerciseIndex,
    currentExerciseLabel,
    vapi.isActive,
    vapi.speak,
  ]);

  useEffect(() => {
    const latest = posture.latestResult;
    if (!latest) return;
    const issues = latest.issues.map((item) => item.message);
    exerciseSnapshotsRef.current.set(currentExercise, {
      exercise: currentExercise,
      score: Math.round((latest.score ?? 0) * 100),
      status: latest.status ?? "adjust",
      issues,
    });
  }, [posture.latestResult, currentExercise]);

  useEffect(() => {
    if (!isRoutineComplete) return;
    const snapshots = Array.from(exerciseSnapshotsRef.current.values());
    if (snapshots.length === 0) return;
    const averageScore = Math.round(
      snapshots.reduce((sum, item) => sum + item.score, 0) / snapshots.length,
    );
    onSummaryReady({ averageScore, exercises: snapshots });
  }, [isRoutineComplete, onSummaryReady]);

  const score = Math.round((posture.latestResult?.score ?? 0) * 100);
  const scoreBreakdown = useMemo(
    () => createScoreBreakdown(posture.latestResult?.metrics ?? {}, score),
    [posture.latestResult, score],
  );
  const tip =
    posture.issues[0] ?? "Keep your hips level with your shoulders for a better score.";
  const outOfFrameIssue = posture.latestResult?.issues.find(
    (issue) => issue.id === "low-visibility" || issue.id === "missing-landmarks",
  );
  const popupMessage = outOfFrameIssue?.message ?? successPopup;
  const popupToneClass = outOfFrameIssue
    ? "bg-destructive text-destructive-foreground border-destructive"
    : "bg-success text-success-foreground border-success";
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
              className="absolute inset-0 h-full w-full object-contain"
              muted
              playsInline
            />
            <canvas
              ref={overlayRef}
              className="absolute inset-0 h-full w-full pointer-events-none"
            />
            {popupMessage && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2">
                <div
                  className={`rounded-full border px-4 py-2 text-xs md:text-sm font-semibold shadow-lg whitespace-nowrap max-w-[90vw] truncate ${popupToneClass}`}
                  title={popupMessage}
                >
                  {popupMessage}
                </div>
              </div>
            )}
            <div className="absolute top-16 left-4 z-10 rounded-md bg-foreground/80 border border-border px-3 py-1">
              <p className="text-xs text-primary-foreground font-semibold">
                Exercise: {currentExerciseLabel} ({exerciseIndex + 1}/{MOVEMENT_EXERCISES.length})
              </p>
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
            <div className="w-10 h-10 rounded-full overflow-hidden border border-terracotta/20 bg-terracotta-light">
              <img
                src={botAvatar}
                alt="Dr. AI Coach"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Dr. Hyde</p>
              <p className="text-xs text-success flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />{" "}
                {vapi.isActive ? "Session Live" : "Connecting"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center gap-3">
            <PulsingOrb
              mode={vapi.isConnected ? vapi.orbMode : "idle"}
              size="xs"
              className="py-1"
              connected={vapi.isConnected}
            />
          <div className="flex items-center gap-2">
            <Button
              variant="hero-outline"
              size="sm"
              onClick={() =>
                vapi.isActive
                  ? vapi.endCall()
                  : assistantId && vapi.startCall(assistantId)
              }
            >
              {vapi.isActive ? "Stop Call" : "Start Call"}
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

function normalizeForMatch(value: string): string {
  if (typeof value !== "string") return "";
  return value
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9'\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isAssistantRole(role: unknown): boolean {
  if (typeof role !== "string") return false;
  const value = role.toLowerCase().trim();
  return value === "assistant" || value === "bot" || value === "ai";
}

const SummaryPhase = ({ summary }: { summary: MovementSummary | null }) => {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [planText, setPlanText] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [planPdfUrl, setPlanPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!summary) return;
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      setAiError(null);
      try {
        const prompt = [
          "You are a physiotherapy assistant. Analyze the posture screening summary and generate:",
          "1) Strengths (2-3 short bullets)",
          "2) Areas to improve (2-3 short bullets)",
          "3) A short recovery plan paragraph (2-4 sentences)",
          "",
          "Keep it concise, supportive, and non-diagnostic.",
          "",
          `Average score: ${summary.averageScore}`,
          "Exercise results:",
          ...summary.exercises.map((item) => {
            const issueText = item.issues.length ? item.issues.join("; ") : "No issues flagged.";
            return `- ${EXERCISE_LABELS[item.exercise]}: score ${item.score}, status ${item.status}, issues: ${issueText}`;
          }),
        ].join("\n");
        const text = await generateGeminiText({ prompt });
        if (!cancelled) setAiSummary(text);
      } catch (error) {
        if (!cancelled) {
          setAiError(error instanceof Error ? error.message : "Failed to generate summary.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [summary]);

  const handleGeneratePlan = async () => {
    setShowPlan(true);
    if (!summary || planText || planLoading) return;
    setPlanLoading(true);
    setPlanError(null);
    try {
      const defaults: Record<ExerciseType, MovementExerciseSnapshot> = {
        squat: {
          exercise: "squat",
          score: 65,
          status: "adjust",
          issues: ["No specific issues recorded."],
        },
        forwardExtension: {
          exercise: "forwardExtension",
          score: 65,
          status: "adjust",
          issues: ["No specific issues recorded."],
        },
        backExtension: {
          exercise: "backExtension",
          score: 65,
          status: "adjust",
          issues: ["No specific issues recorded."],
        },
        plank: {
          exercise: "plank",
          score: 65,
          status: "adjust",
          issues: ["No specific issues recorded."],
        },
        bridge: {
          exercise: "bridge",
          score: 65,
          status: "adjust",
          issues: ["No specific issues recorded."],
        },
      };

      const byExercise = new Map<ExerciseType, MovementExerciseSnapshot>();
      summary.exercises.forEach((item) => byExercise.set(item.exercise, item));

      const squat = byExercise.get("squat") ?? defaults.squat;
      const forwardBend = byExercise.get("forwardExtension") ?? defaults.forwardExtension;
      const backwardBend = byExercise.get("backExtension") ?? defaults.backExtension;

      const prompt = `
You are a clinical documentation assistant. Your job is to take structured posture scoring data from a PhysioAssist Phase 2 movement screening and write a professional recovery plan.

Return the plan in clean Markdown with headings and bullet points. Do not wrap the response in code fences.

Include these sections as Markdown headings:
1) Overview
2) Key Findings (by exercise)
3) Daily Mobility Routine
4) Strength & Stability
5) Form Cues
6) When to Seek Help

Rules:
- Use neutral, clinical language (no diagnosis).
- Keep it concise and practical.
- If an exercise has no issues, state that no concerns were noted.

Data:
${JSON.stringify(
  {
    overall_average: summary.averageScore,
    exercises: [
      squat,
      forwardBend,
      backwardBend,
    ],
  },
  null,
  2,
)}
`.trim();

      const raw = await generateGeminiText({ prompt });
      const cleaned = raw.replace(/```/g, "").trim();
      setPlanText(cleaned);
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : "Failed to generate plan.");
    } finally {
      setPlanLoading(false);
    }
  };

  useEffect(() => {
    if (!planText) {
      setPlanPdfUrl(null);
      return;
    }
    try {
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const margin = 48;
      const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
      const headingColor: [number, number, number] = [34, 139, 84];
      const bodyText = planText.replace(/```/g, "").trim();
      const lines = bodyText.split("\n");
      let cursorY = 64;

      const ensureSpace = (lineHeight: number) => {
        const pageHeight = doc.internal.pageSize.getHeight();
        if (cursorY + lineHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
      };

      lines.forEach((rawLine) => {
        const line = rawLine.trimEnd();
        if (!line) {
          cursorY += 8;
          return;
        }

        if (line.startsWith("#")) {
          const level = line.match(/^#+/)?.[0].length ?? 1;
          const text = line.replace(/^#+\s*/, "");
          doc.setFont("times", "bold");
          doc.setTextColor(...headingColor);
          doc.setFontSize(level === 1 ? 18 : level === 2 ? 14 : 12);
          ensureSpace(22);
          doc.text(text, margin, cursorY);
          cursorY += level === 1 ? 22 : 18;
          doc.setTextColor(0, 0, 0);
          doc.setFont("times", "normal");
          return;
        }

        const isBullet = line.startsWith("- ");
        const paragraph = isBullet ? `• ${line.slice(2)}` : line;
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        const wrapped = doc.splitTextToSize(paragraph, pageWidth);
        wrapped.forEach((segment: string) => {
          ensureSpace(14);
          doc.text(segment, margin, cursorY);
          cursorY += 14;
        });
      });

      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      setPlanPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (error) {
      console.error("Failed to render PDF", error);
    }
  }, [planText]);

  return (
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
            <span className="text-4xl font-bold text-foreground block">
              {summary ? summary.averageScore : "--"}
            </span>
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
            Summary
          </h3>
          {isLoading && (
            <p className="text-sm text-muted-foreground">Generating summary...</p>
          )}
          {aiError && (
            <p className="text-sm text-destructive">{aiError}</p>
          )}
          {!isLoading && !aiError && aiSummary && (
            <p className="text-sm text-foreground whitespace-pre-line">{aiSummary}</p>
          )}
          {!summary && !isLoading && (
            <p className="text-sm text-muted-foreground">
              Complete the movement assessment to generate your summary.
            </p>
          )}
        </div>

        <div className="bg-amber-soft-light rounded-2xl p-5 md:p-6 border-2 border-amber-soft/25 shadow-sm">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-soft/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-soft" />
            </div>
            Recovery Plan
          </h3>
          {isLoading && (
            <p className="text-sm text-muted-foreground">Generating recovery plan...</p>
          )}
          {aiError && (
            <p className="text-sm text-destructive">{aiError}</p>
          )}
          {!isLoading && !aiError && aiSummary && (
            <p className="text-sm text-foreground whitespace-pre-line">
              {aiSummary}
            </p>
          )}
          {!summary && !isLoading && (
            <p className="text-sm text-muted-foreground">
              Complete the movement assessment to generate your recovery plan.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        <Button variant="hero" size="lg" onClick={handleGeneratePlan}>
          View Recovery Plan
        </Button>
          <Link to="/">
            <Button variant="hero-outline" size="lg" className="w-full sm:w-auto">
              Return Home
            </Button>
          </Link>
        </div>
      </div>

      {showPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-border bg-warm-white shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border">
              <h3 className="text-lg font-serif text-foreground">Recovery Plan</h3>
              <Button variant="hero-outline" size="sm" onClick={() => setShowPlan(false)}>
                Close
              </Button>
            </div>
            <div className="px-6 py-4 overflow-y-auto">
              {planLoading && (
                <p className="text-sm text-muted-foreground">Generating recovery plan...</p>
              )}
              {planError && (
                <p className="text-sm text-destructive">{planError}</p>
              )}
              {!planLoading && !planError && planPdfUrl && (
                <iframe
                  title="Recovery Plan PDF"
                  src={planPdfUrl}
                  className="w-full h-[65vh] rounded-lg border border-border"
                />
              )}
              {!planLoading && !planError && planText && !planPdfUrl && (
                <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                  {planText}
                </div>
              )}
              {!summary && !planLoading && !planError && (
                <p className="text-sm text-muted-foreground">
                  Complete the movement assessment to generate your recovery plan.
                </p>
              )}
            </div>
            <div className="mt-auto px-6 py-4 border-t border-border flex justify-end">
              <Button variant="hero-outline" size="sm" onClick={() => window.print()}>
                Print
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default Session;
