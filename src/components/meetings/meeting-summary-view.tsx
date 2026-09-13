import React, { useState } from 'react';
import type { Meeting } from '../../types';
import { db } from '../../db';
import { Button } from '../ui/button';
import { formatSecondsToTime } from '../../services/audio/transcriber';
import { exportMeetingToMarkdown } from '../../services/export/markdown';
import { useWorkspace } from '../../context/workspace-context';
import {
  Clock,
  CheckSquare,
  FileText,
  Download,
  Trash2,
  List,
  Sparkles,
  Bookmark,
  Share2,
  ChevronLeft,
} from 'lucide-react';

interface MeetingSummaryViewProps {
  meeting: Meeting;
  onDeleted?: () => void;
  onBackToList?: () => void;
}

export const MeetingSummaryView: React.FC<MeetingSummaryViewProps> = ({
  meeting,
  onDeleted,
  onBackToList,
}) => {
  const { addToast, setActiveView, setActiveNoteId } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'timeline'>('summary');
  const [highlightTimestamp, setHighlightTimestamp] = useState<number | null>(null);

  const handleExportMarkdown = () => {
    const md = exportMeetingToMarkdown(meeting);
    const filename = `${(meeting.title || 'meeting').toLowerCase().replace(/\s+/g, '_')}.md`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Meeting exported to Markdown.', 'success');
  };

  const handleConvertToNote = async () => {
    try {
      const md = exportMeetingToMarkdown(meeting);
      const noteId = `note-${Date.now()}`;
      await db.notes.put({
        id: noteId,
        title: `Meeting Note: ${meeting.title}`,
        content: md,
        tags: ['meeting', 'summary'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        versions: [],
      });
      addToast('Converted meeting to note in your workspace.', 'success');
      setActiveNoteId(noteId);
      setActiveView('notes');
    } catch {
      addToast('Failed to convert meeting to note.', 'error');
    }
  };

  const handleDelete = async () => {
    if (confirm('Permanently delete this meeting recording and summary?')) {
      await db.meetings.delete(meeting.id);
      if (meeting.audioBlobId) {
        await db.blobs.delete(meeting.audioBlobId);
      }
      addToast('Meeting deleted.', 'info');
      if (onDeleted) onDeleted();
    }
  };

  const jumpToTimestamp = (sec: number) => {
    setHighlightTimestamp(sec);
    setActiveTab('transcript');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black p-4 sm:p-8 overflow-y-auto max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="border-b border-zinc-850 pb-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {onBackToList && (
              <button
                onClick={onBackToList}
                className="md:hidden flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                title="Back to meetings list"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Meetings</span>
              </button>
            )}
            <h2 className="text-xl font-bold text-white tracking-tight">{meeting.title}</h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1.5">
            <span className="font-mono">{new Date(meeting.startTime).toLocaleString()}</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {formatSecondsToTime(meeting.durationSeconds)}
            </span>
            <span>•</span>
            <span>{meeting.transcript.length} transcript segments</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleConvertToNote}>
            <FileText className="w-3.5 h-3.5" />
            <span>Save as Note</span>
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportMarkdown}>
            <Download className="w-3.5 h-3.5" />
            <span>Export MD</span>
          </Button>
          <Button size="icon" variant="ghost" onClick={handleDelete} title="Delete Meeting">
            <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-red-400" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-zinc-850 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'summary'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Executive Summary
        </button>
        <button
          onClick={() => setActiveTab('transcript')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'transcript'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Verbal Transcript ({meeting.transcript.length})
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'timeline'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Milestone Timeline ({meeting.timeline.length})
        </button>
      </div>

      {/* Tab: Summary */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Executive Overview */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4 text-zinc-400" />
              <span>Overview</span>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed">
              {meeting.summary?.overview || 'No overview generated.'}
            </p>
          </div>

          {/* Key Decisions */}
          {meeting.summary && meeting.summary.decisions.length > 0 && (
            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-6">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                Key Decisions
              </h3>
              <ul className="space-y-2">
                {meeting.summary.decisions.map((dec, i) => (
                  <li key={i} className="text-xs text-zinc-200 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                    <span>{dec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Items */}
          {meeting.summary && meeting.summary.actionItems.length > 0 && (
            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Action Items ({meeting.summary.actionItems.length})
                </h3>
              </div>
              <div className="space-y-2.5">
                {meeting.summary.actionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-850 text-xs"
                  >
                    <CheckSquare className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <span className="text-zinc-200 font-medium">{item.task}</span>
                      {item.owner && (
                        <span className="ml-2 text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                          @{item.owner}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discussion Topics */}
          {meeting.summary && meeting.summary.topics.length > 0 && (
            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-6">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                Topics Discussed
              </h3>
              <div className="flex flex-wrap gap-2">
                {meeting.summary.topics.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Manual Notes Taken During Meeting */}
          {meeting.manualNotes.trim() && (
            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-6">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                Participant Notes
              </h3>
              <div className="font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {meeting.manualNotes}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Transcript */}
      {activeTab === 'transcript' && (
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 space-y-3">
          {meeting.transcript.length === 0 ? (
            <div className="text-center py-12 text-xs text-zinc-500">
              No verbal transcript was recorded for this session.
            </div>
          ) : (
            meeting.transcript.map((seg) => {
              const isTarget =
                highlightTimestamp !== null &&
                Math.abs(seg.timestampSeconds - highlightTimestamp) < 3;

              return (
                <div
                  key={seg.id}
                  className={`p-3.5 rounded-lg border text-xs transition-colors ${
                    isTarget
                      ? 'bg-zinc-800/80 border-white text-white shadow-md'
                      : 'bg-zinc-900/40 border-zinc-850 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5">
                    <span className="font-semibold text-zinc-200">{seg.speaker}</span>
                    <span className="font-mono text-zinc-400">
                      {formatSecondsToTime(seg.timestampSeconds)}
                    </span>
                  </div>
                  <p className="leading-relaxed">{seg.text}</p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 space-y-4">
          {meeting.timeline.length === 0 ? (
            <div className="text-center py-12 text-xs text-zinc-500">
              No timeline milestones recorded for this session.
            </div>
          ) : (
            meeting.timeline.map((item) => (
              <div
                key={item.id}
                onClick={() => jumpToTimestamp(item.timestampSeconds)}
                className="flex items-start gap-4 p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-850 hover:bg-zinc-900 hover:border-zinc-750 cursor-pointer transition-all group"
              >
                <span className="font-mono text-xs text-zinc-400 group-hover:text-white shrink-0 pt-0.5">
                  {item.timeFormatted}
                </span>
                <div className="w-px h-6 bg-zinc-800" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                    {item.label}
                  </div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                    {item.type} • click to jump to transcript
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
