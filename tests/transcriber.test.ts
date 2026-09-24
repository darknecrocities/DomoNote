import { describe, it, expect, vi } from 'vitest';
import {
  LiveSpeechTranscriber,
  formatSecondsToTime,
  polishAndDiarizeTranscript,
} from '../src/services/audio/transcriber';
import type { TranscriptSegment } from '../src/types';

describe('LiveSpeechTranscriber speaker tracking', () => {
  it('formats seconds to human-readable MM:SS format', () => {
    expect(formatSecondsToTime(0)).toBe('00:00');
    expect(formatSecondsToTime(65)).toBe('01:05');
    expect(formatSecondsToTime(3600)).toBe('60:00');
  });

  it('allows configuring and switching the active speaker', () => {
    const transcriber = new LiveSpeechTranscriber();
    expect(transcriber.getActiveSpeaker()).toBe('Speaker 1');

    transcriber.setActiveSpeaker('Arron (Host)');
    expect(transcriber.getActiveSpeaker()).toBe('Arron (Host)');

    transcriber.setActiveSpeaker('Speaker 2');
    expect(transcriber.getActiveSpeaker()).toBe('Speaker 2');
  });

  it('polishes and punctuates transcript fallback gracefully when offline', async () => {
    const rawSegments: TranscriptSegment[] = [
      { id: '1', timestampSeconds: 5, speaker: 'Speaker 1', text: 'hello so this is the website' },
      { id: '2', timestampSeconds: 12, speaker: 'Speaker 2', text: 'we understand the requirements' },
    ];

    // When offline / error, returns capitalized with ending period
    const polished = await polishAndDiarizeTranscript(rawSegments, 'mock-model');
    expect(polished.length).toBe(2);
    expect(polished[0].text).toContain('Hello so this is the website.');
    expect(polished[1].text).toContain('We understand the requirements.');
  });

  it('replaces generic Speaker 1 and 2 with real participant names when known participants are provided', async () => {
    const rawSegments: TranscriptSegment[] = [
      { id: '1', timestampSeconds: 5, speaker: 'Speaker 1', text: 'welcome to the meeting' },
      { id: '2', timestampSeconds: 12, speaker: 'Speaker 2', text: 'thanks for having me' },
    ];

    const polished = await polishAndDiarizeTranscript(rawSegments, 'mock-model', ['Arron Parejas', 'Sarah Connor']);
    expect(polished.length).toBe(2);
    expect(polished[0].speaker).toBe('Arron Parejas');
    expect(polished[1].speaker).toBe('Sarah Connor');
    expect(polished[0].speaker).not.toBe('Speaker 1');
    expect(polished[1].speaker).not.toBe('Speaker 2');
  });
});
