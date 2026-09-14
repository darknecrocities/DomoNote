import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useWorkspace } from '../context/workspace-context';
import { useAI } from '../context/ai-context';
import type { Note, Meeting, DocumentEntity, Manual } from '../types';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  FileText,
  Mic,
  FileUp,
  Video,
  Bot,
  Plus,
  ArrowRight,
  Clock,
  BookOpen,
  Feather,
} from 'lucide-react';
import { PandaMascot } from '../components/ui/panda-mascot';

export const DashboardView: React.FC = () => {
  const {
    setActiveView,
    setActiveNoteId,
    setActiveMeetingId,
    setActiveDocumentId,
    setActiveManualId,
  } = useWorkspace();
  const { isConnected, selectedModel } = useAI();

  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().limit(5).toArray(), []) || [];
  const meetings = useLiveQuery(() => db.meetings.orderBy('startTime').reverse().limit(4).toArray(), []) || [];
  const documents = useLiveQuery(() => db.documents.orderBy('createdAt').reverse().limit(4).toArray(), []) || [];
  const manuals = useLiveQuery(() => db.manuals.orderBy('updatedAt').reverse().limit(4).toArray(), []) || [];

  const totalItems = notes.length + meetings.length + documents.length + manuals.length;

  const handleCreateNewNote = async () => {
    const noteId = `note-${Date.now()}`;
    await db.notes.put({
      id: noteId,
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      versions: [],
    });
    setActiveNoteId(noteId);
    setActiveView('notes');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-8 overflow-y-auto max-w-6xl mx-auto w-full select-none transition-colors duration-200">
      {/* Sticky Greeting Header & Quick Actions */}
      <div className="sticky top-0 z-20 bg-slate-50/90 dark:bg-black/90 backdrop-blur-md pb-5 pt-1 -mt-2 mb-8 border-b border-slate-200 dark:border-zinc-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">Your Workspace</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            Local knowledge, active sessions, and syntheses stored in your browser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="primary" onClick={handleCreateNewNote}>
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </Button>
          <Button size="sm" variant="outline" onClick={() => setActiveView('meetings')}>
            <Mic className="w-3.5 h-3.5" />
            <span>Start Meeting</span>
          </Button>
        </div>
      </div>

      {/* Mascot Companion Welcome Banner */}
      <div className="mb-8 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex items-center gap-4">
          <PandaMascot size="sm" showSpeechBubble={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-950 dark:text-white tracking-tight">Domo Panda Assistant</span>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                LOCAL FIRST
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 max-w-lg leading-relaxed">
              Welcome back. You have {totalItems} items stored safely in your browser. All recordings, documents, and notes stay 100% private on your device.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setActiveView('zen')}
          className="shrink-0 font-mono text-xs"
        >
          <Feather className="w-3.5 h-3.5" />
          <span>Launch Zen Focus</span>
        </Button>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
        <button
          onClick={handleCreateNewNote}
          className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors text-left flex flex-col justify-between h-28 shadow-xs"
        >
          <FileText className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">New Note</div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-500">Markdown document</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('meetings')}
          className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors text-left flex flex-col justify-between h-28 shadow-xs"
        >
          <Mic className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Start Meeting</div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-500">Audio & transcript</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('documents')}
          className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors text-left flex flex-col justify-between h-28 shadow-xs"
        >
          <FileUp className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Upload Doc</div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-500">PDF, PPTX, DOCX, TXT</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('manuals')}
          className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors text-left flex flex-col justify-between h-28 shadow-xs"
        >
          <Video className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Capture Operation</div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-500">Step manual generator</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('ai-workspace')}
          className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors text-left flex flex-col justify-between h-28 shadow-xs"
        >
          <Bot className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Ask AI</div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-500">Multi-context chat</span>
          </div>
        </button>
      </div>

      {/* Main Content Area: Real Stored Activity */}
      {totalItems === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-300 dark:border-zinc-850 rounded-2xl bg-white/60 dark:bg-zinc-950/40 p-8 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-400 mx-auto mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mb-1">No activity yet</h3>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mb-6 leading-relaxed">
            Your workspace is clean. Create your first note, record a meeting session, or upload a
            document to begin.
          </p>
          <Button variant="primary" size="sm" onClick={handleCreateNewNote}>
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Note</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Notes */}
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl p-5 flex flex-col justify-between shadow-xs transition-colors duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-850 mb-3">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-wider">
                  Recent Notes ({notes.length})
                </span>
                <button
                  onClick={() => setActiveView('notes')}
                  className="text-[11px] text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white transition-colors font-medium"
                >
                  View all
                </button>
              </div>

              <div className="space-y-2">
                {notes.map((n: Note) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setActiveNoteId(n.id);
                      setActiveView('notes');
                    }}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer transition-colors text-xs flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <div className="font-semibold text-slate-900 dark:text-zinc-200 truncate">
                        {n.title || 'Untitled Note'}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-500">
                        {new Date(n.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Meetings */}
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl p-5 flex flex-col justify-between shadow-xs transition-colors duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-850 mb-3">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-wider">
                  Recorded Meetings ({meetings.length})
                </span>
                <button
                  onClick={() => setActiveView('meetings')}
                  className="text-[11px] text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white transition-colors font-medium"
                >
                  View all
                </button>
              </div>

              <div className="space-y-2">
                {meetings.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 dark:text-zinc-500">No meetings recorded yet.</div>
                ) : (
                  meetings.map((m: Meeting) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setActiveMeetingId(m.id);
                        setActiveView('meetings');
                      }}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer transition-colors text-xs flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold text-slate-900 dark:text-zinc-200 truncate">{m.title}</div>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-500">
                          {m.transcript.length} transcript segments
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Documents */}
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl p-5 flex flex-col justify-between shadow-xs transition-colors duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-850 mb-3">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-wider">
                  Documents ({documents.length})
                </span>
                <button
                  onClick={() => setActiveView('documents')}
                  className="text-[11px] text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white transition-colors font-medium"
                >
                  View all
                </button>
              </div>

              <div className="space-y-2">
                {documents.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 dark:text-zinc-500">No documents uploaded yet.</div>
                ) : (
                  documents.map((d: DocumentEntity) => (
                    <div
                      key={d.id}
                      onClick={() => {
                        setActiveDocumentId(d.id);
                        setActiveView('documents');
                      }}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer transition-colors text-xs flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold text-slate-900 dark:text-zinc-200 truncate">{d.title}</div>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-500">{d.pageCount} pages</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Operation Manuals */}
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl p-5 flex flex-col justify-between shadow-xs transition-colors duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-850 mb-3">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-wider">
                  Operation Manuals ({manuals.length})
                </span>
                <button
                  onClick={() => setActiveView('manuals')}
                  className="text-[11px] text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white transition-colors font-medium"
                >
                  View all
                </button>
              </div>

              <div className="space-y-2">
                {manuals.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 dark:text-zinc-500">No manuals generated yet.</div>
                ) : (
                  manuals.map((man: Manual) => (
                    <div
                      key={man.id}
                      onClick={() => {
                        setActiveManualId(man.id);
                        setActiveView('manuals');
                      }}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer transition-colors text-xs flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold text-slate-900 dark:text-zinc-200 truncate">{man.title}</div>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-500">{man.steps.length} steps</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
