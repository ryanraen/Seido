// hooks/useVapi.ts
import { useEffect, useRef, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { getRuntimeConfig } from "@/lib/runtimeConfig";

type OrbMode = "idle" | "listening" | "talking";
type CallState = "idle" | "connecting" | "active" | "speaking" | "listening" | "ending";

// Map Vapi call states -> orb modes
const STATE_TO_MODE: Record<CallState, OrbMode> = {
  idle: "idle",
  connecting: "listening",
  active: "listening",
  speaking: "talking",
  listening: "listening",
  ending: "idle",
};

export function useVapi() {
  const runtime = getRuntimeConfig();
  const vapiPublicKey = runtime.vapiPublicKey;
  const assistantIdDefault = runtime.vapiAssistantIdDefault;
  const assistantIdBackpain = runtime.vapiAssistantIdBackpain;

  const vapiRef = useRef<Vapi | null>(null);

  const [callState, setCallState] = useState<CallState>("idle");
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!vapiPublicKey) {
      setError("Missing Vapi public key. Open API Settings.");
      return;
    }

    const vapi = new Vapi(vapiPublicKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => setCallState("active"));
    vapi.on("call-end", () => setCallState("idle"));
    vapi.on("speech-start", () => setCallState("speaking"));
    vapi.on("speech-end", () => setCallState("listening"));

    vapi.on("message", (msg: any) => {
      if (msg.type === "transcript") {
        const role = typeof msg.role === "string" ? msg.role : "assistant";
        const text = typeof msg.transcript === "string" ? msg.transcript.trim() : "";
        if (!text) return;

        setTranscript((prev) =>
          upsertTranscriptMessage(prev, {
            role,
            text,
            transcriptType: msg.transcriptType,
          }),
        );
      }
      if (msg.type === "end-of-call-report") {
        setAssessmentResult(msg.analysis?.structuredData ?? null);
      }
    });

    vapi.on("error", (err: any) => {
      setError(err?.message ?? "Something went wrong");
      setCallState("idle");
    });

    return () => {
      vapi.stop();
    };
  }, [vapiPublicKey]);

  const startCall = useCallback(
    async (assistantId?: string) => {
      setCallState("connecting");
      setTranscript([]);
      setAssessmentResult(null);
      setError(null);
      try {
        const targetAssistant = assistantId ?? assistantIdDefault;
        if (!targetAssistant) {
          throw new Error("Missing Vapi assistant ID. Open API Settings.");
        }
        await vapiRef.current?.start(targetAssistant);
      } catch (err: any) {
        setError(err?.message ?? "Failed to start voice session");
        setCallState("idle");
      }
    },
    [assistantIdDefault],
  );

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

  const canSpeak =
    callState === "active" || callState === "listening" || callState === "speaking";
  const speak = useCallback(
    (message: string) => {
      if (!message.trim()) return;
      if (!canSpeak) return;
      vapiRef.current?.say(message);
    },
    [canSpeak],
  );

  return {
    orbMode: STATE_TO_MODE[callState],
    callState,
    transcript,
    assessmentResult,
    error,
    isMuted,
    isActive: callState !== "idle",
    isConnected: canSpeak,
    startCall,
    assistantIdDefault,
    assistantIdBackpain,
    endCall,
    toggleMute,
    speak,
  };
}

function upsertTranscriptMessage(
  previous: { role: string; text: string }[],
  nextMessage: { role: string; text: string; transcriptType?: string },
): { role: string; text: string }[] {
  const next = [...previous];
  const last = next[next.length - 1];
  const isFinal = nextMessage.transcriptType === "final";
  const nextRole = normalizeRole(nextMessage.role);
  const nextText = normalizeTranscriptText(nextMessage.text);
  const sameRoleAsLast = Boolean(last) && normalizeRole(last.role) === nextRole;

  // Late/replayed events can arrive out of order; skip near-duplicate same-role content.
  const mostRecentSameRole = [...next]
    .reverse()
    .find((entry) => normalizeRole(entry.role) === nextRole);
  if (mostRecentSameRole) {
    const recentText = normalizeTranscriptText(mostRecentSameRole.text);
    const duplicateText =
      recentText === nextText ||
      recentText.startsWith(nextText) ||
      nextText.startsWith(recentText);
    if (duplicateText) {
      // Keep the longer/more complete version when possible.
      if (sameRoleAsLast && nextMessage.text.length > (last?.text.length ?? 0)) {
        next[next.length - 1] = { role: nextMessage.role, text: nextMessage.text };
        return next;
      }
      return previous;
    }
  }

  if (sameRoleAsLast) {
    if (last.text === nextMessage.text) return previous;
    next[next.length - 1] = { role: nextMessage.role, text: nextMessage.text };
    return next;
  }

  if (!isFinal && last && normalizeRole(last.role) !== normalizeRole(nextMessage.role)) {
    next.push({ role: nextMessage.role, text: nextMessage.text });
    return next;
  }

  next.push({ role: nextMessage.role, text: nextMessage.text });
  return next;
}

function normalizeRole(role: string): string {
  return role.toLowerCase().trim();
}

function normalizeTranscriptText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9'\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
