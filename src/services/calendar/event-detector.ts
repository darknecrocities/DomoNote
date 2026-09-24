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

const FILIPINO_DAY_NAMES: Record<string, number> = {
  linggo: 0,
  lunes: 1,
  martes: 2,
  miyerkules: 3, miyerkoles: 3,
  huwebes: 4,
  biyernes: 5,
  sabado: 6,
};

const FILIPINO_HOURS: Record<string, number> = {
  una: 1, '1': 1, isa: 1,
  dos: 2, '2': 2, dalawa: 2,
  tres: 3, '3': 3, tatlo: 3,
  kuwatro: 4, cuatro: 4, '4': 4, apat: 4,
  singko: 5, cinco: 5, '5': 5, lima: 5,
  seis: 6, '6': 6, anim: 6,
  siyete: 7, siete: 7, '7': 7, pito: 7,
  otso: 8, ocho: 8, '8': 8, walo: 8,
  nuwebe: 9, nueve: 9, '9': 9, siyam: 9,
  diyes: 10, dyes: 10, diez: 10, '10': 10, sampu: 10,
  onse: 11, once: 11, '11': 11,
  dose: 12, doce: 12, '12': 12,
};

/**
 * Parses time expressions such as:
 * "at 3pm", "3:30 pm", "10 am", "14:00", "at 9:15", "noon", "12:00"
 * as well as Filipino expressions like "alas tres ng hapon", "alas 4", "alas diyes ng umaga".
 */
export function parseTimeExpression(text: string): string | null {
  const lower = text.toLowerCase();

  if (/\bnoon\b/.test(lower)) return '12:00';
  if (/\bmidnight\b/.test(lower)) return '00:00';

  // Filipino pattern: "alas [tres/3/diyes] (ng hapon/umaga/gabi)?"
  const filAlasMatch = lower.match(/\balas\s+([a-z0-9]+)(?::(\d{2}))?(?:\s*(?:ng|sa)\s*(hapon|gabi|umaga))?\b/);
  if (filAlasMatch) {
    const rawWord = filAlasMatch[1];
    const minutes = filAlasMatch[2] ? parseInt(filAlasMatch[2], 10) : 0;
    const period = filAlasMatch[3]; // 'hapon' (pm), 'gabi' (pm), 'umaga' (am)

    let hours = FILIPINO_HOURS[rawWord];
    if (hours === undefined && !isNaN(parseInt(rawWord, 10))) {
      hours = parseInt(rawWord, 10);
    }

    if (hours !== undefined) {
      if ((period === 'hapon' || period === 'gabi') && hours < 12) {
        hours += 12;
      } else if (period === 'umaga' && hours === 12) {
        hours = 0;
      } else if (!period && hours >= 1 && hours <= 7) {
        // Typical work/meeting hours inference: "alas 3" -> 15:00
        hours += 12;
      }
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }

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

  // Support "morning" -> "09:00", "afternoon" -> "14:00", "evening" -> "18:00", "night" -> "19:00" if explicitly specified in scheduling context
  if (/\b(in the morning|tomorrow morning|bukas ng umaga|ngayong umaga)\b/.test(lower) && !lower.match(/\b\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/)) {
    return '09:00';
  }
  if (/\b(in the afternoon|tomorrow afternoon|bukas ng hapon|ngayong hapon)\b/.test(lower) && !lower.match(/\b\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/)) {
    return '14:00';
  }
  if (/\b(in the evening|tonight|bukas ng gabi|ngayong gabi)\b/.test(lower) && !lower.match(/\b\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/)) {
    return '18:00';
  }

  return null;
}

/**
 * Resolves a date string or relative reference into YYYY-MM-DD.
 * Supports English, Filipino, Japanese, and Chinese relative date terms.
 */
export function parseDateExpression(text: string, baseDate: Date = new Date()): string | null {
  const lower = text.toLowerCase();

  // "day after tomorrow" / Filipino "sa makalawa" / Japanese "明後日" / Chinese "后天"
  if (/\b(day after tomorrow|sa makalawa|samakalawa)\b/.test(lower) || /明後日|后天/.test(text)) {
    const next = new Date(baseDate);
    next.setDate(next.getDate() + 2);
    return formatIsoDate(next);
  }

  // "today" / "tonight" / Filipino "ngayon" / "ngayong araw" / "ngayong gabi" / Japanese "今日" / Chinese "今天"
  if (/\b(today|tonight|ngayon|ngayong araw|ngayong gabi|this afternoon|ngayong hapon)\b/.test(lower) || /今日|今天/.test(text)) {
    return formatIsoDate(baseDate);
  }

  // "tomorrow" / Filipino "bukas" / Japanese "明日" / Chinese "明天"
  if (/\b(tomorrow|bukas|darating na bukas)\b/.test(lower) || /明日|明天/.test(text)) {
    const next = new Date(baseDate);
    next.setDate(next.getDate() + 1);
    return formatIsoDate(next);
  }

  // "in X days / weeks"
  const inDaysMatch = lower.match(/\bin\s+(\d+|two|three|four|five|six|seven|a couple of|a|1|2|3|4|5)\s+(days?|weeks?)\b/);
  if (inDaysMatch) {
    const wordNum = inDaysMatch[1];
    const unit = inDaysMatch[2];
    let count = 1;
    if (wordNum === 'two' || wordNum === 'a couple of' || wordNum === '2') count = 2;
    else if (wordNum === 'three' || wordNum === '3') count = 3;
    else if (wordNum === 'four' || wordNum === '4') count = 4;
    else if (wordNum === 'five' || wordNum === '5') count = 5;
    else if (wordNum === 'six' || wordNum === '6') count = 6;
    else if (wordNum === 'seven' || wordNum === '7') count = 7;
    else if (!isNaN(parseInt(wordNum, 10))) count = parseInt(wordNum, 10);

    const daysToAdd = unit.startsWith('week') ? count * 7 : count;
    const next = new Date(baseDate);
    next.setDate(next.getDate() + daysToAdd);
    return formatIsoDate(next);
  }

  // "next week" / Filipino "sa susunod na linggo"
  if (/\b(next week|sa susunod na linggo|susunod na linggo)\b/.test(lower)) {
    const next = new Date(baseDate);
    next.setDate(next.getDate() + 7);
    return formatIsoDate(next);
  }

  // Filipino weekday e.g. "sa lunes", "sa biyernes"
  const filDayMatch = lower.match(/\b(?:sa|darating na)?\s*(lunes|martes|miyerkules|miyerkoles|huwebes|biyernes|sabado|linggo)\b/);
  if (filDayMatch) {
    const targetDayIndex = FILIPINO_DAY_NAMES[filDayMatch[1]];
    if (targetDayIndex !== undefined) {
      const currentDayIndex = baseDate.getDay();
      let diff = targetDayIndex - currentDayIndex;
      if (diff <= 0) diff += 7;
      const res = new Date(baseDate);
      res.setDate(res.getDate() + diff);
      return formatIsoDate(res);
    }
  }

  // "next [weekday]" or "this [weekday]" or "on [weekday]"
  const weekdayMatch = lower.match(/\b(next|this|on|coming)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/);
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

  // Ordinal Month Day: "25th of September", "1st of October", "3rd of November"
  const ordinalMonthMatch = lower.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+of\s+(january|february|march|april|may|june|july|august|september|sept|sep|october|oct|november|nov|december|dec)(?:\s*,?\s*(\d{4}))?\b/);
  if (ordinalMonthMatch) {
    const day = parseInt(ordinalMonthMatch[1], 10);
    const month = MONTH_NAMES[ordinalMonthMatch[2]];
    const year = ordinalMonthMatch[3] ? parseInt(ordinalMonthMatch[3], 10) : baseDate.getFullYear();
    if (month !== undefined && day >= 1 && day <= 31) {
      const res = new Date(year, month, day);
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
    /(?:mag-meeting|mag-sync|usapan|pagpupulong)\s*(?:para sa|tungkol sa)?\s*([^,.\n]+)/i,
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
  const words = cleaned.replace(/^(let's|we have|there is|can we|we will|i will|please|mag|may)\s+/i, '').split(' ');
  const titleSlice = words.slice(0, 5).join(' ');
  return titleSlice.charAt(0).toUpperCase() + titleSlice.slice(1);
}

/**
 * Infer event category from text keywords.
 */
export function inferCategory(text: string): ScheduleCategory {
  const lower = text.toLowerCase();
  if (/\b(deadline|due|milestone|cutoff|submission|pasa|takdang-aralin)\b/.test(lower)) return 'deadline';
  if (/\b(review|audit|code review|feedback|retrospective|pagsusuri|ire-review)\b/.test(lower)) return 'review';
  if (/\b(deep work|focus|coding|writing|investigation|pokus)\b/.test(lower)) return 'deep-work';
  if (/\b(sop|manual|procedure|operation|recording|gabay)\b/.test(lower)) return 'manual';
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
  // Reject non-scheduling statements, past tense, or conversational remarks
  const nonSchedulingPatterns = [
    /\b(?:thank\s+you|thanks)\s+(?:everyone|all|guys|folks)?\s*(?:for\s+(?:joining|coming|attending|being here))/i,
    /\bwelcome\s+to\s+(?:the|our|today'?s)?\s*(?:meeting|call|session|sync)\b/i,
    /\b(?:in\s+our\s+last|in\s+the\s+previous|earlier\s+in\s+the|during\s+this|end\s+of\s+the)\s*meeting\b/i,
    /\b(?:yesterday|earlier today|last week|last month|last year)\b/i,
    /\b(?:good\s+morning|good\s+afternoon|good\s+evening|see\s+you\s+all|have\s+a\s+good\s+day)\b/i,
  ];

  for (const pattern of nonSchedulingPatterns) {
    if (pattern.test(sentence)) {
      return null;
    }
  }

  // Keyword check for scheduling context
  const triggerKeywords = /\b(meeting|sync|call|demo|event|deadline|due|schedule|appointment|presentation|standup|workshop|catch up|session|follow up|calendar|conference|pulong|usapan|pagpupulong|sesyon|talakayan|takdang-aralin|ire-review)\b/i;
  const timeKeywords = /\b(at\s+\d|am\b|pm\b|\d{1,2}:\d{2}|noon|midnight|tomorrow|bukas|sa\s+makalawa|next\s+(?:week|mon|tue|wed|thu|fri|sat|sun)|today|on\s+(?:friday|monday|tuesday|wednesday|thursday|saturday|sunday)|alas\s+\w+|sa\s+(?:lunes|martes|miyerkules|huwebes|biyernes|sabado|linggo))\b/i;

  const hasTrigger = triggerKeywords.test(sentence);
  const hasTimeIndicator = timeKeywords.test(sentence);

  // If there's neither a trigger nor a clear date/time indicator, skip
  if (!hasTrigger && !hasTimeIndicator) return null;

  const parsedDate = parseDateExpression(sentence, baseDate);
  const parsedTime = parseTimeExpression(sentence);

  // We require at least a date OR a time to consider it a scheduled event
  if (!parsedDate && !parsedTime) return null;
  if (!hasTrigger && !parsedDate) return null;

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
