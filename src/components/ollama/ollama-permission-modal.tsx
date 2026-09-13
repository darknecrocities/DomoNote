import React, { useState, useEffect } from 'react';
import { useAI } from '../../context/ai-context';
import { useWorkspace } from '../../context/workspace-context';
import { Button } from '../ui/button';
import {
  Cpu,
  Download,
  CheckCircle,
  Loader2,
  X,
  Shield,
  ExternalLink,
  Power,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { AppleIcon, WindowsIcon, LinuxTuxIcon } from '../../views/download-view';

interface OllamaPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  actionName?: string;
}

export const OllamaPermissionModal: React.FC<OllamaPermissionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionName = 'AI generation',
}) => {
  const { isConnected, startOllamaService, checkConnection, pullModel } = useAI();
  const { addToast } = useWorkspace();

  const [installing, setInstalling] = useState(false);
  const [stepStatus, setStepStatus] = useState<string>('');
  const [stepNumber, setStepNumber] = useState<number>(1);

  // Detect OS
  const detectedOS = React.useMemo<'macos' | 'windows' | 'linux'>(() => {
    if (typeof navigator === 'undefined') return 'macos';
    const ua = navigator.userAgent.toLowerCase();
    const plat = (navigator as any).userAgentData?.platform?.toLowerCase() || navigator.platform.toLowerCase();
    if (plat.includes('win') || ua.includes('windows')) return 'windows';
    if (plat.includes('mac') || ua.includes('macintosh')) return 'macos';
    return 'linux';
  }, []);

  // Poll connection while modal is in installing state
  useEffect(() => {
    if (!installing) return;

    const interval = setInterval(async () => {
      const ok = await checkConnection();
      if (ok) {
        clearInterval(interval);
        setStepNumber(3);
        setStepStatus('Ollama connected successfully! Continuing workspace operations...');
        setTimeout(() => {
          setInstalling(false);
          addToast('Local Ollama AI engine is ready. Continuing...', 'success');
          onClose();
          onSuccess?.();
        }, 1500);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [installing, checkConnection, onClose, onSuccess, addToast]);

  if (!isOpen) return null;

  const handleGrantPermissionAndInstall = async () => {
    setInstalling(true);
    setStepNumber(1);
    setStepStatus('Requesting local background service startup...');

    try {
      // 1. First attempt to invoke companion start service
      const res = await startOllamaService();
      if (res.success) {
        setStepNumber(2);
        setStepStatus('Ollama service started. Initializing model runtime...');
        return;
      }
    } catch {
      // ignore
    }

    // 2. If companion not running, trigger the direct official installer download for user's OS
    setStepNumber(2);
    setStepStatus(`Triggering official Ollama package download for ${detectedOS}...`);

    let downloadUrl = 'https://ollama.com/download';
    if (detectedOS === 'macos') {
      downloadUrl = 'https://ollama.com/download/Ollama-darwin.zip';
    } else if (detectedOS === 'windows') {
      downloadUrl = 'https://ollama.com/download/OllamaSetup.exe';
    }

    // Open download in background or trigger
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStepStatus(
      'Installer launched. Waiting for Ollama service to start on http://localhost:11434...'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border-2 border-white p-6 sm:p-7 shadow-2xl shadow-white/10 space-y-6 text-white">
        {/* Close Button */}
        {!installing && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header with Mascot Theme */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white text-black shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white text-black">
                Local AI Required
              </span>
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                {detectedOS === 'macos' && <AppleIcon className="w-3.5 h-3.5" />}
                {detectedOS === 'windows' && <WindowsIcon className="w-3.5 h-3.5" />}
                {detectedOS === 'linux' && <LinuxTuxIcon className="w-3.5 h-3.5" />}
                <span className="capitalize">{detectedOS}</span>
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              Connect Local AI (Ollama)
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Required for {actionName}, private meeting summaries, and document Q&A.
            </p>
          </div>
        </div>

        {/* Information Box */}
        <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-2 text-xs text-zinc-300">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Shield className="w-4 h-4 text-zinc-400" />
            <span>100% Offline & Private AI Guarantee</span>
          </div>
          <p className="leading-relaxed text-zinc-400">
            DomoNote never sends your voice recordings, notes, or uploaded PDFs to third-party cloud servers.
            All AI operations run directly on your hardware using the open-source Ollama engine.
          </p>
        </div>

        {/* Live Installation Progress */}
        {installing ? (
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/20 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Step {stepNumber} of 3: Installing & Verifying</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">Polling localhost:11434</span>
            </div>

            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: stepNumber === 1 ? '35%' : stepNumber === 2 ? '70%' : '100%' }}
              />
            </div>

            <p className="text-xs text-zinc-300 font-mono leading-relaxed">{stepStatus}</p>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850 space-y-2">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              <span>Permission Request</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Click below to grant permission for DomoNote to launch or download Ollama for {detectedOS}.
              Once verified, the pending operation will automatically continue.
            </p>
          </div>
        )}

        {/* Terminal Fallback Quick Copy */}
        <div className="space-y-1">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-zinc-400" />
            <span>Or run manually in your terminal:</span>
          </div>
          <code className="block text-[10px] text-zinc-300 font-mono bg-black p-2.5 rounded border border-zinc-850 overflow-x-auto whitespace-pre">
            {detectedOS === 'macos'
              ? './scripts/setup-ollama.sh'
              : detectedOS === 'windows'
              ? 'ollama serve'
              : 'curl -fsSL https://ollama.com/install.sh | sh'}
          </code>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Continue Without AI
          </button>

          <Button
            size="sm"
            variant="primary"
            className="bg-white text-black hover:bg-zinc-200 font-bold px-5"
            onClick={handleGrantPermissionAndInstall}
            disabled={installing}
          >
            {installing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Checking Ollama...</span>
              </>
            ) : (
              <>
                <Power className="w-3.5 h-3.5" />
                <span>Grant Permission & Start</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
