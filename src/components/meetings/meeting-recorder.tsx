import React, { useState, useEffect, useRef } from 'react';
import type { TranscriptSegment, Meeting } from '../../types';
import { AudioRecorder } from '../../services/audio/recorder';
import { LiveSpeechTranscriber, formatSecondsToTime, synthesizeMeetingAI } from '../../services/audio/transcriber';
import { db } from '../../db';
import { useAI } from '../../context/ai-context';
import { useWorkspace } from '../../context/workspace-context';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { GoogleMeetGuideModal } from './google-meet-guide-modal';
import {
  Mic,
  MicOff,
  Square,
  Radio,
  FileText,
  Clock,
  Sparkles,
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

  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const speechTranscriberRef = useRef<LiveSpeechTranscriber | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const transcriptBottomRef = useRef<HTMLDivElement>(null);

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
    };
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptBottomRef.current) {
      transcriptBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  const startRecording = async () => {
    try {
      setTranscript([]);
      setElapsedSeconds(0);

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

      setTranscript([]);
      setElapsedSeconds(0);
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

  const stopAndSaveMeeting = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    setIsProcessingAI(true);

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
              <Button
                variant="danger"
                size="md"
                onClick={stopAndSaveMeeting}
                disabled={isProcessingAI}
              >
                <Square className="w-4 h-4 fill-current" />
                <span>End Meeting</span>
              </Button>
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

      {/* Google Meet Guide Modal */}
      {isMeetModalOpen && (
        <GoogleMeetGuideModal
          isOpen={isMeetModalOpen}
          onClose={() => setIsMeetModalOpen(false)}
          onStartTabCapture={handleStartTabCapture}
        />
      )}
    </div>
  );
};
