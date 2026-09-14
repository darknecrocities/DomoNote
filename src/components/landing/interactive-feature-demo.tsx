import React, { useState, useEffect } from 'react';
import {
  Mic,
  FileText,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
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
    25, 45, 35, 60, 50, 30, 65, 75, 45, 35, 55, 70, 40, 60, 30, 45, 65, 40, 55, 70, 25, 45
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

  // Auto-play loop carousel timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStage((current) => {
            if (current === 'calls') return 'summarizing';
            if (current === 'summarizing') return 'annotation';
            if (current === 'annotation') return 'notes';
            return 'calls';
          });
          return 0;
        }
        return prev + 1.8;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Gentle wave update
  useEffect(() => {
    if (activeStage !== 'calls' || !isPlaying) return;

    const waveTimer = setInterval(() => {
      setAudioWaves((prev) =>
        prev.map(() => Math.floor(Math.random() * 55) + 20)
      );
      setCallDuration((prev) => prev + 1);
    }, 320);

    const speakerTimer = setInterval(() => {
      setActiveSpeakerIndex((prev) => (prev + 1) % 3);
    }, 3200);

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
    const notesMarkdown = `# Team Architecture Sync
Date: September 14, 2026 | Duration: 42m | Participants: Alex Chen, Elena Rostova, Marcus Vance

## Executive Summary
The team verified DomoNote's local-first architecture. All speech transcripts, document highlights, and notes stay strictly on your device without sending any data to remote servers.

## Key Decisions
- [x] Private by Default: Safe for confidential team meetings.
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
      title: 'Local Storage',
      targetText: 'All extracted document text, audio recordings, and screen captures are kept directly on your computer in local storage.',
      stepTag: '01 • Local Storage',
      note: 'Keeps confidential legal, medical, and executive documents completely private on your device.',
    },
    {
      title: 'Clean Outlines',
      targetText: 'Dynamic bounding boxes draw around exact sentences with zero background shading, preserving original document readability.',
      stepTag: '02 • Clean Citation',
      note: 'Enables clear visual citation directly inside the original page layout without obscuring text.',
    },
    {
      title: 'Offline AI',
      targetText: 'Local AI models run entirely within user machine memory on port 11434 with instant responses and zero cloud latency.',
      stepTag: '03 • Fast & Offline',
      note: 'Works anywhere without an internet connection, with zero monthly subscription fees.',
    },
  ];

  return (
    <div className="w-full rounded-2xl border border-zinc-850 bg-zinc-950 overflow-hidden shadow-xl font-sans text-left relative z-10">
      {/* Top Minimal Bar */}
      <div className="px-4 py-3 border-b border-zinc-850 bg-zinc-900/50 flex items-center justify-between gap-3 text-xs">
        {/* Left: Window Dots, Title & Minimal Online Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
          </div>

          <div className="h-3.5 w-[1px] bg-zinc-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-200">Interactive Demo</span>
            {/* Minimal Online Status */}
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Online</span>
            </span>
          </div>
        </div>

        {/* Right: Minimal Carousel Controls */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <button
            onClick={handlePrevStage}
            className="p-1 rounded hover:bg-zinc-800 hover:text-white transition-colors"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono text-[11px] px-1 text-zinc-400">
            {currentStageIndex + 1} / 4
          </span>

          <button
            onClick={handleNextStage}
            className="p-1 rounded hover:bg-zinc-800 hover:text-white transition-colors"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded hover:bg-zinc-800 hover:text-white transition-colors ml-1"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setProgress(0)}
            className="p-1 rounded hover:bg-zinc-800 hover:text-white transition-colors"
            title="Replay"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Minimal Stepper Tabs */}
      <div className="px-3 sm:px-6 pt-3 pb-2 border-b border-zinc-850 bg-zinc-950 overflow-x-auto no-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 min-w-[500px] md:min-w-0">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isActive = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => handleStageSelect(stage.id)}
                className={`relative flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-colors ${
                  isActive
                    ? 'bg-zinc-900 border-zinc-700 text-white'
                    : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs ${
                    isActive ? 'bg-white text-black' : 'bg-zinc-850 text-zinc-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">
                    {stage.number}
                  </div>
                  <div className="text-xs font-medium truncate">
                    {stage.label}
                  </div>
                </div>

                {/* Minimal Progress Line */}
                {isActive && (
                  <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-zinc-800 rounded-full overflow-hidden">
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

      {/* Main Slide Content */}
      <div key={activeStage} className="p-5 sm:p-6 min-h-[440px] flex flex-col justify-between bg-[#080808] animate-slide-in-right">
        {/* ================= STAGE 1: CALL RECORDING ================= */}
        {activeStage === 'calls' && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="p-3.5 rounded-lg border border-zinc-850 bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-white">Sprint Planning Sync</span>
                    <span className="text-zinc-500 font-mono text-[11px]">
                      00:{callDuration < 10 ? `0${callDuration}` : callDuration}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Local Audio Recording</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-850 text-zinc-300 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Recording Active</span>
                </span>
              </div>
            </div>

            {/* Visualizer & Dialogue Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Speakers Column */}
              <div className="lg:col-span-4 p-3.5 rounded-lg border border-zinc-850 bg-zinc-900/30 space-y-2.5 text-xs">
                <div className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
                  <span>Speakers</span>
                  <span className="text-zinc-500">3 in call</span>
                </div>

                <div className="space-y-2">
                  {[
                    { name: 'Arron Parejas', role: 'Host', active: activeSpeakerIndex === 0 },
                    { name: 'Elena Rostova', role: 'Engineer', active: activeSpeakerIndex === 1 },
                    { name: 'Marcus Vance', role: 'Reviewer', active: activeSpeakerIndex === 2 },
                  ].map((speaker, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded border flex items-center justify-between transition-colors ${
                        speaker.active
                          ? 'bg-zinc-900 border-zinc-700 text-white'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-medium text-xs ${
                            speaker.active ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {speaker.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-200">{speaker.name}</div>
                          <div className="text-[10px] text-zinc-500">{speaker.role}</div>
                        </div>
                      </div>
                      {speaker.active && (
                        <span className="text-[10px] font-mono text-emerald-400">Speaking</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio Wave & Transcript Stream */}
              <div className="lg:col-span-8 p-3.5 rounded-lg border border-zinc-850 bg-zinc-900/30 space-y-3 flex flex-col justify-between">
                {/* Flat minimal sound wave */}
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 flex items-center justify-between gap-1 h-12">
                  {audioWaves.map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-zinc-500 rounded-sm transition-all duration-200"
                      style={{
                        height: `${height}%`,
                        opacity: height > 50 ? 0.9 : 0.4,
                      }}
                    />
                  ))}
                </div>

                {/* Clean Transcript Stream */}
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-zinc-300">
                    <span className="text-[10px] text-zinc-500 block mb-0.5">Arron Parejas:</span>
                    "Let's ensure DomoNote keeps all audio buffers strictly in browser memory without sending files outside."
                  </div>

                  <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-zinc-300">
                    <span className="text-[10px] text-zinc-500 block mb-0.5">Elena Rostova:</span>
                    "Confirmed. Speech-to-text runs directly on your computer with instant summaries."
                  </div>

                  <div className="p-2 rounded bg-zinc-900 border border-zinc-750 text-white">
                    <span className="text-[10px] text-emerald-400 block mb-0.5">Marcus Vance:</span>
                    "That eliminates data leakage risk for sensitive meetings."
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 2: SMART SUMMARIZING ================= */}
        {activeStage === 'summarizing' && (
          <div className="space-y-5">
            {/* Header */}
            <div className="p-3.5 rounded-lg border border-zinc-850 bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Meeting Summary</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400">Local Llama 3.2</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Key decisions and action items extracted</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-850 text-zinc-300 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Ready to Export</span>
              </span>
            </div>

            {/* Clean 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
              {/* Left: Input snippets */}
              <div className="lg:col-span-5 p-3.5 rounded-lg border border-zinc-850 bg-zinc-900/30 space-y-2">
                <div className="text-[11px] font-medium text-zinc-400">Conversation Highlights</div>
                <div className="space-y-2 p-3 rounded bg-zinc-950 border border-zinc-850 text-zinc-400 text-[11px] leading-relaxed">
                  <p>• Reviewed local-first storage architecture</p>
                  <p>• IndexedDB stores documents and audio</p>
                  <p>• Everything runs directly on your computer</p>
                  <p>• Document highlighting ready for testing</p>
                </div>
              </div>

              {/* Right: Structured Notes */}
              <div className="lg:col-span-7 p-3.5 rounded-lg border border-zinc-850 bg-zinc-900/30 space-y-3">
                <div className="text-[11px] font-medium text-zinc-300">Generated Highlights</div>

                <div className="p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 leading-relaxed text-xs">
                  <div className="text-[10px] text-zinc-500 uppercase font-semibold mb-1">Overview</div>
                  The team confirmed DomoNote's on-device setup. Speech transcripts, document highlights, and notes stay strictly on your device.
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-300 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Private by Default: Safe for confidential internal discussions.</span>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-300 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Fast Local AI: Instant answers without cloud latency.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 3: DOCUMENT ANNOTATION (MINIMAL, NOT FUTURISTIC) ================= */}
        {activeStage === 'annotation' && (
          <div className="space-y-5">
            {/* Header */}
            <div className="p-3.5 rounded-lg border border-zinc-850 bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                  <Highlighter className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Document Viewer</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400">Clean Sentence Outlines</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">High-precision border boxes without obscuring text</p>
                </div>
              </div>

              {/* Minimal Zoom Toggle & Presets */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsZoomMode(!isZoomMode)}
                  className={`px-2.5 py-1 rounded text-xs border transition-colors flex items-center gap-1 ${
                    isZoomMode
                      ? 'bg-white text-black border-white font-medium'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
                  }`}
                  title="Toggle subtle zoom"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>{isZoomMode ? 'Zoom: On' : 'Zoom In'}</span>
                </button>

                {annotationPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedAnnotationPreset(idx)}
                    className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                      selectedAnnotationPreset === idx
                        ? 'bg-zinc-800 text-white border-zinc-700 font-medium'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-white'
                    }`}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Document Reader (Minimal Paper Style) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left 7 Cols: Clean White Paper Document */}
              <div className="lg:col-span-7 rounded-lg border border-zinc-300 bg-white text-zinc-900 p-5 shadow-sm text-xs leading-relaxed font-sans space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2 text-[11px] text-zinc-500 font-mono">
                  <span className="font-medium text-zinc-700">Architecture_Overview.pdf</span>
                  <span>Page 3 of 8</span>
                </div>

                <p className="text-zinc-600">
                  DomoNote stores all your data directly on your device. Documents, audio notes, and transcripts are never uploaded to third-party web servers.
                </p>

                {/* MINIMAL, NON-FUTURISTIC ANNOTATION BOX */}
                <div
                  key={`${selectedAnnotationPreset}-${isZoomMode}`}
                  className={`p-3 rounded border-2 border-zinc-900 bg-zinc-50/90 transition-all duration-200 animate-box-zoom ${
                    isZoomMode ? 'scale-[1.02] shadow-md bg-white' : 'scale-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
                    <span className="font-semibold text-zinc-900">
                      {annotationPresets[selectedAnnotationPreset].stepTag}
                    </span>
                    <span className="text-zinc-400">Cited Excerpt</span>
                  </div>

                  <p className="text-zinc-900 font-medium text-xs sm:text-sm">
                    "{annotationPresets[selectedAnnotationPreset].targetText}"
                  </p>
                </div>

                <p className="text-zinc-600">
                  Clean border boxes let you read the original document naturally with clear references.
                </p>
              </div>

              {/* Right 5 Cols: Minimal Inspector */}
              <div className="lg:col-span-5 p-4 rounded-lg border border-zinc-850 bg-zinc-900/30 text-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="font-medium text-zinc-300 pb-2 border-b border-zinc-850 mb-3">
                    Citation Details
                  </div>

                  <div className="space-y-3">
                    <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-300 text-xs">
                      <span className="text-[10px] text-zinc-500 block mb-1">Why this is highlighted:</span>
                      {annotationPresets[selectedAnnotationPreset].note}
                    </div>

                    <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-[11px] text-zinc-400 flex items-center justify-between">
                      <span>Location</span>
                      <span className="font-mono text-zinc-300">Page 3, Line 12</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-850 text-[11px] text-zinc-500">
                  Click 'Zoom In' above for focused viewing
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 4: SAMPLE MEETING NOTES ================= */}
        {activeStage === 'notes' && (
          <div className="space-y-5">
            {/* Header */}
            <div className="p-3.5 rounded-lg border border-zinc-850 bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Weekly Planning Note</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400">Sep 14, 2026</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Stored in your local workspace</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyNotes}
                  className="text-xs h-7 px-2.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1 text-zinc-400" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={onOpenWorkspace}
                  className="text-xs h-7 px-2.5"
                >
                  <span>Open Workspace</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>

            {/* Clean Note Content */}
            <div className="p-4 sm:p-5 rounded-lg border border-zinc-850 bg-zinc-900/20 text-xs space-y-4">
              <div className="flex items-center gap-2 text-zinc-400 text-[11px] pb-3 border-b border-zinc-850">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Duration: 42 mins</span>
                <span>•</span>
                <span>Attendees: Arron Parejas, Elena Rostova, Marcus Vance</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Left 6: Summary & Decisions */}
                <div className="md:col-span-6 space-y-3">
                  <div>
                    <div className="font-semibold text-zinc-300 mb-1 text-xs">Summary</div>
                    <p className="p-2.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-300 text-xs leading-relaxed">
                      The team confirmed DomoNote's local-first architecture. Transcripts, document highlights, and notes stay strictly on your device.
                    </p>
                  </div>

                  <div>
                    <div className="font-semibold text-zinc-300 mb-1 text-xs">Decisions</div>
                    <div className="space-y-1.5 text-xs">
                      <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-zinc-300 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Use clean border-only outlines for document citations.</span>
                      </div>
                      <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-zinc-300 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Llama 3.2 3B recommended for offline AI.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 6: Action Items */}
                <div className="md:col-span-6 space-y-2">
                  <div className="font-semibold text-zinc-300 mb-1 text-xs">Action Items</div>

                  {[
                    { text: 'Add border-only document citation boxes', owner: '@Alex' },
                    { text: 'Verify offline Ollama model status', owner: '@Elena' },
                    { text: 'Test macOS and Windows standalone downloads', owner: '@Marcus' },
                  ].map((task, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleTask(idx)}
                      className="p-2.5 rounded bg-zinc-950 border border-zinc-850 hover:border-zinc-700 cursor-pointer flex items-center gap-2.5 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedTasks[idx]}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 text-white accent-white cursor-pointer"
                      />
                      <span className={`flex-1 ${checkedTasks[idx] ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {task.text}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">{task.owner}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Bar */}
      <div className="p-3.5 border-t border-zinc-850 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Clean audio transcription, smart summaries, and document reader.</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextStage}
            className="text-xs h-7 px-2.5"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenWorkspace}
            className="text-xs h-7 px-2.5"
          >
            <span>Open Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
