import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  EyeOff,
  Server,
  LifeBuoy,
  Send,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Mail,
  X,
  Cpu,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useSound } from '../../context/sound-context';
import { useWorkspace } from '../../context/workspace-context';
import {
  recordSupportSubmission,
  generateMailtoUrl,
  generateGitHubIssueUrl,
  CATEGORY_LABELS,
  SUPPORT_EMAIL,
  type SubmissionCategory,
  type SupportSubmission,
} from '../../services/support';
import logoImg from '../../assets/official_domonote.png';

interface FooterPopupCardProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'support';
}

export const FooterPopupCard: React.FC<FooterPopupCardProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'support'>(initialTab);
  const { playPop, playThock } = useSound();
  const { addToast } = useWorkspace();

  // Form State
  const [category, setCategory] = useState<SubmissionCategory>('feedback');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittedRecord, setSubmittedRecord] = useState<SupportSubmission | null>(null);

  // Copy Feedback State
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Synchronize initialTab when prop changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Update browser URL path cleanly when tab switches or modal opens
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    const path = activeTab === 'privacy' ? '/privacy-policy' : '/support';
    const currentPath = window.location.pathname;

    if (currentPath !== path) {
      window.history.pushState({ modal: activeTab }, '', path);
    }
  }, [isOpen, activeTab]);

  // Handle ESC key and popstate
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    const handlePopState = () => {
      handleClose(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen]);

  const handleClose = (updateHistory = true) => {
    if (updateHistory && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath === '/support' || currentPath === '/privacy-policy' || currentPath === '/privacy') {
        window.history.pushState({}, '', '/');
      }
    }
    onClose();
  };

  const handleTabChange = (tab: 'privacy' | 'support') => {
    playThock();
    setActiveTab(tab);
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!subject.trim()) {
      setValidationError('Please enter a brief subject.');
      return;
    }

    if (!message.trim()) {
      setValidationError('Please enter your message or details before submitting.');
      return;
    }

    setIsSubmitting(true);
    playPop();

    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const record = recordSupportSubmission({
        category,
        name,
        email,
        subject,
        message,
        includeDiagnostics,
      });

      setSubmittedRecord(record);
      setIsSubmitting(false);
      playPop();
      addToast(`Support submission recorded (ID: ${record.id})`, 'success');
    } catch {
      setIsSubmitting(false);
      setValidationError('Failed to record submission. Please write directly via email.');
    }
  };

  const handleResetForm = () => {
    playThock();
    setSubmittedRecord(null);
    setSubject('');
    setMessage('');
    setValidationError(null);
  };

  const handleCopySubmissionSummary = async () => {
    if (!submittedRecord) return;
    playPop();
    const summary = `DomoNote Support Submission: ${submittedRecord.id}
Category: ${CATEGORY_LABELS[submittedRecord.category]?.label || submittedRecord.category}
Subject: ${submittedRecord.subject}
Message: ${submittedRecord.message}
Date: ${submittedRecord.createdAt}`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedSummary(true);
      addToast('Submission details copied to clipboard', 'success');
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      addToast('Failed to copy to clipboard', 'warning');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={() => handleClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="footer-popup-title"
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-zinc-950 border-t sm:border border-slate-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] text-slate-900 dark:text-zinc-100 transition-all font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 backdrop-blur flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="DomoNote" className="w-6 h-6 rounded-md object-contain shadow-xs" />

            {/* Tabs */}
            <div className="flex items-center bg-slate-200/80 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-slate-300/50 dark:border-zinc-700/50">
              <button
                type="button"
                onClick={() => handleTabChange('privacy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'privacy'
                    ? 'bg-white dark:bg-black text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-slate-700 dark:text-zinc-300" />
                <span>Privacy Policy</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('support')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'support'
                    ? 'bg-white dark:bg-black text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LifeBuoy className="w-3.5 h-3.5 text-slate-700 dark:text-zinc-300" />
                <span>Support & Help</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => handleClose()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1">
          {/* ======================================================== */}
          {/* TAB 1: PRIVACY POLICY                                   */}
          {/* ======================================================== */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                  <Shield className="w-3 h-3 text-slate-600 dark:text-zinc-400" />
                  <span>Local-First & On-Device</span>
                </div>
                <h2 id="footer-popup-title" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Privacy Policy & Data Sovereignty
                </h2>
                <p className="text-slate-600 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                  Honest, binding guarantees regarding your notes, voice recordings, document files, and local AI execution.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. On-Device Storage */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                    <Lock className="w-4 h-4 text-slate-700 dark:text-zinc-300 shrink-0" />
                    <span>100% On-Device IndexedDB Storage</span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    All notes, audio minutes, meeting transcripts, uploaded PDFs, and step screenshots reside strictly inside your browser local IndexedDB database. There are no remote sync databases or user accounts.
                  </p>
                </div>

                {/* 2. Local AI Isolation */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                    <Cpu className="w-4 h-4 text-slate-700 dark:text-zinc-300 shrink-0" />
                    <span>Local AI Execution (Ollama)</span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    AI generation travels exclusively between your web browser and your local Ollama port (<code className="font-mono text-[11px] bg-slate-200 dark:bg-zinc-800 px-1 py-0.5 rounded">http://localhost:11434</code>). Zero text or prompts are transmitted to third-party cloud servers.
                  </p>
                </div>

                {/* 3. Hardware Permissions */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                    <Server className="w-4 h-4 text-slate-700 dark:text-zinc-300 shrink-0" />
                    <span>Explicit Hardware Permissions</span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Microphone and Screen Capture only run when explicitly initiated by you with native browser permission prompts. DomoNote has no background or hidden capture routines.
                  </p>
                </div>

                {/* 4. Zero Trackers */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                    <EyeOff className="w-4 h-4 text-slate-700 dark:text-zinc-300 shrink-0" />
                    <span>Zero Third-Party Telemetry</span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    No Google Analytics, advertising cookies, tracking pixels, or keystroke monitors. You can inspect the entire open-source code anytime on GitHub.
                  </p>
                </div>
              </div>

              {/* Data Ownership & Export */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white">Data Ownership, Portability & Deletion</div>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                  You own your data completely. You can export any note, meeting summary, or guide to clean Markdown and PDF files with one click. Clearing your browser site data permanently deletes all local records from your machine.
                </p>
              </div>

              {/* Switch Action */}
              <div className="pt-2 flex items-center justify-end border-t border-slate-200 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => handleTabChange('support')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white transition-colors"
                >
                  <span>Need help or have questions? Go to Support</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: SUPPORT & SUBMISSIONS                            */}
          {/* ======================================================== */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                  <LifeBuoy className="w-3 h-3 text-slate-600 dark:text-zinc-400" />
                  <span>Support & Inquiries</span>
                </div>
                <h2 id="footer-popup-title" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Support & Feedback Submission
                </h2>
                <p className="text-slate-600 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                  Have a question about local Ollama setup, reporting a bug, or requesting a new feature? Send a submission directly below.
                </p>
              </div>

              {submittedRecord ? (
                /* Success Card View */
                <div className="p-6 rounded-2xl border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 space-y-5 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Submission Recorded Successfully
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                        Reference identifier:{' '}
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {submittedRecord.id}
                        </span>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                    Because DomoNote operates client-side without third-party tracking databases, your submission has been saved locally on this machine. You can also send it directly via email or GitHub:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Mailto link */}
                    <a
                      href={generateMailtoUrl(submittedRecord)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send to {SUPPORT_EMAIL}</span>
                    </a>

                    {/* GitHub issue link */}
                    <a
                      href={generateGitHubIssueUrl(submittedRecord)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-semibold text-xs hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open as GitHub Issue</span>
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800 text-xs">
                    <button
                      type="button"
                      onClick={handleCopySubmissionSummary}
                      className="inline-flex items-center gap-1.5 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white transition-colors"
                    >
                      {copiedSummary ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSummary ? 'Copied to Clipboard' : 'Copy Submission Summary'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white hover:underline transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Submit Another Inquiry</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Submission Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Submission Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(Object.keys(CATEGORY_LABELS) as SubmissionCategory[]).map((cat) => {
                        const info = CATEGORY_LABELS[cat];
                        const isSelected = category === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              playThock();
                              setCategory(cat);
                            }}
                            className={`flex items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-xs'
                                : 'bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            <span>{info.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name & Email Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Your Name or Handle <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name or GitHub handle"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Reply Email <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Subject Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Subject / Title <span className="text-slate-900 dark:text-white font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief summary of your question, issue, or suggestion"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all"
                    />
                  </div>

                  {/* Message Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Message & Details <span className="text-slate-900 dark:text-white font-bold">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe what happened, steps to reproduce, or details about your request..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all resize-y"
                    />
                  </div>

                  {/* Diagnostics Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="diag-checkbox"
                      checked={includeDiagnostics}
                      onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                      className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                    />
                    <label
                      htmlFor="diag-checkbox"
                      className="text-xs text-slate-600 dark:text-zinc-400 cursor-pointer select-none"
                    >
                      Attach client environment details (DomoNote v1.0.3, OS platform, Browser type)
                    </label>
                  </div>

                  {/* Validation Error Banner */}
                  {validationError && (
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-400 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium animate-fade-in">
                      {validationError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-end border-t border-slate-200 dark:border-zinc-850">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-slate-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-all shadow-md active:scale-95"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Recording Submission...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Submission</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Direct Reach Strip */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-850 bg-slate-50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Direct Contact Options</div>
                  <div className="text-slate-500 dark:text-zinc-400">You can also write directly via email or GitHub:</div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white text-xs font-medium transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{SUPPORT_EMAIL}</span>
                  </a>

                  <a
                    href="https://github.com/darknecrocities/DomoNote/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>GitHub Issues</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
