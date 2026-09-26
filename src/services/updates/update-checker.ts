/**
 * update-checker.ts
 * ─────────────────────────────────────────────────────────────────
 * GitHub Releases-based update checker for DomoNote.
 *
 * Strategy:
 *  - Fetch the latest published release from the GitHub Releases API
 *  - Compare semantic versions (current vs latest)
 *  - Remember which versions the user has dismissed so we don't spam
 *  - Never compare against arbitrary main-branch commits
 *
 * Usage:
 *   const info = await checkForUpdates(CURRENT_VERSION);
 *   if (info.updateAvailable) showBanner(info);
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface GitHubRelease {
  tag_name: string;       // e.g. "v1.2.0"
  name: string;           // e.g. "DomoNote v1.2.0"
  body: string;           // Release notes (Markdown)
  html_url: string;       // Link to the GitHub release page
  published_at: string;   // ISO 8601 date string
  prerelease: boolean;
  draft: boolean;
}

export interface UpdateInfo {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes: string;
  releaseUrl: string;
  publishedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const GITHUB_REPO = 'darknecrocities/DomoNote';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

// localStorage keys
const KEY_DISMISSED_VERSION = 'domonote_dismissed_update_version';
const KEY_LAST_CHECK = 'domonote_last_update_check';

/** Minimum time between passive update checks (20 minutes) to keep notices prompt */
const CHECK_INTERVAL_MS = 20 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
// Semantic version comparison
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse a semver string like "v1.2.3" or "1.2.3" into numeric parts.
 */
function parseSemver(tag: string): [number, number, number] {
  const clean = tag.replace(/^v/, '').split('-')[0]; // strip "v" prefix and pre-release suffix
  const parts = clean.split('.').map((n) => parseInt(n, 10) || 0);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

/**
 * Returns true if `b` is strictly newer than `a`.
 */
export function isNewerVersion(current: string, latest: string): boolean {
  const [ca, cb, cc] = parseSemver(current);
  const [la, lb, lc] = parseSemver(latest);
  if (la !== ca) return la > ca;
  if (lb !== cb) return lb > cb;
  return lc > cc;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dismissed-version persistence
// ─────────────────────────────────────────────────────────────────────────────

export function getDismissedVersion(): string | null {
  try {
    return localStorage.getItem(KEY_DISMISSED_VERSION);
  } catch {
    return null;
  }
}

export function dismissVersion(version: string): void {
  try {
    localStorage.setItem(KEY_DISMISSED_VERSION, version);
  } catch {}
}

export function clearDismissedVersion(): void {
  try {
    localStorage.removeItem(KEY_DISMISSED_VERSION);
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
// Cooldown helpers
// ─────────────────────────────────────────────────────────────────────────────

function getLastCheckTime(): number {
  try {
    return parseInt(localStorage.getItem(KEY_LAST_CHECK) || '0', 10);
  } catch {
    return 0;
  }
}

function setLastCheckTime(): void {
  try {
    localStorage.setItem(KEY_LAST_CHECK, String(Date.now()));
  } catch {}
}

function isCheckDue(): boolean {
  return Date.now() - getLastCheckTime() >= CHECK_INTERVAL_MS;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch the latest GitHub release and compare against the current version.
 *
 * @param currentVersion - The app's current version string (e.g. "0.1.0" or "v0.1.0")
 * @param force          - Skip the cooldown check
 * @returns UpdateInfo or null if the check was skipped / failed / no update
 */
export async function checkForUpdates(
  currentVersion: string,
  force = false
): Promise<UpdateInfo | null> {
  if (!force && !isCheckDue()) {
    return null;
  }

  try {
    const res = await fetch(API_URL, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const release: GitHubRelease = await res.json();

    setLastCheckTime();

    // Skip drafts and pre-releases
    if (release.draft || release.prerelease) return null;

    const latestVersion = release.tag_name;
    const updateAvailable = isNewerVersion(currentVersion, latestVersion);

    return {
      updateAvailable,
      currentVersion: currentVersion.startsWith('v') ? currentVersion : `v${currentVersion}`,
      latestVersion: latestVersion.startsWith('v') ? latestVersion : `v${latestVersion}`,
      releaseNotes: release.body || '',
      releaseUrl: release.html_url,
      publishedAt: release.published_at,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Derived helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * True if we should show the update banner to the user.
 * Considers: update available AND not dismissed for this version.
 */
export function shouldShowUpdateBanner(info: UpdateInfo | null): boolean {
  if (!info || !info.updateAvailable) return false;
  const dismissed = getDismissedVersion();
  return dismissed !== info.latestVersion;
}
