/**
 * OllamaSetupFlow
 * ──────────────────────────────────────────────────────────────
 * Full-screen guided first-run flow that runs once on startup
 * when Ollama is not ready.
 *
 * States:
 *   checking      → Pulsing spinner "Checking Local AI…"
 *   ready         → Brief "AI Ready" flash (auto-dismisses)
 *   starting      → "Starting Local AI…" auto-attempt
 *   needs_install → "Install Ollama" CTA with platform instructions
 *   needs_model   → "Download Qwen 2.5 3B" with progress bar
 *   error         → Recovery options
 *
 * Design rules:
 *  - Never shown again once `ready` has been persisted (unless user repairs)
 *  - Does NOT block the app if the user explicitly continues without AI
 *  - Works cross-platform (Windows, macOS, Linux)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Cpu,
  CheckCircle,
  Loader2,
  Download,
  RefreshCw,
  Terminal,
  Shield,
  AlertTriangle,
  ChevronDown,
  Zap,
  Power,
  ExternalLink,
  X,
} from 'lucide-react';
import {
  type OllamaSetupStatus,
  type OllamaSetupState,
  type ModelPullProgress,
  DEFAULT_MODEL,
  detectOS,
  isOllamaReachable,
  isModelAvailable,
  tryAutoStartOllama,
  triggerOllamaDownload,
  getManualInstallCommand,
  pullModelWithProgress,
  probeOllamaSetup,
  markSetupComplete,
} from '../../services/ai/ollama-setup';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const StatusDot: React.FC<{ status: 'good' | 'warn' | 'idle' }> = ({ status }) => {
  const color =
    status === 'good'
      ? 'bg-emerald-400'
      : status === 'warn'
      ? 'bg-amber-400'
      : 'bg-zinc-600';
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${color} ${
        status !== 'idle' ? 'animate-pulse' : ''
      }`}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface OllamaSetupFlowProps {
  /** Whether this overlay is visible */
  isOpen: boolean;
  /** Called when the user explicitly dismisses without completing */
  onDismiss: () => void;
  /** Called when setup is fully complete */
  onComplete: () => void;
  /** If true, runs silently (ready state auto-dismisses without showing anything) */
  silentIfReady?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const OllamaSetupFlow: React.FC<OllamaSetupFlowProps> = ({
  isOpen,
  onDismiss,
  onComplete,
  silentIfReady = true,
}) => {
  const detectedOS = React.useMemo(() => detectOS(), []);

  const [setupState, setSetupState] = useState<OllamaSetupState>({
    status: 'checking',
    isOllamaReachable: false,
    isModelInstalled: false,
    detectedOS,
  });

  const [pullProgress, setPullProgress] = useState<ModelPullProgress | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [pollActive, setPollActive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Initial probe ──────────────────────────────────────────────────────────

  const runProbe = useCallback(async () => {
    setSetupState((s) => ({ ...s, status: 'checking' }));
    const result = await probeOllamaSetup(DEFAULT_MODEL);
    setSetupState(result);

    if (result.status === 'ready' && silentIfReady) {
      markSetupComplete(DEFAULT_MODEL);
      onComplete();
    }
  }, [silentIfReady, onComplete]);

  useEffect(() => {
    if (isOpen) {
      runProbe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Auto-start polling (while waiting for Ollama to come up) ──────────────

  useEffect(() => {
    if (!pollActive) return;
    pollRef.current = setInterval(async () => {
      const alive = await isOllamaReachable();
      if (alive) {
        clearInterval(pollRef.current!);
        setPollActive(false);
        const modelReady = await isModelAvailable(DEFAULT_MODEL);
        setSetupState((s) => ({
          ...s,
          status: modelReady ? 'ready' : 'needs_model',
          isOllamaReachable: true,
          isModelInstalled: modelReady,
        }));
        if (modelReady) {
          markSetupComplete(DEFAULT_MODEL);
          setTimeout(() => onComplete(), 1200);
        }
      }
    }, 2500);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pollActive, onComplete]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Install button: trigger download + start polling */
  const handleInstall = async () => {
    setIsInstalling(true);
    setSetupState((s) => ({ ...s, status: 'starting' }));

    // 1. Try companion first
    const autoStarted = await tryAutoStartOllama();
    if (autoStarted) {
      const modelReady = await isModelAvailable(DEFAULT_MODEL);
      setIsInstalling(false);
      setSetupState({
        status: modelReady ? 'ready' : 'needs_model',
        isOllamaReachable: true,
        isModelInstalled: modelReady,
        detectedOS,
      });
      if (modelReady) {
        markSetupComplete(DEFAULT_MODEL);
        setTimeout(() => onComplete(), 1200);
      }
      return;
    }

    // 2. Trigger OS-specific download
    triggerOllamaDownload(detectedOS);

    // 3. Start polling while user installs
    setIsInstalling(false);
    setPollActive(true);
  };

  /** Model download button */
  const handlePullModel = async () => {
    if (isPulling) return;
    setIsPulling(true);
    setPullProgress({ status: 'Connecting…' });
    abortRef.current = new AbortController();

    const result = await pullModelWithProgress(
      DEFAULT_MODEL,
      (p) => setPullProgress(p),
      abortRef.current.signal
    );

    setIsPulling(false);
    if (result.success) {
      markSetupComplete(DEFAULT_MODEL);
      setSetupState((s) => ({
        ...s,
        status: 'ready',
        isModelInstalled: true,
      }));
      setTimeout(() => onComplete(), 1200);
    } else {
      setPullProgress(null);
      setSetupState((s) => ({
        ...s,
        status: 'needs_model',
        errorMessage: result.message,
      }));
    }
  };

  const handleCancelPull = () => {
    abortRef.current?.abort();
    setIsPulling(false);
    setPullProgress(null);
  };

  const handleRecheck = async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setPollActive(false);
    await runProbe();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Guard: don't render if not open
  // ─────────────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────────────────
  // Render: "checking" state
  // ─────────────────────────────────────────────────────────────────────────

  if (setupState.status === 'checking') {
    return (
      <OverlayWrapper onDismiss={onDismiss}>
        <div className="flex flex-col items-center gap-5 py-4">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-white">Checking Local AI…</h2>
            <p className="text-xs text-zinc-400">DomoNote is probing your Ollama service.</p>
          </div>
        </div>
      </OverlayWrapper>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: "ready" state (brief flash before auto-dismiss)
  // ─────────────────────────────────────────────────────────────────────────

  if (setupState.status === 'ready') {
    return (
      <OverlayWrapper onDismiss={onDismiss} canClose={false}>
        <div className="flex flex-col items-center gap-5 py-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-white">AI Ready</h2>
            <p className="text-xs text-zinc-400">Local AI is ready to use.</p>
          </div>
        </div>
      </OverlayWrapper>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: "starting" state (auto-start in progress / polling)
  // ─────────────────────────────────────────────────────────────────────────

  if (setupState.status === 'starting') {
    return (
      <OverlayWrapper onDismiss={onDismiss}>
        <HeaderBlock
          icon={<Power className="w-6 h-6" />}
          badge="Starting Local AI"
          badgeColor="bg-amber-500"
          title="Starting Ollama Service…"
          subtitle="DomoNote is attempting to start the local AI runtime."
        />
        <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 space-y-3">
          <div className="flex items-center gap-3 text-xs text-white font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{isInstalling ? 'Launching installer…' : 'Waiting for Ollama to start…'}</span>
          </div>
          <ProgressBar percent={pollActive ? undefined : 40} />
          {pollActive && (
            <p className="text-[11px] text-zinc-400 font-mono">
              Polling localhost:11434 — Ollama service is starting, please wait…
            </p>
          )}
        </div>
        <div className="flex justify-between items-center pt-1">
          <button
            onClick={onDismiss}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Continue without AI
          </button>
          <button
            onClick={handleRecheck}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Check now
          </button>
        </div>
      </OverlayWrapper>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: "needs_model" state
  // ─────────────────────────────────────────────────────────────────────────

  if (setupState.status === 'needs_model') {
    return (
      <OverlayWrapper onDismiss={onDismiss}>
        <HeaderBlock
          icon={<Cpu className="w-6 h-6" />}
          badge="Model Setup"
          badgeColor="bg-violet-500"
          title="Setting Up Your Local AI…"
          subtitle={
            isPulling
              ? 'Downloading Qwen 2.5 3B. This only needs to happen once.'
              : `The AI model "${DEFAULT_MODEL}" isn't installed yet. Download it to enable AI features.`
          }
        />

        {/* Privacy note */}
        <PrivacyNote />

        {/* Download progress */}
        {isPulling ? (
          <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Downloading {DEFAULT_MODEL}</span>
              </div>
              {pullProgress?.percent !== undefined && (
                <span className="font-mono text-white font-bold">{pullProgress.percent}%</span>
              )}
            </div>
            <ProgressBar percent={pullProgress?.percent ?? 0} />
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>{pullProgress?.status || 'Downloading model layers…'}</span>
              {pullProgress?.completed && pullProgress?.total ? (
                <span>
                  {(pullProgress.completed / 1024 / 1024).toFixed(1)} MB /{' '}
                  {(pullProgress.total / 1024 / 1024).toFixed(1)} MB
                </span>
              ) : null}
            </div>
            <button
              onClick={handleCancelPull}
              className="text-[11px] text-zinc-500 hover:text-white transition-colors"
            >
              Cancel download
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850 space-y-2">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>What happens when you click below</span>
            </div>
            <ol className="text-xs text-zinc-400 leading-relaxed space-y-1">
              <li className="flex items-start gap-1.5">
                <span className="text-zinc-600 font-mono shrink-0">1.</span>
                DomoNote tells Ollama to download Qwen 2.5 3B (~2 GB)
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-zinc-600 font-mono shrink-0">2.</span>
                You'll see live download progress right here
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-zinc-600 font-mono shrink-0">3.</span>
                The model stays on your device — never downloaded again
              </li>
            </ol>
          </div>
        )}

        {/* Error message */}
        {setupState.errorMessage && !isPulling && (
          <div className="text-[11px] text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {setupState.errorMessage}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={onDismiss}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Skip for now
          </button>
          {!isPulling && (
            <PrimaryButton onClick={handlePullModel} id="setup-download-model-btn">
              <Download className="w-3.5 h-3.5" />
              <span>Download Model (2 GB)</span>
            </PrimaryButton>
          )}
        </div>
      </OverlayWrapper>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: "needs_install" — main install flow
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <OverlayWrapper onDismiss={onDismiss}>
      <HeaderBlock
        icon={<Cpu className="w-6 h-6" />}
        badge="Local AI Setup"
        badgeColor="bg-white text-black"
        title="Connect Local AI (Ollama)"
        subtitle={`DomoNote needs Ollama to run its local AI features. A one-time setup is required on your ${detectedOS === 'macos' ? 'Mac' : detectedOS === 'windows' ? 'Windows PC' : 'Linux system'}.`}
      />

      {/* Privacy note */}
      <PrivacyNote />

      {/* What happens explanation */}
      <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850 space-y-2">
        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>What happens when you click Install Ollama</span>
        </div>
        <ol className="text-xs text-zinc-400 leading-relaxed space-y-1">
          <li className="flex items-start gap-1.5">
            <span className="text-zinc-600 font-mono shrink-0">1.</span>
            DomoNote checks if Ollama is already running on your machine
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-zinc-600 font-mono shrink-0">2.</span>
            If not found, the official Ollama installer for{' '}
            <strong className="text-white capitalize">{detectedOS}</strong> is downloaded
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-zinc-600 font-mono shrink-0">3.</span>
            Once Ollama is running, DomoNote detects it and continues setup automatically
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-zinc-600 font-mono shrink-0">4.</span>
            The default AI model (Qwen 2.5 3B) is downloaded — one time only
          </li>
        </ol>
      </div>

      {/* macOS Gatekeeper warning */}
      {detectedOS === 'macos' && (
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-400/80 leading-relaxed">
          <AlertTriangle className="w-3 h-3 inline mr-1" />
          <strong className="text-amber-400">macOS Gatekeeper:</strong> If macOS blocks Ollama after
          download, run{' '}
          <code className="font-mono bg-black/40 px-1 rounded">
            xattr -cr /Applications/Ollama.app
          </code>{' '}
          in Terminal to allow it.
        </div>
      )}

      {/* Advanced / manual install section */}
      <div className="space-y-1.5">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
          />
          <span>Advanced: Manual install</span>
        </button>
        {showAdvanced && (
          <div className="space-y-1.5">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Terminal className="w-3 h-3" />
              <span>Install Ollama in your terminal:</span>
            </div>
            <code className="block text-[10px] text-zinc-300 font-mono bg-black p-2.5 rounded border border-zinc-850 overflow-x-auto whitespace-pre select-all">
              {getManualInstallCommand(detectedOS)}
            </code>
            {detectedOS !== 'linux' && (
              <a
                href="https://ollama.com/download"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                ollama.com/download
              </a>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={onDismiss}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Continue Without AI
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecheck}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors border border-zinc-800 rounded-md px-3 py-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recheck
          </button>
          <PrimaryButton
            onClick={handleInstall}
            disabled={isInstalling || pollActive}
            id="setup-install-ollama-btn"
          >
            {isInstalling || pollActive ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Waiting…</span>
              </>
            ) : (
              <>
                <Power className="w-3.5 h-3.5" />
                <span>Install Ollama</span>
              </>
            )}
          </PrimaryButton>
        </div>
      </div>

      {/* Polling indicator */}
      {pollActive && (
        <p className="text-[11px] text-zinc-500 font-mono text-center animate-pulse">
          Waiting for Ollama on localhost:11434… (install it, then we'll detect it automatically)
        </p>
      )}
    </OverlayWrapper>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────────

const OverlayWrapper: React.FC<{
  children: React.ReactNode;
  onDismiss: () => void;
  canClose?: boolean;
}> = ({ children, onDismiss, canClose = true }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    role="dialog"
    aria-modal="true"
    aria-label="Ollama AI Setup"
  >
    <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border-2 border-white/10 p-6 sm:p-7 shadow-2xl shadow-black/60 space-y-5 text-white">
      {canClose && (
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Dismiss setup"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {children}
    </div>
  </div>
);

const HeaderBlock: React.FC<{
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
}> = ({ icon, badge, badgeColor, title, subtitle }) => (
  <div className="flex items-start gap-4">
    <div className="p-3 rounded-xl bg-white text-black shrink-0">{icon}</div>
    <div>
      <span
        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${badgeColor}`}
      >
        {badge}
      </span>
      <h2 className="text-xl font-bold tracking-tight text-white mt-1">{title}</h2>
      <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>
    </div>
  </div>
);

const PrivacyNote: React.FC = () => (
  <div
    className="p-3.5 rounded-xl bg-black border border-zinc-900 space-y-1.5 text-xs text-zinc-300"
    role="note"
  >
    <div className="flex items-center gap-2 font-semibold text-white">
      <Shield className="w-4 h-4 text-zinc-400" />
      <span>100% Offline &amp; Private</span>
    </div>
    <p className="leading-relaxed text-zinc-400 text-[11px]">
      All AI features run locally on your device. No data leaves your machine. No API key or
      subscription required.
    </p>
  </div>
);

const ProgressBar: React.FC<{ percent?: number }> = ({ percent }) => (
  <div
    className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden"
    role="progressbar"
    aria-valuenow={percent}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <div
      className={`bg-white h-full rounded-full transition-all duration-300 ${
        percent === undefined ? 'animate-pulse w-1/3' : ''
      }`}
      style={percent !== undefined ? { width: `${Math.max(4, percent)}%` } : undefined}
    />
  </div>
);

const PrimaryButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  id?: string;
}> = ({ children, onClick, disabled, id }) => (
  <button
    id={id}
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 font-bold text-xs px-5 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);
