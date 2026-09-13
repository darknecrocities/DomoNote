import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ViewType =
  | 'landing'
  | 'dashboard'
  | 'notes'
  | 'meetings'
  | 'documents'
  | 'manuals'
  | 'ai-workspace'
  | 'templates'
  | 'settings'
  | 'about'
  | 'privacy';

export interface ToastItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface WorkspaceContextType {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  activeMeetingId: string | null;
  setActiveMeetingId: (id: string | null) => void;
  activeDocumentId: string | null;
  setActiveDocumentId: (id: string | null) => void;
  activeManualId: string | null;
  setActiveManualId: (id: string | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastItem['type']) => void;
  removeToast: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check URL query parameters for initial view or defaults to landing
  const [activeView, setActiveViewState] = useState<ViewType>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const requestedView = params.get('view') as ViewType;
      if (
        requestedView &&
        [
          'dashboard',
          'notes',
          'meetings',
          'documents',
          'manuals',
          'ai-workspace',
          'templates',
          'settings',
          'about',
          'privacy',
        ].includes(requestedView)
      ) {
        return requestedView;
      }
    }
    return 'landing';
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [activeManualId, setActiveManualId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setActiveView = useCallback((view: ViewType) => {
    setActiveViewState(view);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (view === 'landing') {
        url.searchParams.delete('view');
      } else {
        url.searchParams.set('view', view);
      }
      window.history.pushState({}, '', url.toString());
    }
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Toggle Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsCommandPaletteOpen(false);
        return;
      }

      // Cmd/Ctrl + Shift + F: Open Global Search
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        activeView,
        setActiveView,
        activeNoteId,
        setActiveNoteId,
        activeMeetingId,
        setActiveMeetingId,
        activeDocumentId,
        setActiveDocumentId,
        activeManualId,
        setActiveManualId,
        isSearchOpen,
        setIsSearchOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
}
