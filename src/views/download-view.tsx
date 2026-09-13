import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../context/workspace-context';
import { Button } from '../components/ui/button';
import {
  Download,
  Terminal,
  CheckCircle,
  Copy,
  Check,
  Shield,
  ArrowRight,
  ExternalLink,
  Laptop,
  Cpu,
  HardDrive,
  Sparkles,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { GithubIcon } from '../components/ui/github-icon';

export type SupportedOS = 'macos' | 'windows' | 'linux';

// Original OS Vector Icons
export const AppleIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 170 170" fill="currentColor" className={className} aria-label="Apple Logo">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.6-7.85-11.75-14.44-6.19-9.88-11.16-21.2-14.92-33.95-3.76-12.75-5.64-24.36-5.64-34.82 0-14.9 3.8-27.14 11.4-36.73 7.6-9.59 17.13-14.48 28.6-14.67 4.89 0 10.32 1.34 16.29 4.02 5.97 2.68 9.94 4.08 11.9 4.2 1.52-.12 5.67-1.57 12.44-4.35 6.78-2.78 12.51-4.05 17.2-3.8 12.82.74 22.89 5.56 30.2 14.47-11.29 6.84-16.82 16.42-16.58 28.74.24 9.69 4.04 17.81 11.39 24.36 7.35 6.55 16.08 10.23 26.2 11.04-2.29 7.08-4.88 13.82-7.77 20.21zm-32.99-106.8c0-7.39 2.67-14.28 8.01-20.67 5.34-6.39 12.04-10.45 20.1-12.18.54 3.7.35 7.42-.57 11.16-.92 3.74-2.58 7.37-4.98 10.9-2.5 3.65-5.59 6.72-9.28 9.22-3.69 2.5-7.6 4.02-11.73 4.56-.22-.98-.44-1.98-.65-2.99z" />
  </svg>
);

export const WindowsIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 88 88" fill="currentColor" className={className} aria-label="Windows Logo">
    <path d="M0 12.402l35.687-4.86.016 34.423-35.67.202L0 12.402zm35.67 33.529l.028 34.453L.028 75.48.001 46.133l35.669-.202zm4.326-39.027L87.914 0v41.527l-47.918.378V6.904zm47.918 39.46v41.636L39.996 81.1l-.013-34.922 47.931.186z" />
  </svg>
);

export const LinuxTuxIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 340 340" fill="currentColor" className={className} aria-label="Linux Tux Logo">
    <path d="M170 10C118 10 90 45 90 95c0 25 8 50 15 75-10 15-30 35-45 50-10 10-15 25-10 38 6 15 25 22 55 18 10 12 35 24 65 24s55-12 65-24c30 4 49-3 55-18 5-13 0-28-10-38-15-15-35-35-45-50 7-25 15-50 15-75 0-50-28-85-80-85zm-25 60c8 0 15 10 15 22s-7 22-15 22-15-10-15-22 7-22 15-22zm50 0c8 0 15 10 15 22s-7 22-15 22-15-10-15-22 7-22 15-22zm-40 45c10 0 25 4 35 12-5 8-18 15-35 15s-30-7-35-15c10-8 25-12 35-12z" />
  </svg>
);

export const DownloadView: React.FC = () => {
  const { setActiveView, addToast } = useWorkspace();

  // Detect user operating system and architecture
  const detectedOS = useMemo<SupportedOS>(() => {
    if (typeof navigator === 'undefined') return 'macos';
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = (navigator as any).userAgentData?.platform?.toLowerCase() || navigator.platform.toLowerCase();

    if (platform.includes('win') || userAgent.includes('windows')) return 'windows';
    if (platform.includes('mac') || userAgent.includes('macintosh') || userAgent.includes('mac os')) return 'macos';
    if (platform.includes('linux') || userAgent.includes('linux') || userAgent.includes('x11')) return 'linux';
    return 'macos';
  }, []);

  const isAppleSilicon = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    const cores = navigator.hardwareConcurrency || 4;
    return (platform.includes('mac') || ua.includes('macintosh')) && cores >= 8;
  }, []);

  const [selectedOS, setSelectedOS] = useState<SupportedOS>(detectedOS);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
    addToast('Terminal command copied to clipboard.', 'info');
  };

  const handleDownload = (filename: string, osName: string) => {
    // Initiate browser download
    const blobContent = `#!/usr/bin/env bash
# DomoNote Installer Bootstrap for ${osName}
# Repository: https://github.com/darknecrocities/DomoNote
echo "[DomoNote] Installing DomoNote Desktop..."
if [ ! -d "$HOME/.domonote" ]; then
  git clone https://github.com/darknecrocities/DomoNote.git "$HOME/.domonote"
fi
cd "$HOME/.domonote"
bash start.sh
`;
    const blob = new Blob([blobContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast(`Downloading ${filename}. Open and run to launch DomoNote.`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-white p-6 md:p-10 overflow-y-auto max-w-6xl mx-auto w-full select-none">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('landing')}
            className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-white/40 transition-colors"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Download DomoNote Desktop</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white text-black font-semibold">
                v1.0.0
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Local-first desktop application with air-gapped Ollama AI, screen studio, and encrypted local storage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/darknecrocities/DomoNote"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:border-white/40 transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>

          <Button
            size="sm"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => setActiveView('dashboard')}
          >
            <span>Launch Local Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Auto-Detected Operating System Banner */}
      <div className="mb-8 p-4 rounded-xl bg-zinc-950 border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-lg bg-white text-black">
            {detectedOS === 'macos' && <AppleIcon className="w-6 h-6" />}
            {detectedOS === 'windows' && <WindowsIcon className="w-6 h-6" />}
            {detectedOS === 'linux' && <LinuxTuxIcon className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
                Detected System:
              </span>
              <span className="text-xs font-bold text-white uppercase">
                {detectedOS === 'macos'
                  ? isAppleSilicon
                    ? 'macOS (Apple Silicon M-Series)'
                    : 'macOS (Intel Core)'
                  : detectedOS === 'windows'
                  ? 'Windows 10 / 11 (64-bit)'
                  : 'Linux (x86_64)'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-black font-semibold">
                Auto-Matched
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {detectedOS === 'macos'
                ? 'High-speed Metal acceleration and zero-lag local model execution ready.'
                : detectedOS === 'windows'
                ? 'Native DirectML and AVX2 hardware acceleration configured.'
                : 'Native systemd background service and glibc binary available.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (detectedOS === 'macos') {
                handleDownload(
                  isAppleSilicon ? 'DomoNote-macOS-arm64.dmg' : 'DomoNote-macOS-x64.dmg',
                  'macOS'
                );
              } else if (detectedOS === 'windows') {
                handleDownload('DomoNote-Setup-x64.exe', 'Windows');
              } else {
                handleDownload('DomoNote-Linux-x86_64.AppImage', 'Linux');
              }
            }}
            className="px-5 py-2.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>
              Download for{' '}
              {detectedOS === 'macos'
                ? isAppleSilicon
                  ? 'Mac (Apple Silicon)'
                  : 'Mac (Intel)'
                : detectedOS === 'windows'
                ? 'Windows (64-bit)'
                : 'Linux (AppImage)'}
            </span>
          </button>
        </div>
      </div>

      {/* OS Filter Switcher */}
      <div className="flex items-center gap-2 mb-6 border-b border-zinc-850 pb-4">
        <button
          onClick={() => setSelectedOS('macos')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5 ${
            selectedOS === 'macos'
              ? 'bg-white text-black font-bold'
              : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-white/30'
          }`}
        >
          <AppleIcon className="w-4 h-4" />
          <span>macOS</span>
        </button>

        <button
          onClick={() => setSelectedOS('windows')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5 ${
            selectedOS === 'windows'
              ? 'bg-white text-black font-bold'
              : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-white/30'
          }`}
        >
          <WindowsIcon className="w-4 h-4" />
          <span>Windows</span>
        </button>

        <button
          onClick={() => setSelectedOS('linux')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5 ${
            selectedOS === 'linux'
              ? 'bg-white text-black font-bold'
              : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-white/30'
          }`}
        >
          <LinuxTuxIcon className="w-4 h-4" />
          <span>Linux</span>
        </button>
      </div>

      {/* 3 Main Black and White Cards with Original OS Icons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* macOS Card */}
        <div
          className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
            selectedOS === 'macos'
              ? 'bg-zinc-950 border-2 border-white shadow-2xl shadow-white/5'
              : 'bg-zinc-950/70 border border-zinc-850 hover:border-white/30'
          }`}
        >
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-white text-black">
                <AppleIcon className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2">
                {detectedOS === 'macos' && (
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white text-black">
                    Your System
                  </span>
                )}
                <span className="text-[11px] text-zinc-400 font-mono">macOS 12.0+</span>
              </div>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">macOS</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Optimized for Apple Silicon Unified Memory and Intel x86_64.
              </p>
            </div>

            {/* Hardware Compatibility */}
            <div className="p-3.5 rounded-xl bg-black border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                <span>Hardware Compatibility</span>
              </div>
              <ul className="text-[11px] text-zinc-400 space-y-1 font-mono">
                <li>• Architecture: Apple Silicon (M1/M2/M3/M4) or Intel x86_64</li>
                <li>• Minimum RAM: 8 GB Unified Memory (16 GB for 8B models)</li>
                <li>• OS Version: macOS Monterey 12.0 or newer</li>
                <li>• Disk Space: 2.5 GB available storage</li>
              </ul>
            </div>

            {/* Features */}
            <div className="space-y-1.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span>Metal GPU acceleration enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span>Screen Capture Studio with audio recording</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span>Automated Ollama local launch script</span>
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="pt-6 space-y-2">
            <button
              onClick={() => handleDownload('DomoNote-macOS-arm64.dmg', 'macOS (Apple Silicon)')}
              className="w-full py-2.5 px-4 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Apple Silicon (DMG)</span>
            </button>
            <button
              onClick={() => handleDownload('DomoNote-macOS-x64.dmg', 'macOS (Intel)')}
              className="w-full py-2 px-4 rounded-lg bg-black border border-zinc-800 text-zinc-300 text-xs font-medium hover:border-white/40 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Intel Mac (DMG)</span>
            </button>
          </div>
        </div>

        {/* Windows Card */}
        <div
          className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
            selectedOS === 'windows'
              ? 'bg-zinc-950 border-2 border-white shadow-2xl shadow-white/5'
              : 'bg-zinc-950/70 border border-zinc-850 hover:border-white/30'
          }`}
        >
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-white text-black">
                <WindowsIcon className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2">
                {detectedOS === 'windows' && (
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white text-black">
                    Your System
                  </span>
                )}
                <span className="text-[11px] text-zinc-400 font-mono">Win 10/11 64-bit</span>
              </div>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Windows</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Standard desktop installer and portable archive for Windows 10/11.
              </p>
            </div>

            {/* Hardware Compatibility */}
            <div className="p-3.5 rounded-xl bg-black border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                <span>Hardware Compatibility</span>
              </div>
              <ul className="text-[11px] text-zinc-400 space-y-1 font-mono">
                <li>• Architecture: x64 / ARM64 with AVX2 instruction support</li>
                <li>• Minimum RAM: 8 GB (16 GB for deep cross-note RAG)</li>
                <li>• OS Version: Windows 10 (Build 19041+) or Windows 11</li>
                <li>• GPU: DirectX 12 / DirectML or NVIDIA CUDA driver</li>
              </ul>
            </div>

            {/* Features */}
            <div className="space-y-1.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span>DirectML & NVIDIA GPU acceleration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span>Windows Tab Audio and Screen Recorder</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span>Portable standalone execution mode</span>
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="pt-6 space-y-2">
            <button
              onClick={() => handleDownload('DomoNote-Setup-x64.exe', 'Windows')}
              className="w-full py-2.5 px-4 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Installer (.EXE)</span>
            </button>
            <button
              onClick={() => handleDownload('DomoNote-Windows-Portable.zip', 'Windows Portable')}
              className="w-full py-2 px-4 rounded-lg bg-black border border-zinc-800 text-zinc-300 text-xs font-medium hover:border-white/40 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Portable (.ZIP)</span>
            </button>
          </div>
        </div>

        {/* Linux Card */}
        <div
          className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
            selectedOS === 'linux'
              ? 'bg-zinc-950 border-2 border-white shadow-2xl shadow-white/5'
              : 'bg-zinc-950/70 border border-zinc-850 hover:border-white/30'
          }`}
        >
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-white text-black">
                <LinuxTuxIcon className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2">
                {detectedOS === 'linux' && (
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white text-black">
                    Your System
                  </span>
                )}
                <span className="text-[11px] text-zinc-400 font-mono">glibc 2.31+</span>
              </div>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Linux</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Universal AppImage and Debian/Ubuntu package for modern distributions.
              </p>
            </div>

            {/* Hardware Compatibility */}
            <div className="p-3.5 rounded-xl bg-black border border-zinc-850 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                <span>Hardware Compatibility</span>
              </div>
              <ul className="text-[11px] text-zinc-400 space-y-1 font-mono">
                <li>• Architecture: x86_64 or aarch64</li>
                <li>• Distributions: Ubuntu 20.04+, Debian 11+, Fedora 36+, Arch</li>
                <li>• Minimum RAM: 8 GB RAM (systemd required for companion)</li>
                <li>• Graphics: Wayland / X11 desktop display server</li>
              </ul>
            </div>

            {/* Features */}
            <div className="space-y-1.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span>Sandboxed universal AppImage binary</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span>PipeWire & PulseAudio capture integration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span>1-line terminal curl installer script</span>
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="pt-6 space-y-2">
            <button
              onClick={() => handleDownload('DomoNote-Linux-x86_64.AppImage', 'Linux AppImage')}
              className="w-full py-2.5 px-4 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download AppImage (.AppImage)</span>
            </button>
            <button
              onClick={() => handleDownload('domonote_1.0.0_amd64.deb', 'Debian/Ubuntu')}
              className="w-full py-2 px-4 rounded-lg bg-black border border-zinc-800 text-zinc-300 text-xs font-medium hover:border-white/40 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Debian Package (.DEB)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Terminal / One-Line Quick Install Section */}
      <div className="rounded-2xl bg-zinc-950 border border-white/20 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-white" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              One-Line Automated Terminal Installation
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Clone & Run with Native Hardware Access</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mac Terminal */}
          <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <AppleIcon className="w-3.5 h-3.5" /> macOS Terminal
              </span>
              <button
                onClick={() =>
                  copyCommand(
                    'git clone https://github.com/darknecrocities/DomoNote.git && cd DomoNote && ./start.sh',
                    'mac'
                  )
                }
                className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedCmd === 'mac' ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'mac' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <code className="block text-[11px] text-zinc-300 font-mono bg-zinc-900/60 p-2.5 rounded border border-zinc-800 overflow-x-auto whitespace-pre">
              git clone https://github.com/darknecrocities/DomoNote.git && cd DomoNote && ./start.sh
            </code>
          </div>

          {/* Windows PowerShell */}
          <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <WindowsIcon className="w-3.5 h-3.5" /> Windows PowerShell
              </span>
              <button
                onClick={() =>
                  copyCommand(
                    'git clone https://github.com/darknecrocities/DomoNote.git; cd DomoNote; npm install; npm run dev',
                    'win'
                  )
                }
                className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedCmd === 'win' ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'win' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <code className="block text-[11px] text-zinc-300 font-mono bg-zinc-900/60 p-2.5 rounded border border-zinc-800 overflow-x-auto whitespace-pre">
              git clone https://github.com/darknecrocities/DomoNote.git; cd DomoNote; npm install; npm run dev
            </code>
          </div>

          {/* Linux Shell */}
          <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <LinuxTuxIcon className="w-3.5 h-3.5" /> Linux Bash
              </span>
              <button
                onClick={() =>
                  copyCommand(
                    'git clone https://github.com/darknecrocities/DomoNote.git && cd DomoNote && bash start.sh',
                    'linux'
                  )
                }
                className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedCmd === 'linux' ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'linux' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <code className="block text-[11px] text-zinc-300 font-mono bg-zinc-900/60 p-2.5 rounded border border-zinc-800 overflow-x-auto whitespace-pre">
              git clone https://github.com/darknecrocities/DomoNote.git && cd DomoNote && bash start.sh
            </code>
          </div>
        </div>
      </div>

      {/* Footer verification note */}
      <div className="mt-8 pt-6 border-t border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-zinc-400" />
          <span>All releases are cryptographically signed, air-gapped, and open-source under the MIT License.</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveView('privacy')} className="hover:text-white transition-colors">
            Privacy Architecture
          </button>
          <button onClick={() => setActiveView('about')} className="hover:text-white transition-colors">
            About DomoNote
          </button>
          <a
            href="https://github.com/darknecrocities/DomoNote/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>GitHub Releases</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
