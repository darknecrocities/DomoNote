import React, { useState, useEffect, useRef } from 'react';
import type { TranscriptSegment, Meeting, MeetingScreenshot } from '../../types';
import { AudioRecorder } from '../../services/audio/recorder';
import { LiveSpeechTranscriber, formatSecondsToTime, synthesizeMeetingAI } from '../../services/audio/transcriber';
import { db } from '../../db';
import { useAI } from '../../context/ai-context';
import { useWorkspace } from '../../context/workspace-context';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { GoogleMeetGuideModal } from './google-meet-guide-modal';
import { FloatingMeetingController } from './floating-meeting-controller';
import { ScreenSnipperOverlay, type CropRect } from './screen-snipper-overlay';
import {
  Mic,
  MicOff,
  Square,
  Radio,
  FileText,
  Clock,
  Sparkles,
  Camera,
  X,
  Image,
} from 'lucide-react';

interface MeetingRecorderProps {
  onMeetingSaved: (meeting: Meeting) => void;
  onCancel?: () => void;
}

export const MeetingRecorder: React.FC<MeetingRecorderProps> = ({ onMeetingSaved, onCancel }) => {
  const { selectedModel, isConnected } = useAI();
  const { addToast } = useWorkspace();

  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [manualNotes, setManualNotes] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('Product & Engineering Sync');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [screenshots, setScreenshots] = useState<MeetingScreenshot[]>([]);
  const [previewScreenshot, setPreviewScreenshot] = useState<MeetingScreenshot | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSnipping, setIsSnipping] = useState(false);

  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const speechTranscriberRef = useRef<LiveSpeechTranscriber | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const transcriptBottomRef = useRef<HTMLDivElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize instances
  useEffect(() => {
    audioRecorderRef.current = new AudioRecorder();
    speechTranscriberRef.current = new LiveSpeechTranscriber();

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioRecorderRef.current?.isRecording()) {
        audioRecorderRef.current.stop();
      }
      speechTranscriberRef.current?.stop();
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptBottomRef.current) {
      transcriptBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  // Timer interval handling pause / resume
  useEffect(() => {
    if (!isRecording || isPaused) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      setTranscript([]);
      setElapsedSeconds(0);
      setScreenshots([]);

      // Start audio stream & visualizer
      await audioRecorderRef.current?.start((level) => {
        setAudioLevel(level);
      });

      // Start speech recognition
      speechTranscriberRef.current?.start((seg) => {
        setTranscript((prev) => [...prev, seg]);
      });

      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);

      addToast('Microphone recording started.', 'info');
    } catch (err: any) {
      console.error('[DomoNote] Microphone permission denied or failed:', err);
      addToast(
        'Microphone access was denied. Please allow microphone permissions in your browser.',
        'error'
      );
    }
  };

  const handleStartTabCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Check if audio track was included
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        addToast(
          'No audio was shared. Please check "Also share tab audio" when selecting the tab.',
          'warning'
        );
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      // Keep the screen stream for screenshot capture
      setScreenStream(stream);

      // Setup hidden video element for frame capture
      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      video.play();
      screenVideoRef.current = video;

      // Listen for stream end (user stops sharing)
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        setScreenStream(null);
        screenVideoRef.current = null;
      });

      setTranscript([]);
      setElapsedSeconds(0);
      setScreenshots([]);
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);

      speechTranscriberRef.current?.start((seg) => {
        setTranscript((prev) => [...prev, seg]);
      });

      addToast('Google Meet / Tab audio capture started.', 'info');
    } catch (err: any) {
      console.warn('[DomoNote] Tab capture cancelled:', err?.message);
    }
  };

  /**
   * Capture a screenshot from the active screen share or prompt for one.
   * Uses the existing screen stream if available (from tab capture),
   * otherwise prompts for a new screen share to take a single snapshot.
   */
  const handleTakeScreenshot = async () => {
    try {
      let videoEl = screenVideoRef.current;

      // If no active screen share, prompt for one
      if (!videoEl || !videoEl.videoWidth) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'monitor' } as any,
          audio: false,
        });

        videoEl = document.createElement('video');
        videoEl.srcObject = stream;
        videoEl.muted = true;
        await videoEl.play();

        // Wait a frame for video to render
        await new Promise((r) => requestAnimationFrame(r));
        await new Promise((r) => requestAnimationFrame(r));

        // Take the snapshot
        const canvas = document.createElement('canvas');
        canvas.width = videoEl.videoWidth || 1920;
        canvas.height = videoEl.videoHeight || 1080;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        }
        const dataUrl = canvas.toDataURL('image/png');

        // Stop the temporary stream
        stream.getTracks().forEach((t) => t.stop());
        videoEl.srcObject = null;

        const screenshot: MeetingScreenshot = {
          id: `ss-${Date.now()}`,
          timestampSeconds: elapsedSeconds,
          dataUrl,
        };
        setScreenshots((prev) => [...prev, screenshot]);
        addToast(`Screenshot captured at ${formatSecondsToTime(elapsedSeconds)}.`, 'success');
        return;
      }

      // Active screen share — capture frame directly
      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth || 1920;
      canvas.height = videoEl.videoHeight || 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      }
      const dataUrl = canvas.toDataURL('image/png');

      const screenshot: MeetingScreenshot = {
        id: `ss-${Date.now()}`,
        timestampSeconds: elapsedSeconds,
        dataUrl,
      };
      setScreenshots((prev) => [...prev, screenshot]);
      addToast(`Screenshot captured at ${formatSecondsToTime(elapsedSeconds)}.`, 'success');
    } catch (err: any) {
      console.warn('[DomoNote] Screenshot capture cancelled:', err?.message);
      addToast('Screenshot capture was cancelled or denied.', 'warning');
    }
  };

  const removeScreenshot = (id: string) => {
    setScreenshots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleTogglePause = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    if (nextPaused) {
      speechTranscriberRef.current?.stop();
      addToast('Meeting recording paused.', 'info');
    } else {
      speechTranscriberRef.current?.start((seg) => {
        setTranscript((prev) => [...prev, seg]);
      });
      addToast('Meeting recording resumed.', 'info');
    }
  };

  const handleToggleMicMute = () => {
    const nextMuted = !isMicMuted;
    setIsMicMuted(nextMuted);
    audioRecorderRef.current?.setMuted(nextMuted);
    addToast(nextMuted ? 'Microphone muted.' : 'Microphone unmuted.', 'info');
  };

  const handleAddBookmark = (type: 'decision' | 'action' | 'highlight', note?: string) => {
    const timeStr = formatSecondsToTime(elapsedSeconds);
    const label = note || (type === 'decision' ? 'Agreed decision' : type === 'action' ? 'Action item' : 'Key highlight');
    setManualNotes((prev) => prev ? `${prev}\n- [${timeStr}] [${type.toUpperCase()}]: ${label}` : `- [${timeStr}] [${type.toUpperCase()}]: ${label}`);
    addToast(`Bookmarked [${type.toUpperCase()}] at ${timeStr}.`, 'success');
  };

  const handleAddQuickNote = (note: string) => {
    const timeStr = formatSecondsToTime(elapsedSeconds);
    setManualNotes((prev) => prev ? `${prev}\n- [${timeStr}] ${note}` : `- [${timeStr}] ${note}`);
    addToast(`Note added at ${timeStr}.`, 'success');
  };

  const handleCapturePortion = async (cropRect: CropRect) => {
    setIsSnipping(false);
    try {
      let videoEl = screenVideoRef.current;
      let tempStream: MediaStream | null = null;

      if (!videoEl || !videoEl.videoWidth) {
        tempStream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'monitor' } as any,
          audio: false,
        });
        videoEl = document.createElement('video');
        videoEl.srcObject = tempStream;
        videoEl.muted = true;
        await videoEl.play();
        await new Promise((r) => requestAnimationFrame(r));
        await new Promise((r) => requestAnimationFrame(r));
      }

      const fullWidth = videoEl.videoWidth || window.innerWidth;
      const fullHeight = videoEl.videoHeight || window.innerHeight;

      // Scale coordinates from viewport to video resolution
      const scaleX = fullWidth / cropRect.viewportWidth;
      const scaleY = fullHeight / cropRect.viewportHeight;

      const sourceX = cropRect.x * scaleX;
      const sourceY = cropRect.y * scaleY;
      const sourceWidth = cropRect.width * scaleX;
      const sourceHeight = cropRect.height * scaleY;

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(sourceWidth));
      canvas.height = Math.max(1, Math.round(sourceHeight));
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          videoEl,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      if (tempStream) {
        tempStream.getTracks().forEach((t) => t.stop());
      }

      const dataUrl = canvas.toDataURL('image/png');
      const screenshot: MeetingScreenshot = {
        id: `snip-${Date.now()}`,
        timestampSeconds: elapsedSeconds,
        dataUrl,
        type: 'portion',
        cropDimensions: {
          width: Math.round(cropRect.width),
          height: Math.round(cropRect.height),
        },
        caption: `Portion Snip (${Math.round(cropRect.width)}×${Math.round(cropRect.height)}px)`,
      };

      setScreenshots((prev) => [...prev, screenshot]);
      addToast(`Portion snip captured at ${formatSecondsToTime(elapsedSeconds)}.`, 'success');
    } catch (err: any) {
      console.warn('[DomoNote] Portion snip cancelled or failed:', err);
      addToast('Portion snip was cancelled.', 'info');
    }
  };

  const stopAndSaveMeeting = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    setIsProcessingAI(true);

    // Stop screen stream if active
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      screenVideoRef.current = null;
    }

    try {
      // Stop audio recording and get blob
      const audioBlob = await audioRecorderRef.current?.stop();
      speechTranscriberRef.current?.stop();

      const meetingId = `meeting-${Date.now()}`;
      const now = Date.now();
      let audioBlobId: string | undefined;

      if (audioBlob && audioBlob.size > 0) {
        audioBlobId = `blob-${Date.now()}`;
        await db.blobs.put({
          id: audioBlobId,
          data: audioBlob,
          mimeType: audioBlob.type,
          createdAt: now,
        });
      }

      // Synthesize AI insights
      let summaryData;
      let timelineData;

      if (isConnected && selectedModel && (transcript.length > 0 || manualNotes.trim())) {
        const result = await synthesizeMeetingAI(transcript, manualNotes, selectedModel);
        summaryData = result.summary;
        timelineData = result.timeline;
      } else {
        // Fallback without AI or when AI offline
        summaryData = {
          overview:
            transcript.length > 0
              ? `Meeting recorded with ${transcript.length} speech segment(s). (Local AI not connected to extract deeper synthesis).`
              : 'Meeting ended with manual notes.',
          decisions: [],
          actionItems: [],
          topics: [],
          followUpTasks: [],
        };
        timelineData = transcript.slice(0, 5).map((s, idx) => ({
          id: `tl-${idx}`,
          timestampSeconds: s.timestampSeconds,
          timeFormatted: formatSecondsToTime(s.timestampSeconds),
          label: s.text.slice(0, 45) + '...',
          type: 'topic' as const,
        }));
      }

      const newMeeting: Meeting = {
        id: meetingId,
        title: meetingTitle.trim() || 'Untitled Meeting',
        startTime: now - elapsedSeconds * 1000,
        endTime: now,
        durationSeconds: elapsedSeconds,
        audioBlobId,
        transcript,
        manualNotes,
        timeline: timelineData,
        summary: summaryData,
        screenshots,
        createdAt: now,
      };

      await db.meetings.put(newMeeting);
      addToast('Meeting recording and AI synthesis complete.', 'success');
      onMeetingSaved(newMeeting);
    } catch (err: any) {
      console.error('[DomoNote] Failed to save meeting:', err);
      addToast('Failed to save meeting data.', 'error');
    } finally {
      setIsProcessingAI(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black p-8 max-w-5xl mx-auto w-full">
      {/* Top Controls Card */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              disabled={isRecording}
              className="bg-transparent text-xl font-bold text-white tracking-tight focus:outline-none placeholder-zinc-600 w-full"
              placeholder="Meeting Session Title..."
            />
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
              <span className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {formatSecondsToTime(elapsedSeconds)}
              </span>
              <span>•</span>
              <span>Local storage</span>
              {isConnected && (
                <>
                  <span>•</span>
                  <span className="text-zinc-300">AI: {selectedModel}</span>
                </>
              )}
              {screenshots.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-zinc-300 flex items-center gap-1">
                    <Image className="w-3 h-3" />
                    {screenshots.length} screenshot{screenshots.length !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Recording Badge */}
          <div className="flex items-center gap-3">
            {isRecording ? (
              <Badge variant="recording" dot>
                RECORDING
              </Badge>
            ) : (
              <Badge variant="outline">STANDBY</Badge>
            )}

            {!isRecording ? (
              <div className="flex items-center gap-2">
                <Button variant="primary" size="md" onClick={startRecording}>
                  <Mic className="w-4 h-4" />
                  <span>Start Microphone</span>
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsMeetModalOpen(true)}
                  title="Capture Google Meet or Tab audio"
                >
                  <Radio className="w-4 h-4" />
                  <span>Google Meet / Tab</span>
                </Button>
                {onCancel && (
                  <Button variant="ghost" size="md" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Screenshot Capture Button */}
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleTakeScreenshot}
                  title="Capture a screenshot of the current screen"
                  className="border-zinc-700 hover:border-zinc-500"
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Screenshot</span>
                </Button>

                <Button
                  variant="danger"
                  size="md"
                  onClick={stopAndSaveMeeting}
                  disabled={isProcessingAI}
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>End Meeting</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Live Audio Meter Waveform */}
        {isRecording && (
          <div className="pt-4 border-t border-zinc-850 flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono">Live Input Level</span>
            <div className="flex items-center gap-1 h-6">
              {[...Array(24)].map((_, i) => {
                const threshold = (i / 24) * 100;
                const active = audioLevel >= threshold;
                return (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      active ? 'bg-zinc-200 h-5' : 'bg-zinc-800 h-1.5'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Screenshot Thumbnail Strip */}
        {screenshots.length > 0 && (
          <div className="pt-4 border-t border-zinc-850 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Captured Screenshots ({screenshots.length})
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {screenshots.map((ss) => (
                <div key={ss.id} className="relative group shrink-0">
                  <button
                    onClick={() => setPreviewScreenshot(ss)}
                    className="block rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-colors"
                  >
                    <img
                      src={ss.dataUrl}
                      alt={`Screenshot at ${formatSecondsToTime(ss.timestampSeconds)}`}
                      className="h-16 w-28 object-cover"
                    />
                  </button>
                  <span className="absolute bottom-1 left-1 text-[9px] font-mono bg-black/80 text-zinc-300 px-1.5 py-0.5 rounded">
                    {formatSecondsToTime(ss.timestampSeconds)}
                  </span>
                  {isRecording && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeScreenshot(ss.id);
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900 hover:border-red-700"
                      title="Remove screenshot"
                    >
                      <X className="w-3 h-3 text-zinc-300" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main split: Live Transcript on left, Manual Notes on right */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        {/* Live Transcript Pane */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-850 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                Live Verbal Transcript
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              {transcript.length} segments
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {transcript.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 text-xs">
                {isRecording ? (
                  <>
                    <Mic className="w-6 h-6 mb-2 text-zinc-400 animate-pulse" />
                    <span>Listening to conversation... Speech recognition is streaming transcript.</span>
                  </>
                ) : (
                  <span>Transcript will appear live as you speak once recording begins.</span>
                )}
              </div>
            ) : (
              transcript.map((seg) => (
                <div key={seg.id} className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-850 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                    <span className="font-semibold text-zinc-300">{seg.speaker}</span>
                    <span className="font-mono">{formatSecondsToTime(seg.timestampSeconds)}</span>
                  </div>
                  <p className="text-zinc-200 leading-relaxed">{seg.text}</p>
                </div>
              ))
            )}
            <div ref={transcriptBottomRef} />
          </div>
        </div>

        {/* Manual Meeting Notes Pane */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-850 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                Meeting Notes
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500">Live editor</span>
          </div>

          <textarea
            value={manualNotes}
            onChange={(e) => setManualNotes(e.target.value)}
            placeholder="Jot down notes, reminders, or questions during the meeting..."
            className="flex-1 w-full bg-transparent resize-none text-xs leading-relaxed text-zinc-200 placeholder-zinc-600 focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Processing AI overlay */}
      {isProcessingAI && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <Sparkles className="w-8 h-8 text-zinc-300 animate-spin mb-4" />
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Synthesizing Meeting</h3>
          <p className="text-xs text-zinc-400 max-w-sm text-center">
            Extracting executive summary, key decisions, action items, and topic milestones from your
            actual recorded transcript...
          </p>
        </div>
      )}

      {/* Screenshot Preview Lightbox */}
      {previewScreenshot && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewScreenshot(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-400 font-mono">
                Screenshot at {formatSecondsToTime(previewScreenshot.timestampSeconds)}
              </span>
              <button
                onClick={() => setPreviewScreenshot(null)}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={previewScreenshot.dataUrl}
              alt={`Screenshot at ${formatSecondsToTime(previewScreenshot.timestampSeconds)}`}
              className="w-full rounded-lg border border-zinc-800 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Google Meet Guide Modal */}
      {isMeetModalOpen && (
        <GoogleMeetGuideModal
          isOpen={isMeetModalOpen}
          onClose={() => setIsMeetModalOpen(false)}
          onStartTabCapture={handleStartTabCapture}
        />
      )}

      {/* Floating Meeting HUD Controller (Monochrome Glassmorphism) */}
      {isRecording && (
        <FloatingMeetingController
          elapsedSeconds={elapsedSeconds}
          isRecording={isRecording}
          isPaused={isPaused}
          isMicMuted={isMicMuted}
          audioLevel={audioLevel}
          transcript={transcript}
          screenshots={screenshots}
          onStopAndCompile={stopAndSaveMeeting}
          onTogglePause={handleTogglePause}
          onToggleMicMute={handleToggleMicMute}
          onTakeFullScreenshot={handleTakeScreenshot}
          onStartPortionSnip={() => setIsSnipping(true)}
          onAddBookmark={handleAddBookmark}
          onAddQuickNote={handleAddQuickNote}
          onRemoveScreenshot={removeScreenshot}
        />
      )}

      {/* Interactive Portion Snip Tool Overlay */}
      {isSnipping && (
        <ScreenSnipperOverlay
          onCapture={handleCapturePortion}
          onCancel={() => setIsSnipping(false)}
        />
      )}
    </div>
  );
};
