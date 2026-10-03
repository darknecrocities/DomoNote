import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { updateSEOMetadata, SEO_PAGE_DATA } from '../src/services/seo';

describe('SEO, Sitemaps, and Google Verification Suite', () => {
  const rootDir = path.resolve(__dirname, '..');
  const publicDir = path.resolve(rootDir, 'public');

  describe('Google Search Console Verification', () => {
    it('serves the exact Google verification file in public/', () => {
      const filePath = path.join(publicDir, 'google265fea273f067470.html');
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf-8').trim();
      expect(content).toBe('google-site-verification: google265fea273f067470.html');
    });

    it('contains google-site-verification meta tags in index.html', () => {
      const indexPath = path.join(rootDir, 'index.html');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');

      expect(indexContent).toContain('<meta name="google-site-verification" content="google265fea273f067470" />');
    });
  });

  describe('Robots.txt & Sitemap Discovery', () => {
    it('has a valid robots.txt pointing to the sitemap and allowing crawlable routes', () => {
      const robotsPath = path.join(publicDir, 'robots.txt');
      expect(fs.existsSync(robotsPath)).toBe(true);

      const content = fs.readFileSync(robotsPath, 'utf-8');
      expect(content).toContain('User-agent: *');
      expect(content).toContain('Allow: /');
      expect(content).toContain('Allow: /download');
      expect(content).toContain('Disallow: /updates.json');
      expect(content).toContain('Sitemap: https://domonote.vercel.app/sitemap.xml');
    });

    it('has a comprehensive, well-formed sitemap.xml with all public pages', () => {
      const sitemapPath = path.join(publicDir, 'sitemap.xml');
      expect(fs.existsSync(sitemapPath)).toBe(true);

      const xml = fs.readFileSync(sitemapPath, 'utf-8');
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset');
      expect(xml).toContain('https://domonote.vercel.app/</loc>');
      expect(xml).toContain('https://domonote.vercel.app/download</loc>');
      expect(xml).toContain('https://domonote.vercel.app/about</loc>');
      expect(xml).toContain('https://domonote.vercel.app/changelog</loc>');
      expect(xml).toContain('https://domonote.vercel.app/privacy</loc>');
      expect(xml).toContain('<priority>1.0</priority>');
      expect(xml).toContain('<priority>0.9</priority>');
      expect(xml).toContain('image:image');

      // Verify expanded SEO routes exist in sitemap
      expect(xml).toContain('https://domonote.vercel.app/features/offline-meeting-transcription</loc>');
      expect(xml).toContain('https://domonote.vercel.app/compare/domonote-vs-otter-ai</loc>');
      expect(xml).toContain('https://domonote.vercel.app/models/qwen2.5-3b</loc>');
      expect(xml).toContain('https://domonote.vercel.app/templates/executive-meeting-minutes</loc>');
      expect(xml).toContain('https://domonote.vercel.app/guides/how-to-setup-ollama-for-domonote</loc>');
      expect(xml).toContain('https://domonote.vercel.app/solutions/legal-attorneys-confidential-meetings</loc>');
      expect(xml).toContain('https://domonote.vercel.app/tools/meeting-transcription/google-meet</loc>');
      expect(xml).toContain('https://domonote.vercel.app/tools/document-summarizer/pdf</loc>');

      // Verify page count in sitemap is 114
      const locMatches = xml.match(/<loc>/g) || [];
      expect(locMatches.length).toBe(114);
    });

  });

  describe('Metadata, Social Cards & PWA Manifest', () => {
    it('has high-resolution Open Graph image and valid PWA manifest', () => {
      const ogImagePath = path.join(publicDir, 'og-image.png');
      expect(fs.existsSync(ogImagePath)).toBe(true);
      const stats = fs.statSync(ogImagePath);
      expect(stats.size).toBeGreaterThan(10000);

      const manifestPath = path.join(publicDir, 'site.webmanifest');
      expect(fs.existsSync(manifestPath)).toBe(true);
      const manifestJson = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifestJson.name).toContain('DomoNote');
      expect(manifestJson.start_url).toBe('/');
    });

    it('contains rich Open Graph, Twitter Cards, and JSON-LD schema in index.html', () => {
      const indexPath = path.join(rootDir, 'index.html');
      const html = fs.readFileSync(indexPath, 'utf-8');

      // Canonical and Primary Meta
      expect(html).toContain('<link rel="canonical" href="https://domonote.vercel.app/" />');
      expect(html).toContain('<meta name="description"');
      expect(html).toContain('<meta name="keywords"');

      // Open Graph
      expect(html).toContain('<meta property="og:type" content="website" />');
      expect(html).toContain('<meta property="og:site_name" content="DomoNote" />');
      expect(html).toContain('<meta property="og:image" content="https://domonote.vercel.app/og-image.png" />');

      // Twitter Cards
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
      expect(html).toContain('<meta name="twitter:image" content="https://domonote.vercel.app/og-image.png" />');

      // JSON-LD Structured Data
      expect(html).toContain('application/ld+json');
      expect(html).toContain('"@type": "SoftwareApplication"');
      expect(html).toContain('"@type": "Organization"');
      expect(html).toContain('"@type": "FAQPage"');
    });
  });

  describe('Dynamic SEO In-App Updates', () => {
    let originalDocument: any;
    let store: Map<string, any>;

    beforeEach(() => {
      originalDocument = (globalThis as any).document;
      store = new Map<string, any>();

      (globalThis as any).document = {
        title: '',
        head: {
          appendChild: (el: any) => {
            const selector = el.attrs['name']
              ? `meta[name="${el.attrs['name']}"]`
              : el.attrs['property']
              ? `meta[property="${el.attrs['property']}"]`
              : el.attrs['rel']
              ? `link[rel="${el.attrs['rel']}"]`
              : '';
            if (selector) store.set(selector, el);
          },
        },
        querySelector: (selector: string) => store.get(selector) || null,
        createElement: (tag: string) => {
          const el = {
            tag,
            attrs: {} as Record<string, string>,
            setAttribute: (k: string, v: string) => {
              el.attrs[k] = v;
            },
            getAttribute: (k: string) => el.attrs[k],
          };
          return el;
        },
      };
    });

    afterEach(() => {
      (globalThis as any).document = originalDocument;
    });

    it('dynamically switches title, description, and canonical for the download view', () => {
      updateSEOMetadata('download');

      expect((globalThis as any).document.title).toBe(SEO_PAGE_DATA.download.title);

      const desc = (globalThis as any).document.querySelector('meta[name="description"]')?.getAttribute('content');
      expect(desc).toBe(SEO_PAGE_DATA.download.description);

      const canonical = (globalThis as any).document.querySelector('link[rel="canonical"]')?.getAttribute('href');
      expect(canonical).toBe('https://domonote.vercel.app/download');

      const ogUrl = (globalThis as any).document.querySelector('meta[property="og:url"]')?.getAttribute('content');
      expect(ogUrl).toBe('https://domonote.vercel.app/download');
    });

    it('dynamically switches title, description, and canonical for the about and privacy views', () => {
      updateSEOMetadata('privacy');
      expect((globalThis as any).document.title).toBe(SEO_PAGE_DATA.privacy.title);
      expect((globalThis as any).document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://domonote.vercel.app/privacy');

      updateSEOMetadata('about');
      expect((globalThis as any).document.title).toBe(SEO_PAGE_DATA.about.title);
      expect((globalThis as any).document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://domonote.vercel.app/about');
    });

    it('verifies prerendered static snapshots exist with valid HTML and schema', () => {
      const distDir = path.resolve(__dirname, '../dist');
      if (!fs.existsSync(distDir)) return;

      const samplePrerenderPath = path.join(distDir, 'features', 'offline-meeting-transcription', 'index.html');
      expect(fs.existsSync(samplePrerenderPath)).toBe(true);

      const html = fs.readFileSync(samplePrerenderPath, 'utf-8');
      expect(html).toContain('<title>Offline Meeting Transcription');
      expect(html).toContain('application/ld+json');
      expect(html).toContain('id="seo-prerender"');
      expect(html).toContain('DomoNote transcribes your meetings directly');
    });
  });
});

