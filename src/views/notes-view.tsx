import React, { useEffect, useState, useCallback } from 'react';
import { useWorkspace } from '../context/workspace-context';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { NoteList } from '../components/notes/note-list';
import { NoteEditor } from '../components/notes/note-editor';
import { EmptyState } from '../components/ui/empty-state';
import { FileText, PanelLeftOpen, GripVertical } from 'lucide-react';

export const NotesView: React.FC = () => {
  const { activeNoteId, setActiveNoteId } = useWorkspace();

  // Dynamic resizable sidebar width (persisted in localStorage)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('domonote:notes-sidebar-width');
    const parsed = saved ? parseInt(saved, 10) : 320;
    return isNaN(parsed) || parsed < 180 || parsed > 550 ? 320 : parsed;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('domonote:notes-sidebar-collapsed') === 'true';
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray(), []) || [];

  // Persist sidebar preferences
  useEffect(() => {
    localStorage.setItem('domonote:notes-sidebar-width', String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem('domonote:notes-sidebar-collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Handle dragging the border to resize the notes sidebar
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

  // Auto-select first note if none selected and notes exist
  useEffect(() => {
    if (!activeNoteId && notes.length > 0) {
      setActiveNoteId(notes[0].id);
    }
  }, [notes, activeNoteId, setActiveNoteId]);

  const handleCreateNote = async () => {
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
  };

  // Listen to Topbar trigger
  useEffect(() => {
    const handleNewNoteEvent = () => handleCreateNote();
    window.addEventListener('domonote:new-note', handleNewNoteEvent);
    return () => window.removeEventListener('domonote:new-note', handleNewNoteEvent);
  }, []);

  return (
    <div
      className={`flex h-full w-full overflow-hidden bg-slate-50 dark:bg-black transition-colors duration-500 relative ${
        isDragging ? 'select-none cursor-col-resize' : ''
      }`}
    >
      {/* Left Sidebar: Notes List */}
      {!isSidebarCollapsed && (
        <div
          style={{ width: `${sidebarWidth}px` }}
          className={`${
            activeNoteId ? 'hidden md:flex' : 'flex'
          } shrink-0 h-full flex-col relative`}
        >
          <NoteList
            selectedNoteId={activeNoteId}
            onSelectNote={(id) => setActiveNoteId(id)}
            onCreateNote={handleCreateNote}
          />
        </div>
      )}

      {/* Draggable Divider Handle */}
      {!isSidebarCollapsed && (
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={() => setSidebarWidth(320)}
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
          title="Expand notes sidebar"
          className="hidden md:flex absolute top-3 left-3 z-30 items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-850 text-slate-700 dark:text-zinc-300 hover:text-black dark:hover:text-white shadow-md hover:bg-slate-100 dark:hover:bg-zinc-800 backdrop-blur transition-all text-xs font-semibold"
        >
          <PanelLeftOpen className="w-4 h-4 text-emerald-500" />
          <span>Notes</span>
        </button>
      )}

      {/* Right Content Area */}
      <div className={`${activeNoteId ? 'flex' : 'hidden md:flex'} flex-1 h-full min-w-0 flex-col overflow-hidden`}>
        {activeNoteId ? (
          <NoteEditor
            noteId={activeNoteId}
            onBackToList={() => setActiveNoteId(null)}
            onDeleted={() => {
              const remaining = notes.filter((n) => n.id !== activeNoteId);
              setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={FileText}
              title="No note selected"
              description="Select a note from the sidebar or create a new markdown note to start writing."
              actionLabel="New Note"
              onAction={handleCreateNote}
            />
          </div>
        )}
      </div>
    </div>
  );
};
