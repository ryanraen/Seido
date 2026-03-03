import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { clearRuntimeConfig, getRuntimeConfig, saveRuntimeConfig } from "@/lib/runtimeConfig";

type Props = {
  onSaved: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
};

export default function ApiKeySettings({ onSaved, onCancel, showCancel = false }: Props) {
  const initial = getRuntimeConfig();
  const [vapiPublicKey, setVapiPublicKey] = useState(initial.vapiPublicKey);
  const [vapiAssistantIdDefault, setVapiAssistantIdDefault] = useState(
    initial.vapiAssistantIdDefault,
  );
  const [vapiAssistantIdBackpain, setVapiAssistantIdBackpain] = useState(
    initial.vapiAssistantIdBackpain,
  );
  const [geminiApiKey, setGeminiApiKey] = useState(initial.geminiApiKey);
  const [geminiModel, setGeminiModel] = useState(initial.geminiModel || "gemini-2.0-flash");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!vapiPublicKey.trim()) {
      setError("Vapi public key is required.");
      return;
    }
    if (!vapiAssistantIdDefault.trim()) {
      setError("Default Vapi assistant ID is required.");
      return;
    }
    if (!geminiApiKey.trim()) {
      setError("Gemini API key is required.");
      return;
    }

    saveRuntimeConfig({
      vapiPublicKey: vapiPublicKey.trim(),
      vapiAssistantIdDefault: vapiAssistantIdDefault.trim(),
      vapiAssistantIdBackpain: vapiAssistantIdBackpain.trim() || vapiAssistantIdDefault.trim(),
      geminiApiKey: geminiApiKey.trim(),
      geminiModel: geminiModel.trim() || "gemini-2.0-flash",
    });

    onSaved();
  };

  const onReset = () => {
    clearRuntimeConfig();
    window.location.reload();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="text-sm text-muted-foreground">
        All keys are stored in your browser local storage on this device only.
      </p>

      <Field label="Vapi Public Key">
        <input
          value={vapiPublicKey}
          onChange={(e) => setVapiPublicKey(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="vapi_public_key"
          autoComplete="off"
        />
      </Field>

      <Field label="Vapi Assistant ID (Default)">
        <input
          value={vapiAssistantIdDefault}
          onChange={(e) => setVapiAssistantIdDefault(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="assistant_id_default"
          autoComplete="off"
        />
      </Field>

      <Field label="Vapi Assistant ID (Movement)">
        <input
          value={vapiAssistantIdBackpain}
          onChange={(e) => setVapiAssistantIdBackpain(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="assistant_id_movement (optional)"
          autoComplete="off"
        />
      </Field>

      <Field label="Gemini API Key">
        <input
          type="password"
          value={geminiApiKey}
          onChange={(e) => setGeminiApiKey(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="AIza..."
          autoComplete="off"
        />
      </Field>

      <Field label="Gemini Model">
        <input
          value={geminiModel}
          onChange={(e) => setGeminiModel(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="gemini-2.0-flash"
          autoComplete="off"
        />
      </Field>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" variant="hero" size="sm">
          Save Keys
        </Button>
        {showCancel && onCancel && (
          <Button type="button" variant="hero-outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          Clear Saved Keys
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
