/**
 * DomoNote Automatic Speaker Hook & Multi-App Participant Attribution Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Automatically hooks into meeting apps (Google Meet, Microsoft Teams, Zoom,
 * Cisco Webex, Slack Huddles, Discord, Jitsi Meet, Skype) to detect real participant
 * names, track active speaking turns, and eliminate generic "Speaker 1" / "Speaker 2" labels.
 *
 * Capabilities:
 * 1. Multi-App DOM Hooking (via Companion Extension / Cross-tab Broadcast Channel)
 * 2. Conversational In-Speech Self-Identification ("Hi, this is Sarah", "Alex here", etc.)
 * 3. Conversational Question & Handoff Prediction ("Over to you, David")
 * 4. Active Speaker & Live Subtitle Synchronization
 * 5. Dynamic Speaker Roster Management & Retroactive Attribution
 */

export interface DiscoveredSpeaker {
  name: string;
  source: 'google-meet' | 'teams' | 'zoom' | 'webex' | 'slack' | 'discord' | 'jitsi' | 'skype' | 'conversational' | 'manual';
  confidence: number; // 0.0 to 1.0
  firstSeen: number;
  lastActive: number;
  isSelf?: boolean;
}

export interface MeetingSyncPayload {
  type: 'DOMONOTE_MEETING_PARTICIPANTS' | 'DOMONOTE_ACTIVE_SPEAKER';
  app?: string;
  participants?: string[];
  activeSpeaker?: string;
  timestamp?: number;
}

/**
 * Filter and sanitize names scraped from DOM or conversational speech.
 * Strips UI artifacts like "(You)", "(Host)", "(Guest)", emojis, and rejects buttons.
 */
export function cleanSpeakerName(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;

  let cleaned = raw
    // Remove UI role labels
    .replace(/\s*\((?:you|host|co-host|guest|external|presenter|organiser|organizer|presentation|joined|leaving)\)/gi, '')
    // Remove trailing status or badge numbers (e.g. "Sarah (3)")
    .replace(/\s*\(\d+\)$/, '')
    // Remove trailing prepositions if captured in name parsing
    .replace(/\s+(?:from|with|at|on|for|here|speaking|para|sa|po)(?:\s+.*)?$/i, '')
    // Remove emojis and special icon characters
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Remove trailing/leading punctuation and excess whitespace
    .replace(/^[^a-zA-Z0-9\u3040-\u30FF\u4E00-\u9FAF]+|[^a-zA-Z0-9\u3040-\u30FF\u4E00-\u9FAF]+$/g, '')
    .trim();

  // Strip common generic prefixes
  cleaned = cleaned.replace(/^(?:speaker|participant|user|guest)\s*\d*$/i, '').trim();

  // Exclude common UI button labels & meeting actions
  const UI_BLACKLIST = new Set([
    'mute',
    'unmute',
    'turn off microphone',
    'turn on microphone',
    'turn off camera',
    'turn on camera',
    'raise hand',
    'lower hand',
    'leave call',
    'end call',
    'leave meeting',
    'participants',
    'people',
    'chat',
    'more options',
    'show more',
    'pin to screen',
    'unpin',
    'settings',
    'share screen',
    'present now',
    'whiteboard',
    'breakout rooms',
    'recording',
    'captions',
    'closed captions',
    'audio',
    'video',
    'search',
    'close',
    'cancel',
    'apply',
    'ok',
    'yes',
    'no',
  ]);

  if (UI_BLACKLIST.has(cleaned.toLowerCase())) {
    return null;
  }

  // Reject strings that are too short, too long, or pure numbers/time formats
  if (cleaned.length < 2 || cleaned.length > 50) return null;
  if (/^\d+([:.]\d+)?$/.test(cleaned)) return null;

  return cleaned;
}

/**
 * Detect conversational self-introductions or direct speaker handoffs in spoken speech.
 * Example self-intros:
 * - "Hi everyone, this is Arron from engineering" -> "Arron"
 * - "Hey team, Sarah here, just wanted to check" -> "Sarah"
 * - "My name is Dr. Watson" -> "Dr. Watson"
 * - "Alex speaking, let me present my screen" -> "Alex"
 * - "Ako nga pala si Maria para sa report ngayon" -> "Maria"
 * - "Si John ito" -> "John"
 *
 * Example handoffs:
 * - "Over to you, Sarah" -> handoff to "Sarah"
 * - "David, what do you think?" -> handoff to "David"
 * - "Thanks Michael" -> previous or next speaker "Michael"
 */
export function detectConversationalSpeaker(
  text: string,
  knownRoster: string[] = []
): {
  name: string;
  isSelfIntro: boolean;
  isHandoff: boolean;
  confidence: number;
} | null {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();

  // 1. Direct Self-Introductions (High Confidence)
  const selfIntroPatterns = [
    // "Hi everyone, this is Sarah", "Hello team, it's Alex", "Good morning, my name is John Smith"
    /(?:hi|hello|hey|good\s+(?:morning|afternoon|evening))(?:\s+(?:everyone|everybody|all|team|folks|guys))?[,\s]+(?:this\s+is|it'?s|i'?m|my\s+name\s+is)\s+([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+)?)/i,
    // "Sarah here, just wanted to update" or "Hey team, Sarah Jenkins here" or "Dr. Watson speaking"
    /(?:^|[,\s]+)((?:(?:Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*)?[A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+)?)\s+(?:here|speaking)\b/i,
    // "This is Dr. Watson speaking"
    /(?:this\s+is|it'?s)\s+((?:Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)?\s*[A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+)?)\s+speaking\b/i,
    // "I am Alex from Product"
    /\b(?:i\s+am|i'm)\s+([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+)?)\s+(?:from|with|on)\b/i,
    // Filipino self-intros: "Ako nga pala si Maria", "Si Arron ito"
    /\b(?:ako\s+nga\s+pala\s+si|si)\s+([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+)?)(?:\s+(?:ito|dito|po\s+ito|para|sa|ang|ng))?/i,
  ];

  for (const pattern of selfIntroPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      const candidate = cleanSpeakerName(match[1]);
      if (candidate) {
        return {
          name: candidate,
          isSelfIntro: true,
          isHandoff: false,
          confidence: 0.95,
        };
      }
    }
  }

  // 2. Direct Address / Handoffs (Medium-High Confidence)
  const handoffPatterns = [
    // "Over to you, Sarah", "Your turn, Alex", "Take it away, Marcus"
    /(?:over\s+to\s+you|your\s+turn|take\s+it\s+away|handing\s+over\s+to)[,\s]+([A-Z][a-zA-Z'\-]+)\b/i,
    // "Sarah, what do you think about...", "Alex, can you take this one?"
    /^([A-Z][a-zA-Z'\-]+)[,\s]+(?:what\s+do\s+you\s+think|can\s+you|could\s+you|do\s+you\s+have|would\s+you)\b/i,
    // "...what are your thoughts, David?"
    /(?:what\s+(?:are\s+your|do\s+you)\s+thoughts|any\s+thoughts)[,\s]+([A-Z][a-zA-Z'\-]+)\??$/i,
  ];

  for (const pattern of handoffPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      const candidate = cleanSpeakerName(match[1]);
      if (candidate) {
        return {
          name: candidate,
          isSelfIntro: false,
          isHandoff: true,
          confidence: 0.85,
        };
      }
    }
  }

  // 3. Known Roster Cross-Match ("Thanks Sarah")
  if (knownRoster.length > 0) {
    for (const known of knownRoster) {
      if (known.toLowerCase() === 'you / host') continue;
      const firstName = known.split(/\s+/)[0];
      if (firstName.length < 3) continue;

      const mentionRegex = new RegExp(`\\b(?:thanks|thank\\s+you|hey|hi)\\s+${firstName}\\b`, 'i');
      if (mentionRegex.test(trimmed)) {
        return {
          name: known,
          isSelfIntro: false,
          isHandoff: true,
          confidence: 0.75,
        };
      }
    }
  }

  return null;
}

/**
 * Universal meeting speaker hook listener.
 * Connects via BroadcastChannel and window message events to sync participants
 * from browser extension content scripts running in Google Meet, Teams, Zoom, etc.
 */
export class MeetingSpeakerHook {
  private static instance: MeetingSpeakerHook | null = null;
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(roster: string[], app: string | null, activeSpeaker: string | null) => void> = new Set();

  private discoveredSpeakers: Map<string, DiscoveredSpeaker> = new Map();
  private detectedApp: string | null = null;
  private activeSpeaker: string | null = null;
  private pendingHandoff: string | null = null;

  private constructor() {
    this.initBroadcastChannel();
    this.initWindowListener();
  }

  public static getInstance(): MeetingSpeakerHook {
    if (!MeetingSpeakerHook.instance) {
      MeetingSpeakerHook.instance = new MeetingSpeakerHook();
    }
    return MeetingSpeakerHook.instance;
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('domonote_meeting_sync');
        this.channel.onmessage = (event) => {
          this.handleIncomingPayload(event.data);
        };
      } catch (err) {
        console.warn('[DomoNote SpeakerHook] BroadcastChannel unavailable:', err);
      }
    }
  }

  private initWindowListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        if (event.data?.type === 'DOMONOTE_MEETING_PARTICIPANTS' || event.data?.type === 'DOMONOTE_ACTIVE_SPEAKER') {
          this.handleIncomingPayload(event.data);
        }
      });
    }
  }

  public handleIncomingPayload(payload: MeetingSyncPayload) {
    if (!payload) return;

    let changed = false;

    if (payload.app) {
      this.detectedApp = payload.app;
    }

    if (Array.isArray(payload.participants) && payload.participants.length > 0) {
      for (const rawName of payload.participants) {
        const cleaned = cleanSpeakerName(rawName);
        if (cleaned && !this.discoveredSpeakers.has(cleaned)) {
          const source = (payload.app?.toLowerCase().replace(/\s+/g, '-') || 'conversational') as any;
          this.discoveredSpeakers.set(cleaned, {
            name: cleaned,
            source,
            confidence: 0.9,
            firstSeen: Date.now(),
            lastActive: Date.now(),
          });
          changed = true;
        }
      }
    }

    if (payload.activeSpeaker) {
      const cleaned = cleanSpeakerName(payload.activeSpeaker);
      if (cleaned) {
        this.activeSpeaker = cleaned;
        if (!this.discoveredSpeakers.has(cleaned)) {
          this.discoveredSpeakers.set(cleaned, {
            name: cleaned,
            source: (payload.app?.toLowerCase().replace(/\s+/g, '-') || 'conversational') as any,
            confidence: 0.95,
            firstSeen: Date.now(),
            lastActive: Date.now(),
          });
        } else {
          const spk = this.discoveredSpeakers.get(cleaned)!;
          spk.lastActive = Date.now();
        }
        changed = true;
      }
    }

    if (changed) {
      this.notifyListeners();
    }
  }

  /**
   * Process an incoming segment of spoken text.
   * Automatically attributes to real speaker names and eliminates "Speaker 1" / "Speaker 2".
   */
  public processSegment(
    text: string,
    currentSpeaker: string,
    roster: string[]
  ): {
    assignedSpeaker: string;
    updatedRoster: string[];
    isNewDetection: boolean;
  } {
    let assigned = currentSpeaker;
    let isNewDetection = false;
    const currentList = [...new Set([...roster, ...Array.from(this.discoveredSpeakers.keys())])];

    // 1. If previous segment was handed off to someone, that handed-off person is speaking now!
    if (this.pendingHandoff) {
      assigned = this.pendingHandoff;
      this.activeSpeaker = this.pendingHandoff;
      this.pendingHandoff = null;
      isNewDetection = true;
    } else {
      // Check for conversational self-introduction or new handoff
      const conversational = detectConversationalSpeaker(text, currentList);
      if (conversational) {
        if (conversational.isSelfIntro) {
          assigned = conversational.name;
          this.addSpeaker(conversational.name, 'conversational', 0.95);
          this.activeSpeaker = conversational.name;
          isNewDetection = true;
        } else if (conversational.isHandoff) {
          // Prepare pending handoff for the next segment
          this.pendingHandoff = conversational.name;
          this.addSpeaker(conversational.name, 'conversational', 0.85);
        }
      } else if (this.activeSpeaker && this.activeSpeaker !== currentSpeaker) {
        // If a meeting app DOM hook signaled an active speaker
        assigned = this.activeSpeaker;
      }
    }

    // 2. Eradicate generic "Speaker 1" / "Speaker 2" if we have known participants
    if (/^speaker\s*\d*$/i.test(assigned) || assigned.toLowerCase() === 'guest') {
      const nonHostSpeakers = currentList.filter(
        (s) => s.toLowerCase() !== 'you / host' && !/^speaker\s*\d*$/i.test(s)
      );
      if (nonHostSpeakers.length > 0) {
        // If "Speaker 2" or "Guest", assign to the first discovered external participant
        assigned = nonHostSpeakers[0];
      } else {
        assigned = 'You / Host';
      }
    }

    const updatedRoster = [...new Set([
      'You / Host',
      ...currentList.filter((s) => s.toLowerCase() !== 'you / host'),
      assigned,
    ])];

    return {
      assignedSpeaker: assigned,
      updatedRoster,
      isNewDetection,
    };
  }

  public reset(): void {
    this.discoveredSpeakers.clear();
    this.detectedApp = null;
    this.activeSpeaker = null;
    this.pendingHandoff = null;
  }

  public addSpeaker(name: string, source: DiscoveredSpeaker['source'] = 'manual', confidence = 1.0) {
    const cleaned = cleanSpeakerName(name);
    if (!cleaned) return;

    if (!this.discoveredSpeakers.has(cleaned)) {
      this.discoveredSpeakers.set(cleaned, {
        name: cleaned,
        source,
        confidence,
        firstSeen: Date.now(),
        lastActive: Date.now(),
      });
      this.notifyListeners();
    }
  }

  public setActiveSpeaker(name: string) {
    const cleaned = cleanSpeakerName(name) || name;
    this.activeSpeaker = cleaned;
    this.notifyListeners();
  }

  public getActiveSpeaker(): string | null {
    return this.activeSpeaker;
  }

  public getDiscoveredSpeakers(): string[] {
    return Array.from(this.discoveredSpeakers.keys());
  }

  public getDetectedApp(): string | null {
    return this.detectedApp;
  }

  public subscribe(
    callback: (roster: string[], app: string | null, activeSpeaker: string | null) => void
  ): () => void {
    this.listeners.add(callback);
    // Initial emit
    callback(this.getDiscoveredSpeakers(), this.detectedApp, this.activeSpeaker);

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    const roster = this.getDiscoveredSpeakers();
    for (const listener of this.listeners) {
      try {
        listener(roster, this.detectedApp, this.activeSpeaker);
      } catch (e) {
        console.warn('[DomoNote SpeakerHook] Listener error:', e);
      }
    }
  }
}

export const speakerHookManager = MeetingSpeakerHook.getInstance();
