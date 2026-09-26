import React, { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '../context/workspace-context';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { MeetingRecorder } from '../components/meetings/meeting-recorder';
import { MeetingSummaryView } from '../components/meetings/meeting-summary-view';
import { EmptyState } from '../components/ui/empty-state';
import { Button } from '../components/ui/button';
import { formatSecondsToTime } from '../services/audio/transcriber';
import { Mic, Plus, PanelLeftClose, PanelLeftOpen, GripVertical } from 'lucide-react';

export const MeetingsView: React.FC = () => {
  const { activeMeetingId, setActiveMeetingId } = useWorkspace();
  const [isRecordingMode, setIsRecordingMode] = useState<boolean>(false);

  // Dynamic resizable sidebar width (persisted in localStorage)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('domonote:meetings-sidebar-width');
    const parsed = saved ? parseInt(saved, 10) : 300;
    return isNaN(parsed) || parsed < 180 || parsed > 550 ? 300 : parsed;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('domonote:meetings-sidebar-collapsed') === 'true';
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const meetings = useLiveQuery(() => db.meetings.orderBy('startTime').reverse().toArray(), []) || [];

  // Persist sidebar preferences
  useEffect(() => {
    localStorage.setItem('domonote:meetings-sidebar-width', String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem('domonote:meetings-sidebar-collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Handle dragging the border to resize the meetings sidebar
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newWidth = startWidth + deltaX;
      if (newWidth < 180) newWidth = 180;
      if (newWidth > 550) newWidth = 550;
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [sidebarWidth]);

  // Auto-select first meeting if available and none selected
  useEffect(() => {
    if (!activeMeetingId && !isRecordingMode && meetings.length > 0) {
      setActiveMeetingId(meetings[0].id);
    }
  }, [meetings, activeMeetingId, isRecordingMode, setActiveMeetingId]);

  // Listen to Topbar trigger
  useEffect(() => {
    const handleStartEvent = () => setIsRecordingMode(true);
    window.addEventListener('domonote:start-meeting', handleStartEvent);
    return () => window.removeEventListener('domonote:start-meeting', handleStartEvent);
  }, []);

  const selectedMeeting = meetings.find((m) => m.id === activeMeetingId);

  const isDetailOpen = Boolean(isRecordingMode || selectedMeeting);

  return (
    <div
      className={`flex h-full w-full overflow-hidden bg-slate-50 dark:bg-black transition-colors duration-500 relative ${
        isDragging ? 'select-none cursor-col-resize' : ''
      }`}
    >
      {/* Left Sidebar: Sessions List */}
      {!isSidebarCollapsed && (
        <div
          style={{ width: `${sidebarWidth}px` }}
          className={`${
            isDetailOpen ? 'hidden md:flex' : 'flex'
          } border-r border-slate-200 dark:border-zinc-850 flex-col h-full bg-white dark:bg-zinc-950 shrink-0 select-none transition-colors duration-500`}
        >
          <div className="p-3.5 border-b border-slate-200 dark:border-zinc-850 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-wider">
              Meetings ({meetings.length})
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setIsRecordingMode(true);
                  setActiveMeetingId(null);
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Session</span>
              </Button>
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                title="Collapse sidebar to expand notes"
                className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Collapse meetings sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-850">
            {meetings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-500">
                No meetings recorded yet. Start your first session to record audio and build your
                timeline.
              </div>
            ) : (
              meetings.map((m) => {
                const isSelected = !isRecordingMode && activeMeetingId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setIsRecordingMode(false);
                      setActiveMeetingId(m.id);
                    }}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-zinc-900/90 text-slate-950 dark:text-white border-l-2 border-slate-900 dark:border-white'
                        : 'hover:bg-slate-50 dark:hover:bg-zinc-900/40 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-slate-950 dark:text-zinc-100 truncate pr-2">
                        {m.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 font-medium shrink-0">
                        {formatSecondsToTime(m.durationSeconds)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-zinc-500 mb-1.5 font-medium">
                      <span>{new Date(m.startTime).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{m.transcript.length} transcript segments</span>
                    </div>
                    {m.summary?.overview && (
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {m.summary.overview}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Draggable Divider Handle */}
      {!isSidebarCollapsed && (
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={() => setSidebarWidth(300)}
          title="Drag to resize sidebar • Double-click to reset"
          className="hidden md:flex items-center justify-center w-2 hover:w-2.5 -ml-1 cursor-col-resize select-none z-20 group relative transition-colors"
        >
          <div
            className={`w-[2px] h-full transition-colors ${
              isDragging
                ? 'bg-emerald-500 dark:bg-emerald-400'
                : 'bg-transparent group-hover:bg-emerald-500/50 dark:group-hover:bg-emerald-400/50'
            }`}
          />
          <div className="absolute top-1/2 -translate-y-1/2 p-0.5 rounded bg-slate-200 dark:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm">
            <GripVertical className="w-2.5 h-2.5 text-slate-500 dark:text-zinc-400" />
          </div>
        </div>
      )}

      {/* Expand sidebar trigger when collapsed */}
      {isSidebarCollapsed && (
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(false)}
          title="Expand meetings sidebar"
          className="hidden md:flex absolute top-3 left-3 z-30 items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-850 text-slate-700 dark:text-zinc-300 hover:text-black dark:hover:text-white shadow-md hover:bg-slate-100 dark:hover:bg-zinc-800 backdrop-blur transition-all text-xs font-semibold"
        >
          <PanelLeftOpen className="w-4 h-4 text-emerald-500" />
          <span>Meetings</span>
        </button>
      )}

      {/* Right Content Area */}
      <div className={`${isDetailOpen ? 'flex' : 'hidden md:flex'} flex-1 h-full min-w-0 flex-col overflow-hidden`}>
        {isRecordingMode ? (
          <MeetingRecorder
            onMeetingSaved={(savedMeeting) => {
              setIsRecordingMode(false);
              setActiveMeetingId(savedMeeting.id);
            }}
            onCancel={() => {
              setIsRecordingMode(false);
              if (meetings.length > 0) setActiveMeetingId(meetings[0].id);
            }}
          />
        ) : selectedMeeting ? (
          <MeetingSummaryView
            meeting={selectedMeeting}
            onBackToList={() => {
              setActiveMeetingId(null);
              setIsRecordingMode(false);
            }}
            onDeleted={() => {
              const remaining = meetings.filter((m) => m.id !== selectedMeeting.id);
              setActiveMeetingId(remaining.length > 0 ? remaining[0].id : null);
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={Mic}
              title="No meeting selected"
              description="Start a new recording session to capture browser microphone audio and generate AI minutes."
              actionLabel="Start Meeting"
              onAction={() => setIsRecordingMode(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
