import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { isCloudDeployment } from '../services/environment';
import { useSEO } from '../services/seo';

export type ViewType =
  | 'landing'
  | 'download'
  | 'dashboard'
  | 'notes'
  | 'zen'
  | 'meetings'
  | 'schedule'
  | 'documents'
  | 'manuals'
  | 'studio'
  | 'ai-workspace'
  | 'templates'
  | 'settings'
  | 'about'
  | 'changelog'
  | 'privacy'
  | 'support';

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
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  isCloudModalOpen: boolean;
  setIsCloudModalOpen: (open: boolean) => void;
  isExtensionModalOpen: boolean;
  setIsExtensionModalOpen: (open: boolean) => void;
  isCloudHost: boolean;
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastItem['type']) => void;
  removeToast: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

const ALL_VALID_VIEWS: ViewType[] = [
  'landing',
  'download',
  'dashboard',
  'notes',
  'zen',
  'meetings',
  'schedule',
  'documents',
  'manuals',
  'studio',
  'ai-workspace',
  'templates',
  'settings',
  'about',
  'changelog',
  'privacy',
  'support',
];

const LOCAL_WORKSPACE_VIEWS: ViewType[] = [
  'dashboard',
  'notes',
  'zen',
  'meetings',
  'schedule',
  'documents',
  'manuals',
  'studio',
  'ai-workspace',
  'templates',
  'settings',
];

function getRequestedViewFromLocation(): ViewType | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const paramView = params.get('view') as ViewType;
  if (paramView && ALL_VALID_VIEWS.includes(paramView)) {
    return paramView;
  }
  const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (cleanPath === 'privacy-policy') {
    return 'privacy';
  }
  if (cleanPath === 'support' || cleanPath === 'contact') {
    return 'support';
  }
  if (cleanPath && ALL_VALID_VIEWS.includes(cleanPath as ViewType)) {
    return cleanPath as ViewType;
  }
  return null;
}

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isCloudHost = useMemo(() => isCloudDeployment(), []);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState<boolean>(false);

  // Check URL query parameters or clean path for initial view or defaults to landing
  const [activeView, setActiveViewState] = useState<ViewType>(() => {
    if (typeof window !== 'undefined') {
      const requestedView = getRequestedViewFromLocation();

      // On Cloud (e.g. Vercel, Netlify):
      if (isCloudDeployment()) {
        if (!requestedView || requestedView === 'landing' || LOCAL_WORKSPACE_VIEWS.includes(requestedView)) {
          return 'landing';
        }
        if (ALL_VALID_VIEWS.includes(requestedView)) {
          return requestedView;
        }
        return 'landing';
      }

      // On Local (localhost, 127.0.0.1, desktop companion):
      if (requestedView && ALL_VALID_VIEWS.includes(requestedView)) {
        return requestedView;
      }
      return 'dashboard';
    }
    return 'dashboard';
  });

  // Dynamically update document title, canonical link, and open graph tags for SEO
  useSEO(activeView);

  // If on cloud and navigated directly to workspace param, prompt modal
  useEffect(() => {
    if (typeof window !== 'undefined' && isCloudHost) {
      const requestedView = getRequestedViewFromLocation();
      if (requestedView && LOCAL_WORKSPACE_VIEWS.includes(requestedView)) {
        setIsCloudModalOpen(true);
      }
    }
  }, [isCloudHost]);

  // Listen to browser popstate (back/forward buttons)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (typeof window === 'undefined') return;
      const requestedView = (e.state?.view || getRequestedViewFromLocation()) as ViewType;

      if (isCloudHost) {
        if (!requestedView || requestedView === 'landing' || LOCAL_WORKSPACE_VIEWS.includes(requestedView)) {
          setActiveViewState('landing');
          return;
        }
        if (ALL_VALID_VIEWS.includes(requestedView)) {
          setActiveViewState(requestedView);
          return;
        }
        setActiveViewState('landing');
        return;
      }

      // Local environment
      if (requestedView && ALL_VALID_VIEWS.includes(requestedView)) {
        setActiveViewState(requestedView);
      } else {
        setActiveViewState('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isCloudHost]);

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [activeManualId, setActiveManualId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
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

  const setActiveView = useCallback(
    (view: ViewType) => {
      // Prevent entering broken cloud workspace on Vercel
      if (isCloudHost && LOCAL_WORKSPACE_VIEWS.includes(view)) {
        setIsCloudModalOpen(true);
        return;
      }

      setActiveViewState(view);
      setIsMobileSidebarOpen(false);
      if (typeof window !== 'undefined') {
        const publicCleanPaths: ViewType[] = ['landing', 'download', 'about', 'changelog', 'privacy', 'support'];
        if (isCloudHost && publicCleanPaths.includes(view)) {
          const targetUrl = view === 'landing' ? '/' : `/${view}`;
          window.history.pushState({ view }, '', targetUrl);
        } else {
          const url = new URL(window.location.href);
          if (view === 'landing') {
            url.searchParams.set('view', 'landing');
          } else {
            url.searchParams.set('view', view);
          }
          window.history.pushState({ view }, '', url.toString());
        }
      }
    },
    [isCloudHost]
  );

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
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        isCloudModalOpen,
        setIsCloudModalOpen,
        isExtensionModalOpen,
        setIsExtensionModalOpen,
        isCloudHost,
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
