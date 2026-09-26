import React, { useEffect, useState, useCallback } from 'react';
import { useWorkspace } from './context/workspace-context';
import { initializeDatabase } from './db';
import { AppLayout } from './components/layout/app-layout';
import { GlobalSearchModal } from './components/search/global-search-modal';
import { LandingPage } from './views/landing-page';
import { DashboardView } from './views/dashboard-view';
import { NotesView } from './views/notes-view';
import { ZenFocusView } from './views/zen-focus-view';
import { MeetingsView } from './views/meetings-view';
import { ScheduleView } from './views/schedule-view';
import { DocumentsView } from './views/documents-view';
import { ManualsView } from './views/manuals-view';
import { StudioView } from './views/studio-view';
import { AIWorkspaceView } from './components/ai-workspace/ai-workspace-view';
import { TemplateGallery } from './components/templates/template-gallery';
import { SettingsView } from './views/settings-view';
import { AboutView } from './views/about-view';
import { ChangelogView } from './views/changelog-view';
import { PrivacyView } from './views/privacy-view';
import { DownloadView } from './views/download-view';
import { CloudEnvironmentModal } from './components/modals/cloud-environment-modal';
import { ChromeExtensionModal } from './components/modals/chrome-extension-modal';
import { handleGoogleAuthCallback } from './services/calendar/google-calendar';

// ── New: Ollama setup flow ────────────────────────────────────────────────────
import { OllamaSetupFlow } from './components/ollama/ollama-setup-flow';
import {
  wasSetupCompleted,
  DEFAULT_MODEL,
  clearSetupState,
  probeOllamaSetup,
  markSetupComplete,
} from './services/ai/ollama-setup';
import { recordSiteVisit } from './services/firebase/stats';

// ── New: Update banner ────────────────────────────────────────────────────────
import { UpdateBanner } from './components/updates/update-banner';
import {
  checkForUpdates,
  shouldShowUpdateBanner,
  type UpdateInfo,
} from './services/updates/update-checker';

/** App version — kept in sync with package.json via import */
const APP_VERSION = '1.0.2';

export const App: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isCloudModalOpen,
    setIsCloudModalOpen,
    isExtensionModalOpen,
    setIsExtensionModalOpen,
  } = useWorkspace();

  // ── Ollama setup state ──────────────────────────────────────────────────────
  const [showSetupFlow, setShowSetupFlow] = useState(false);

  // ── Update banner state ─────────────────────────────────────────────────────
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  // Initialize Dexie IndexedDB and seeds on app boot, or intercept OAuth popup
  useEffect(() => {
    if (handleGoogleAuthCallback()) {
      return;
    }

    initializeDatabase().catch((err) => {
      console.warn('[DomoNote] DB initialization warning:', err);
    });

    const handleNavigate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const view = detail?.view;
      if (view) {
        setActiveView(view);
      }
      if (detail?.action === 'new') {
        window.dispatchEvent(new CustomEvent('domonote:new-note'));
      } else if (detail?.action === 'record') {
        window.dispatchEvent(new CustomEvent('domonote:start-meeting'));
      }
    };

    window.addEventListener('domonote:navigate', handleNavigate);
    return () => window.removeEventListener('domonote:navigate', handleNavigate);
  }, [setActiveView]);

  // ── Record site visit on startup ──────────────────────────────────────────
  useEffect(() => {
    recordSiteVisit();
  }, []);

  // ── Global F11 Fullscreen Handler (Windows WebView2, macOS WebKit, Browser) ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();

        // 1. Windows Desktop App (WebView2)
        const winChrome = (window as unknown as { chrome?: { webview?: { postMessage: (msg: unknown) => void } } }).chrome;
        if (winChrome?.webview?.postMessage) {
          winChrome.webview.postMessage({ action: 'toggleFullscreen' });
          return;
        }

        // 2. macOS Desktop App (WebKit message handler)
        const webkit = (window as unknown as { webkit?: { messageHandlers?: { domonoteDesktop?: { postMessage: (msg: unknown) => void } } } }).webkit;
        if (webkit?.messageHandlers?.domonoteDesktop?.postMessage) {
          webkit.messageHandlers.domonoteDesktop.postMessage({ action: 'toggleFullscreen' });
          return;
        }

        // 3. Browser Fullscreen API fallback (Chrome, Edge, Firefox on laptop)
        try {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        } catch {
          // ignore any fullscreen API rejection
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Ollama first-run check (Workspace only, silent auto-connect if running) ─
  useEffect(() => {
    // NEVER pop up on landing page or download page
    if (activeView === 'landing' || activeView === 'download') {
      setShowSetupFlow(false);
      return;
    }

    // Never pop up on cloud deployments (e.g. Vercel)
    const isCloudHost =
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1';
    if (isCloudHost) {
      setShowSetupFlow(false);
      return;
    }

    const alreadyDone = wasSetupCompleted(DEFAULT_MODEL);
    if (alreadyDone) {
      setShowSetupFlow(false);
      return;
    }

    // Inside workspace view: probe silently FIRST
    let cancelled = false;
    probeOllamaSetup(DEFAULT_MODEL)
      .then((result) => {
        if (cancelled) return;
        if (result.status === 'ready') {
          // Ollama is already running and model is ready -> silently connect with ZERO popup!
          markSetupComplete(DEFAULT_MODEL);
          setShowSetupFlow(false);
        } else {
          // Only show modal if Ollama is truly not ready and user is inside workspace
          setShowSetupFlow(true);
        }
      })
      .catch(() => {
        // Silently ignore probe exceptions
      });

    return () => {
      cancelled = true;
    };
  }, [activeView]);

  // ── Also listen for a "repair AI" event from settings ──────────────────────
  useEffect(() => {
    const handleRepair = () => {
      clearSetupState();
      setShowSetupFlow(true);
    };
    window.addEventListener('domonote:repair-ai', handleRepair);
    return () => window.removeEventListener('domonote:repair-ai', handleRepair);
  }, []);

  // ── Update check on startup and periodic polling (non-blocking) ────────────
  useEffect(() => {
    let cancelled = false;
    async function runUpdateCheck(force = false) {
      try {
        const info = await checkForUpdates(APP_VERSION, force);
        if (!cancelled && info && shouldShowUpdateBanner(info)) {
          setUpdateInfo(info);
        }
      } catch {
        // silently ignore — update check is non-critical
      }
    }

    runUpdateCheck();

    // Check periodically every 20 minutes
    const interval = setInterval(() => {
      runUpdateCheck();
    }, 20 * 60 * 1000);

    const onManualCheck = () => runUpdateCheck(true);
    const onOnline = () => runUpdateCheck(false);

    window.addEventListener('domonote:check-updates', onManualCheck);
    window.addEventListener('online', onOnline);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('domonote:check-updates', onManualCheck);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  const handleSetupComplete = useCallback(() => {
    setShowSetupFlow(false);
  }, []);

  const handleSetupDismiss = useCallback(() => {
    setShowSetupFlow(false);
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'landing':
        return <LandingPage />;
      case 'download':
        return <DownloadView />;
      case 'dashboard':
        return <DashboardView />;
      case 'notes':
        return <NotesView />;
      case 'zen':
        return <ZenFocusView />;
      case 'meetings':
        return <MeetingsView />;
      case 'schedule':
        return <ScheduleView />;
      case 'documents':
        return <DocumentsView />;
      case 'manuals':
        return <ManualsView />;
      case 'studio':
        return <StudioView />;
      case 'ai-workspace':
        return <AIWorkspaceView />;
      case 'templates':
        return <TemplateGallery />;
      case 'settings':
        return <SettingsView />;
      case 'about':
        return <AboutView />;
      case 'changelog':
        return <ChangelogView />;
      case 'privacy':
        return <PrivacyView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      {/* Non-spammy update notification banner */}
      {updateInfo && shouldShowUpdateBanner(updateInfo) && (
        <UpdateBanner
          info={updateInfo}
          onDismiss={() => setUpdateInfo(null)}
        />
      )}

      <AppLayout>
        {renderActiveView()}
        <GlobalSearchModal />
        <CloudEnvironmentModal
          isOpen={isCloudModalOpen}
          onClose={() => setIsCloudModalOpen(false)}
        />
        <ChromeExtensionModal
          isOpen={isExtensionModalOpen}
          onClose={() => setIsExtensionModalOpen(false)}
        />
      </AppLayout>

      {/* Ollama first-run / repair setup flow (Workspace only) */}
      {activeView !== 'landing' && activeView !== 'download' && (
        <OllamaSetupFlow
          isOpen={showSetupFlow}
          onDismiss={handleSetupDismiss}
          onComplete={handleSetupComplete}
          silentIfReady
        />
      )}
    </>
  );
};

export default App;
