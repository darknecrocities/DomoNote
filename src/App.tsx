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
import { wasSetupCompleted, DEFAULT_MODEL, clearSetupState } from './services/ai/ollama-setup';

// ── New: Update banner ────────────────────────────────────────────────────────
import { UpdateBanner } from './components/updates/update-banner';
import {
  checkForUpdates,
  shouldShowUpdateBanner,
  type UpdateInfo,
} from './services/updates/update-checker';

/** App version — kept in sync with package.json via import */
const APP_VERSION = '1.0.0';

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

  // ── Ollama first-run check ──────────────────────────────────────────────────
  useEffect(() => {
    // Only run the setup flow check after a brief delay so the app UI renders first
    const timer = setTimeout(() => {
      const alreadyDone = wasSetupCompleted(DEFAULT_MODEL);
      if (!alreadyDone) {
        setShowSetupFlow(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // ── Also listen for a "repair AI" event from settings ──────────────────────
  useEffect(() => {
    const handleRepair = () => {
      clearSetupState();
      setShowSetupFlow(true);
    };
    window.addEventListener('domonote:repair-ai', handleRepair);
    return () => window.removeEventListener('domonote:repair-ai', handleRepair);
  }, []);

  // ── Update check on startup (non-blocking) ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function runUpdateCheck() {
      try {
        const info = await checkForUpdates(APP_VERSION);
        if (!cancelled && info && shouldShowUpdateBanner(info)) {
          setUpdateInfo(info);
        }
      } catch {
        // silently ignore — update check is non-critical
      }
    }
    runUpdateCheck();
    return () => {
      cancelled = true;
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

      {/* Ollama first-run / repair setup flow */}
      <OllamaSetupFlow
        isOpen={showSetupFlow}
        onDismiss={handleSetupDismiss}
        onComplete={handleSetupComplete}
        silentIfReady
      />
    </>
  );
};

export default App;
