/**
 * ollama-setup.ts
 * ───────────────────────────────────────────────────────────────
 * Ollama Detection & Guided Setup Service
 *
 * Responsibilities:
 *  1. Detect OS (windows | macos | linux)
 *  2. Check if Ollama is reachable (installed + service running)
 *  3. Check if a required model is available
 *  4. Determine compatibility
 *  5. Try to start Ollama automatically via companion service
 *  6. Provide install download URLs per platform
 *  7. Pull the default model with progress streaming
 *
 * This module is intentionally pure — it does not reference React
 * or any browser DOM APIs other than `fetch` and `navigator`.
 */

export type OllamaOS = 'windows' | 'macos' | 'linux';

/** All possible states the Ollama setup can be in */
export type OllamaSetupStatus =
  | 'checking'        // Initial lightweight probe in progress
  | 'ready'           // Ollama is up and selected model is installed
  | 'starting'        // Ollama is installed, trying to auto-start service
  | 'needs_install'   // Ollama is not installed
  | 'needs_model'     // Ollama is up but selected model not found
  | 'error';          // Unexpected / unrecoverable

export interface OllamaSetupState {
  status: OllamaSetupStatus;
  isOllamaReachable: boolean;
  isModelInstalled: boolean;
  detectedOS: OllamaOS;
  errorMessage?: string;
}

export const DEFAULT_MODEL = 'qwen2.5:3b';

// ─────────────────────────────────────────────────────────────────────────────
// OS Detection
// ─────────────────────────────────────────────────────────────────────────────

export function detectOS(): OllamaOS {
  if (typeof navigator === 'undefined') return 'linux';
  const ua = navigator.userAgent.toLowerCase();
  const plat: string =
    ((navigator as unknown as Record<string, unknown>).userAgentData as Record<string, string> | undefined)
      ?.platform?.toLowerCase() ||
    navigator.platform.toLowerCase();

  if (plat.includes('win') || ua.includes('windows')) return 'windows';
  if (plat.includes('mac') || ua.includes('macintosh') || ua.includes('mac os')) return 'macos';
  return 'linux';
}

// ─────────────────────────────────────────────────────────────────────────────
// Ollama reachability
// ─────────────────────────────────────────────────────────────────────────────

const OLLAMA_BASE = 'http://localhost:11434';
const COMPANION_BASE = 'http://localhost:8765';

export async function isOllamaReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Model check
// ─────────────────────────────────────────────────────────────────────────────

export async function isModelAvailable(modelTag: string): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return false;
    const data = await res.json();
    const models: Array<{ name: string; model?: string }> = data.models || [];
    const tag = modelTag.toLowerCase();
    return models.some(
      (m) =>
        (m.name || '').toLowerCase() === tag ||
        (m.model || '').toLowerCase() === tag ||
        (m.name || '').toLowerCase().startsWith(tag.split(':')[0])
    );
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-start via companion
// ─────────────────────────────────────────────────────────────────────────────

export async function tryAutoStartOllama(): Promise<boolean> {
  try {
    const res = await fetch(`${COMPANION_BASE}/ollama/start`, {
      method: 'POST',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    // Give the service a few seconds to come up
    await new Promise((r) => setTimeout(r, 3500));
    return isOllamaReachable();
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Download URL per OS
// ─────────────────────────────────────────────────────────────────────────────

export function getOllamaDownloadUrl(os: OllamaOS): string {
  switch (os) {
    case 'windows':
      return 'https://ollama.com/download/OllamaSetup.exe';
    case 'macos':
      return 'https://ollama.com/download/Ollama-darwin.zip';
    default:
      return 'https://ollama.com/download';
  }
}

/** Terminal install command shown to the user for reference */
export function getManualInstallCommand(os: OllamaOS): string {
  switch (os) {
    case 'windows':
      return '# Download OllamaSetup.exe from https://ollama.com/download\n# Then run it and restart DomoNote.';
    case 'macos':
      return 'curl -fsSL https://ollama.com/install.sh | sh\n# Or: brew install ollama';
    default:
      return 'curl -fsSL https://ollama.com/install.sh | sh';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Trigger browser download for non-Linux platforms
// ─────────────────────────────────────────────────────────────────────────────

export function triggerOllamaDownload(os: OllamaOS): void {
  if (os === 'linux') return; // Linux users must use the shell command
  const url = getOllamaDownloadUrl(os);
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─────────────────────────────────────────────────────────────────────────────
// Pull model with progress
// ─────────────────────────────────────────────────────────────────────────────

export interface ModelPullProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
  percent?: number;
}

export async function pullModelWithProgress(
  modelTag: string,
  onProgress?: (p: ModelPullProgress) => void,
  signal?: AbortSignal
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelTag, stream: true }),
      signal,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      return { success: false, message: `Ollama pull error (${res.status}): ${txt}` };
    }

    if (!res.body) {
      return { success: false, message: 'Streaming not supported in this browser.' };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          const percent =
            data.total && data.completed
              ? Math.min(100, Math.round((data.completed / data.total) * 100))
              : undefined;
          onProgress?.({
            status: data.status || 'Downloading...',
            digest: data.digest,
            total: data.total,
            completed: data.completed,
            percent,
          });
          if (data.error) return { success: false, message: data.error };
        } catch {
          /* ignore partial */
        }
      }
    }
    return { success: true, message: `Model "${modelTag}" ready.` };
  } catch (err: unknown) {
    if ((err as { name?: string }).name === 'AbortError') {
      return { success: false, message: 'Download cancelled.' };
    }
    return { success: false, message: (err as Error).message || `Failed to pull "${modelTag}".` };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Full setup probe
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run the full lightweight probe sequence:
 * 1. Check if Ollama is reachable
 * 2. If reachable, check if the default model is installed
 * 3. If not reachable, try to auto-start via companion
 * 4. Return the resulting OllamaSetupState
 */
export async function probeOllamaSetup(
  modelTag: string = DEFAULT_MODEL
): Promise<OllamaSetupState> {
  const detectedOS = detectOS();

  // Step 1: Is Ollama reachable?
  const reachable = await isOllamaReachable();

  if (reachable) {
    // Step 2: Is the model installed?
    const modelReady = await isModelAvailable(modelTag);
    return {
      status: modelReady ? 'ready' : 'needs_model',
      isOllamaReachable: true,
      isModelInstalled: modelReady,
      detectedOS,
    };
  }

  // Step 3: Try auto-start via companion
  const started = await tryAutoStartOllama();
  if (started) {
    const modelReady = await isModelAvailable(modelTag);
    return {
      status: modelReady ? 'ready' : 'needs_model',
      isOllamaReachable: true,
      isModelInstalled: modelReady,
      detectedOS,
    };
  }

  // Not reachable — we can't tell if it's installed or just not running
  // from a browser context. Present the install flow.
  return {
    status: 'needs_install',
    isOllamaReachable: false,
    isModelInstalled: false,
    detectedOS,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Persistence helpers — avoid re-showing setup when everything is healthy
// ─────────────────────────────────────────────────────────────────────────────

const KEY_SETUP_DONE = 'domonote_ai_setup_done_v1';
const KEY_SETUP_MODEL = 'domonote_ai_setup_model';

export function markSetupComplete(modelTag: string): void {
  try {
    localStorage.setItem(KEY_SETUP_DONE, '1');
    localStorage.setItem(KEY_SETUP_MODEL, modelTag);
  } catch {}
}

export function wasSetupCompleted(modelTag: string): boolean {
  try {
    const done = localStorage.getItem(KEY_SETUP_DONE);
    const model = localStorage.getItem(KEY_SETUP_MODEL);
    return done === '1' && model === modelTag;
  } catch {
    return false;
  }
}

export function clearSetupState(): void {
  try {
    localStorage.removeItem(KEY_SETUP_DONE);
    localStorage.removeItem(KEY_SETUP_MODEL);
  } catch {}
}
