import React, { useState, useEffect, useRef } from 'react';
import type { TranscriptSegment, MeetingScreenshot } from '../../types';
import { formatSecondsToTime } from '../../services/audio/transcriber';
import {
  Mic,
  MicOff,
  Square,
  Camera,
  Crop,
  FileText,
  Bookmark,
  ChevronDown,
  ChevronUp,
  GripHorizontal,
  Copy,
  Check,
  Pause,
  Play,
  Image,
  X,
  ExternalLink,
  MessageSquare,
  Volume2,
} from 'lucide-react';

export interface FloatingMeetingControllerProps {
  elapsedSeconds: number;
  isRecording: boolean;
  isPaused: boolean;
  isMicMuted: boolean;
  audioLevel: number;
  transcript: TranscriptSegment[];
  screenshots: MeetingScreenshot[];
  onStopAndCompile: () => void;
  onTogglePause: () => void;
  onToggleMicMute: () => void;
  onTakeFullScreenshot: () => void;
  onStartPortionSnip: () => void;
  onAddBookmark: (type: 'decision' | 'action' | 'highlight', note?: string) => void;
  onAddQuickNote: (note: string) => void;
  onRemoveScreenshot: (id: string) => void;
}

/**
 * FloatingMeetingController provides a draggable, Always-on-Top capable,
 * strictly monochrome white/gray glassmorphic HUD toolbar during meeting recording.
 *
 * It provides the complete expanded suite of quick actions:
 * - Quick Stop & Compile Single Report
 * - Pause / Resume
 * - Mic Mute / Unmute
 * - Full Screen Snapshot
 * - Interactive Portion Snip Tool
 * - Live Transcriber Streaming Drawer
 * - AI Milestone Bookmarking (Decisions, Actions, Highlights)
 * - Quick Timestamped Note Jotter
 * - Screenshot Strip Drawer
 * - Picture-in-Picture (PiP) Window
 * - Collapse to Mini Pill / Expand Full HUD
 */
export const FloatingMeetingController: React.FC<FloatingMeetingControllerProps> = ({
  elapsedSeconds,
  isRecording,
  isPaused,
  isMicMuted,
  audioLevel,
  transcript,
  screenshots,
  onStopAndCompile,
  onTogglePause,
  onToggleMicMute,
  onTakeFullScreenshot,
  onStartPortionSnip,
  onAddBookmark,
  onAddQuickNote,
  onRemoveScreenshot,
}) => {
  // Position state (defaults to top-center)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const defaultX = typeof window !== 'undefined' ? Math.max(20, (window.innerWidth - 680) / 2) : 200;
    return { x: defaultX, y: 24 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  // HUD Expand / Collapse
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sub-drawers & modals
  const [activeDrawer, setActiveDrawer] = useState<'transcriber' | 'bookmarks' | 'notes' | 'screenshots' | null>(null);
  const [quickNoteText, setQuickNoteText] = useState('');
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);

  const transcriberEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll live transcript drawer
  useEffect(() => {
    if (activeDrawer === 'transcriber' && transcriberEndRef.current) {
      transcriberEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, activeDrawer]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from handle or container background, not interactive buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('textarea')) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      const newX = Math.max(10, Math.min(window.innerWidth - 320, dragStartRef.current.startX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.startY + dy));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Copy transcript so far
  const handleCopyTranscript = () => {
    const text = transcript.map((s) => `[${formatSecondsToTime(s.timestampSeconds)}] ${s.speaker}: ${s.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  // Submit quick note
  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteText.trim()) return;
    onAddQuickNote(quickNoteText.trim());
    setQuickNoteText('');
    setActiveDrawer(null);
  };

  // Toggle Picture-in-Picture (PiP) Window
  const handleTogglePiP = async () => {
    if ('documentPictureInPicture' in window) {
      try {
        if (!isPiPActive) {
          const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
            width: 440,
            height: 240,
          });

          // Copy styles
          [...document.styleSheets].forEach((styleSheet) => {
            try {
              const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
              const style = document.createElement('style');
              style.textContent = cssRules;
              pipWindow.document.head.appendChild(style);
            } catch {
              if (styleSheet.href) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = styleSheet.type;
                link.media = styleSheet.media.toString();
                link.href = styleSheet.href;
                pipWindow.document.head.appendChild(link);
              }
            }
          });

          // Set background to dark monochrome
          pipWindow.document.body.className = 'bg-black text-white p-4 font-sans antialiased overflow-hidden';
          pipWindow.document.body.innerHTML = `
            <div style="font-family: sans-serif; display: flex; flex-direction: column; height: 100%; justify-content: space-between; color: white;">
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: white; animation: pulse 1.5s infinite;"></span>
                  <span style="font-weight: bold; font-size: 12px; letter-spacing: 0.5px;">DomoNote Active</span>
                </div>
                <span id="pip-timer" style="font-family: monospace; font-size: 13px; font-weight: bold; color: #e4e4e7;">${formatSecondsToTime(elapsedSeconds)}</span>
              </div>
              <div id="pip-live-text" style="font-size: 11px; color: #a1a1aa; max-height: 80px; overflow-y: auto; line-height: 1.4; padding: 6px 0;">
                ${transcript.length > 0 ? transcript[transcript.length - 1].text : 'Listening for audio & meeting speech...'}
              </div>
              <div style="display: flex; gap: 8px;">
                <button id="pip-snap-btn" style="flex: 1; padding: 6px 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: white; font-size: 11px; font-weight: 600; cursor: pointer;">Screenshot</button>
                <button id="pip-stop-btn" style="flex: 1.2; padding: 6px 10px; background: white; border: 1px solid white; border-radius: 6px; color: black; font-size: 11px; font-weight: bold; cursor: pointer;">Stop & Report</button>
              </div>
            </div>
          `;

          pipWindow.document.getElementById('pip-snap-btn')?.addEventListener('click', () => {
            onTakeFullScreenshot();
          });

          pipWindow.document.getElementById('pip-stop-btn')?.addEventListener('click', () => {
            pipWindow.close();
            onStopAndCompile();
          });

          pipWindow.addEventListener('pagehide', () => {
            setIsPiPActive(false);
          });

          setIsPiPActive(true);
        } else {
          setIsPiPActive(false);
        }
      } catch (err) {
        console.warn('[DomoNote] PiP request failed:', err);
      }
    }
  };

  return (
    <aside
      aria-label="Floating meeting controls"
      className="fixed z-[9999] select-none pointer-events-auto transition-shadow"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Main Glassmorphic HUD Bar */}
      <div
        className="flex items-center gap-2 p-2 rounded-2xl border shadow-2xl backdrop-blur-3xl transition-all duration-300"
        style={{
          backgroundColor: 'rgba(15, 15, 18, 0.78)',
          borderColor: 'rgba(255, 255, 255, 0.20)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Draggable Grip Handle */}
        <div
          className="px-1.5 py-2 cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Drag to reposition HUD"
        >
          <GripHorizontal className="w-4 h-4" />
        </div>

        {/* Status Indicator & Timer */}
        <div className="flex items-center gap-2.5 px-2 py-1 rounded-xl bg-white/5 border border-white/10">
          <div className="relative flex items-center justify-center">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPaused ? 'bg-zinc-500' : 'bg-white'
              } transition-colors`}
            />
            {!isPaused && (
              <span className="absolute w-4 h-4 rounded-full border border-white/60 animate-ping" />
            )}
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold tracking-wider text-white">
              {formatSecondsToTime(elapsedSeconds)}
            </span>
            <span className="text-[9px] font-medium uppercase tracking-widest text-zinc-400">
              {isPaused ? 'Paused' : isRecording ? 'Recording' : 'Standby'}
            </span>
          </div>

          {/* Audio Soundwave Bars reacting to level */}
          {!isMicMuted && !isPaused && (
            <div className="flex items-end gap-0.5 h-4 ml-1 px-1">
              {[0.4, 0.8, 0.5, 1.0, 0.6].map((scale, i) => {
                const height = Math.max(3, Math.min(16, (audioLevel / 100) * 16 * scale));
                return (
                  <div
                    key={i}
                    className="w-0.5 rounded-full bg-zinc-300 transition-all duration-75"
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Compact Pill divider */}
        {!isCollapsed && (
          <>
            <div className="h-6 w-[1px] bg-white/15 mx-1" />

            {/* Quick Stop Button (Prominent Monochrome White Pill) */}
            <button
              onClick={onStopAndCompile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 active:bg-zinc-300 text-xs font-bold transition-all shadow-md active:scale-95"
              title="End meeting and compile into Single Report"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop & Report</span>
            </button>

            {/* Visual Capture Group: Full Screenshot & Portion Snip */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={onTakeFullScreenshot}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/15 text-zinc-200 hover:text-white text-xs font-semibold transition-all active:scale-95"
                title="Full Screen Screenshot (1-Click)"
              >
                <Camera className="w-3.5 h-3.5 text-zinc-300" />
                <span className="hidden sm:inline">Full</span>
              </button>

              <button
                onClick={onStartPortionSnip}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/15 text-zinc-200 hover:text-white text-xs font-semibold transition-all active:scale-95"
                title="Snip Portion (Interactive Rectangle Crop)"
              >
                <Crop className="w-3.5 h-3.5 text-zinc-300" />
                <span className="hidden sm:inline">Snip</span>
              </button>
            </div>

            {/* Live Transcriber Toggle */}
            <button
              onClick={() => setActiveDrawer(activeDrawer === 'transcriber' ? null : 'transcriber')}
              className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
                activeDrawer === 'transcriber'
                  ? 'bg-white/25 border-white/40 text-white shadow-inner'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/15 hover:text-white'
              }`}
              title="Toggle Live Transcriber Drawer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden md:inline">Transcribe</span>
              {transcript.length > 0 && (
                <span className="text-[10px] font-mono px-1 rounded bg-white/20 text-white">
                  {transcript.length}
                </span>
              )}
            </button>

            {/* AI Bookmark Quick Actions */}
            <button
              onClick={() => setActiveDrawer(activeDrawer === 'bookmarks' ? null : 'bookmarks')}
              className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1 ${
                activeDrawer === 'bookmarks'
                  ? 'bg-white/25 border-white/40 text-white'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/15 hover:text-white'
              }`}
              title="Bookmark key moment (Decision, Action Item, Highlight)"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden md:inline">Bookmark</span>
            </button>

            {/* Quick Note Jotter */}
            <button
              onClick={() => setActiveDrawer(activeDrawer === 'notes' ? null : 'notes')}
              className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1 ${
                activeDrawer === 'notes'
                  ? 'bg-white/25 border-white/40 text-white'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/15 hover:text-white'
              }`}
              title="Type quick timestamped note"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden lg:inline">Note</span>
            </button>

            {/* Screenshots Gallery Drawer Toggle */}
            {screenshots.length > 0 && (
              <button
                onClick={() => setActiveDrawer(activeDrawer === 'screenshots' ? null : 'screenshots')}
                className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1 ${
                  activeDrawer === 'screenshots'
                    ? 'bg-white/25 border-white/40 text-white'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/15 hover:text-white'
                }`}
                title="View captured screenshots"
              >
                <Image className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono px-1 rounded bg-white/20 text-white">
                  {screenshots.length}
                </span>
              </button>
            )}

            {/* Audio Controls: Pause / Mute */}
            <div className="flex items-center gap-1">
              <button
                onClick={onTogglePause}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-all"
                title={isPaused ? 'Resume recording' : 'Pause recording'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onToggleMicMute}
                className={`p-2 rounded-xl border transition-all ${
                  isMicMuted
                    ? 'bg-zinc-800 border-zinc-600 text-zinc-400'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/15 hover:text-white'
                }`}
                title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Always-on-Top PiP Window (Chrome/Edge Document PiP) */}
            {'documentPictureInPicture' in window && (
              <button
                onClick={handleTogglePiP}
                className={`p-2 rounded-xl border transition-all ${
                  isPiPActive
                    ? 'bg-white/25 border-white/40 text-white'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/15 hover:text-white'
                }`}
                title="Pop out Always-on-Top floating window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}

        {/* Collapse / Expand Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-white/15 text-zinc-400 hover:text-white transition-colors ml-1"
          title={isCollapsed ? 'Expand full HUD controls' : 'Collapse to mini pill'}
        >
          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Drawers below or above HUD in Monochrome Glassmorphism */}

      {/* 1. Live Transcriber Drawer */}
      {activeDrawer === 'transcriber' && !isCollapsed && (
        <div
          className="mt-2.5 p-3 rounded-2xl border shadow-2xl backdrop-blur-3xl w-[380px] max-w-[90vw] transition-all"
          style={{
            backgroundColor: 'rgba(12, 12, 15, 0.88)',
            borderColor: 'rgba(255, 255, 255, 0.20)',
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-300" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Speech Stream
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyTranscript}
                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-mono text-zinc-200 transition-colors flex items-center gap-1"
                title="Copy transcript so far"
              >
                {copiedTranscript ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTranscript ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => setActiveDrawer(null)}
                className="p-1 rounded-md hover:bg-white/15 text-zinc-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
            {transcript.length === 0 ? (
              <p className="text-zinc-500 italic text-[11px] py-3 text-center">
                Listening... spoken words will transcribe here in real-time.
              </p>
            ) : (
              transcript.map((seg) => (
                <div key={seg.id} className="p-2 rounded-lg bg-white/5 border border-white/5 leading-relaxed">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-0.5">
                    <span className="font-semibold text-zinc-300">{seg.speaker}</span>
                    <span>{formatSecondsToTime(seg.timestampSeconds)}</span>
                  </div>
                  <p className="text-zinc-200 text-xs">{seg.text}</p>
                </div>
              ))
            )}
            <div ref={transcriberEndRef} />
          </div>
        </div>
      )}

      {/* 2. AI Bookmark Popover */}
      {activeDrawer === 'bookmarks' && !isCollapsed && (
        <div
          className="mt-2.5 p-3 rounded-2xl border shadow-2xl backdrop-blur-3xl w-72 transition-all"
          style={{
            backgroundColor: 'rgba(12, 12, 15, 0.88)',
            borderColor: 'rgba(255, 255, 255, 0.20)',
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Mark Moment [{formatSecondsToTime(elapsedSeconds)}]
            </span>
            <button
              onClick={() => setActiveDrawer(null)}
              className="p-1 rounded-md hover:bg-white/15 text-zinc-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                onAddBookmark('decision');
                setActiveDrawer(null);
              }}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex flex-col items-center gap-1 text-center transition-all hover:scale-105"
            >
              <span className="text-xs font-bold">Decision</span>
              <span className="text-[9px] text-zinc-400 font-mono">Agreed point</span>
            </button>

            <button
              onClick={() => {
                onAddBookmark('action');
                setActiveDrawer(null);
              }}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex flex-col items-center gap-1 text-center transition-all hover:scale-105"
            >
              <span className="text-xs font-bold">Action</span>
              <span className="text-[9px] text-zinc-400 font-mono">Todo task</span>
            </button>

            <button
              onClick={() => {
                onAddBookmark('highlight');
                setActiveDrawer(null);
              }}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex flex-col items-center gap-1 text-center transition-all hover:scale-105"
            >
              <span className="text-xs font-bold">Highlight</span>
              <span className="text-[9px] text-zinc-400 font-mono">Key insight</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Quick Note Jotter Drawer */}
      {activeDrawer === 'notes' && !isCollapsed && (
        <form
          onSubmit={handleSubmitNote}
          className="mt-2.5 p-3 rounded-2xl border shadow-2xl backdrop-blur-3xl w-80 transition-all"
          style={{
            backgroundColor: 'rgba(12, 12, 15, 0.88)',
            borderColor: 'rgba(255, 255, 255, 0.20)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white">
              Quick Note @ {formatSecondsToTime(elapsedSeconds)}
            </span>
            <button
              type="button"
              onClick={() => setActiveDrawer(null)}
              className="p-1 rounded-md hover:bg-white/15 text-zinc-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <input
            type="text"
            value={quickNoteText}
            onChange={(e) => setQuickNoteText(e.target.value)}
            placeholder="Type bullet point and press Enter..."
            autoFocus
            className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/50"
          />

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setActiveDrawer(null)}
              className="px-2.5 py-1 rounded-lg hover:bg-white/10 text-[11px] text-zinc-400 hover:text-white font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!quickNoteText.trim()}
              className="px-3 py-1 rounded-lg bg-white text-black hover:bg-zinc-200 disabled:opacity-40 text-[11px] font-bold"
            >
              Save Note
            </button>
          </div>
        </form>
      )}

      {/* 4. Screenshot Strip Drawer */}
      {activeDrawer === 'screenshots' && !isCollapsed && (
        <div
          className="mt-2.5 p-3 rounded-2xl border shadow-2xl backdrop-blur-3xl w-[360px] max-w-[90vw] transition-all"
          style={{
            backgroundColor: 'rgba(12, 12, 15, 0.88)',
            borderColor: 'rgba(255, 255, 255, 0.20)',
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Screenshots ({screenshots.length})
            </span>
            <button
              onClick={() => setActiveDrawer(null)}
              className="p-1 rounded-md hover:bg-white/15 text-zinc-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {screenshots.map((ss, idx) => (
              <div key={ss.id} className="relative group shrink-0 w-24 rounded-lg overflow-hidden border border-white/15 bg-black">
                <img src={ss.dataUrl} alt={`Screenshot ${idx + 1}`} className="w-full h-16 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => onRemoveScreenshot(ss.id)}
                    className="p-1 rounded bg-black/80 hover:bg-zinc-800 text-white"
                    title="Delete screenshot"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-1 bg-zinc-950/80 text-[9px] font-mono text-zinc-300 text-center truncate">
                  {formatSecondsToTime(ss.timestampSeconds)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
