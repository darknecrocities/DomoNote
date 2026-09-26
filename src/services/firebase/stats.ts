import { doc, onSnapshot, setDoc, increment, getDoc } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import { db, getFirebaseAnalytics } from './firebase';

export interface SiteStats {
  visitors: number;
  downloads: number;
  isLive: boolean;
}

export const BASELINE_VISITORS = 759;
export const BASELINE_DOWNLOADS = 329;

const STATS_COLLECTION = 'stats';
const STATS_DOC_ID = 'global';
const LOCAL_STORAGE_KEY = 'domonote_site_stats_v3';
const BROADCAST_CHANNEL_NAME = 'domonote_stats_channel';

// Read cached stats from localStorage with baseline safeguards
const getCachedStats = (): { visitors: number; downloads: number } => {
  if (typeof window === 'undefined') {
    return { visitors: BASELINE_VISITORS, downloads: BASELINE_DOWNLOADS };
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        visitors: Math.max(BASELINE_VISITORS, Number(parsed.visitors) || BASELINE_VISITORS),
        downloads: Math.max(BASELINE_DOWNLOADS, Number(parsed.downloads) || BASELINE_DOWNLOADS),
      };
    }
  } catch {
    // Ignore JSON parse errors
  }
  return { visitors: BASELINE_VISITORS, downloads: BASELINE_DOWNLOADS };
};

// Save stats cache locally
const setCachedStats = (visitors: number, downloads: number) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ visitors, downloads, updatedAt: Date.now() })
    );
  } catch {
    // Ignore storage quota errors
  }
};

// Internal reactive state initialized immediately
const initialCached = getCachedStats();
const currentStats: SiteStats = {
  visitors: initialCached.visitors,
  downloads: initialCached.downloads,
  isLive: false,
};

type StatsSubscriber = (stats: SiteStats) => void;
const subscribers = new Set<StatsSubscriber>();

const notifySubscribers = () => {
  const snapshot: SiteStats = { ...currentStats };
  for (const sub of subscribers) {
    try {
      sub(snapshot);
    } catch (err) {
      console.warn('[DomoNote Stats] Subscriber error:', err);
    }
  }
};

// Cross-tab broadcast synchronization
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'STATS_SYNC') {
        const { visitors, downloads } = event.data;
        let changed = false;
        if (typeof visitors === 'number' && visitors > currentStats.visitors) {
          currentStats.visitors = visitors;
          changed = true;
        }
        if (typeof downloads === 'number' && downloads > currentStats.downloads) {
          currentStats.downloads = downloads;
          changed = true;
        }
        if (changed) {
          setCachedStats(currentStats.visitors, currentStats.downloads);
          notifySubscribers();
        }
      }
    };
  } catch {
    // BroadcastChannel unsupported or restricted
  }
}

// Storage event fallback for cross-tab sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        const v = Math.max(BASELINE_VISITORS, Number(parsed.visitors) || BASELINE_VISITORS);
        const d = Math.max(BASELINE_DOWNLOADS, Number(parsed.downloads) || BASELINE_DOWNLOADS);
        if (v !== currentStats.visitors || d !== currentStats.downloads) {
          currentStats.visitors = Math.max(currentStats.visitors, v);
          currentStats.downloads = Math.max(currentStats.downloads, d);
          notifySubscribers();
        }
      } catch {}
    }
  });
}

const broadcastUpdate = (visitors: number, downloads: number) => {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'STATS_SYNC',
        visitors,
        downloads,
      });
    } catch {}
  }
};

/**
 * Initializes the Firestore stats document with current baseline or cached numbers
 */
export const ensureStatsDocInitialized = async (
  visitors: number = BASELINE_VISITORS,
  downloads: number = BASELINE_DOWNLOADS
): Promise<void> => {
  try {
    const docRef = doc(db, STATS_COLLECTION, STATS_DOC_ID);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(
        docRef,
        {
          visitors: Math.max(BASELINE_VISITORS, visitors),
          downloads: Math.max(BASELINE_DOWNLOADS, downloads),
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    // Firestore rules or offline — fallback continues seamlessly
    console.debug('[DomoNote Stats] Initial doc check note:', err);
  }
};

/**
 * Subscribes to real-time stats updates.
 * - Always provides instantaneous local cached stats immediately.
 * - Synchronizes with Firestore live snapshot when available.
 * - Dispatches updates whenever visitors or downloads increment in any component or tab.
 */
export const subscribeToStats = (
  callback: (stats: SiteStats) => void
): (() => void) => {
  // Register subscriber
  subscribers.add(callback);

  // Immediately notify with current stats
  callback({ ...currentStats });

  // Firestore live subscription
  let unsubscribeFirestore: (() => void) | null = null;
  try {
    const docRef = doc(db, STATS_COLLECTION, STATS_DOC_ID);
    unsubscribeFirestore = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const remoteVisitors = Number(data.visitors) || 0;
          const remoteDownloads = Number(data.downloads) || 0;

          // Merge: remote takes precedence if higher, otherwise keep local increments
          currentStats.visitors = Math.max(BASELINE_VISITORS, remoteVisitors, currentStats.visitors);
          currentStats.downloads = Math.max(BASELINE_DOWNLOADS, remoteDownloads, currentStats.downloads);
          currentStats.isLive = true;

          setCachedStats(currentStats.visitors, currentStats.downloads);
          broadcastUpdate(currentStats.visitors, currentStats.downloads);
          notifySubscribers();
        } else {
          // Document does not exist yet; try creating it with current stats
          ensureStatsDocInitialized(currentStats.visitors, currentStats.downloads);
        }
      },
      (error) => {
        // Firestore rules or offline mode — continue locally without crashing
        console.debug('[DomoNote Stats] Firestore snapshot offline or awaiting rules:', error.message);
      }
    );
  } catch (err) {
    console.debug('[DomoNote Stats] Firestore setup skipped:', err);
  }

  return () => {
    subscribers.delete(callback);
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
  };
};

// Cooldown timestamps to prevent double-firing from React.StrictMode, event bubbling, or rapid clicks
let lastVisitRecordedTime = 0;
let lastDownloadRecordedTime = 0;

/**
 * Increments the total visitors count by 1.
 * Triggers on every site visit or page refresh as requested.
 * Guarded against double-firing from React.StrictMode or multiple component mounts.
 */
export const recordSiteVisit = async (): Promise<void> => {
  try {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    if (now - lastVisitRecordedTime < 1500) {
      return;
    }
    lastVisitRecordedTime = now;

    // Immediately increment local count and notify all UI listeners
    currentStats.visitors = Math.max(BASELINE_VISITORS, currentStats.visitors + 1);
    setCachedStats(currentStats.visitors, currentStats.downloads);
    broadcastUpdate(currentStats.visitors, currentStats.downloads);
    notifySubscribers();

    // Sync to Firestore
    try {
      const docRef = doc(db, STATS_COLLECTION, STATS_DOC_ID);
      await setDoc(
        docRef,
        {
          visitors: increment(1),
          lastVisitedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (firestoreErr) {
      console.debug('[DomoNote Stats] Firestore visit sync note (local count preserved):', firestoreErr);
    }

    // Optional Analytics event
    const analytics = getFirebaseAnalytics();
    if (analytics) {
      logEvent(analytics, 'site_visit');
    }
  } catch (err) {
    console.warn('[DomoNote Stats] Visit record exception:', err);
  }
};

/**
 * Increments the total downloads count by 1 whenever a download card/button is clicked.
 * Guarded against double-firing from event bubbling or accidental multi-clicks.
 */
export const recordAppDownload = async (platform?: string): Promise<void> => {
  try {
    const now = Date.now();
    if (now - lastDownloadRecordedTime < 800) {
      return;
    }
    lastDownloadRecordedTime = now;

    // Immediately increment local count and notify all UI listeners
    currentStats.downloads = Math.max(BASELINE_DOWNLOADS, currentStats.downloads + 1);
    setCachedStats(currentStats.visitors, currentStats.downloads);
    broadcastUpdate(currentStats.visitors, currentStats.downloads);
    notifySubscribers();

    // Sync to Firestore
    try {
      const docRef = doc(db, STATS_COLLECTION, STATS_DOC_ID);
      await setDoc(
        docRef,
        {
          downloads: increment(1),
          lastDownloadedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (firestoreErr) {
      console.debug('[DomoNote Stats] Firestore download sync note (local count preserved):', firestoreErr);
    }

    // Optional Analytics event
    const analytics = getFirebaseAnalytics();
    if (analytics) {
      logEvent(analytics, 'app_download', { platform: platform || 'general' });
    }
  } catch (err) {
    console.warn('[DomoNote Stats] Download record exception:', err);
  }
};
