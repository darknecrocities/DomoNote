import { useEffect } from 'react';
import type { ViewType } from '../context/workspace-context';

export interface PageSEOMetadata {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string;
}

export const SEO_PAGE_DATA: Record<string, PageSEOMetadata> = {
  landing: {
    title: 'DomoNote — Your Personal AI Secretary | Privacy-First Local AI Workspace',
    description:
      'DomoNote is a privacy-first, 100% offline personal AI secretary. Transcribe meetings, summarize documents, capture screen workflows, and organize notes using local AI (Ollama). Zero cloud leaks, zero subscriptions.',
    canonicalPath: '/',
    keywords:
      'DomoNote, AI secretary, personal AI assistant, local AI workspace, offline transcription, meeting notes AI, Ollama desktop app, private AI notes, AI document summarizer, screen capture AI, local LLM',
  },
  download: {
    title: 'Download DomoNote — Free Local AI Secretary for Windows, macOS & Linux',
    description:
      'Download DomoNote for Windows, macOS (Apple Silicon & Intel), Linux (AppImage & Debian), and Chrome Extension. Free, open-source, and powered entirely by local AI.',
    canonicalPath: '/download',
    keywords:
      'download DomoNote, DomoNote Windows installer, DomoNote macOS dmg, DomoNote Linux AppImage, Ollama desktop companion, offline meeting recorder download',
  },
  about: {
    title: 'About DomoNote — The Privacy-First Local AI Architecture',
    description:
      'Learn how DomoNote protects knowledge workers with 100% local processing, zero telemetry, and self-hosted AI models running on device hardware.',
    canonicalPath: '/about',
    keywords:
      'about DomoNote, privacy-first AI, local-first software, edge AI architecture, open source AI secretary, sovereign data',
  },
  changelog: {
    title: 'DomoNote Changelog — Version History, Features & Improvements',
    description:
      'Explore latest releases, performance upgrades, multilingual speech recognition updates, and new local AI features in DomoNote.',
    canonicalPath: '/changelog',
    keywords:
      'DomoNote updates, DomoNote release notes, changelog, local AI updates, speech-to-text enhancements',
  },
  privacy: {
    title: 'DomoNote Privacy Guarantee — 100% Offline, Zero Cloud Leaks',
    description:
      'Read DomoNote’s uncompromising privacy commitment: no cloud audio uploads, no external telemetry, no data harvesting. Your notes and recordings stay solely on your hardware.',
    canonicalPath: '/privacy',
    keywords:
      'DomoNote privacy policy, offline data guarantee, private AI, GDPR compliant AI, HIPAA local meeting recorder',
  },
  support: {
    title: 'DomoNote Support & Submissions — Help, Feedback & Inquiries',
    description:
      'Need help with DomoNote, have questions regarding local Ollama setup, or want to submit feedback? Send a submission directly or get assistance from the community.',
    canonicalPath: '/support',
    keywords:
      'DomoNote support, DomoNote help, submit feedback, bug report, feature request, offline AI assistant help',
  },
};

const BASE_URL = 'https://domonote.vercel.app';

/**
 * Updates head metadata dynamically based on the current active view.
 */
export function updateSEOMetadata(view: ViewType): void {
  if (typeof document === 'undefined') return;

  const data = SEO_PAGE_DATA[view] || SEO_PAGE_DATA.landing;
  const canonicalUrl = `${BASE_URL}${data.canonicalPath === '/' ? '' : data.canonicalPath}`;

  // Document Title
  document.title = data.title;

  // Helper to update or create meta tags
  const setMeta = (selector: string, attr: string, value: string, propAttr = 'name') => {
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(propAttr, selector.replace(/meta\[.*=["'](.*)["']\]/, '$1'));
      document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
  };

  // Primary Meta
  setMeta('meta[name="title"]', 'content', data.title);
  setMeta('meta[name="description"]', 'content', data.description);
  if (data.keywords) {
    setMeta('meta[name="keywords"]', 'content', data.keywords);
  }

  // Open Graph
  setMeta('meta[property="og:title"]', 'content', data.title, 'property');
  setMeta('meta[property="og:description"]', 'content', data.description, 'property');
  setMeta('meta[property="og:url"]', 'content', canonicalUrl, 'property');

  // Twitter
  setMeta('meta[name="twitter:title"]', 'content', data.title);
  setMeta('meta[name="twitter:description"]', 'content', data.description);
  setMeta('meta[name="twitter:url"]', 'content', canonicalUrl);

  // Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);
}

/**
 * React hook to synchronize SEO metadata with the current view.
 */
export function useSEO(activeView: ViewType): void {
  useEffect(() => {
    updateSEOMetadata(activeView);
  }, [activeView]);
}
