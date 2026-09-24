import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { useWorkspace } from '../../context/workspace-context';
import { Modal } from '../ui/modal';
import { Search, FileText, Mic, FileUp, Video, ArrowRight } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'note' | 'meeting' | 'document' | 'manual';
  title: string;
  snippet: string;
  targetId: string;
}

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    setActiveView,
    setActiveNoteId,
    setActiveMeetingId,
    setActiveDocumentId,
    setActiveManualId,
  } = useWorkspace();

  const [query, setQuery] = useState('');

  const rawNotes = useLiveQuery(() => db.notes.toArray(), []);
  const rawMeetings = useLiveQuery(() => db.meetings.toArray(), []);
  const rawDocuments = useLiveQuery(() => db.documents.toArray(), []);
  const rawManuals = useLiveQuery(() => db.manuals.toArray(), []);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) {
      return [];
    }

    const q = query.toLowerCase();
    const hits: SearchResult[] = [];
    const notes = rawNotes || [];
    const meetings = rawMeetings || [];
    const documents = rawDocuments || [];
    const manuals = rawManuals || [];

    // Search Notes
    notes.forEach((n) => {
      if (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        hits.push({
          id: `res-note-${n.id}`,
          type: 'note',
          title: n.title || 'Untitled Note',
          snippet: n.content.replace(/[#*`_>\[\]-]/g, '').slice(0, 100) + '...',
          targetId: n.id,
        });
      }
    });

    // Search Meetings
    meetings.forEach((m) => {
      const transcriptMatch = m.transcript.find((t) => t.text.toLowerCase().includes(q));
      if (
        m.title.toLowerCase().includes(q) ||
        m.manualNotes.toLowerCase().includes(q) ||
        transcriptMatch
      ) {
        hits.push({
          id: `res-meeting-${m.id}`,
          type: 'meeting',
          title: m.title || 'Meeting Session',
          snippet: transcriptMatch
            ? `Transcript: "${transcriptMatch.text.slice(0, 100)}..."`
            : m.summary?.overview?.slice(0, 100) || 'Meeting notes and timeline',
          targetId: m.id,
        });
      }
    });

    // Search Documents
    documents.forEach((d) => {
      const pageMatch = d.extractedPages.find((p) => p.text.toLowerCase().includes(q));
      if (d.title.toLowerCase().includes(q) || pageMatch) {
        hits.push({
          id: `res-doc-${d.id}`,
          type: 'document',
          title: d.title || 'Document',
          snippet: pageMatch
            ? `Page ${pageMatch.pageNumber}: "${pageMatch.text.slice(0, 100)}..."`
            : `${d.pageCount} page document`,
          targetId: d.id,
        });
      }
    });

    // Search Manuals
    manuals.forEach((m) => {
      const stepMatch = m.steps.find(
        (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
      if (m.title.toLowerCase().includes(q) || m.purpose.toLowerCase().includes(q) || stepMatch) {
        hits.push({
          id: `res-manual-${m.id}`,
          type: 'manual',
          title: m.title || 'Operation Manual',
          snippet: stepMatch ? `Step ${stepMatch.stepNumber}: ${stepMatch.description.slice(0, 80)}...` : m.purpose,
          targetId: m.id,
        });
      }
    });

    return hits;
  }, [query, rawNotes, rawMeetings, rawDocuments, rawManuals]);

  const handleSelect = (hit: SearchResult) => {
    setIsSearchOpen(false);
    if (hit.type === 'note') {
      setActiveNoteId(hit.targetId);
      setActiveView('notes');
    } else if (hit.type === 'meeting') {
      setActiveMeetingId(hit.targetId);
      setActiveView('meetings');
    } else if (hit.type === 'document') {
      setActiveDocumentId(hit.targetId);
      setActiveView('documents');
    } else if (hit.type === 'manual') {
      setActiveManualId(hit.targetId);
      setActiveView('manuals');
    }
  };

  return (
    <Modal
      isOpen={isSearchOpen}
      onClose={() => setIsSearchOpen(false)}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 dark:text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search across all notes, meetings, documents, and manuals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-950 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-700"
          />
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {query.trim() && results.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-zinc-500">
              No matches found for "{query}".
            </div>
          ) : (
            results.map((hit) => {
              const icons = {
                note: FileText,
                meeting: Mic,
                document: FileUp,
                manual: Video,
              };
              const Icon = icons[hit.type];

              return (
                <div
                  key={hit.id}
                  onClick={() => handleSelect(hit)}
                  className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-850 hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer transition-colors text-xs flex items-center justify-between"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Icon className="w-4 h-4 text-slate-600 dark:text-zinc-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-slate-950 dark:text-zinc-100 truncate">{hit.title}</span>
                        <span className="text-[10px] text-slate-700 dark:text-zinc-400 bg-slate-200 dark:bg-zinc-950 px-1.5 py-0.2 rounded border border-slate-300 dark:border-zinc-850 uppercase font-semibold">
                          {hit.type}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-zinc-400 line-clamp-1">{hit.snippet}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-500 shrink-0 ml-2" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
