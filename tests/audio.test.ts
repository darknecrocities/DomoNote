import { describe, it, expect } from 'vitest';
import { formatSecondsToTime } from '../src/services/audio/transcriber';

describe('Audio Time Utilities', () => {
  it('formats zero seconds properly', () => {
    expect(formatSecondsToTime(0)).toBe('00:00');
  });

  it('formats seconds less than a minute', () => {
    expect(formatSecondsToTime(45)).toBe('00:45');
  });

  it('formats multi-minute timestamps', () => {
    expect(formatSecondsToTime(75)).toBe('01:15');
    expect(formatSecondsToTime(600)).toBe('10:00');
    expect(formatSecondsToTime(3665)).toBe('61:05');
  });
});
