import { describe, it, expect } from 'vitest';
import { exportNoteToMarkdown, exportMeetingToMarkdown, exportManualToMarkdown } from '../src/services/export/markdown';
import type { Note, Meeting, Manual } from '../src/types';

describe('Markdown Exporters', () => {
  it('exports note with frontmatter and content', () => {
    const note: Note = {
      id: 'note-1',
      title: 'Test Note Title',
      content: 'This is the note content.',
      tags: ['engineering', 'specs'],
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      versions: [],
    };

    const md = exportNoteToMarkdown(note);
    expect(md).toContain('title: "Test Note Title"');
    expect(md).toContain('Tags: engineering, specs');
    expect(md).toContain('# Test Note Title');
    expect(md).toContain('This is the note content.');
  });

  it('exports meeting with transcript and executive summary', () => {
    const meeting: Meeting = {
      id: 'meet-1',
      title: 'Weekly Sync',
      startTime: 1700000000000,
      durationSeconds: 125,
      transcript: [
        {
          id: 'seg-1',
          timestampSeconds: 5,
          speaker: 'Speaker',
          text: 'We are ready to deploy.',
        },
      ],
      manualNotes: 'Remember to check environment keys.',
      timeline: [],
      summary: {
        overview: 'Sync completed smoothly.',
        decisions: ['Deployment scheduled for Friday.'],
        actionItems: [{ task: 'Prepare configs', owner: 'Arron' }],
        topics: ['Deployment', 'Architecture'],
        followUpTasks: [],
      },
      createdAt: 1700000000000,
    };

    const md = exportMeetingToMarkdown(meeting);
    expect(md).toContain('# Meeting: Weekly Sync');
    expect(md).toContain('Deployment scheduled for Friday.');
    expect(md).toContain('- [ ] Prepare configs (@Arron)');
    expect(md).toContain('We are ready to deploy.');
    expect(md).toContain('Remember to check environment keys.');
  });

  it('exports manual with steps and prerequisites', () => {
    const manual: Manual = {
      id: 'man-1',
      title: 'Server Migration SOP',
      purpose: 'Safely migrate workloads to the new cluster.',
      requirements: ['Root access', 'SSH keys configured'],
      steps: [
        {
          id: 's-1',
          stepNumber: 1,
          title: 'Drain node',
          description: 'Evacuate pods from target machine.',
        },
      ],
      warnings: ['Do not reboot during migration.'],
      expectedResult: 'All pods running on new cluster.',
      troubleshooting: ['Check networking routing table.'],
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      version: 1,
    };

    const md = exportManualToMarkdown(manual);
    expect(md).toContain('# Server Migration SOP');
    expect(md).toContain('Safely migrate workloads to the new cluster.');
    expect(md).toContain('- Root access');
    expect(md).toContain('### Step 1: Drain node');
    expect(md).toContain('Do not reboot during migration.');
  });
});
