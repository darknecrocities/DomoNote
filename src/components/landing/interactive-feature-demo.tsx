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
  const [drawAnimKey, setDrawAnimKey] = useState<number>(0);

  // Meeting Notes Checklist State
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
  });

  const stages: { id: DemoStage; label: string; number: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'calls', label: 'Voice Listener', number: '01', icon: Mic },
    { id: 'summarizing', label: 'Quick Summary', number: '02', icon: Sparkles },
    { id: 'annotation', label: 'Red Highlighter', number: '03', icon: Highlighter },
    { id: 'notes', label: 'To-Do Checklist', number: '04', icon: FileText },
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
    const notesMarkdown = `# Secret Notes
Date: Today | Friends: Arron, Elena, Marcus

## Quick Summary
We talked about keeping all notes safe at home on this computer. Nobody on the internet can peek at what you write!

## Things We Decided
- [x] 100% Private: Keep all notes locked on this computer screen.
- [x] No Wi-Fi Needed: Works anywhere, even on an airplane.
- [x] Red Pen Magic: Highlights the only sentence that matters so you save time.

## To-Do List
- [x] Download DomoNote to your computer (@Arron, Done!)
- [ ] Turn off your Wi-Fi and write a quick note (@Elena, Try it!)
- [ ] Let DomoNote highlight a long paper in red (@Marcus, Easy!)
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
      title: 'Secret Diary Rule',
      targetText: 'THE #1 RULE: Everything you say and write stays locked safely inside your own computer. No one on the internet can ever see your notes, and we never send your words to outside companies.',
      stepTag: '01 • 100% Private',
      note: 'Your notes are locked like a secret diary at home. No strangers can read them.',
      highlightSentence: 'Everything you say and write stays locked safely inside your own computer.',
    },
    {
      title: 'Works With No Wi-Fi',
      targetText: 'NO INTERNET NEEDED: DomoNote has its own smart brain built right into your laptop. You can write, talk, and get helpful answers even if your internet is completely turned off.',
      stepTag: '02 • Works Everywhere',
      note: 'You can take notes on an airplane, in the car, or during a storm with zero internet.',
      highlightSentence: 'You can write, talk, and get helpful answers even if your internet is completely turned off.',
    },
    {
      title: 'Red Pen Magic',
      targetText: 'READS FOR YOU: Instead of forcing you to read ten pages of tiny, boring words, DomoNote draws a bright red box around the only sentence that actually answers your question.',
      stepTag: '03 • Saves Your Time',
      note: 'Finds the exact answer in two seconds so you can finish quickly and go have fun.',
      highlightSentence: 'DomoNote draws a bright red box around the only sentence that actually answers your question.',
    },
  ];

  return (
    <div className="w-full rounded-2xl border border-zinc-850 bg-zinc-950 overflow-hidden shadow-xl font-sans text-left relative z-10">
      {/* Top Minimal Bar */}
      <div className="px-4 py-3 border-b border-zinc-850 bg-zinc-900/50 flex items-center justify-between gap-3 text-xs">
        {/* Left: Window Dots & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
          </div>

          <div className="h-3.5 w-[1px] bg-zinc-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-200">Interactive Demo</span>
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
                    <span className="font-semibold text-white">Talking with Friends</span>
                    <span className="text-zinc-500 font-mono text-[11px]">
                      00:{callDuration < 10 ? `0${callDuration}` : callDuration}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Listens and writes down your words</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-850 text-zinc-300 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Listening Now</span>
                </span>
              </div>
            </div>

            {/* Visualizer & Dialogue Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Speakers Column */}
              <div className="lg:col-span-4 p-3.5 rounded-lg border border-zinc-850 bg-zinc-900/30 space-y-2.5 text-xs">
                <div className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
                  <span>Friends in Chat</span>
                  <span className="text-zinc-500">3 friends</span>
                </div>

                <div className="space-y-2">
                  {[
                    { name: 'Arron Parejas', role: 'Speaking', active: activeSpeakerIndex === 0 },
                    { name: 'Elena Rostova', role: 'Listening', active: activeSpeakerIndex === 1 },
                    { name: 'Marcus Vance', role: 'Listening', active: activeSpeakerIndex === 2 },
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
                        <span className="text-[10px] font-mono text-emerald-400">Talking</span>
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
                    "Hey guys! Everything we say stays locked inside this computer. Nobody else on the internet can ever hear us!"
                  </div>

                  <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-zinc-300">
                    <span className="text-[10px] text-zinc-500 block mb-0.5">Elena Rostova:</span>
                    "Yes! DomoNote listens to our voices and writes down every word cleanly, all by itself."
                  </div>

                  <div className="p-2 rounded bg-zinc-900 border border-zinc-750 text-white">
                    <span className="text-[10px] text-emerald-400 block mb-0.5">Marcus Vance:</span>
                    "That means our private ideas and secrets are 100% safe at home."
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
                    <span className="font-semibold text-white">Quick Summary</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400">Smart Helper</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Turns long talks into short, easy bullet points</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-850 text-zinc-300 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Saved & Ready</span>
              </span>
            </div>

            {/* Clean 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
              {/* Left: Input snippets */}
              <div className="lg:col-span-5 p-3.5 rounded-lg border border-zinc-850 bg-zinc-900/30 space-y-2">
                <div className="text-[11px] font-medium text-zinc-400">What We Said</div>
                <div className="space-y-2 p-3 rounded bg-zinc-950 border border-zinc-850 text-zinc-400 text-[11px] leading-relaxed">
                  <p>• Keep all notes safe on this computer</p>
                  <p>• Works even when you turn off Wi-Fi</p>
                  <p>• Draw red boxes on important sentences</p>
                  <p>• No strangers can ever see your secrets</p>
                </div>
              </div>

              {/* Right: Structured Notes */}
              <div className="lg:col-span-7 p-3.5 rounded-lg border border-zinc-850 bg-zinc-900/30 space-y-3">
                <div className="text-[11px] font-medium text-zinc-300">Short Summary</div>

                <div className="p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 leading-relaxed text-xs">
                  <div className="text-[10px] text-zinc-500 uppercase font-semibold mb-1">In Simple Words</div>
                  DomoNote listens to your voice, writes your notes, and keeps all your secrets locked safely on this computer so nobody else can see them.
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-300 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span>100% Secret: Like a diary with a physical lock on it.</span>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-300 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Super Fast: Answers right away without waiting for slow internet.</span>
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
                <div className="w-8 h-8 rounded-lg bg-red-950/50 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
                  <Highlighter className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Whole Paper Reader</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-red-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      Magic Red Pen
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Draws a bright red box around the only sentence you need to read
                  </p>
                </div>
              </div>

              {/* Controls & Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setDrawAnimKey((k) => k + 1)}
                  className="px-2.5 py-1 rounded text-xs border border-red-500/40 bg-red-950/30 text-red-300 hover:bg-red-900/40 hover:text-white transition-colors flex items-center gap-1.5 font-medium shadow-xs"
                  title="Replay hand-drawn red annotation animation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Draw Again</span>
                </button>

                <button
                  onClick={() => setIsZoomMode(!isZoomMode)}
                  className={`px-2.5 py-1 rounded text-xs border transition-colors flex items-center gap-1 ${
                    isZoomMode
                      ? 'bg-white text-black border-white font-medium'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
                  }`}
                  title="Toggle document zoom"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>{isZoomMode ? 'Zoom: Big' : 'Zoom In'}</span>
                </button>

                {annotationPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedAnnotationPreset(idx);
                      setDrawAnimKey((k) => k + 1);
                    }}
                    className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                      selectedAnnotationPreset === idx
                        ? 'bg-red-600 text-white border-red-500 font-semibold shadow-xs'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-white'
                    }`}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Whole Paper Document View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left 8 Cols: Whole Clean Paper Document Sheet */}
              <div
                className={`lg:col-span-8 rounded-xl border border-zinc-300 bg-white text-zinc-900 p-6 sm:p-8 shadow-2xl transition-all duration-300 relative text-xs leading-relaxed font-sans ${
                  isZoomMode ? 'scale-[1.02] shadow-2xl' : 'scale-100'
                }`}
              >
                {/* Paper Header / Official Spec Letterhead */}
                <div className="border-b-2 border-zinc-900 pb-3 mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-mono tracking-widest uppercase font-bold text-zinc-500">
                      DOMONOTE EASY GUIDE FOR EVERYONE
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-zinc-950 tracking-tight mt-0.5">
                      How DomoNote Keeps All Your Notes Safe & Simple
                    </h3>
                    <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      Works on Mac, Windows, and Linux • 100% Private at Home
                    </div>
                  </div>
                  <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-100 text-red-700 border border-red-300">
                      TOP SECRET
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">Page 1 of 1</span>
                  </div>
                </div>

                {/* Section 1: Executive Context */}
                <div className="space-y-1 mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 font-mono">
                    1. What This Paper Is About
                  </div>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Welcome to DomoNote — Your Personal AI Secretary! This paper explains why DomoNote is special: it helps you remember everything, reads long papers for you, and never lets strangers or outside companies see your notes.
                  </p>
                </div>

                {/* Section 2: Important Mandate with Animated Hand-Drawn Red Outline & Underline */}
                <div className="relative my-4">
                  <div
                    key={`paper-box-${selectedAnnotationPreset}-${drawAnimKey}`}
                    className="relative p-4 rounded-lg bg-red-50/50 border border-red-200/80 transition-all duration-300"
                  >
                    {/* Hand-Drawn SVG Red Box Outline with Draw Animation */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      preserveAspectRatio="none"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="calc(100% - 4px)"
                        height="calc(100% - 4px)"
                        rx="8"
                        ry="8"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-red-box"
                      />
                    </svg>

                    {/* Excerpt Header */}
                    <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-red-600">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span>IMPORTANT // {annotationPresets[selectedAnnotationPreset].stepTag}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-600 text-white font-bold tracking-wider animate-red-stamp">
                        MUST READ
                      </span>
                    </div>

                    {/* Target Text */}
                    <p className="text-zinc-950 font-semibold text-xs sm:text-sm leading-relaxed relative z-10">
                      "{annotationPresets[selectedAnnotationPreset].targetText}"
                    </p>

                    {/* Animated Red Hand-Drawn Underline SVG */}
                    <svg
                      key={`underline-${selectedAnnotationPreset}-${drawAnimKey}`}
                      className="w-full h-3 mt-1.5 pointer-events-none relative z-10"
                      viewBox="0 0 400 12"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M 2 7 Q 100 12, 200 6 T 398 7"
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="animate-red-underline"
                      />
                    </svg>

                    {/* Annotation Footer */}
                    <div className="mt-2.5 pt-2 border-t border-red-200 flex flex-wrap items-center justify-between text-[11px] text-red-700 font-mono relative z-10">
                      <span>Important Rule #{selectedAnnotationPreset + 1}</span>
                      <span>Magic Red Pen: Hand-Drawn For You</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: "What this document is about" Key Takeaways */}
                <div className="space-y-2 mt-4 pt-3 border-t border-zinc-200">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 font-mono">
                    2. Why You Will Love It (The 3 Big Perks)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                      <span className="font-bold text-red-600 block">✓ 100% Private</span>
                      <span className="text-zinc-600 mt-0.5 block">
                        Your words and papers stay inside your computer. Nobody else can peek.
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                      <span className="font-bold text-red-600 block">✓ Works Without Wi-Fi</span>
                      <span className="text-zinc-600 mt-0.5 block">
                        DomoNote has its own smart brain right inside your laptop. No internet needed!
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                      <span className="font-bold text-red-600 block">✓ Saves You Time</span>
                      <span className="text-zinc-600 mt-0.5 block">
                        Draws a bright red box around the answer so you don't have to read 10 boring pages.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Paper Footer */}
                <div className="mt-5 pt-3 border-t-2 border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>DOMONOTE SIMPLE NOTE</span>
                  <span>100% PRIVATE • SAFE • NO WI-FI NEEDED</span>
                </div>
              </div>

              {/* Right 4 Cols: Inspector */}
              <div className="lg:col-span-4 p-4 rounded-xl border border-zinc-850 bg-zinc-900/40 text-xs space-y-4">
                <div className="pb-3 border-b border-zinc-850">
                  <div className="font-semibold text-white mb-1">Magic Red Pen Helper</div>
                  <div className="text-[11px] text-zinc-400">
                    Shows why this sentence was highlighted in red
                  </div>
                </div>

                {/* Color Badge */}
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                    Pen Color
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-500 ring-2 ring-red-500/40 animate-pulse shrink-0" />
                    <span className="font-bold text-white text-xs">Bright Red Marker</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Draws a red box and a red underline so you can spot the important part in 1 second.
                  </div>
                </div>

                {/* Why This is Highlighted */}
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                    Why Is This Highlighted?
                  </span>
                  <p className="text-zinc-200 text-xs leading-relaxed">
                    {annotationPresets[selectedAnnotationPreset].note}
                  </p>
                </div>

                {/* Document Information */}
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Paper Name</span>
                    <span className="font-mono text-zinc-200">My-Notes.pdf</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Where to Look</span>
                    <span className="font-mono text-zinc-200">Middle of paper</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Privacy Level</span>
                    <span className="font-mono text-red-400 font-bold">100% Private</span>
                  </div>
                </div>

                {/* Replay Button */}
                <button
                  onClick={() => setDrawAnimKey((k) => k + 1)}
                  className="w-full py-2.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Draw Red Box Again</span>
                </button>
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
                    <span className="font-semibold text-white">My Weekly Plan</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400">Today</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Saved safely on your computer</p>
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
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1 text-zinc-400" />
                      <span>Copy Notes</span>
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
                <span>Duration: 15 mins</span>
                <span>•</span>
                <span>Friends: Arron, Elena, Marcus</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Left 6: Summary & Decisions */}
                <div className="md:col-span-6 space-y-3">
                  <div>
                    <div className="font-semibold text-zinc-300 mb-1 text-xs">Quick Summary</div>
                    <p className="p-2.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-300 text-xs leading-relaxed">
                      We all agreed: DomoNote is the best because all our notes stay on our own computer, and it writes down to-dos automatically!
                    </p>
                  </div>

                  <div>
                    <div className="font-semibold text-zinc-300 mb-1 text-xs">What We Decided</div>
                    <div className="space-y-1.5 text-xs">
                      <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-zinc-300 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Always use bright red boxes to highlight the most important sentence.</span>
                      </div>
                      <div className="p-2 rounded bg-zinc-950 border border-zinc-850 text-zinc-300 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Keep everything working even when Wi-Fi is completely turned off.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 6: Action Items */}
                <div className="md:col-span-6 space-y-2">
                  <div className="font-semibold text-zinc-300 mb-1 text-xs">To-Do List (Click to check off!)</div>

                  {[
                    { text: 'Download DomoNote to your computer', owner: '@Arron' },
                    { text: 'Turn off Wi-Fi and write a secret note', owner: '@Elena' },
                    { text: 'Let DomoNote highlight a long paper in red', owner: '@Marcus' },
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
          <span>Listens to your voice, summarizes long chats, and highlights what matters in red.</span>
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
