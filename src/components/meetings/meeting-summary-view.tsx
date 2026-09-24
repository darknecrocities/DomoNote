import React, { useState, useEffect } from 'react';
import type { Meeting } from '../../types';
import { db } from '../../db';
import { Button } from '../ui/button';
import { formatSecondsToTime } from '../../services/audio/transcriber';
import { exportMeetingToMarkdown } from '../../services/export/markdown';
import { exportMeetingToPdf } from '../../services/export/pdf';
import { useWorkspace } from '../../context/workspace-context';
import { MeetingSingleReport } from './meeting-single-report';
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
  Camera,
  Crop,
  Image,
  X,
  User,
  Wand2,
  Languages,
  ArrowRightLeft,
  RotateCw,
} from 'lucide-react';
import { useAI } from '../../context/ai-context';
import { polishAndDiarizeTranscript, synthesizeMeetingAI } from '../../services/audio/transcriber';
import {
  SUPPORTED_LANGUAGES,
  TRANSLATION_TARGETS,
  translateTranscriptSegments,
  getLanguageName,
} from '../../services/ai/translation';

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
  const { isConnected, selectedModel } = useAI();
  const [currentMeeting, setCurrentMeeting] = useState<Meeting>(meeting);
  const [activeTab, setActiveTab] = useState<'report' | 'summary' | 'transcript' | 'timeline' | 'screenshots'>('report');
  const [highlightTimestamp, setHighlightTimestamp] = useState<number | null>(null);
  const [lightboxScreenshot, setLightboxScreenshot] = useState<string | null>(null);
  const [isPolishingAI, setIsPolishingAI] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isResynthesizing, setIsResynthesizing] = useState<boolean>(false);
  const [transcriptViewMode, setTranscriptViewMode] = useState<'dual' | 'translated' | 'original'>('dual');

  // Sync prop changes
  useEffect(() => {
    setCurrentMeeting(meeting);
  }, [meeting]);

  const handleRenameSpeaker = async (oldName: string) => {
    const newName = window.prompt(`Rename all segments for "${oldName}" to:`, oldName);
    if (!newName || !newName.trim() || newName.trim() === oldName) return;

    const trimmed = newName.trim();
    const updatedTranscript = currentMeeting.transcript.map((s) =>
      s.speaker.toLowerCase() === oldName.toLowerCase() ? { ...s, speaker: trimmed } : s
    );

    const updated = { ...currentMeeting, transcript: updatedTranscript };
    setCurrentMeeting(updated);
    await db.meetings.update(currentMeeting.id, { transcript: updatedTranscript });
    addToast(`Renamed "${oldName}" to "${trimmed}".`, 'success');
  };

  const handlePolishTranscript = async () => {
    if (!isConnected || !selectedModel || currentMeeting.transcript.length === 0) {
      addToast('Local AI (Ollama) is offline or transcript is empty.', 'warning');
      return;
    }
    setIsPolishingAI(true);
    addToast('Local AI is polishing transcript grammar & speaker turns...', 'info');
    try {
      const polished = await polishAndDiarizeTranscript(currentMeeting.transcript, selectedModel);
      const updated = { ...currentMeeting, transcript: polished };
      setCurrentMeeting(updated);
      await db.meetings.update(currentMeeting.id, { transcript: polished });
      addToast('Transcript polished with speaker diarization & grammar.', 'success');
    } catch (err: any) {
      addToast('Failed to polish transcript with AI.', 'error');
    } finally {
      setIsPolishingAI(false);
    }
  };

  const handleTranslateTranscript = async (targetLang: string) => {
    if (!isConnected || !selectedModel || currentMeeting.transcript.length === 0) {
      addToast('Local AI is offline or transcript is empty.', 'warning');
      return;
    }
    setIsTranslating(true);
    const targetName = getLanguageName(targetLang);
    addToast(`Translating transcript to ${targetName}...`, 'info');
    try {
      const translated = await translateTranscriptSegments(
        currentMeeting.transcript,
        targetLang,
        selectedModel
      );
      const updated = {
        ...currentMeeting,
        transcript: translated,
        translationLanguage: targetLang,
      };
      setCurrentMeeting(updated);
      await db.meetings.update(currentMeeting.id, {
        transcript: translated,
        translationLanguage: targetLang,
      });
      addToast(`Transcript successfully translated to ${targetName}.`, 'success');
    } catch (err: any) {
      console.warn('[DomoNote] Translate error:', err);
      addToast('Failed to translate transcript.', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleResynthesizeSummary = async (lang: 'en' | 'fil') => {
    if (!isConnected || !selectedModel || (currentMeeting.transcript.length === 0 && !currentMeeting.manualNotes.trim())) {
      addToast('Local AI is offline or no meeting content to summarize.', 'warning');
      return;
    }
    setIsResynthesizing(true);
    const langLabel = lang === 'fil' ? 'Filipino' : 'English';
    addToast(`Re-synthesizing meeting summary in ${langLabel}...`, 'info');
    try {
      const result = await synthesizeMeetingAI(
        currentMeeting.transcript,
        currentMeeting.manualNotes,
        selectedModel,
        currentMeeting.title,
        lang
      );
      const updated = {
        ...currentMeeting,
        summary: result.summary,
        timeline: result.timeline.length > 0 ? result.timeline : currentMeeting.timeline,
      };
      setCurrentMeeting(updated);
      await db.meetings.update(currentMeeting.id, {
        summary: result.summary,
        timeline: updated.timeline,
      });
      addToast(`Meeting summary re-synthesized in ${langLabel}.`, 'success');
    } catch (err: any) {
      console.warn('[DomoNote] Resynthesize error:', err);
      addToast('Failed to re-synthesize summary.', 'error');
    } finally {
      setIsResynthesizing(false);
    }
  };

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

  const handleExportPdf = () => {
    try {
      exportMeetingToPdf(meeting);
      addToast('Meeting exported to PDF with full notes and screenshots.', 'success');
    } catch (err: any) {
      console.error('[DomoNote] PDF export failed:', err);
      addToast('Failed to generate PDF export.', 'error');
    }
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

  const screenshotCount = meeting.screenshots?.length || 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-8 overflow-y-auto max-w-5xl mx-auto w-full transition-colors duration-500 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-zinc-850 pb-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {onBackToList && (
              <button
                onClick={onBackToList}
                className="md:hidden flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white px-2 py-1 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
                title="Back to meetings list"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Meetings</span>
              </button>
            )}
            <h2 className="text-xl font-bold text-slate-950 dark:text-white tracking-tight">{meeting.title}</h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-zinc-400 mt-1.5 font-medium flex-wrap">
            <span className="font-mono">{new Date(meeting.startTime).toLocaleString()}</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {formatSecondsToTime(meeting.durationSeconds)}
            </span>
            <span>•</span>
            <span>{currentMeeting.transcript.length} transcript segments</span>
            {currentMeeting.spokenLanguage && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400">
                  <Languages className="w-3 h-3" />
                  <span>Spoken: {getLanguageName(currentMeeting.spokenLanguage)}</span>
                </span>
              </>
            )}
            {currentMeeting.translationLanguage && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-cyan-600 dark:text-cyan-400">
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>Translated: {getLanguageName(currentMeeting.translationLanguage)}</span>
                </span>
              </>
            )}
            {screenshotCount > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  {screenshotCount} screenshot{screenshotCount !== 1 ? 's' : ''}
                </span>
              </>
            )}
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
          <Button size="sm" variant="primary" onClick={handleExportPdf}>
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </Button>
          <Button size="icon" variant="ghost" onClick={handleDelete} title="Delete Meeting">
            <Trash2 className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 dark:border-zinc-850 mb-6 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'report'
              ? 'border-slate-900 text-slate-950 dark:border-white dark:text-white font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Single Report</span>
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === 'summary'
              ? 'border-slate-900 text-slate-950 dark:border-white dark:text-white font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Executive Summary
        </button>
        <button
          onClick={() => setActiveTab('transcript')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === 'transcript'
              ? 'border-slate-900 text-slate-950 dark:border-white dark:text-white font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Verbal Transcript ({currentMeeting.transcript.length})
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === 'timeline'
              ? 'border-slate-900 text-slate-950 dark:border-white dark:text-white font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Milestone Timeline ({currentMeeting.timeline.length})
        </button>
        {screenshotCount > 0 && (
          <button
            onClick={() => setActiveTab('screenshots')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'screenshots'
                ? 'border-slate-900 text-slate-950 dark:border-white dark:text-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            Screenshots ({screenshotCount})
          </button>
        )}
      </div>

      {/* Tab: Single Compiled Report */}
      {activeTab === 'report' && (
        <MeetingSingleReport meeting={currentMeeting} onBack={onBackToList} />
      )}

      {/* Tab: Summary */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Multilingual AI Re-synthesis Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 flex-wrap gap-2 text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                Summary Language:
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-bold">
                {currentMeeting.summary?.summaryLanguage === 'fil' ? '🇵🇭 Filipino' : '🇺🇸 English'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleResynthesizeSummary('en')}
                disabled={isResynthesizing}
                className="text-xs font-mono py-1 px-2.5 h-7"
                title="Synthesize meeting overview, decisions, and action items in English"
              >
                <RotateCw className={`w-3 h-3 mr-1 text-cyan-500 ${isResynthesizing ? 'animate-spin' : ''}`} />
                <span>Re-summarize in English</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleResynthesizeSummary('fil')}
                disabled={isResynthesizing}
                className="text-xs font-mono py-1 px-2.5 h-7"
                title="Synthesize meeting overview, decisions, and action items in Filipino"
              >
                <RotateCw className={`w-3 h-3 mr-1 text-amber-500 ${isResynthesizing ? 'animate-spin' : ''}`} />
                <span>Re-summarize in Filipino</span>
              </Button>
            </div>
          </div>
          {/* Executive Overview */}
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl p-6 shadow-xs dark:shadow-none transition-colors duration-500">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              <span>Overview</span>
            </div>
            <p className="text-sm text-slate-900 dark:text-zinc-200 leading-relaxed">
              {meeting.summary?.overview || 'No overview generated.'}
            </p>
          </div>

          {/* Key Decisions */}
          {meeting.summary && meeting.summary.decisions.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl p-6 shadow-xs dark:shadow-none transition-colors duration-500">
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-wider mb-3">
                Key Decisions
              </h3>
              <ul className="space-y-2">
                {meeting.summary.decisions.map((dec, i) => (
                  <li key={i} className="text-xs text-slate-800 dark:text-zinc-200 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-400 mt-1.5 shrink-0" />
                    <span>{dec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Items */}
          {meeting.summary && meeting.summary.actionItems.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl p-6 shadow-xs dark:shadow-none transition-colors duration-500">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-wider">
                  Action Items ({meeting.summary.actionItems.length})
                </h3>
              </div>
              <div className="space-y-2.5">
                {meeting.summary.actionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-850 text-xs"
                  >
                    <CheckSquare className="w-4 h-4 text-slate-500 dark:text-zinc-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <span className="text-slate-900 dark:text-zinc-200 font-bold">{item.task}</span>
                      {item.owner && (
                        <span className="ml-2 text-[10px] text-slate-700 bg-slate-200 dark:text-zinc-400 dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-300 dark:border-zinc-700 font-medium">
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
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl p-6 shadow-xs dark:shadow-none transition-colors duration-500">
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-wider mb-3">
                Topics Discussed
              </h3>
              <div className="flex flex-wrap gap-2">
                {meeting.summary.topics.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs text-slate-800 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-md font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Manual Notes Taken During Meeting */}
          {meeting.manualNotes.trim() && (
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl p-6 shadow-xs dark:shadow-none transition-colors duration-500">
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-wider mb-3">
                Participant Notes
              </h3>
              <div className="font-mono text-xs text-slate-800 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {meeting.manualNotes}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Transcript */}
      {activeTab === 'transcript' && (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl p-6 space-y-3 shadow-xs dark:shadow-none transition-colors duration-500">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-850 mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-slate-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                Verbal Transcript ({currentMeeting.transcript.length} segments)
              </span>
              {currentMeeting.translationLanguage && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800">
                  Translated: {getLanguageName(currentMeeting.translationLanguage)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Translate dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <Languages className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                <select
                  disabled={isTranslating}
                  onChange={(e) => {
                    const target = e.target.value;
                    if (target) handleTranslateTranscript(target);
                  }}
                  defaultValue=""
                  className="bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none font-medium cursor-pointer"
                >
                  <option value="" disabled>
                    {isTranslating ? 'Translating...' : 'Translate Transcript...'}
                  </option>
                  {TRANSLATION_TARGETS.filter((t) => t.code !== 'none').map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.flag} {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle when translation is present */}
              {currentMeeting.transcript.some((s) => s.translation) && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-0.5 text-[11px] font-mono">
                  <button
                    onClick={() => setTranscriptViewMode('dual')}
                    className={`px-2 py-0.5 rounded transition-all ${
                      transcriptViewMode === 'dual'
                        ? 'bg-white dark:bg-zinc-800 text-slate-950 dark:text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    Dual View
                  </button>
                  <button
                    onClick={() => setTranscriptViewMode('translated')}
                    className={`px-2 py-0.5 rounded transition-all ${
                      transcriptViewMode === 'translated'
                        ? 'bg-white dark:bg-zinc-800 text-slate-950 dark:text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    Translation
                  </button>
                  <button
                    onClick={() => setTranscriptViewMode('original')}
                    className={`px-2 py-0.5 rounded transition-all ${
                      transcriptViewMode === 'original'
                        ? 'bg-white dark:bg-zinc-800 text-slate-950 dark:text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    Original
                  </button>
                </div>
              )}

              {currentMeeting.transcript.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePolishTranscript}
                  disabled={isPolishingAI}
                  className="text-xs font-mono py-1 px-3 h-7"
                  title="Use Local AI to clean grammar and diarize speaker turns"
                >
                  <Wand2 className={`w-3.5 h-3.5 mr-1 text-emerald-500 ${isPolishingAI ? 'animate-spin' : ''}`} />
                  <span>{isPolishingAI ? 'Diarizing...' : 'AI Polish & Diarize'}</span>
                </Button>
              )}
            </div>
          </div>

          {currentMeeting.transcript.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500 dark:text-zinc-500">
              No verbal transcript was recorded for this session.
            </div>
          ) : (
            currentMeeting.transcript.map((seg, idx) => {
              const isTarget =
                highlightTimestamp !== null &&
                Math.abs(seg.timestampSeconds - highlightTimestamp) < 3;

              const isSpeaker1 = seg.speaker.includes('1') || seg.speaker.toLowerCase().includes('host') || seg.speaker.toLowerCase().includes('you');
              const badgeColor = isSpeaker1
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                : 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30';

              const showDual = transcriptViewMode === 'dual' && seg.translation;
              const showTranslatedOnly = transcriptViewMode === 'translated' && seg.translation;

              return (
                <div
                  key={seg.id || `sum-seg-${idx}`}
                  className={`p-3.5 rounded-lg border text-xs transition-colors space-y-1.5 ${
                    isTarget
                      ? 'bg-slate-200 dark:bg-zinc-800/80 border-slate-900 dark:border-white text-slate-950 dark:text-white shadow-md'
                      : 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-850 text-slate-800 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 mb-1 font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRenameSpeaker(seg.speaker)}
                        className={`font-semibold px-2 py-0.5 rounded border text-[10px] font-mono flex items-center gap-1 hover:brightness-110 cursor-pointer ${badgeColor}`}
                        title="Click to rename this speaker across all transcript segments"
                      >
                        <User className="w-2.5 h-2.5" />
                        <span>{seg.speaker}</span>
                      </button>
                      {seg.sourceLanguage && (
                        <span className="text-[9px] font-mono px-1 rounded bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700">
                          {seg.sourceLanguage}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-slate-500 dark:text-zinc-400">
                      {formatSecondsToTime(seg.timestampSeconds)}
                    </span>
                  </div>

                  {showDual ? (
                    <div className="space-y-1 pl-1">
                      <div className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed italic border-l-2 border-slate-300 dark:border-zinc-700 pl-2">
                        <span className="text-[9px] font-mono uppercase text-slate-400 dark:text-zinc-500 mr-1.5">Original:</span>
                        {seg.originalText || seg.text}
                      </div>
                      <div className="text-slate-900 dark:text-zinc-100 text-xs font-medium leading-relaxed border-l-2 border-emerald-500/60 pl-2">
                        <span className="text-[9px] font-mono uppercase text-emerald-600 dark:text-emerald-400 mr-1.5">Translated:</span>
                        {seg.translation}
                      </div>
                    </div>
                  ) : showTranslatedOnly ? (
                    <p className="text-slate-900 dark:text-zinc-100 text-xs leading-relaxed pl-1 font-medium">
                      {seg.translation}
                    </p>
                  ) : (
                    <p className="leading-relaxed pl-1">{seg.originalText || seg.text}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl p-6 space-y-4 shadow-xs dark:shadow-none transition-colors duration-500">
          {meeting.timeline.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500 dark:text-zinc-500">
              No timeline milestones recorded for this session.
            </div>
          ) : (
            meeting.timeline.map((item) => (
              <div
                key={item.id}
                onClick={() => jumpToTimestamp(item.timestampSeconds)}
                className="flex items-start gap-4 p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-750 cursor-pointer transition-all group"
              >
                <span className="font-mono text-xs text-slate-500 dark:text-zinc-400 group-hover:text-slate-950 dark:group-hover:text-white shrink-0 pt-0.5 font-medium">
                  {item.timeFormatted}
                </span>
                <div className="w-px h-6 bg-slate-200 dark:bg-zinc-800" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-zinc-200 group-hover:text-slate-950 dark:group-hover:text-white">
                    {item.label}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                    {item.type} • click to jump to transcript
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Screenshots */}
      {activeTab === 'screenshots' && (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl p-6 shadow-xs dark:shadow-none transition-colors duration-500">
          {!meeting.screenshots || meeting.screenshots.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500 dark:text-zinc-500">
              No screenshots were captured during this session.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {meeting.screenshots.map((ss, idx) => (
                <div
                  key={ss.id}
                  className="group rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-600 transition-colors cursor-pointer"
                  onClick={() => setLightboxScreenshot(ss.dataUrl)}
                >
                  <div className="relative">
                    <img
                      src={ss.dataUrl}
                      alt={ss.caption || `Screenshot ${idx + 1}`}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white/90 font-semibold">
                          {formatSecondsToTime(ss.timestampSeconds)}
                        </span>
                        <span className="text-[10px] text-white/80 font-medium flex items-center gap-1">
                          {ss.type === 'portion' ? (
                            <>
                              <Crop className="w-2.5 h-2.5" />
                              <span>Portion</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-2.5 h-2.5" />
                              <span>Full</span>
                            </>
                          )}
                        </span>
                      </div>
                      {ss.caption && (
                        <p className="text-[11px] text-white/80 mt-1 line-clamp-1">{ss.caption}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Screenshot Lightbox */}
      {lightboxScreenshot && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxScreenshot(null)}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxScreenshot(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={lightboxScreenshot}
              alt="Screenshot preview"
              className="w-full rounded-lg border border-zinc-800 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
