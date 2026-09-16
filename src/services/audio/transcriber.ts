import type { TranscriptSegment, MeetingSummary, TimelineItem, ScheduleEvent } from '../../types';
export type { TranscriptSegment, MeetingSummary, TimelineItem, ScheduleEvent };
import { ollama } from '../ai/ollama';
import {
  detectAllEventsInText,
  createScheduleEventFromMatch,
} from '../calendar/event-detector';

/**
 * LiveSpeechTranscriber provides real-time speech-to-text transcription
 * using the browser's Web Speech API (SpeechRecognition).
 *
 * Features:
 * - Continuous listening with automatic restart on speech end
 * - Configurable language (defaults to 'en-US')
 * - Timestamped transcript segments relative to recording start
 * - Graceful degradation when SpeechRecognition is unsupported
 *
 * Usage:
 * ```ts
 * const transcriber = new LiveSpeechTranscriber();
 * transcriber.start((segment) => {
 *   console.log(segment.text); // live transcribed text
 * });
 * // later...
 * transcriber.stop();
 * ```
 */
export class LiveSpeechTranscriber {
  private recognition: any = null;
  private isListening: boolean = false;
  private startTime: number = 0;
  private onSegmentCallback: ((segment: TranscriptSegment) => void) | null = null;
  private onInterimCallback: ((interimText: string) => void) | null = null;
  private segmentCounter: number = 0;
  private restartAttempts: number = 0;
  private maxRestartAttempts: number = 50;
  private language: string = 'en-US';
  private activeSpeaker: string = 'Speaker 1';

  constructor() {
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;

      this.recognition.onresult = (event: any) => {
        let interimAccumulator = '';
        const elapsed = Math.max(0, Math.floor((Date.now() - this.startTime) / 1000));

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0]?.transcript?.trim();
          if (!text) continue;

          if (result.isFinal) {
            this.restartAttempts = 0; // Reset on successful result
            if (this.onSegmentCallback) {
              this.onSegmentCallback({
                id: `seg-${++this.segmentCounter}-${Date.now()}`,
                timestampSeconds: elapsed,
                speaker: this.activeSpeaker || 'Speaker 1',
                text,
              });
            }
          } else {
            interimAccumulator += (interimAccumulator ? ' ' : '') + text;
          }
        }

        if (this.onInterimCallback) {
          this.onInterimCallback(interimAccumulator);
        }
      };

      this.recognition.onerror = (event: any) => {
        const errorType = event?.error;
        console.warn('[DomoNote] Speech recognition event:', errorType);

        // Handle specific error types
        switch (errorType) {
          case 'no-speech':
            // Normal — user is silent, will auto-restart via onend
            break;
          case 'audio-capture':
            console.error('[DomoNote] Microphone not available or disconnected.');
            break;
          case 'not-allowed':
            console.error('[DomoNote] Microphone permission denied by user or browser.');
            this.isListening = false; // Stop trying to restart
            break;
          case 'network':
            console.warn('[DomoNote] Network error in speech recognition. Will retry.');
            break;
          case 'aborted':
            // Recognition was aborted, may auto-restart
            break;
          default:
            console.warn('[DomoNote] Unknown speech recognition error:', errorType);
        }
      };

      this.recognition.onend = () => {
        // Auto-restart if we are still marked listening and haven't exceeded retry limit
        if (this.isListening && this.restartAttempts < this.maxRestartAttempts) {
          this.restartAttempts++;
          // Small delay to prevent tight restart loops under browser throttling
          const delay = Math.min(100 * this.restartAttempts, 2000);
          setTimeout(() => {
            if (this.isListening) {
              try {
                this.recognition.start();
              } catch {
                // ignore — may already be started
              }
            }
          }, delay);
        } else if (this.restartAttempts >= this.maxRestartAttempts) {
          console.warn('[DomoNote] Speech recognition exceeded max restart attempts. Stopping.');
          this.isListening = false;
        }
      };
    }
  }

  /**
   * Check whether the browser supports the Web Speech API.
   * @returns `true` if SpeechRecognition is available.
   */
  isSupported(): boolean {
    return !!this.recognition;
  }

  /**
   * Set the language code for speech recognition.
   * Must be called before `start()`. Defaults to 'en-US'.
   * @param lang - BCP 47 language tag (e.g., 'en-US', 'fil-PH', 'ja-JP')
   */
  setLanguage(lang: string): void {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  /**
   * Set active speaker name (e.g., 'Arron', 'Speaker 1', 'Client')
   */
  setActiveSpeaker(speaker: string): void {
    if (speaker && speaker.trim()) {
      this.activeSpeaker = speaker.trim();
    }
  }

  getActiveSpeaker(): string {
    return this.activeSpeaker;
  }

  /**
   * Begin live speech transcription.
   * Each recognized phrase calls `onSegment` with a timestamped `TranscriptSegment`.
   * Optionally streams interim speech in real time as the user speaks.
   * @param onSegment - Callback invoked with each finalized transcribed segment.
   * @param onInterim - Optional callback invoked in real time with interim spoken words.
   */
  start(
    onSegment: (segment: TranscriptSegment) => void,
    onInterim?: (interimText: string) => void
  ): void {
    if (!this.recognition) return;
    this.isListening = true;
    this.startTime = Date.now();
    this.segmentCounter = 0;
    this.restartAttempts = 0;
    this.onSegmentCallback = onSegment;
    this.onInterimCallback = onInterim || null;
    try {
      this.recognition.start();
    } catch {
      // already active
    }
  }

  /**
   * Stop live speech transcription and release resources.
   * Safe to call multiple times.
   */
  stop(): void {
    this.isListening = false;
    this.onSegmentCallback = null;
    this.restartAttempts = 0;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }
}

/**
 * Format a duration in seconds to a human-readable `MM:SS` string.
 * @param totalSeconds - Total seconds elapsed.
 * @returns Formatted time string (e.g., '05:32').
 */
export function formatSecondsToTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Synthesize AI-powered meeting insights from transcript and manual notes.
 *
 * Sends the full transcript and manual notes to the local Ollama model,
 * which extracts:
 * - Executive overview
 * - Key decisions
 * - Action items with owners
 * - Discussion topics
 * - Follow-up tasks
 * - Timeline milestones
 *
 * Falls back to a deterministic summary if AI is unavailable or returns
 * malformed JSON.
 *
 * @param transcript - Array of timestamped transcript segments.
 * @param manualNotes - Free-text notes taken during the meeting.
 * @param modelName - Ollama model name to use for synthesis.
 * @returns Structured summary and timeline milestones.
 */
export async function synthesizeMeetingAI(
  transcript: TranscriptSegment[],
  manualNotes: string,
  modelName: string,
  meetingTitle?: string
): Promise<{
  summary: MeetingSummary;
  timeline: TimelineItem[];
  detectedEvents: ScheduleEvent[];
}> {
  if (transcript.length === 0 && !manualNotes.trim()) {
    return {
      summary: {
        overview: 'No transcript or manual notes recorded for this session.',
        decisions: [],
        actionItems: [],
        topics: [],
        followUpTasks: [],
      },
      timeline: [],
      detectedEvents: [],
    };
  }

  const combinedText = `${transcript.map((s) => s.text).join(' ')}\n${manualNotes}`;
  const nlpMatches = detectAllEventsInText(combinedText);
  const detectedEvents: ScheduleEvent[] = nlpMatches.map((m) =>
    createScheduleEventFromMatch(m, {
      source: 'meeting',
      sourceTitle: meetingTitle || 'Recorded Meeting',
    })
  );

  const transcriptText = transcript
    .map((s) => `[${formatSecondsToTime(s.timestampSeconds)}] ${s.speaker}: ${s.text}`)
    .join('\n');

  const prompt = `Analyze this actual meeting transcript and participant notes. Deriving facts ONLY from the text provided below, generate a factual structured JSON output.
Do not hallucinate or invent owners if none are mentioned. If something was not discussed, leave that array empty.
If any future events, meetings, syncs, presentations, or deadlines are mentioned with dates/times, include them in "detectedEvents".

TRANSCRIPT:
${transcriptText || '(No verbal transcript)'}

MANUAL NOTES:
${manualNotes || '(No manual notes)'}

Respond STRICTLY with valid JSON in this exact structure, with no extra text or commentary:
{
  "overview": "Brief 2-3 sentence meeting summary",
  "decisions": ["Decision 1", "Decision 2"],
  "actionItems": [{"task": "Task description", "owner": "Name or empty"}],
  "topics": ["Topic 1", "Topic 2"],
  "followUpTasks": ["Follow-up task 1"],
  "detectedEvents": [
    {"title": "Event Name", "date": "YYYY-MM-DD", "time": "HH:MM", "durationMin": 30, "category": "meeting"}
  ],
  "timeline": [
    {"timestampSeconds": 0, "label": "Brief topic milestone", "type": "topic"}
  ]
}`;

  try {
    const response = await ollama.generate(prompt, {
      model: modelName,
      temperature: 0.1,
    });

    // Extract JSON block
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Model did not return JSON');

    const parsed = JSON.parse(jsonMatch[0]);

    const timeline: TimelineItem[] = Array.isArray(parsed.timeline)
      ? parsed.timeline.map((item: any, i: number) => ({
          id: `tl-${i}-${Date.now()}`,
          timestampSeconds: item.timestampSeconds || 0,
          timeFormatted: formatSecondsToTime(item.timestampSeconds || 0),
          label: item.label || 'Discussion Milestone',
          type: item.type || 'topic',
        }))
      : [];

    // Parse AI-detected events and merge with NLP events
    if (Array.isArray(parsed.detectedEvents)) {
      for (const ev of parsed.detectedEvents) {
        if (ev.title && (ev.date || ev.time)) {
          const isoDate = ev.date && /^\d{4}-\d{2}-\d{2}$/.test(ev.date)
            ? ev.date
            : new Date().toISOString().split('T')[0];
          const timeStr = ev.time || '10:00';

          const exists = detectedEvents.some(
            (e) => e.date === isoDate && e.time === timeStr
          );

          if (!exists) {
            detectedEvents.push({
              id: `ev-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              title: ev.title,
              date: isoDate,
              time: timeStr,
              durationMin: Number(ev.durationMin) || 30,
              category: ['meeting', 'deep-work', 'review', 'manual', 'deadline'].includes(ev.category)
                ? ev.category
                : 'meeting',
              completed: false,
              notes: `Identified by Local AI from meeting discussion.`,
              detectedFrom: {
                source: 'meeting',
                sourceTitle: meetingTitle || 'Recorded Meeting',
              },
              addedToComputerCalendar: false,
              syncedToGoogle: false,
              createdAt: Date.now(),
            });
          }
        }
      }
    }

    return {
      summary: {
        overview: parsed.overview || 'Meeting completed.',
        decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
        topics: Array.isArray(parsed.topics) ? parsed.topics : [],
        followUpTasks: Array.isArray(parsed.followUpTasks) ? parsed.followUpTasks : [],
      },
      timeline,
      detectedEvents,
    };
  } catch (err: any) {
    console.warn('[DomoNote] AI meeting synthesis fallback:', err?.message);
    // Safe deterministic fallback when AI fails or model JSON malformed
    return {
      summary: {
        overview: `Meeting recorded with ${transcript.length} transcript segment(s). AI analysis could not be parsed.`,
        decisions: [],
        actionItems: [],
        topics: [],
        followUpTasks: [],
      },
      timeline: transcript.slice(0, 5).map((s, idx) => ({
        id: `tl-${idx}`,
        timestampSeconds: s.timestampSeconds,
        timeFormatted: formatSecondsToTime(s.timestampSeconds),
        label: s.text.slice(0, 40) + '...',
        type: 'topic',
      })),
      detectedEvents,
    };
  }
}

/**
 * Uses Local AI (Ollama) to polish raw speech transcription:
 * - Fixes grammar, punctuation, and fragmented speech chunks
 * - Assigns realistic, accurate speaker names (e.g. Speaker 1, Speaker 2, or detected participant names)
 * - Merges stuttered/split phrases into clean, professional dialogue turns
 */
export async function polishAndDiarizeTranscript(
  transcript: TranscriptSegment[],
  modelName: string
): Promise<TranscriptSegment[]> {
  if (transcript.length === 0) return [];

  const rawLines = transcript
    .map((s, idx) => `[${idx}] [${formatSecondsToTime(s.timestampSeconds)}] ${s.speaker}: ${s.text}`)
    .join('\n');

  const prompt = `You are an expert audio transcription editor and speaker diarization specialist.
Clean up, punctuate, and polish this raw spoken transcript. Correct speech recognition misspellings, merge stuttered phrases into clean sentences, and distinguish speakers accurately based on conversational flow.

RAW TRANSCRIPT:
${rawLines}

Respond STRICTLY with a valid JSON array of objects formatted as:
[
  {
    "timestampSeconds": 0,
    "speaker": "Speaker 1",
    "text": "Polished, grammatically correct speech with proper punctuation."
  }
]
Return only the JSON array with no extra text or markdown formatting.`;

  try {
    const response = await ollama.generate(prompt, {
      model: modelName,
      temperature: 0.1,
    });

    const match = response.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array in AI response');

    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Empty parsed array');

    return parsed.map((item: any, idx: number) => ({
      id: `seg-polished-${idx}-${Date.now()}`,
      timestampSeconds:
        typeof item.timestampSeconds === 'number'
          ? item.timestampSeconds
          : transcript[Math.min(idx, transcript.length - 1)]?.timestampSeconds || 0,
      speaker: (item.speaker || 'Speaker 1').trim(),
      text: (item.text || '').trim(),
    }));
  } catch (err: any) {
    console.warn('[DomoNote] AI transcript polish fallback:', err?.message);
    // Safe deterministic fallback: capitalize and punctuate
    return transcript.map((s) => ({
      ...s,
      text: s.text.charAt(0).toUpperCase() + s.text.slice(1) + (s.text.endsWith('.') ? '' : '.'),
    }));
  }
}
