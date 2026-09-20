import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  Copy,
  Check,
  ExternalLink,
  Download,
  Terminal,
  Layers,
  Sparkles,
  Play,
  ArrowRight,
  Mic,
  Bot,
  FileText,
  Camera,
} from 'lucide-react';
import { Button } from '../ui/button';

interface ChromeExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChromeExtensionModal: React.FC<ChromeExtensionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Check if extension is installed & responding via window messaging or meta tag
    const checkExtension = () => {
      setIsChecking(true);
      const isExtensionActive = !!(window as any).__domonote_extension_installed ||
        document.getElementById('domonote-extension-marker') !== null;

      if (isExtensionActive) {
        setIsConnected(true);
        setIsChecking(false);
      } else {
        // Send a ping message in case content script is active
        window.postMessage({ type: 'DOMONOTE_PING' }, '*');
        setTimeout(() => {
          setIsChecking(false);
        }, 800);
      }
    };

    checkExtension();

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'DOMONOTE_PONG' || e.data?.source === 'domonote-extension') {
        setIsConnected(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen]);

  if (!isOpen) return null;

  const chromeLaunchCommand = `open -a "Google Chrome" --args --load-extension="$(pwd)/browser-extension"`;

  const copyLaunchCommand = () => {
    navigator.clipboard.writeText(chromeLaunchCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleDownloadZip = () => {
    // Trigger download of the extension folder package
    const a = document.createElement('a');
    a.href = '/browser-extension/setup-extension.command';
    a.download = 'setup-domonote-extension.command';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl rounded-2xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl shadow-white/10 space-y-6 text-white max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Close modal"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-white text-black shrink-0 shadow-lg">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-black">
                Automated 1-Click Integration
              </span>
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isConnected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                  }`}
                />
                {isConnected ? 'Extension Connected' : 'Not Loaded Yet'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              DomoNote Chrome Extension & Side Panel
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Access all DomoNote features directly inside your browser without opening the full desktop app.
            </p>
          </div>
        </div>

        {/* 1-Click Automated Launch Action */}
        <div className="p-5 rounded-xl bg-black border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Option 1: Single-Click Auto-Load into Chrome
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Zero Manual Setup</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Run Chrome with the DomoNote extension preloaded in a single terminal stroke, or download the automated runner:
          </p>

          <div className="relative">
            <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap pr-24">
              {chromeLaunchCommand}
            </pre>
            <button
              onClick={copyLaunchCommand}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="/downloads/DomoNote-Chrome-Extension.zip"
              download="DomoNote-Chrome-Extension.zip"
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-all flex items-center gap-2 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Extension (.ZIP)</span>
            </a>

            <button
              onClick={() => {
                const a = document.createElement('a');
                a.href = '/browser-extension/setup-extension.command';
                a.download = 'setup-extension.command';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-2"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Auto-Loader Script (.command)</span>
            </button>

            <button
              onClick={() => {
                window.open('chrome://extensions', '_blank');
              }}
              className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open chrome://extensions</span>
            </button>
          </div>
        </div>

        {/* Features Built Directly Into the Extension (No full app needed!) */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Features Available Directly Inside Extension Popup & Side Panel:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-black border border-zinc-800 text-white shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Full Markdown Notes</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Create, search, format, and save notes locally with auto-save & export.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-black border border-zinc-800 text-white shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Voice Dictation & Meetings</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Live mic/tab recording, live waveform, speech transcript, and AI summary.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-black border border-zinc-800 text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Local Ollama AI Chat</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Offline model chat (llama3.2, etc.) & 1-click "Summarize Active Webpage".
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-black border border-zinc-800 text-white shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Screen Studio & SOP</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Capture tab screenshots, click coordinates, and generate step guides.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Step Manual Fallback */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 text-xs text-zinc-400 space-y-2">
          <div className="font-semibold text-zinc-200">
            Manual Developer Mode Alternative (if preferred):
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-400 leading-relaxed">
            <li>
              Open <code className="text-zinc-200 font-mono">chrome://extensions</code> in your browser and toggle{' '}
              <span className="text-white font-semibold">Developer mode</span> (top right).
            </li>
            <li>
              Click <span className="text-white font-semibold">Load unpacked</span> and choose the{' '}
              <code className="text-zinc-200 font-mono">browser-extension</code> directory.
            </li>
          </ol>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="border-zinc-800 text-zinc-300">
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              copyLaunchCommand();
              onClose();
            }}
          >
            <span>Copy Auto-Launch Command</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
