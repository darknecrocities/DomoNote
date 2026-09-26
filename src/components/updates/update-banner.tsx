/**
 * UpdateBanner
 * ────────────────────────────────────────────────────────────────
 * Non-spammy update notification shown as a slim bar at the top of the app.
 *
 * Rules:
 *  - Only shown when updateAvailable is true
 *  - Dismissing saves the version to localStorage; banner won't reappear
 *    until a *newer* version exists
 *  - Does NOT block the app or show a modal
 *  - "View Update" opens the GitHub release page in a new tab
 */

import React, { useState } from 'react';
import { ArrowUpCircle, X, ExternalLink } from 'lucide-react';
import type { UpdateInfo } from '../../services/updates/update-checker';
import { dismissVersion } from '../../services/updates/update-checker';

interface UpdateBannerProps {
  info: UpdateInfo;
  onDismiss: () => void;
}

export const UpdateBanner: React.FC<UpdateBannerProps> = ({ info, onDismiss }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    dismissVersion(info.latestVersion);
    setDismissed(true);
    onDismiss();
  };

  return (
    <div
      id="update-banner"
      role="alert"
      aria-live="polite"
      className="
        flex items-center justify-between gap-3 px-4 py-2.5
        bg-zinc-900 border-b border-zinc-800
        text-xs text-zinc-300
        animate-in slide-in-from-top duration-300
        select-none
      "
    >
      {/* Left: icon + message */}
      <div className="flex items-center gap-2.5 min-w-0">
        <ArrowUpCircle className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
        <span className="font-medium text-white whitespace-nowrap">
          DomoNote {info.latestVersion} is available
        </span>
        <span className="text-zinc-500 hidden sm:inline">
          · You are on {info.currentVersion}
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        <a
          href={info.releaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="update-banner-view-btn"
          className="
            inline-flex items-center gap-1.5
            px-3 py-1 rounded-md
            bg-white text-black font-bold text-[11px]
            hover:bg-zinc-200 transition-colors
          "
        >
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
          View Update
        </a>
        <button
          onClick={handleDismiss}
          id="update-banner-dismiss-btn"
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
          aria-label="Dismiss update notification"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
