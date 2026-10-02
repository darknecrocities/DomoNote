import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateSubmissionId,
  collectDiagnostics,
  recordSupportSubmission,
  getSupportSubmissions,
  clearSupportSubmissions,
  generateMailtoUrl,
  generateGitHubIssueUrl,
  getDirectPathUrl,
  CATEGORY_LABELS,
} from '../src/services/support';
import { SEO_PAGE_DATA } from '../src/services/seo';

describe('Support & Privacy Policy Feature Suite', () => {
  beforeEach(() => {
    clearSupportSubmissions();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('Submission Reference Generation', () => {
    it('generates distinct IDs prefixed with DOMO-SUB-', () => {
      const id1 = generateSubmissionId();
      const id2 = generateSubmissionId();

      expect(id1).toMatch(/^DOMO-SUB-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(id2).toMatch(/^DOMO-SUB-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('Diagnostic Collection', () => {
    it('captures client diagnostic metadata accurately', () => {
      const diag = collectDiagnostics('1.0.3');
      expect(diag.appVersion).toBe('1.0.3');
      expect(diag.platform).toBeDefined();
      expect(diag.timestamp).toBeDefined();
    });
  });

  describe('Support Submission Persistence', () => {
    it('records a new submission and saves it to local storage', () => {
      const submission = recordSupportSubmission({
        category: 'bug',
        name: 'Arron',
        email: 'arron@example.com',
        subject: 'Microphone permission prompt failed',
        message: 'Clicking Start Microphone did not show the system audio selector.',
        includeDiagnostics: true,
      });

      expect(submission.id).toBeDefined();
      expect(submission.category).toBe('bug');
      expect(submission.name).toBe('Arron');
      expect(submission.email).toBe('arron@example.com');
      expect(submission.subject).toBe('Microphone permission prompt failed');
      expect(submission.diagnostics).toBeDefined();
      expect(submission.status).toBe('recorded');

      const all = getSupportSubmissions();
      expect(all.length).toBe(1);
      expect(all[0].id).toBe(submission.id);
    });

    it('records submissions without optional fields', () => {
      const submission = recordSupportSubmission({
        category: 'feature',
        subject: 'Add Claude 3.5 Sonnet support',
        message: 'Would love to configure an Anthropic endpoint alongside Ollama.',
      });

      expect(submission.name).toBeUndefined();
      expect(submission.email).toBeUndefined();
      expect(submission.diagnostics).toBeUndefined();

      const all = getSupportSubmissions();
      expect(all.length).toBe(1);
      expect(all[0].subject).toBe('Add Claude 3.5 Sonnet support');
    });
  });

  describe('External Action URL Builders', () => {
    it('constructs a valid, encoded mailto URL with diagnostic payload', () => {
      const submission = recordSupportSubmission({
        category: 'question',
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Where are notes saved?',
        message: 'Is my note stored in an SQLite file or in IndexedDB?',
        includeDiagnostics: true,
      });

      const mailto = generateMailtoUrl(submission);
      expect(mailto).toContain('mailto:support@domonote.dev');
      expect(mailto).toContain('subject=');
      expect(mailto).toContain(encodeURIComponent(submission.id));
      expect(mailto).toContain(encodeURIComponent('Where are notes saved?'));
      expect(mailto).toContain('body=');
    });

    it('constructs a pre-filled GitHub Issue URL', () => {
      const submission = recordSupportSubmission({
        category: 'feedback',
        subject: 'Great dark mode interface',
        message: 'The contrast in the Zen writing mode is fantastic.',
      });

      const issueUrl = generateGitHubIssueUrl(submission);
      expect(issueUrl).toContain('https://github.com/darknecrocities/DomoNote/issues/new');
      expect(issueUrl).toContain('title=');
      expect(issueUrl).toContain(encodeURIComponent('[FEEDBACK] Great dark mode interface'));
      expect(issueUrl).toContain(encodeURIComponent(submission.id));
    });

    it('formats direct path URLs correctly', () => {
      const supportPath = getDirectPathUrl('support');
      const policyPath = getDirectPathUrl('privacy-policy');

      expect(supportPath).toContain('/support');
      expect(policyPath).toContain('/privacy-policy');
    });
  });

  describe('SEO Metadata & Category Configurations', () => {
    it('has all four standard submission categories configured', () => {
      expect(CATEGORY_LABELS.bug.label).toBe('Bug Report');
      expect(CATEGORY_LABELS.feature.label).toBe('Feature Request');
      expect(CATEGORY_LABELS.question.label).toBe('Help & Inquiry');
      expect(CATEGORY_LABELS.feedback.label).toBe('General Feedback');
    });

    it('contains SEO metadata for the support view', () => {
      expect(SEO_PAGE_DATA.support).toBeDefined();
      expect(SEO_PAGE_DATA.support.canonicalPath).toBe('/support');
      expect(SEO_PAGE_DATA.support.title).toContain('Support');
      expect(SEO_PAGE_DATA.support.description).toBeDefined();
    });
  });
});
