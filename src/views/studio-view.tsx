import React, { useState, useRef, useEffect } from 'react';
import { db } from '../db';
import type { Manual, ManualStep } from '../types';
import { useWorkspace } from '../context/workspace-context';
import { useSound } from '../context/sound-context';
import { Button } from '../components/ui/button';
import {
  Video,
  Mic,
  Camera,
  Square,
  Play,
  Download,
  CameraOff,
  Layers,
  Sparkles,
  ArrowRight,
  Monitor,
  CheckCircle,
} from 'lucide-react';

export const StudioView: React.FC = () => {
  const { addToast, setActiveView, setActiveManualId } = useWorkspace();
  const { playThock, playChime, playPop } = useSound();

  const [isRecording, setIsRecording] = useState(false);
  const [hasScreenStream, setHasScreenStream] = useState(false);
  const [enableWebcam, setEnableWebcam] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);

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

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current?.getTracks().forEach((t) => t.stop());
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
      setCapturedFrames([]);

      // Automatically stop if user clicks browser "Stop Sharing" button
      stream.getVideoTracks()[0].onended = () => {
        handleStopRecording();
      };

      addToast('Screen stream initialized across standard display capture.', 'success');
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

  // Snapshot active video frame
  const handleCaptureSnapshot = () => {
    if (!screenVideoRef.current) return;
    playThock(1.2);

    try {
      const video = screenVideoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedFrames((prev) => [...prev, dataUrl]);
        addToast(`Snapshot #${capturedFrames.length + 1} captured.`, 'info');
      }
    } catch {
      addToast('Could not capture frame.', 'error');
    }
  };

  // Stop recording and compile into an Operation Manual SOP
  const handleStopRecording = async () => {
    playChime();
    setIsRecording(false);
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    webcamStreamRef.current?.getTracks().forEach((t) => t.stop());
    setHasScreenStream(false);
    setEnableWebcam(false);

    try {
      const manualId = `manual-sop-${Date.now()}`;
      const steps: ManualStep[] = capturedFrames.map((frameDataUrl, idx) => ({
        id: `step-${Date.now()}-${idx}`,
        stepNumber: idx + 1,
        title: `Operation Step ${idx + 1}`,
        description: `Perform interaction verified during screen recording at timestamp ${idx * 15}s.`,
        screenshotDataUrl: frameDataUrl,
        annotations: [],
        timestampMs: idx * 15000,
      }));

      const newManual: Manual = {
        id: manualId,
        title: `Screen Operation SOP: ${new Date().toLocaleDateString()}`,
        purpose: `Standard Operating Procedure generated via DomoNote Studio recording. Captured ${steps.length} procedural keyframes.`,
        requirements: ['Browser display access', 'Standard computer operational privileges'],
        steps,
        warnings: [],
        expectedResult: 'Screen operation captured and verified.',
        troubleshooting: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      };

      await db.manuals.put(newManual);
      addToast('Screen recording compiled into Operation Manual SOP.', 'success');
      setActiveManualId(manualId);
      setActiveView('manuals');
    } catch (err: any) {
      console.warn('[DomoNote] Error saving manual:', err);
    }
  };

  const formatTimer = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black p-8 overflow-y-auto max-w-6xl mx-auto w-full select-none font-sans">
      {/* Top Header */}
      <div className="border-b border-zinc-850 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-white" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Screen Recording Studio
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Flight recorder for computer tasks. Capture screen frames and turn operations into SOPs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isRecording ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1 rounded bg-red-950/80 border border-red-800 text-red-400 font-mono text-xs animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>REC {formatTimer(elapsedSeconds)}</span>
              </div>

              <Button variant="outline" size="sm" onClick={handleCaptureSnapshot}>
                <Camera className="w-3.5 h-3.5" />
                <span>Snap Step ({capturedFrames.length})</span>
              </Button>

              <Button variant="outline" size="sm" onClick={handleToggleWebcam}>
                {enableWebcam ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                <span>PIP Camera</span>
              </Button>

              <Button variant="danger" size="sm" onClick={handleStopRecording}>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop & Generate SOP</span>
              </Button>
            </>
          ) : (
            <Button variant="primary" size="md" onClick={handleStartScreenStream}>
              <Monitor className="w-4 h-4" />
              <span>Start Screen Capture</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Studio Canvas & Stream Box */}
      <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl min-h-[460px] flex items-center justify-center">
        {hasScreenStream ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={screenVideoRef}
              className="max-h-[600px] w-auto max-w-full rounded-lg"
              autoPlay
              muted
            />

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
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mx-auto">
              <Monitor className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Ready to Capture Operations
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Select your entire screen, an application window, or browser tab. DomoNote captures
              interaction states with zero cloud telemetry.
            </p>
            <Button variant="primary" size="md" onClick={handleStartScreenStream} className="mx-auto">
              <Play className="w-4 h-4" />
              <span>Initialize Capture</span>
            </Button>
          </div>
        )}
      </div>

      {/* Captured Keyframes Strip */}
      {capturedFrames.length > 0 && (
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500 uppercase">
            <span>Captured Procedural Keyframes ({capturedFrames.length})</span>
            <span>Will be converted to SOP Manual Steps</span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {capturedFrames.map((frame, idx) => (
              <div
                key={idx}
                className="shrink-0 w-44 rounded-xl border border-zinc-800 bg-zinc-950 p-2 space-y-1.5 shadow-lg"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>STEP 0{idx + 1}</span>
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                </div>
                <img
                  src={frame}
                  alt={`Step ${idx + 1}`}
                  className="w-full h-24 object-cover rounded border border-zinc-850"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
