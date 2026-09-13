import type { TranscriptSegment, MeetingSummary, TimelineItem } from '../../types';
import { ollama } from '../ai/ollama';

export class LiveSpeechTranscriber {
  private recognition: any = null;
  private isListening: boolean = false;
  private startTime: number = 0;
  private onSegmentCallback: ((segment: TranscriptSegment) => void) | null = null;
  private segmentCounter: number = 0;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const lastIdx = event.results.length - 1;
        const text = event.results[lastIdx][0]?.transcript?.trim();
        if (text && this.onSegmentCallback) {
          const elapsed = Math.max(0, Math.floor((Date.now() - this.startTime) / 1000));
          this.onSegmentCallback({
            id: `seg-${++this.segmentCounter}-${Date.now()}`,
            timestampSeconds: elapsed,
            speaker: 'Speaker',
            text,
          });
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('[DomoNote] Speech recognition event:', event?.error);
      };

      this.recognition.onend = () => {
        // Auto-restart if we are still marked listening
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch {
            // ignore
          }
        }
      };
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  start(onSegment: (segment: TranscriptSegment) => void): void {
    if (!this.recognition) return;
    this.isListening = true;
    this.startTime = Date.now();
    this.segmentCounter = 0;
    this.onSegmentCallback = onSegment;
    try {
      this.recognition.start();
    } catch {
      // already active
    }
  }

  stop(): void {
    this.isListening = false;
    this.onSegmentCallback = null;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }
}

export function formatSecondsToTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export async function synthesizeMeetingAI(
  transcript: TranscriptSegment[],
  manualNotes: string,
  modelName: string
): Promise<{ summary: MeetingSummary; timeline: TimelineItem[] }> {
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
    };
  }

  const transcriptText = transcript
    .map((s) => `[${formatSecondsToTime(s.timestampSeconds)}] ${s.speaker}: ${s.text}`)
    .join('\n');

  const prompt = `Analyze this actual meeting transcript and participant notes. Deriving facts ONLY from the text provided below, generate a factual structured JSON output.
Do not hallucinate or invent owners if none are mentioned. If something was not discussed, leave that array empty.

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

    return {
      summary: {
        overview: parsed.overview || 'Meeting completed.',
        decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
        topics: Array.isArray(parsed.topics) ? parsed.topics : [],
        followUpTasks: Array.isArray(parsed.followUpTasks) ? parsed.followUpTasks : [],
      },
      timeline,
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
    };
  }
}
