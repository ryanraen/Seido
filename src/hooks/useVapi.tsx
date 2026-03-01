// hooks/useVapi.ts
import { useEffect, useRef, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;
const VAPI_ASSISTANT_ID_BACKPAIN = import.meta.env.VITE_VAPI_ASSISTANT_ID_BACKPAIN;

type OrbMode = "idle" | "listening" | "talking";
type CallState = "idle" | "connecting" | "active" | "speaking" | "listening" | "ending";

// Map Vapi call states → your orb modes
const STATE_TO_MODE: Record<CallState, OrbMode> = {
  idle:       "idle",
  connecting: "listening",
  active:     "listening",
  speaking:   "talking",
  listening:  "listening",
  ending:     "idle",
};

export function useVapi() {
  const vapiRef = useRef<Vapi | null>(null);

  const [callState, setCallState]           = useState<CallState>("idle");
  const [transcript, setTranscript]         = useState<{ role: string; text: string }[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [error, setError]                   = useState<string | null>(null);
  const [isMuted, setIsMuted]               = useState(false);

  useEffect(() => {
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on("call-start",   () => setCallState("active"));
    vapi.on("call-end",     () => setCallState("idle"));
    vapi.on("speech-start", () => setCallState("speaking"));
    vapi.on("speech-end",   () => setCallState("listening"));

    vapi.on("message", (msg: any) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        setTranscript(prev => [...prev, {
          role: msg.role,
          text: msg.transcript,
        }]);
      }
      if (msg.type === "end-of-call-report") {
        setAssessmentResult(msg.analysis?.structuredData ?? null);
      }
    });

    vapi.on("error", (err: any) => {
      setError(err?.message ?? "Something went wrong");
      setCallState("idle");
    });

    return () => { vapi.stop(); };
  }, []);

  const startCall = useCallback(async (assistantId?: string) => {
    setCallState("connecting");
    setTranscript([]);
    setAssessmentResult(null);
    setError(null);
    try {
      await vapiRef.current?.start(assistantId ?? VAPI_ASSISTANT_ID);
    } catch (err: any) {
      setError(err?.message ?? "Failed to start voice session");
      setCallState("idle");
    }
  }, []);

  const endCall = useCallback(() => {
    setCallState("ending");
    vapiRef.current?.stop();
  }, []);

  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return;
    const next = !vapiRef.current.isMuted();
    vapiRef.current.setMuted(next);
    setIsMuted(next);
  }, []);

  const canSpeak = callState === "active" || callState === "listening" || callState === "speaking";
  const speak = useCallback(
    (message: string) => {
      if (!message.trim()) return;
      if (!canSpeak) return;
      vapiRef.current?.say(message);
    },
    [canSpeak],
  );

  return {
    orbMode: STATE_TO_MODE[callState],  // ← plug directly into <PulsingOrb mode={orbMode} />
    callState,
    transcript,
    assessmentResult,
    error,
    isMuted,
    isActive: callState !== "idle",
    isConnected: canSpeak,
    startCall,
    assistantIdDefault: VAPI_ASSISTANT_ID,
    assistantIdBackpain: VAPI_ASSISTANT_ID_BACKPAIN,
    endCall,
    toggleMute,
    speak,
  };
}
