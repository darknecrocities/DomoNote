import { describe, it, expect } from 'vitest';
import { screenAnnotator } from '../src/services/screen/annotator';

describe('Screen Annotator & SOP Documentation Service', () => {
  it('generates SOP Markdown structure with step directives and security guarantees', () => {
    const md = screenAnnotator.generateSopMarkdown({
      title: 'Database Migration SOP',
      purpose: 'Execute database schema migration safely.',
      requirements: ['PostgreSQL access', 'Environment flags set'],
      steps: [
        {
          stepNumber: 1,
          title: 'Verify Connection',
          description: 'Ping primary replica to verify cluster availability.',
          timestampMs: 5000,
          targetCoords: { x: 30, y: 40 },
        },
        {
          stepNumber: 2,
          title: 'Run Migration Script',
          description: 'Execute npm run db:migrate.',
          timestampMs: 15000,
          targetCoords: { x: 60, y: 55 },
        },
      ],
    });

    expect(md).toContain('# Database Migration SOP');
    expect(md).toContain('Standard Operating Procedure (SOP)');
    expect(md).toContain('Step 1: Verify Connection');
    expect(md).toContain('`0:05`');
    expect(md).toContain('Step 2: Run Migration Script');
    expect(md).toContain('`0:15`');
    expect(md).toContain('Security & Privacy Audit');
    expect(md).toContain('Local-First AI Engine');
  });
});
