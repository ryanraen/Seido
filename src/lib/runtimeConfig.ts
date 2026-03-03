export type RuntimeConfig = {
  vapiPublicKey: string;
  vapiAssistantIdDefault: string;
  vapiAssistantIdBackpain: string;
  geminiApiKey: string;
  geminiModel: string;
};

const STORAGE_KEY = "seido.runtimeConfig.v1";

// Use user-provided values first, and fall back to env when missing.
export function getRuntimeConfig(): RuntimeConfig {
  const stored = readStoredConfig();
  const envDefault = readEnvConfig();

  const vapiPublicKey = stored.vapiPublicKey || envDefault.vapiPublicKey;
  const vapiAssistantIdDefault =
    stored.vapiAssistantIdDefault || envDefault.vapiAssistantIdDefault;
  const vapiAssistantIdBackpain =
    stored.vapiAssistantIdBackpain ||
    envDefault.vapiAssistantIdBackpain ||
    vapiAssistantIdDefault;
  const geminiApiKey = stored.geminiApiKey || envDefault.geminiApiKey;
  const geminiModel = stored.geminiModel || envDefault.geminiModel || "gemini-2.0-flash";

  return {
    vapiPublicKey,
    vapiAssistantIdDefault,
    vapiAssistantIdBackpain,
    geminiApiKey,
    geminiModel,
  };
}

export function saveRuntimeConfig(next: Partial<RuntimeConfig>) {
  const current = readStoredConfig();
  const merged: RuntimeConfig = {
    ...current,
    ...next,
    vapiAssistantIdBackpain:
      next.vapiAssistantIdBackpain?.trim() ||
      current.vapiAssistantIdBackpain ||
      next.vapiAssistantIdDefault?.trim() ||
      current.vapiAssistantIdDefault ||
      "",
    geminiModel:
      next.geminiModel?.trim() || current.geminiModel || "gemini-2.0-flash",
  };

  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

export function clearRuntimeConfig() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function isRuntimeConfigured() {
  const cfg = getRuntimeConfig();
  return Boolean(
    cfg.vapiPublicKey &&
      cfg.vapiAssistantIdDefault &&
      cfg.vapiAssistantIdBackpain &&
      cfg.geminiApiKey,
  );
}

function readStoredConfig(): RuntimeConfig {
  if (typeof window === "undefined") {
    return emptyConfig();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyConfig();
    const parsed = JSON.parse(raw) as Partial<RuntimeConfig>;
    return {
      vapiPublicKey: parsed.vapiPublicKey ?? "",
      vapiAssistantIdDefault: parsed.vapiAssistantIdDefault ?? "",
      vapiAssistantIdBackpain: parsed.vapiAssistantIdBackpain ?? "",
      geminiApiKey: parsed.geminiApiKey ?? "",
      geminiModel: parsed.geminiModel ?? "",
    };
  } catch {
    return emptyConfig();
  }
}

function readEnvConfig(): RuntimeConfig {
  return {
    vapiPublicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || "",
    vapiAssistantIdDefault: import.meta.env.VITE_VAPI_ASSISTANT_ID || "",
    vapiAssistantIdBackpain: import.meta.env.VITE_VAPI_ASSISTANT_ID_BACKPAIN || "",
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
    geminiModel: import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash",
  };
}

function emptyConfig(): RuntimeConfig {
  return {
    vapiPublicKey: "",
    vapiAssistantIdDefault: "",
    vapiAssistantIdBackpain: "",
    geminiApiKey: "",
    geminiModel: "",
  };
}
