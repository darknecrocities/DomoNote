import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEO_PAGES } from './load-seo-catalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://domonote.vercel.app';
const distPath = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distPath)) {
  console.error('❌ Build directory dist/ does not exist. Please run npm run build first.');
  process.exit(1);
}

const templatePath = path.resolve(distPath, 'index.html');
if (!fs.existsSync(templatePath)) {
  console.error('❌ dist/index.html not found. Run build before prerendering.');
  process.exit(1);
}

const templateHtml = fs.readFileSync(templatePath, 'utf-8');

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ---------------------------------------------------------------------------
// 1. Prerender Base Public Pages
// ---------------------------------------------------------------------------
const basePublicPages = [
  {
    path: 'download',
    title: 'Download DomoNote — Free Local AI Secretary for Windows, macOS & Linux',
    desc: 'Download DomoNote for Windows, macOS (Apple Silicon & Intel), Linux (AppImage & Debian), and Chrome Extension. Free, open-source, and powered entirely by local AI.',
    keywords: 'download DomoNote, DomoNote Windows installer, DomoNote macOS dmg, DomoNote Linux AppImage, Ollama desktop companion, offline meeting recorder download',
  },
  {
    path: 'about',
    title: 'About DomoNote — The Privacy-First Local AI Architecture',
    desc: 'Learn how DomoNote protects knowledge workers with 100% local processing, zero telemetry, and self-hosted AI models running on device hardware.',
    keywords: 'about DomoNote, privacy-first AI, local-first software, edge AI architecture, open source AI secretary, sovereign data',
  },
  {
    path: 'changelog',
    title: 'DomoNote Changelog — Version History, Features & Improvements',
    desc: 'Explore latest releases, performance upgrades, multilingual speech recognition updates, and new local AI features in DomoNote.',
    keywords: 'DomoNote updates, DomoNote release notes, changelog, local AI updates, speech-to-text enhancements',
  },
  {
    path: 'privacy',
    title: 'DomoNote Privacy Guarantee — 100% Offline, Zero Cloud Leaks',
    desc: 'Read DomoNote’s uncompromising privacy commitment: no cloud audio uploads, no external telemetry, no data harvesting. Your notes and recordings stay solely on your hardware.',
    keywords: 'DomoNote privacy policy, offline data guarantee, private AI, GDPR compliant AI, HIPAA local meeting recorder',
  },
  {
    path: 'support',
    title: 'DomoNote Support & Submissions — Help, Feedback & Inquiries',
    desc: 'Need help with DomoNote, have questions regarding local Ollama setup, or want to submit feedback? Send a submission directly or get assistance from the community.',
    keywords: 'DomoNote support, DomoNote help, submit feedback, bug report, feature request, offline AI assistant help',
  },
];

console.log(`🤖 Prerendering ${basePublicPages.length} base pages...`);

basePublicPages.forEach((p) => {
  const pageUrl = `${BASE_URL}/${p.path}`;
  let pageHtml = templateHtml
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(p.title)}</title>`)
    .replace(/<meta name="title" content=".*?" \/>/, `<meta name="title" content="${escapeHtml(p.title)}" />`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${escapeHtml(p.desc)}" />`)
    .replace(/<meta name="keywords" content=".*?" \/>/, `<meta name="keywords" content="${escapeHtml(p.keywords)}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${escapeHtml(p.title)}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${escapeHtml(p.desc)}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${escapeHtml(pageUrl)}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${escapeHtml(p.title)}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${escapeHtml(p.desc)}" />`)
    .replace(/<meta name="twitter:url" content=".*?" \/>/, `<meta name="twitter:url" content="${escapeHtml(pageUrl)}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${escapeHtml(pageUrl)}" />`);

  const staticFallback = `
    <div id="seo-prerender" style="padding: 2.5rem 1.5rem; max-width: 860px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f4f4f5; text-align: left; line-height: 1.6;">
      <nav style="margin-bottom: 1.5rem; font-size: 0.85rem; color: #a1a1aa; font-family: monospace;">
        <a href="/" style="color: #10b981; text-decoration: none;">Home</a> &gt; 
        <span style="color: #f4f4f5; text-transform: capitalize;">${escapeHtml(p.path)}</span>
      </nav>
      <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.75rem; color: #ffffff; letter-spacing: -0.02em;">${escapeHtml(p.title)}</h1>
      <p style="font-size: 1.15rem; color: #a1a1aa; margin-bottom: 2rem;">${escapeHtml(p.desc)}</p>
      
      <div style="background: #09090b; border: 1px solid #27272a; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
        <h2 style="font-size: 1.2rem; color: #10b981; margin-top: 0; margin-bottom: 0.75rem;">100% Local-First AI Architecture</h2>
        <p style="color: #d4d4d8; font-size: 0.95rem; margin-bottom: 0;">
          DomoNote executes speech-to-text, meeting intelligence, and document synthesis directly on your device CPU/GPU. No accounts, no subscriptions, and zero cloud leaks.
        </p>
      </div>

      <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 2rem;">
        <a href="/download" style="padding: 0.75rem 1.5rem; background: #ffffff; color: #000000; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem;">Download DomoNote Free</a>
        <a href="/" style="padding: 0.75rem 1.5rem; background: #27272a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 0.9rem;">Return to Home</a>
      </div>
    </div>
  `;

  pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${staticFallback}</div>`);

  const pageDir = path.resolve(distPath, p.path);
  fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(path.resolve(pageDir, 'index.html'), pageHtml);
});

// ---------------------------------------------------------------------------
// 2. Prerender All 108 SEO Catalog Pages
// ---------------------------------------------------------------------------
console.log(`🤖 Prerendering ${SEO_PAGES.length} SEO catalog pages...`);

SEO_PAGES.forEach((page) => {
  const cleanPath = page.path.replace(/^\/+/, '');
  const pageUrl = `${BASE_URL}/${cleanPath}`;

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'DomoNote',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.category.charAt(0).toUpperCase() + page.category.slice(1),
        item: `${BASE_URL}/${page.category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: page.name,
        item: pageUrl,
      },
    ],
  };

  // Structured Item schema
  let mainSchema = {};
  if (page.schemaType === 'HowTo' && page.steps && page.steps.length > 0) {
    mainSchema = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: page.name,
      description: page.description,
      step: page.steps.map((s, idx) => ({
        '@type': 'HowToStep',
        position: idx + 1,
        name: s.title,
        text: s.desc,
      })),
    };
  } else if (page.schemaType === 'Article') {
    mainSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: page.title,
      description: page.description,
      author: {
        '@type': 'Organization',
        name: 'DomoNote',
      },
      publisher: {
        '@type': 'Organization',
        name: 'DomoNote',
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/official_domonote.png`,
        },
      },
      datePublished: '2026-10-01',
      dateModified: '2026-10-03',
    };
  } else {
    mainSchema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: page.name,
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows 10+, macOS 12+, Linux, Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: page.description,
      downloadUrl: `${BASE_URL}/download`,
      featureList: page.highlights.map((h) => h.title).join(', '),
    };
  }

  // FAQ schema if FAQs present
  let faqSchema = null;
  if (page.faqs && page.faqs.length > 0) {
    faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    };
  }

  // Inject Schemas into <head>
  const schemasHtml = `
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(mainSchema)}</script>
    ${faqSchema ? `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>` : ''}
  `;

  let pageHtml = templateHtml
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<meta name="title" content=".*?" \/>/, `<meta name="title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${escapeHtml(page.description)}" />`)
    .replace(/<meta name="keywords" content=".*?" \/>/, `<meta name="keywords" content="${escapeHtml(page.keywords)}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${escapeHtml(page.description)}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${escapeHtml(pageUrl)}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`)
    .replace(/<meta name="twitter:url" content=".*?" \/>/, `<meta name="twitter:url" content="${escapeHtml(pageUrl)}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${escapeHtml(pageUrl)}" />`)
    .replace('</head>', `${schemasHtml}</head>`);

  // Rich Static Fallback for Search Crawlers
  const staticFallback = `
    <article id="seo-prerender" style="padding: 2.5rem 1.5rem; max-width: 860px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f4f4f5; text-align: left; line-height: 1.6;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 1.5rem; font-size: 0.85rem; color: #a1a1aa; font-family: monospace;">
        <a href="/" style="color: #10b981; text-decoration: none;">Home</a> &gt; 
        <span style="color: #71717a; text-transform: capitalize;">${escapeHtml(page.category)}</span> &gt; 
        <span style="color: #f4f4f5;">${escapeHtml(page.name)}</span>
      </nav>

      <header style="margin-bottom: 2rem;">
        <span style="display: inline-block; padding: 0.25rem 0.65rem; border-radius: 9999px; font-size: 0.75rem; font-family: monospace; background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); margin-bottom: 0.75rem;">
          ${escapeHtml(page.badge)} • 100% Local AI
        </span>
        <h1 style="font-size: 2.5rem; font-weight: 800; margin: 0 0 0.75rem 0; color: #ffffff; letter-spacing: -0.02em;">${escapeHtml(page.name)}</h1>
        <p style="font-size: 1.15rem; color: #a1a1aa; line-height: 1.6; margin: 0;">${escapeHtml(page.summary)}</p>
      </header>

      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #ffffff; border-bottom: 1px solid #27272a; padding-bottom: 0.5rem; margin-bottom: 1rem;">
          Key Capabilities &amp; Architecture
        </h2>
        <ul style="list-style: none; padding: 0; margin: 0; display: grid; grid-gap: 1rem;">
          ${page.highlights
            .map(
              (h) => `
            <li style="background: #09090b; border: 1px solid #27272a; padding: 1rem 1.25rem; border-radius: 8px;">
              <strong style="color: #10b981; display: block; font-size: 0.95rem; margin-bottom: 0.25rem;">${escapeHtml(h.title)}</strong>
              <span style="color: #a1a1aa; font-size: 0.85rem;">${escapeHtml(h.desc)}</span>
            </li>`
            )
            .join('')}
        </ul>
      </section>

      ${
        page.steps && page.steps.length > 0
          ? `
      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #ffffff; border-bottom: 1px solid #27272a; padding-bottom: 0.5rem; margin-bottom: 1rem;">
          How It Operates On Your Device
        </h2>
        <ol style="padding-left: 1.25rem; margin: 0; color: #d4d4d8;">
          ${page.steps
            .map(
              (s) => `
            <li style="margin-bottom: 0.75rem;">
              <strong style="color: #ffffff;">${escapeHtml(s.title)}:</strong> ${escapeHtml(s.desc)}
            </li>`
            )
            .join('')}
        </ol>
      </section>`
          : ''
      }

      ${
        page.faqs && page.faqs.length > 0
          ? `
      <section style="margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #ffffff; border-bottom: 1px solid #27272a; padding-bottom: 0.5rem; margin-bottom: 1rem;">
          Frequently Asked Questions
        </h2>
        <dl style="margin: 0;">
          ${page.faqs
            .map(
              (f) => `
            <dt style="font-weight: 600; color: #f4f4f5; margin-top: 1rem; font-size: 0.95rem;">${escapeHtml(f.question)}</dt>
            <dd style="color: #a1a1aa; margin-left: 0; font-size: 0.875rem; margin-top: 0.25rem; line-height: 1.5;">${escapeHtml(f.answer)}</dd>`
            )
            .join('')}
        </dl>
      </section>`
          : ''
      }

      <div style="background: linear-gradient(to right, #18181b, #09090b); border: 1px solid #27272a; padding: 2rem; border-radius: 12px; text-align: center; margin-top: 3rem;">
        <h3 style="font-size: 1.25rem; color: #ffffff; margin: 0 0 0.5rem 0;">Get Started with DomoNote Today</h3>
        <p style="color: #a1a1aa; font-size: 0.9rem; margin: 0 0 1.5rem 0;">Free, open source, and runs 100% offline on your device.</p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a href="/download" style="padding: 0.75rem 1.5rem; background: #ffffff; color: #000000; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem;">Download for Windows, Mac &amp; Linux</a>
          <a href="/" style="padding: 0.75rem 1.5rem; background: #27272a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 0.9rem;">Explore Web Workspace</a>
        </div>
      </div>
    </article>
  `;

  pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${staticFallback}</div>`);

  const pageDir = path.resolve(distPath, cleanPath);
  fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(path.resolve(pageDir, 'index.html'), pageHtml);
});

console.log(`✅ Static Snapshot Prerendering completed successfully for ${basePublicPages.length + SEO_PAGES.length} pages.`);
