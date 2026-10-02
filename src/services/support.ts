/**
 * Support & Feedback Submissions Service for DomoNote
 *
 * Provides client-side recording, persistence, and one-click dispatch
 * to email (mailto) and GitHub Issues while respecting 100% privacy boundaries.
 */

export type SubmissionCategory = 'bug' | 'feature' | 'question' | 'feedback';

export interface SupportSubmission {
  id: string;
  category: SubmissionCategory;
  name?: string;
  email?: string;
  subject: string;
  message: string;
  diagnostics?: {
    appVersion: string;
    platform: string;
    userAgent: string;
    timestamp: string;
  };
  createdAt: string;
  status: 'recorded';
}

const STORAGE_KEY = 'domonote_support_submissions_v1';
const GITHUB_REPO_URL = 'https://github.com/darknecrocities/DomoNote';
export const SUPPORT_EMAIL = 'parejasarronkian@gmail.com';

export const CATEGORY_LABELS: Record<SubmissionCategory, { label: string; icon: string }> = {
  feedback: { label: 'General Feedback', icon: 'MessageSquare' },
  bug: { label: 'Bug Report', icon: 'Bug' },
  feature: { label: 'Feature Request', icon: 'Sparkles' },
  question: { label: 'Help & Inquiry', icon: 'HelpCircle' },
};

/**
 * Generate a unique, human-readable submission reference code.
 */
export function generateSubmissionId(): string {
  const timePart = Date.now().toString(36).toUpperCase().slice(-4);
  const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DOMO-SUB-${timePart}-${randPart}`;
}

/**
 * Collect anonymous diagnostic information for troubleshooting.
 */
export function collectDiagnostics(appVersion = '1.0.3') {
  if (typeof window === 'undefined') {
    return {
      appVersion,
      platform: 'unknown',
      userAgent: 'unknown',
      timestamp: new Date().toISOString(),
    };
  }

  const nav = window.navigator;
  return {
    appVersion,
    platform: (nav as any).userAgentData?.platform || nav.platform || 'Browser',
    userAgent: nav.userAgent,
    timestamp: new Date().toISOString(),
  };
}

// In-memory fallback if localStorage is disabled or unavailable
let memorySubmissions: SupportSubmission[] = [];

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return null;
}

export function clearSupportSubmissions(): void {
  memorySubmissions = [];
  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {}
  }
}

/**
 * Retrieve all previously recorded support submissions.
 */
export function getSupportSubmissions(): SupportSubmission[] {
  const storage = getStorage();
  if (!storage) {
    return [...memorySubmissions];
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [...memorySubmissions];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...memorySubmissions];
  } catch (err) {
    console.warn('[DomoNote Support] Failed to parse submissions:', err);
    return [...memorySubmissions];
  }
}

/**
 * Persist a new support submission locally and return the complete record.
 */
export function recordSupportSubmission(data: {
  category: SubmissionCategory;
  name?: string;
  email?: string;
  subject: string;
  message: string;
  includeDiagnostics?: boolean;
}): SupportSubmission {
  const submission: SupportSubmission = {
    id: generateSubmissionId(),
    category: data.category,
    name: data.name?.trim() || undefined,
    email: data.email?.trim() || undefined,
    subject: data.subject.trim(),
    message: data.message.trim(),
    diagnostics: data.includeDiagnostics ? collectDiagnostics() : undefined,
    createdAt: new Date().toISOString(),
    status: 'recorded',
  };

  memorySubmissions = [submission, ...memorySubmissions].slice(0, 50);

  const storage = getStorage();
  if (storage) {
    try {
      const existing = getSupportSubmissions();
      // Ensure unique and max 50
      const combined = [submission, ...existing.filter((s) => s.id !== submission.id)].slice(0, 50);
      storage.setItem(STORAGE_KEY, JSON.stringify(combined));
    } catch (err) {
      console.warn('[DomoNote Support] Could not save submission to storage:', err);
    }
  }

  return submission;
}

/**
 * Generate a pre-filled mailto URL for direct email submission.
 */
export function generateMailtoUrl(submission: SupportSubmission): string {
  const subject = encodeURIComponent(`[${submission.id}] [${submission.category.toUpperCase()}] ${submission.subject}`);
  
  let body = `Hello DomoNote Team,\n\n`;
  body += `Submission Reference: ${submission.id}\n`;
  body += `Category: ${CATEGORY_LABELS[submission.category]?.label || submission.category}\n`;
  if (submission.name) body += `Name: ${submission.name}\n`;
  if (submission.email) body += `Reply Email: ${submission.email}\n`;
  body += `Date: ${submission.createdAt}\n\n`;
  body += `--- Details ---\n${submission.message}\n\n`;

  if (submission.diagnostics) {
    body += `--- Environment Diagnostics ---\n`;
    body += `App Version: ${submission.diagnostics.appVersion}\n`;
    body += `Platform: ${submission.diagnostics.platform}\n`;
    body += `User Agent: ${submission.diagnostics.userAgent}\n`;
  }

  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${encodeURIComponent(body)}`;
}

/**
 * Generate a pre-filled GitHub Issue URL for transparent open-source tracking.
 */
export function generateGitHubIssueUrl(submission: SupportSubmission): string {
  const title = encodeURIComponent(`[${submission.category.toUpperCase()}] ${submission.subject}`);
  
  let body = `### Description\n${submission.message}\n\n`;
  body += `### Submission Metadata\n`;
  body += `- **Reference ID**: \`${submission.id}\`\n`;
  body += `- **Category**: ${CATEGORY_LABELS[submission.category]?.label || submission.category}\n`;
  body += `- **Reported**: ${submission.createdAt}\n`;

  if (submission.diagnostics) {
    body += `\n### Environment Diagnostics\n`;
    body += `- **DomoNote Version**: \`${submission.diagnostics.appVersion}\`\n`;
    body += `- **Platform**: \`${submission.diagnostics.platform}\`\n`;
    body += `- **Browser / UA**: \`${submission.diagnostics.userAgent}\`\n`;
  }

  body += `\n*Submitted via DomoNote Support Modal*`;

  return `${GITHUB_REPO_URL}/issues/new?title=${title}&body=${encodeURIComponent(body)}`;
}

/**
 * Get direct URL path for sharing or navigating to support or privacy policy.
 */
export function getDirectPathUrl(path: 'support' | 'privacy-policy' | 'privacy'): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return `${window.location.origin}/${path}`;
  }
  return `https://domonote.vercel.app/${path}`;
}
