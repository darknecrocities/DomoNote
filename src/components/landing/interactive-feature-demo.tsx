import React, { useState, useEffect } from 'react';
import {
  Mic,
  FileText,
  Sparkles,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  Shield,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Clock,
  ExternalLink,
  Highlighter,
  ZoomIn,
} from 'lucide-react';
import { Button } from '../ui/button';

export type DemoStage = 'calls' | 'summarizing' | 'annotation' | 'notes';

interface InteractiveFeatureDemoProps {
  onOpenWorkspace?: () => void;
}

export const InteractiveFeatureDemo: React.FC<InteractiveFeatureDemoProps> = ({
  onOpenWorkspace,
}) => {
  const [activeStage, setActiveStage] = useState<DemoStage>('calls');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Call Recording Stage State
  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState<number>(0);
  const [callDuration, setCallDuration] = useState<number>(38);
  const [audioWaves, setAudioWaves] = useState<number[]>([
    30, 65, 45, 90, 75, 40, 85, 100, 60, 45, 70, 95, 55, 80, 40, 60, 85, 50, 75, 90, 35, 60
  ]);

  // Document Annotation Stage State
  const [selectedAnnotationPreset, setSelectedAnnotationPreset] = useState<number>(0);
  const [isZoomMode, setIsZoomMode] = useState<boolean>(false);

  // Meeting Notes Checklist State
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
  });

  const stages: { id: DemoStage; label: string; number: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'calls', label: 'Call Recording', number: '01', icon: Mic },
    { id: 'summarizing', label: 'Smart Summary', number: '02', icon: Sparkles },
    { id: 'annotation', label: 'Document Highlights', number: '03', icon: Highlighter },
    { id: 'notes', label: 'Meeting Notes', number: '04', icon: FileText },
  ];

  const currentStageIndex = stages.findIndex((s) => s.id === activeStage);

  // Auto-play loop carousel timer: automatically advances to next stage and loops forever
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Continuous carousel loop
          setActiveStage((current) => {
            if (current === 'calls') return 'summarizing';
            if (current === 'summarizing') return 'annotation';
            if (current === 'annotation') return 'notes';
            return 'calls'; // loop back to first
          });
          return 0;
        }
        return prev + 1.8; // ~5.5 seconds per slide
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Soundwave animation effect during call recording
  useEffect(() => {
    if (activeStage !== 'calls' || !isPlaying) return;

    const waveTimer = setInterval(() => {
      setAudioWaves((prev) =>
        prev.map(() => Math.floor(Math.random() * 75) + 25)
      );
      setCallDuration((prev) => prev + 1);
    }, 280);

    const speakerTimer = setInterval(() => {
      setActiveSpeakerIndex((prev) => (prev + 1) % 3);
    }, 2800);

    return () => {
      clearInterval(waveTimer);
      clearInterval(speakerTimer);
    };
  }, [activeStage, isPlaying]);

  const handleStageSelect = (stageId: DemoStage) => {
    setActiveStage(stageId);
    setProgress(0);
  };

  const handlePrevStage = () => {
    const prevIdx = (currentStageIndex - 1 + stages.length) % stages.length;
    setActiveStage(stages[prevIdx].id);
    setProgress(0);
  };

  const handleNextStage = () => {
    const nextIdx = (currentStageIndex + 1) % stages.length;
    setActiveStage(stages[nextIdx].id);
    setProgress(0);
  };

  const handleCopyNotes = () => {
    const notesMarkdown = `# Team Sync & Architecture Review
Date: September 14, 2026 | Duration: 42m | Participants: Alex Chen, Elena Rostova, Marcus Vance

## Executive Summary
The team verified DomoNote's local-first architecture. All speech transcripts, document highlights, and notes stay strictly on your device without sending any data to remote servers.

## Key Decisions
- [x] Zero Remote Telemetry: Private and secure for sensitive calls.
- [x] Recommended Model: Llama 3.2 3B runs locally with fast sub-second answers.
- [x] Dynamic Border-Only Highlights: Preserves complete document readability.

## Action Items
- [x] Integrate border-only annotation box algorithm (@Alex, Done)
- [ ] Finalize offline Ollama health check before workspace open (@Elena, In Progress)
- [ ] Push standalone desktop packages for macOS, Windows, Linux (@Marcus, Scheduled)
`;
    navigator.clipboard.writeText(notesMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTask = (index: number) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const annotationPresets = [
    {
      title: 'Local Privacy',
      targetText: 'All extracted document text, audio recordings, and screen captures are kept directly on your computer in local storage.',
      stepTag: 'Highlight 01 • Local Storage',
      confidence: 'Exact Match',
      note: 'Keeps confidential legal, medical, and executive documents completely private on your device.',
    },
    {
      title: 'Dynamic Border Boxes',
      targetText: 'Dynamic bounding boxes draw around exact sentences with zero background shading or occlusion, preserving document readability.',
      stepTag: 'Highlight 02 • Clean Citation',
      confidence: 'Exact Match',
      note: 'Enables clear visual citation directly inside the original page layout without obscuring text.',
    },
    {
      title: 'Offline AI Processing',
      targetText: 'Local AI models run entirely within user machine memory on port 11434 with instant responses and zero cloud latency.',
      stepTag: 'Highlight 03 • Fast & Offline',
      confidence: 'Exact Match',
      note: 'Works anywhere without an internet connection, with zero monthly subscription fees.',
    },
  ];

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl font-sans text-left relative z-10">
      {/* Top Studio Control Bar */}
      <div className="p-3.5 sm:p-4 border-b border-zinc-850 bg-zinc-900/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Window controls & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-zinc-700/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-zinc-700/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-zinc-700/80 inline-block" />
          </div>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-white tracking-wide">DomoNote Interactive Showcase</span>
            <span className="text-zinc-500 hidden sm:inline">•</span>
            <span className="text-zinc-400 hidden sm:inline">Continuous Workflow Carousel</span>
          </div>
        </div>

        {/* Global Demo Carousel Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Loop status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
            <span>{isPlaying ? 'Auto-Looping' : 'Paused'}</span>
          </div>

          {/* Carousel Previous / Next Arrows */}
          <button
            onClick={handlePrevStage}
            className="p-1.5 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
            title="Previous slide"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Stage Counter */}
          <span className="text-xs font-mono text-zinc-300 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800 min-w-[54px] text-center">
            {currentStageIndex + 1} / 4
          </span>

          <button
            onClick={handleNextStage}
            className="p-1.5 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
            title="Next slide"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Auto-play Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
            title={isPlaying ? 'Pause loop' : 'Resume loop'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-zinc-300" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-zinc-300" />
                <span className="hidden sm:inline">Loop</span>
              </>
            )}
          </button>

          {/* Reset progress */}
          <button
            onClick={() => setProgress(0)}
            className="p-1.5 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
            title="Replay slide"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Tabs Stepper with Live Progress Filling */}
      <div className="px-3 sm:px-6 pt-4 pb-2 border-b border-zinc-850 bg-zinc-950/90 overflow-x-auto no-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 min-w-[560px] md:min-w-0">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isActive = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => handleStageSelect(stage.id)}
                className={`relative flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-zinc-900 border-white text-white shadow-lg'
                    : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isActive ? 'bg-white text-black' : 'bg-zinc-850 text-zinc-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    Step {stage.number}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold truncate">
                    {stage.label}
                  </div>
                </div>

                {/* Active progress line at bottom of tab */}
                {isActive && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Carousel Slide Body */}
      <div key={activeStage} className="p-4 sm:p-7 min-h-[460px] flex flex-col justify-between bg-black animate-slide-in-right">
        {/* ================= STAGE 1: CALL RECORDING ================= */}
        {activeStage === 'calls' && (
          <div className="space-y-6">
            {/* Call Header Status Card */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-750 flex items-center justify-center text-white shrink-0">
                  <Mic className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      Live Call Recording
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      00:{callDuration < 10 ? `0${callDuration}` : callDuration}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                    Sprint Sync: Local Architecture & Knowledge Vault
                  </h4>
                </div>
              </div>

              {/* Private Audio badge */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Private Audio Stream</span>
                </span>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
                  On-Device Audio
                </span>
              </div>
            </div>

            {/* Dynamic Soundwave Visualizer & Active Speakers */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 4 Cols: Active Speakers in Call */}
              <div className="lg:col-span-4 p-4 rounded-xl border border-zinc-850 bg-zinc-950/70 flex flex-col justify-between space-y-3">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center justify-between">
                  <span>Call Participants</span>
                  <span className="text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    3 Active
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { name: 'Arron Parejas', role: 'System Architect', active: activeSpeakerIndex === 0 },
                    { name: 'Elena Rostova', role: 'AI Specialist', active: activeSpeakerIndex === 1 },
                    { name: 'Marcus Vance', role: 'Security Review', active: activeSpeakerIndex === 2 },
                  ].map((speaker, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                        speaker.active
                          ? 'bg-zinc-900 border-zinc-400 text-white shadow-sm'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            speaker.active ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {speaker.name[0]}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-zinc-200">{speaker.name}</div>
                          <div className="text-[10px] text-zinc-500">{speaker.role}</div>
                        </div>
                      </div>
                      {speaker.active && (
                        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                          <span>Speaking</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-zinc-850 text-[11px] text-zinc-500 flex items-center justify-between">
                  <span>Input Volume:</span>
                  <span className="font-mono text-zinc-300">Clean & Clear</span>
                </div>
              </div>

              {/* Right 8 Cols: Real-Time Audio Waves & Live Speech Transcript */}
              <div className="lg:col-span-8 p-4 rounded-xl border border-zinc-850 bg-zinc-950 flex flex-col justify-between space-y-4">
                {/* Visualizer Waveform Bar */}
                <div className="p-3 rounded-lg bg-black border border-zinc-850 flex items-center justify-between gap-1 overflow-hidden h-16">
                  {audioWaves.map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-zinc-700 via-zinc-400 to-white rounded-full transition-all duration-200"
                      style={{
                        height: `${height}%`,
                        opacity: height > 70 ? 1 : 0.65,
                      }}
                    />
                  ))}
                </div>

                {/* Live Speech-to-Text Stream */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-zinc-500 border-b border-zinc-850 pb-1.5 text-[11px]">
                    <span>REAL-TIME TRANSCRIPTION</span>
                    <span className="text-zinc-400">Transcribed on Device</span>
                  </div>

                  <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1">
                    <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800 text-zinc-300">
                      <span className="text-zinc-500 text-[10px] block font-semibold mb-0.5">
                        [00:14] Arron Parejas (System Architect):
                      </span>
                      "Let's ensure DomoNote keeps all audio buffers strictly in browser memory without streaming speech to any remote servers."
                    </div>

                    <div className="p-2 rounded bg-zinc-900/60 border border-zinc-850 text-zinc-300">
                      <span className="text-zinc-500 text-[10px] block font-semibold mb-0.5">
                        [00:26] Elena Rostova (AI Specialist):
                      </span>
                      "Confirmed. Speech-to-text transcription runs directly on your computer. We can feed the transcript buffer directly to Ollama Llama 3.2 for instant meeting takeaways."
                    </div>

                    <div className="p-2 rounded bg-zinc-900/90 border border-zinc-700 text-white flex items-center justify-between">
                      <div>
                        <span className="text-emerald-400 text-[10px] block font-semibold mb-0.5">
                          [00:37] Marcus Vance (Security Review) • LIVE:
                        </span>
                        <span>
                          "That completely eliminates data leakage risk for sensitive executive and team calls."
                        </span>
                        <span className="inline-block w-1.5 h-3.5 ml-1 bg-white animate-pulse align-middle" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Hint */}
                <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-400">
                  <span>Audio captured safely on your local device</span>
                  <button
                    onClick={() => handleStageSelect('summarizing')}
                    className="text-xs text-white hover:text-zinc-300 flex items-center gap-1 font-semibold underline underline-offset-4"
                  >
                    <span>Next: Smart Summary</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 2: SMART SUMMARIZING ================= */}
        {activeStage === 'summarizing' && (
          <div className="space-y-6">
            {/* Header / Engine Status */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wide">
                      Instant Smart Summary
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      Local Llama 3.2
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-zinc-200 mt-0.5">
                    Extracting Key Takeaways & Action Items from Meeting
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                  Runs Locally
                </span>
                <span className="text-xs font-mono px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400">
                  Private & Offline
                </span>
              </div>
            </div>

            {/* Synthesis Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 5 Cols: Raw Input Context Ingestion */}
              <div className="lg:col-span-5 p-4 rounded-xl border border-zinc-850 bg-zinc-950/80 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span className="font-semibold uppercase tracking-wider text-zinc-500">
                      Meeting Conversation
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400">
                      1,420 words analyzed
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-black border border-zinc-850 text-xs font-mono text-zinc-400 space-y-2 h-[220px] overflow-hidden relative">
                    <p className="opacity-60">
                      [00:02] Arron: "Reviewing local-first data architecture..."
                    </p>
                    <p className="opacity-80">
                      [00:14] Elena: "IndexedDB stores raw blobs and notes directly on device."
                    </p>
                    <p className="text-zinc-200 bg-zinc-900/80 p-1.5 rounded border border-zinc-700">
                      [00:26] Marcus: "Zero external network calls required for speech or text synthesis."
                    </p>
                    <p className="opacity-70">
                      [00:39] Arron: "Let's automate document annotation with border-only boxes."
                    </p>
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span>Summary Generation</span>
                    <span className="text-emerald-400 font-bold">Done</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-white rounded-full w-full" />
                  </div>
                </div>
              </div>

              {/* Right 7 Cols: Real-Time Structured Output */}
              <div className="lg:col-span-7 p-4 rounded-xl border border-zinc-850 bg-zinc-950 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-850 pb-2">
                  <span className="font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                    Structured Meeting Highlights
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    Ready to Save
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Executive Summary Card */}
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 leading-relaxed">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold mb-1">
                      Summary
                    </div>
                    "The team verified that meeting notes, document highlights, and audio recordings stay strictly on your device without sending any data to remote servers."
                  </div>

                  {/* 3 Pillar Takeaways */}
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white">Private & Secure:</span>
                        <span className="text-zinc-400 ml-1">
                          Zero data sent outside your computer for confidential meetings.
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white">Fast Local Execution:</span>
                        <span className="text-zinc-400 ml-1">
                          Llama 3.2 runs on your own hardware with instant answers.
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white">Direct Document Link:</span>
                        <span className="text-zinc-400 ml-1">
                          Connects every decision directly to the exact source text.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Summary ready for your notes</span>
                  <button
                    onClick={() => handleStageSelect('annotation')}
                    className="text-xs text-white hover:text-zinc-300 flex items-center gap-1 font-semibold underline underline-offset-4"
                  >
                    <span>Next: Document Highlights</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 3: DOCUMENT ANNOTATION WITH CREATIVE ZOOM ANIMATION ================= */}
        {activeStage === 'annotation' && (
          <div className="space-y-6">
            {/* Header with Zoom & Lens controls */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
                  <Highlighter className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wide">
                      Document Highlighting Demo
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      PDF & Word Reader
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-zinc-200 mt-0.5">
                    Dynamic Zoom-In Bounding Box with Zero Text Occlusion
                  </h4>
                </div>
              </div>

              {/* Preset Selector & Zoom Toggle */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setIsZoomMode(!isZoomMode)}
                  className={`px-3 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    isZoomMode
                      ? 'bg-white text-black border-white font-bold shadow'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white'
                  }`}
                  title="Toggle Zoom-In Lens"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>{isZoomMode ? 'Zoom: 1.25x Active' : 'Zoom In Box'}</span>
                </button>

                {annotationPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedAnnotationPreset(idx);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap ${
                      selectedAnnotationPreset === idx
                        ? 'bg-zinc-800 text-white border-zinc-600 font-bold'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Reader Mockup with Dynamic Animated Bounding Box */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 7 Cols: High-Fidelity Document Page */}
              <div className="lg:col-span-7 rounded-xl border border-zinc-800 bg-white text-zinc-900 p-5 sm:p-6 shadow-2xl relative select-none flex flex-col justify-between min-h-[320px] overflow-hidden">
                {/* Document Topbar */}
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3 text-xs text-zinc-500 font-mono">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-zinc-600" />
                    <span className="font-semibold text-zinc-800">Product_Architecture_Guide.pdf</span>
                  </div>
                  <span>Page 3 of 12</span>
                </div>

                {/* Document Text Body with Zoom-In Focus */}
                <div className="space-y-3.5 my-3 text-xs sm:text-sm text-zinc-700 leading-relaxed font-sans relative">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                    Section 3.2 — Data Security on Device
                  </div>

                  <p className={`transition-opacity duration-300 ${isZoomMode ? 'opacity-40' : 'opacity-85'}`}>
                    DomoNote saves your files directly on your computer. No network packets leave your machine
                    during file reading or analysis.
                  </p>

                  {/* CREATIVE DYNAMIC BORDER-ONLY ANNOTATION BOX WITH ZOOM-IN ANIMATION */}
                  <div
                    key={`${selectedAnnotationPreset}-${isZoomMode}`}
                    className={`relative p-3.5 rounded-lg border-2 border-black bg-black/[0.02] shadow-lg animate-box-zoom animate-box-glow transition-all duration-300 ${
                      isZoomMode ? 'scale-[1.04] bg-white ring-4 ring-black/10' : 'scale-100'
                    }`}
                  >
                    {/* Creative Corner Reticle Brackets ⌜ ⌝ ⌞ ⌟ */}
                    <span className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-black" />
                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-black" />
                    <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-black" />
                    <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-black" />

                    {/* Floating Step Badge with Pulse */}
                    <div className="absolute -top-3 left-3 px-2 py-0.5 bg-black text-white rounded text-[10px] font-mono font-bold tracking-wide flex items-center gap-1.5 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>{annotationPresets[selectedAnnotationPreset].stepTag}</span>
                    </div>

                    <p className="text-black font-semibold text-xs sm:text-sm leading-relaxed">
                      "{annotationPresets[selectedAnnotationPreset].targetText}"
                    </p>

                    {/* Hover dismiss / verified check */}
                    <div className="absolute -top-2.5 -right-2 w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center shadow">
                      ✓
                    </div>
                  </div>

                  <p className={`transition-opacity duration-300 ${isZoomMode ? 'opacity-40' : 'opacity-85'}`}>
                    This clean design highlights text without blocking the words beneath it.
                  </p>
                </div>

                {/* Document Footer */}
                <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Exact DOM Sentence Coordinates</span>
                  <span className="text-zinc-600">DomoNote Native Viewer</span>
                </div>
              </div>

              {/* Right 5 Cols: Citation & Annotation Inspector */}
              <div className="lg:col-span-5 p-4 rounded-xl border border-zinc-850 bg-zinc-950 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-850 pb-2 mb-3">
                    <span className="font-semibold uppercase tracking-wider text-zinc-300">
                      Highlighted Note
                    </span>
                    <span className="font-mono text-white text-[11px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      {annotationPresets[selectedAnnotationPreset].confidence}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
                      <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">
                        Highlighted Text
                      </div>
                      <p className="text-zinc-200 italic font-serif">
                        "{annotationPresets[selectedAnnotationPreset].targetText}"
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-850 space-y-1">
                      <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">
                        Why this matters
                      </div>
                      <p className="text-zinc-300">
                        {annotationPresets[selectedAnnotationPreset].note}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-zinc-400">
                        Source: Page 3
                      </div>
                      <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-zinc-300 font-semibold">
                        Zoom-In: Active
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Clean border-only rendering</span>
                  <button
                    onClick={() => handleStageSelect('notes')}
                    className="text-xs text-white hover:text-zinc-300 flex items-center gap-1 font-semibold underline underline-offset-4"
                  >
                    <span>Next: Sample Meeting Notes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 4: SAMPLE MEETING NOTES ================= */}
        {activeStage === 'notes' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wide">
                      Meeting Note Artifact
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      Saved in Your Vault
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-zinc-200 mt-0.5">
                    Team Architecture & Local AI Sync
                  </h4>
                </div>
              </div>

              {/* Actions: Copy Markdown */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyNotes}
                  className="text-xs flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={onOpenWorkspace}
                  className="text-xs flex items-center gap-1.5"
                >
                  <span>Open Workspace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Rich Formatted Meeting Note Card */}
            <div className="p-5 sm:p-7 rounded-xl border border-zinc-800 bg-zinc-950 text-left space-y-5">
              {/* Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-850 text-xs text-zinc-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Sep 14, 2026 • 42 mins</span>
                  </span>
                  <span>•</span>
                  <span>Participants: Arron Parejas, Elena Rostova, Marcus Vance</span>
                </div>

                <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Personal Vault Note</span>
                </span>
              </div>

              {/* Note Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left 6 Cols: Summary & Decisions */}
                <div className="md:col-span-6 space-y-4">
                  <div>
                    <h5 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-2">
                      1. Executive Summary
                    </h5>
                    <p className="text-xs text-zinc-300 leading-relaxed p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-850">
                      The team verified DomoNote's local-first architecture. All speech transcripts, document highlights, and notes stay strictly on your device without sending any data to remote servers.
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-2">
                      2. Key Decisions Made
                    </h5>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-zinc-200">
                          Adopted border-only dynamic bounding box rendering for PDF citations.
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-zinc-200">
                          Recommended Llama 3.2 3B as default offline model for 8GB+ memory systems.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 6 Cols: Action Items Checklist */}
                <div className="md:col-span-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                        3. Action Items Checklist
                      </h5>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {Object.values(checkedTasks).filter(Boolean).length} of 3 completed
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        {
                          text: 'Implement dynamic border-only annotation algorithm',
                          owner: '@Alex',
                          status: 'P0 • Complete',
                        },
                        {
                          text: 'Validate offline Ollama health check before workspace open',
                          owner: '@Elena',
                          status: 'P1 • In Progress',
                        },
                        {
                          text: 'Publish standalone desktop packages for macOS, Windows, Linux',
                          owner: '@Marcus',
                          status: 'P1 • Scheduled',
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => toggleTask(idx)}
                          className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-850 hover:border-zinc-700 cursor-pointer flex items-start gap-3 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={!!checkedTasks[idx]}
                            onChange={() => {}}
                            className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-white accent-white cursor-pointer"
                          />
                          <div className="min-w-0 flex-1 text-xs">
                            <span
                              className={`block font-medium ${
                                checkedTasks[idx]
                                  ? 'line-through text-zinc-500'
                                  : 'text-zinc-200'
                              }`}
                            >
                              {item.text}
                            </span>
                            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-zinc-500">
                              <span className="text-zinc-400">{item.owner}</span>
                              <span>•</span>
                              <span
                                className={
                                  checkedTasks[idx]
                                    ? 'text-emerald-400'
                                    : 'text-zinc-400'
                                }
                              >
                                {item.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attached Document Citation Badge */}
                  <div className="p-3 rounded-lg bg-zinc-900/40 border border-dashed border-zinc-850 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Referenced: Product_Architecture_Guide.pdf (Page 3)</span>
                    </div>
                    <button
                      onClick={() => handleStageSelect('annotation')}
                      className="text-white hover:underline text-[11px] font-mono"
                    >
                      View Highlight
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Information Bar with Carousel Indicators */}
      <div className="p-4 border-t border-zinc-850 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-zinc-400 text-xs">
        {/* Carousel indicator dots */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {stages.map((stg, i) => (
              <button
                key={stg.id}
                onClick={() => handleStageSelect(stg.id)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeStage === stg.id ? 'w-6 bg-white' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
                title={`Jump to ${stg.label}`}
              />
            ))}
          </div>
          <span className="text-zinc-500 text-[11px]">
            {activeStage === 'calls' && 'Stage 1 of 4: Call Recording'}
            {activeStage === 'summarizing' && 'Stage 2 of 4: Smart Summary'}
            {activeStage === 'annotation' && 'Stage 3 of 4: Document Highlights'}
            {activeStage === 'notes' && 'Stage 4 of 4: Meeting Notes'}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextStage}
          >
            <span>Next Demo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>

          <Button variant="primary" size="sm" onClick={onOpenWorkspace}>
            <span>Open Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
