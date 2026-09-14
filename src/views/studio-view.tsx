import React, { useState, useRef, useEffect } from 'react';
import { db } from '../db';
import type { Manual, ManualStep, Note } from '../types';
import { useWorkspace } from '../context/workspace-context';
import { useSound } from '../context/sound-context';
import { useAI } from '../context/ai-context';
import { ollama } from '../services/ai/ollama';
import { screenAnnotator } from '../services/screen/annotator';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Video,
  Camera,
  Square,
  Play,
  Download,
  CameraOff,
  Sparkles,
  ArrowRight,
  Monitor,
  CheckCircle,
  Copy,
  FileText,
  Clock,
  Crosshair,
  Sliders,
  X,
} from 'lucide-react';

interface RecordedKeyframeStep {
  id: string;
  stepNumber: number;
  timestampSeconds: number;
  title: string;
  description: string;
  screenshotDataUrl: string;
  coords: { x: number; y: number };
}

export const StudioView: React.FC = () => {
  const { addToast, setActiveView, setActiveManualId } = useWorkspace();
  const { playThock, playChime, playPop } = useSound();
  const { isConnected, selectedModel } = useAI();

  const [isRecording, setIsRecording] = useState(false);
  const [hasScreenStream, setHasScreenStream] = useState(false);
  const [enableWebcam, setEnableWebcam] = useState(false);
  const [autoAnnotateEnabled, setAutoAnnotateEnabled] = useState(true);
  const [autoIntervalSec, setAutoIntervalSec] = useState(8);
  const [sessionTitle, setSessionTitle] = useState('Standard Operating Procedure');
  const [capturedSteps, setCapturedSteps] = useState<RecordedKeyframeStep[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [clickIndicator, setClickIndicator] = useState<{ x: number; y: number } | null>(null);

  // Documentation preview modal
  const [showDocModal, setShowDocModal] = useState(false);
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const [isSavingDoc, setIsSavingDoc] = useState(false);

  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);
  const autoCaptureTimerRef = useRef<any>(null);

  // Timer counter
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Dynamic automatic annotation timer
  useEffect(() => {
    if (isRecording && autoAnnotateEnabled && autoIntervalSec > 0) {
      autoCaptureTimerRef.current = setInterval(() => {
        captureAnnotatedStep();
      }, autoIntervalSec * 1000);
    } else {
      if (autoCaptureTimerRef.current) clearInterval(autoCaptureTimerRef.current);
    }
    return () => {
      if (autoCaptureTimerRef.current) clearInterval(autoCaptureTimerRef.current);
    };
  }, [isRecording, autoAnnotateEnabled, autoIntervalSec, capturedSteps.length]);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoCaptureTimerRef.current) clearInterval(autoCaptureTimerRef.current);
    };
  }, []);

  // Request display media for screen capture
  const handleStartScreenStream = async () => {
    try {
      playPop();
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: true,
      });

      screenStreamRef.current = stream;
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        screenVideoRef.current.play();
      }

      setHasScreenStream(true);
      setIsRecording(true);
      setElapsedSeconds(0);
      setCapturedSteps([]);

      // Stop automatically if user clicks native browser "Stop Sharing" button
      stream.getVideoTracks()[0].onended = () => {
        handleStopRecording();
      };

      addToast('Screen stream active. Auto-annotation will capture keyframes dynamically.', 'success');
    } catch (err: any) {
      console.warn('[DomoNote] Screen recording cancelled:', err?.message);
      addToast('Screen recording access was cancelled or not permitted.', 'warning');
    }
  };

  // Toggle webcam overlay
  const handleToggleWebcam = async () => {
    if (enableWebcam) {
      webcamStreamRef.current?.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current = null;
      setEnableWebcam(false);
      playThock();
    } else {
      try {
        playPop();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: false,
        });
        webcamStreamRef.current = stream;
        if (webcamVideoRef.current) {
          webcamVideoRef.current.srcObject = stream;
          webcamVideoRef.current.play();
        }
        setEnableWebcam(true);
      } catch {
        addToast('Camera access denied or unavailable.', 'warning');
      }
    }
  };

  // Capture an annotated step (manual or automated or click-based)
  const captureAnnotatedStep = async (explicitCoords?: { x: number; y: number }) => {
    if (!screenVideoRef.current) return;
    playThock(1.2);

    const stepNum = capturedSteps.length + 1;

    try {
      // Burn dynamic annotations directly onto canvas frame
      const { dataUrl, point } = screenAnnotator.captureAndAnnotate(screenVideoRef.current, {
        stepNumber: stepNum,
        point: explicitCoords,
        timestampSeconds: elapsedSeconds,
        label: `STEP ${stepNum}: ACTION`,
      });

      let instruction = `Step ${stepNum}: Verify interaction at focal coordinate (${Math.round(point.x)}%, ${Math.round(point.y)}%).`;

      // If Ollama is connected, query concise procedural instruction
      if (isConnected && selectedModel) {
        try {
          const prompt = `Write a single concise technical action instruction (15 words or less) for Step ${stepNum} in an operational manual titled "${sessionTitle}". Keep it direct and procedural.`;
          const res = await ollama.generate(prompt, {
            model: selectedModel,
            temperature: 0.2,
          });
          if (res && res.trim()) {
            instruction = res.trim().replace(/^"|"$/g, '');
          }
        } catch {
          // fallback remains
        }
      }

      const newStep: RecordedKeyframeStep = {
        id: `step-${Date.now()}-${stepNum}`,
        stepNumber: stepNum,
        timestampSeconds: elapsedSeconds,
        title: `Action Point ${stepNum}`,
        description: instruction,
        screenshotDataUrl: dataUrl,
        coords: point,
      };

      setCapturedSteps((prev) => [...prev, newStep]);
      addToast(`Step ${stepNum} annotated and captured.`, 'info');
    } catch {
      addToast('Could not grab annotated frame.', 'error');
    }
  };

  // Interactive click on video to capture exact coordinate
  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!isRecording || !screenVideoRef.current) return;

    const rect = screenVideoRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    setClickIndicator({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setClickIndicator(null), 1000);

    captureAnnotatedStep({ x: clickX, y: clickY });
  };

  // Stop recording and open documentation generator modal
  const handleStopRecording = () => {
    playChime();
    setIsRecording(false);
    if (autoCaptureTimerRef.current) clearInterval(autoCaptureTimerRef.current);
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    webcamStreamRef.current?.getTracks().forEach((t) => t.stop());
    setHasScreenStream(false);
    setEnableWebcam(false);

    if (capturedSteps.length > 0) {
      // Synthesize full Markdown SOP
      const md = screenAnnotator.generateSopMarkdown({
        title: sessionTitle || 'Standard Operating Procedure',
        purpose: `Automated operation procedure manual generated via DomoNote Studio recording. Captured ${capturedSteps.length} dynamically annotated procedural keyframes.`,
        requirements: ['Verified environment credentials', 'Administrative operational authorization'],
        steps: capturedSteps.map((s) => ({
          stepNumber: s.stepNumber,
          title: s.title,
          description: s.description,
          timestampMs: s.timestampSeconds * 1000,
          targetCoords: s.coords,
          screenshotDataUrl: s.screenshotDataUrl,
        })),
      });

      setGeneratedMarkdown(md);
      setShowDocModal(true);
      addToast('Screen capture finished. SOP documentation ready for review.', 'success');
    } else {
      addToast('Screen capture ended without any keyframe steps.', 'warning');
    }
  };

  // Save SOP to database (Manuals and Notes)
  const handleSaveDocumentation = async () => {
    if (capturedSteps.length === 0) return;
    setIsSavingDoc(true);

    try {
      const manualId = `manual-sop-${Date.now()}`;
      const noteId = `note-sop-${Date.now()}`;

      const manualSteps: ManualStep[] = capturedSteps.map((s) => ({
        id: `mstep-${s.stepNumber}`,
        stepNumber: s.stepNumber,
        title: s.title,
        description: s.description,
        screenshotDataUrl: s.screenshotDataUrl,
        annotations: [
          {
            id: `ann-${s.id}`,
            documentId: manualId,
            pageNumber: 1,
            type: 'marker',
            coords: { x: s.coords.x, y: s.coords.y, width: 4, height: 4 },
            color: '#ffffff',
            label: `Step ${s.stepNumber}`,
            stepNumber: s.stepNumber,
            createdAt: Date.now(),
          },
        ],
        timestampMs: s.timestampSeconds * 1000,
      }));

      const newManual: Manual = {
        id: manualId,
        title: sessionTitle.trim() || 'Standard Operating Procedure',
        purpose: `Standard Operating Procedure generated via DomoNote Studio recording. Captured ${capturedSteps.length} procedural keyframes with dynamic annotations.`,
        requirements: ['Browser display access', 'Standard computer operational privileges'],
        steps: manualSteps,
        warnings: ['Verify configurations before committing changes.'],
        expectedResult: 'Screen operation captured and verified.',
        troubleshooting: ['Review step screenshot annotations if UI elements differ.'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      };

      const newNote: Note = {
        id: noteId,
        title: `${sessionTitle.trim() || 'Operation'} SOP Documentation`,
        content: generatedMarkdown,
        tags: ['sop', 'manual', 'screen-recording'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        versions: [
          {
            id: `v-${Date.now()}`,
            title: `${sessionTitle.trim() || 'Operation'} SOP Documentation`,
            content: generatedMarkdown,
            timestamp: Date.now(),
          },
        ],
      };

      await db.manuals.put(newManual);
      await db.notes.put(newNote);

      addToast('Documentation saved to Manuals and Notes.', 'success');
      setShowDocModal(false);
      setActiveManualId(manualId);
      setActiveView('manuals');
    } catch {
      addToast('Failed to save documentation.', 'error');
    } finally {
      setIsSavingDoc(false);
    }
  };

  // Download Markdown file
  const handleDownloadMarkdown = () => {
    playPop();
    const blob = new Blob([generatedMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sessionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-sop.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Markdown SOP downloaded.', 'success');
  };

  // Copy Markdown to clipboard
  const handleCopyMarkdown = async () => {
    playPop();
    try {
      await navigator.clipboard.writeText(generatedMarkdown);
      addToast('SOP Documentation copied to clipboard.', 'success');
    } catch {
      addToast('Could not copy to clipboard.', 'error');
    }
  };

  const formatTimer = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-6 sm:p-8 overflow-y-auto max-w-6xl mx-auto w-full select-none font-sans transition-colors duration-500">
      {/* Top Header Controls Card */}
      <div className="border-b border-slate-200 dark:border-zinc-850 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-slate-900 dark:text-white" />
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
              Screen Recording Studio
            </h1>
            <Badge variant="outline">FLIGHT RECORDER</Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            Capture workflows dynamically with auto-annotated keyframes and generate standard operating procedures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isRecording ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1 rounded bg-red-950/80 border border-red-800 text-red-400 font-mono text-xs animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>REC {formatTimer(elapsedSeconds)}</span>
              </div>

              {/* Auto-Annotate Toggle */}
              <button
                onClick={() => setAutoAnnotateEnabled(!autoAnnotateEnabled)}
                className={`px-3 py-1.5 rounded text-xs font-mono border transition-all flex items-center gap-1.5 ${
                  autoAnnotateEnabled
                    ? 'bg-zinc-900 border-zinc-700 text-emerald-400 shadow-sm'
                    : 'bg-zinc-950 border-zinc-850 text-zinc-500'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>AUTO-ANNOTATE: {autoAnnotateEnabled ? `ON (${autoIntervalSec}s)` : 'OFF'}</span>
              </button>

              <Button variant="outline" size="sm" onClick={() => captureAnnotatedStep()}>
                <Camera className="w-3.5 h-3.5" />
                <span>Snap Step ({capturedSteps.length})</span>
              </Button>

              <Button variant="outline" size="sm" onClick={handleToggleWebcam}>
                {enableWebcam ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                <span>PIP Camera</span>
              </Button>

              <Button variant="danger" size="sm" onClick={handleStopRecording}>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop & Generate Documentation</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Procedure Session Title..."
                className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 w-64"
              />
              <Button variant="primary" size="md" onClick={handleStartScreenStream}>
                <Monitor className="w-4 h-4" />
                <span>Start Screen Capture</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Studio Canvas & Stream Box */}
      <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl min-h-[460px] flex items-center justify-center">
        {hasScreenStream ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {/* Interactive Video Stream with Click-to-Annotate */}
            <video
              ref={screenVideoRef}
              className="max-h-[600px] w-auto max-w-full rounded-lg cursor-crosshair"
              autoPlay
              muted
              onClick={handleVideoClick}
              title="Click anywhere on screen stream to capture and annotate this point"
            />

            {/* Visual Click Reticle Feedback */}
            {clickIndicator && (
              <div
                className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-30"
                style={{ left: clickIndicator.x, top: clickIndicator.y }}
              >
                <span className="flex h-10 w-10 relative items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50" />
                  <span className="relative inline-flex rounded-full h-6 w-6 border-2 border-white bg-black/80 text-[10px] text-white font-mono items-center justify-center">
                    {capturedSteps.length + 1}
                  </span>
                </span>
              </div>
            )}

            {/* Instruction Overlay Pill */}
            <div className="absolute top-4 left-4 bg-zinc-950/90 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full text-xs font-mono shadow-xl flex items-center gap-2 backdrop-blur-md">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>Click stream to stamp annotation marker</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">Auto-captures every {autoIntervalSec}s</span>
            </div>

            {/* Picture-in-Picture Webcam Box */}
            {enableWebcam && (
              <div className="absolute bottom-6 right-6 w-48 h-36 rounded-xl border border-zinc-700 bg-black overflow-hidden shadow-2xl z-20">
                <video
                  ref={webcamVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                />
                <span className="absolute top-1.5 left-2 text-[9px] font-mono text-white/80 bg-black/60 px-1.5 py-0.5 rounded">
                  CAM PIP
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center max-w-md space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mx-auto">
              <Monitor className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Dynamic Auto-Annotating Screen Studio
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Start capture to record your desktop or app window. As you demonstrate workflows,
              DomoNote automatically stamps numbered focal badges, coordinates, and instructions into a clean Standard Operating Procedure.
            </p>
            <div className="pt-2">
              <Button variant="primary" size="md" onClick={handleStartScreenStream} className="mx-auto">
                <Play className="w-4 h-4" />
                <span>Initialize Dynamic Capture</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Captured Keyframes Strip */}
      {capturedSteps.length > 0 && (
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 uppercase">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dynamically Annotated Keyframes ({capturedSteps.length})</span>
            </div>
            <span>Auto-Annotated with Coordinates</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-x-auto pb-2">
            {capturedSteps.map((step) => (
              <div
                key={step.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 space-y-2 shadow-lg transition-transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 border-b border-zinc-850 pb-1">
                  <span className="font-bold text-white">STEP {step.stepNumber}</span>
                  <span className="text-zinc-500">{formatTimer(step.timestampSeconds)}</span>
                </div>
                <img
                  src={step.screenshotDataUrl}
                  alt={`Step ${step.stepNumber}`}
                  className="w-full h-24 object-cover rounded border border-zinc-850"
                />
                <p className="text-[11px] text-zinc-300 line-clamp-2 leading-snug">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documentation Generation Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-white" />
                <h3 className="font-bold text-sm text-white">
                  Generated Standard Operating Documentation
                </h3>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content / Markdown View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Captured {capturedSteps.length} steps with dynamic coordinate callouts.</span>
                </div>
                <span className="text-zinc-500 font-mono">Status: Ready to Export</span>
              </div>

              <div className="bg-black border border-zinc-850 rounded-xl p-4 font-mono text-xs text-zinc-300 whitespace-pre-wrap max-h-[420px] overflow-y-auto leading-relaxed">
                {generatedMarkdown}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-zinc-850 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyMarkdown}>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadMarkdown}>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowDocModal(false)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveDocumentation}
                  disabled={isSavingDoc}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isSavingDoc ? 'Saving...' : 'Save to Manuals & Notes'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
