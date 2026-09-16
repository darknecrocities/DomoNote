import type { ScheduleEvent, ScheduleCategory } from '../../types';

export interface DetectedEventMatch {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMin: number;
  category: ScheduleCategory;
  snippet: string;
  confidence: 'high' | 'medium';
}

const MONTH_NAMES: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

const DAY_NAMES: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thur: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

function formatIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses time expressions such as:
 * "at 3pm", "3:30 pm", "10 am", "14:00", "at 9:15", "noon", "12:00"
 */
export function parseTimeExpression(text: string): string | null {
  const lower = text.toLowerCase();

  if (/\bnoon\b/.test(lower)) return '12:00';
  if (/\bmidnight\b/.test(lower)) return '00:00';

  // Pattern 1: explicitly has am or pm, e.g. "at 5:00 pm", "5pm", "10:30 am", "at 4 pm"
  const amPmRegex = /(?:at\s+)?\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
  const amPmMatch = text.match(amPmRegex);
  if (amPmMatch) {
    let hours = parseInt(amPmMatch[1], 10);
    const minutes = amPmMatch[2] ? parseInt(amPmMatch[2], 10) : 0;
    const meridiem = amPmMatch[3].toLowerCase();

    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }

  // Pattern 2: 24-hour time with colon e.g. "14:30", "at 09:15"
  const colTimeRegex = /(?:at\s+)?\b([01]?\d|2[0-3]):([0-5]\d)\b/i;
  const colMatch = text.match(colTimeRegex);
  if (colMatch) {
    const hours = parseInt(colMatch[1], 10);
    const minutes = parseInt(colMatch[2], 10);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // Pattern 3: "at \d+" e.g. "at 3", "at 14"
  const atTimeRegex = /\bat\s+(\d{1,2})(?::(\d{2}))?\b/i;
  const atMatch = text.match(atTimeRegex);
  if (atMatch) {
    let hours = parseInt(atMatch[1], 10);
    const minutes = atMatch[2] ? parseInt(atMatch[2], 10) : 0;
    if (hours >= 1 && hours <= 7) hours += 12; // Infer afternoon for typical meeting hours e.g. "at 3" -> 15:00
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }

  return null;
}

/**
 * Resolves a date string or relative reference into YYYY-MM-DD.
 */
export function parseDateExpression(text: string, baseDate: Date = new Date()): string | null {
  const lower = text.toLowerCase();

  // "day after tomorrow" (must be before "tomorrow")
  if (/\bday after tomorrow\b/.test(lower)) {
    const next = new Date(baseDate);
    next.setDate(next.getDate() + 2);
    return formatIsoDate(next);
  }

  // "today"
  if (/\btoday\b/.test(lower)) {
    return formatIsoDate(baseDate);
  }

  // "tomorrow"
  if (/\btomorrow\b/.test(lower)) {
    const next = new Date(baseDate);
    next.setDate(next.getDate() + 1);
    return formatIsoDate(next);
  }

  // "next [weekday]" or "this [weekday]" or "on [weekday]"
  const weekdayMatch = lower.match(/\b(next|this|on)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/);
  if (weekdayMatch) {
    const prefix = weekdayMatch[1] || '';
    const targetDayName = weekdayMatch[2];
    const targetDayIndex = DAY_NAMES[targetDayName];

    if (targetDayIndex !== undefined) {
      const currentDayIndex = baseDate.getDay();
      let diff = targetDayIndex - currentDayIndex;

      if (prefix === 'next') {
        diff = diff <= 0 ? diff + 7 : diff + 7;
      } else {
        if (diff <= 0) diff += 7;
      }

      const res = new Date(baseDate);
      res.setDate(res.getDate() + diff);
      return formatIsoDate(res);
    }
  }

  // Explicit Month and Day: "September 25th", "Sep 25", "October 12, 2026"
  const monthDayMatch = lower.match(/\b(january|february|march|april|may|june|july|august|september|sept|sep|october|oct|november|nov|december|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?\b/);
  if (monthDayMatch) {
    const month = MONTH_NAMES[monthDayMatch[1]];
    const day = parseInt(monthDayMatch[2], 10);
    const year = monthDayMatch[3] ? parseInt(monthDayMatch[3], 10) : baseDate.getFullYear();

    if (month !== undefined && day >= 1 && day <= 31) {
      const res = new Date(year, month, day);
      return formatIsoDate(res);
    }
  }

  // ISO Format: YYYY-MM-DD
  const isoMatch = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  // Standard numeric date: MM/DD/YYYY or M/D/YYYY
  const numDateMatch = text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/);
  if (numDateMatch) {
    const month = parseInt(numDateMatch[1], 10) - 1;
    const day = parseInt(numDateMatch[2], 10);
    const year = numDateMatch[3] ? parseInt(numDateMatch[3], 10) : baseDate.getFullYear();
    const res = new Date(year, month, day);
    return formatIsoDate(res);
  }

  return null;
}

/**
 * Extracts a sensible event title from a sentence mentioning an event.
 */
export function extractEventTitle(text: string): string {
  const cleaned = text.trim();

  // Check for explicit markers: e.g. "meeting for client review", "call with team", "sprint demo", "presentation on architecture"
  const titlePatterns = [
    /(?:schedule|have|there will be|plan|set up)?\s*(?:a|an)?\s*([a-z0-9\s-]+?(?:meeting|sync|call|demo|event|review|standup|session|presentation|workshop|discussion|deadline|milestone))/i,
    /(?:deadline|due date)(?:\s+is)?(?:\s+for)?\s*([^,.\n]+)/i,
    /(?:event|appointment)(?:\s+called|\s+for|\s+on|\s+:)?\s*([^,.\n]+)/i,
  ];

  for (const pattern of titlePatterns) {
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      return candidate
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  }

  // Fallback: Use the first 4-7 words of the sentence
  const words = cleaned.replace(/^(let's|we have|there is|can we|we will|i will|please)\s+/i, '').split(' ');
  const titleSlice = words.slice(0, 5).join(' ');
  return titleSlice.charAt(0).toUpperCase() + titleSlice.slice(1);
}

/**
 * Infer event category from text keywords.
 */
export function inferCategory(text: string): ScheduleCategory {
  const lower = text.toLowerCase();
  if (/\b(deadline|due|milestone|cutoff|submission)\b/.test(lower)) return 'deadline';
  if (/\b(review|audit|code review|feedback|retrospective)\b/.test(lower)) return 'review';
  if (/\b(deep work|focus|coding|writing|investigation)\b/.test(lower)) return 'deep-work';
  if (/\b(sop|manual|procedure|operation|recording)\b/.test(lower)) return 'manual';
  return 'meeting';
}

/**
 * Detects whether a sentence or text chunk contains a scheduled event,
 * meeting, deadline, or appointment with a date and/or time.
 */
export function detectEventFromSentence(
  sentence: string,
  baseDate: Date = new Date()
): DetectedEventMatch | null {
  if (!sentence || sentence.length < 5) return null;

  // Keyword check for scheduling context
  const triggerKeywords = /\b(meeting|sync|call|demo|event|deadline|due|schedule|appointment|presentation|standup|workshop|catch up|session|follow up|calendar|conference)\b/i;
  const timeKeywords = /\b(at\s+\d|am\b|pm\b|\d{1,2}:\d{2}|noon|midnight|tomorrow|next\s+(?:mon|tue|wed|thu|fri|sat|sun)|today|on\s+(?:friday|monday|tuesday|wednesday|thursday|saturday|sunday))\b/i;

  const hasTrigger = triggerKeywords.test(sentence);
  const hasTimeIndicator = timeKeywords.test(sentence);

  // If there's neither a trigger nor a clear date/time indicator, skip
  if (!hasTrigger && !hasTimeIndicator) return null;

  const parsedDate = parseDateExpression(sentence, baseDate);
  const parsedTime = parseTimeExpression(sentence);

  // We require at least a date OR a time to consider it a scheduled event
  if (!parsedDate && !parsedTime) return null;

  const finalDate = parsedDate || formatIsoDate(baseDate);
  const finalTime = parsedTime || '10:00';
  const title = extractEventTitle(sentence) || 'Scheduled Event';
  const category = inferCategory(sentence);

  // Parse duration if mentioned (e.g. "for 1 hour", "for 45 minutes", "30 min")
  let durationMin = 30;
  const durationMatch = sentence.match(/(?:for\s+)?(\d+)\s*(hour|hr|minute|min)/i);
  if (durationMatch) {
    const val = parseInt(durationMatch[1], 10);
    const unit = durationMatch[2].toLowerCase();
    if (unit.startsWith('h')) durationMin = val * 60;
    else durationMin = val;
  }

  const confidence: 'high' | 'medium' = parsedDate && parsedTime ? 'high' : 'medium';

  return {
    title,
    date: finalDate,
    time: finalTime,
    durationMin: Math.max(15, Math.min(240, durationMin)),
    category,
    snippet: sentence.trim(),
    confidence,
  };
}

/**
 * Splits text or transcripts into individual sentences and finds all scheduled events.
 */
export function detectAllEventsInText(
  text: string,
  baseDate: Date = new Date()
): DetectedEventMatch[] {
  if (!text) return [];

  // Split into sentences (period, exclamation, question mark, or newlines)
  const sentences = text
    .split(/(?<=[.?!])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);

  const results: DetectedEventMatch[] = [];
  const seenKeys = new Set<string>();

  for (const sentence of sentences) {
    const match = detectEventFromSentence(sentence, baseDate);
    if (match) {
      const key = `${match.date}_${match.time}_${match.title.toLowerCase().slice(0, 10)}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        results.push(match);
      }
    }
  }

  return results;
}

/**
 * Converts a DetectedEventMatch to a full ScheduleEvent ready to be saved in Dexie.
 */
export function createScheduleEventFromMatch(
  match: DetectedEventMatch,
  sourceInfo?: {
    source: 'transcript' | 'meeting' | 'note' | 'manual' | 'ai';
    sourceId?: string;
    sourceTitle?: string;
  }
): ScheduleEvent {
  return {
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: match.title,
    date: match.date,
    time: match.time,
    durationMin: match.durationMin,
    category: match.category,
    completed: false,
    notes: `Detected from: "${match.snippet}"`,
    detectedFrom: {
      source: sourceInfo?.source || 'transcript',
      sourceId: sourceInfo?.sourceId,
      sourceTitle: sourceInfo?.sourceTitle,
      snippet: match.snippet,
    },
    addedToComputerCalendar: false,
    syncedToGoogle: false,
    createdAt: Date.now(),
  };
}
