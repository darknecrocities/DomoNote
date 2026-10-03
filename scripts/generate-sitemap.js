import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEO_PAGES } from '../src/data/seo-catalog.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://domonote.vercel.app';
const today = new Date().toISOString().split('T')[0];

const staticBaseRoutes = [
  {
    path: '',
    changefreq: 'daily',
    priority: '1.0',
    title: 'DomoNote — Your Personal AI Secretary',
    caption: 'DomoNote Logo - Privacy-First Local AI Workspace',
  },
  {
    path: 'download',
    changefreq: 'weekly',
    priority: '0.9',
    title: 'Download DomoNote for Windows, macOS, and Linux',
    caption: 'Download the free, open-source DomoNote installer or portable package',
  },
  {
    path: 'about',
    changefreq: 'monthly',
    priority: '0.8',
    title: 'About DomoNote — Privacy-First AI Architecture',
    caption: 'Learn how DomoNote runs AI entirely on your local machine',
  },
  {
    path: 'changelog',
    changefreq: 'weekly',
    priority: '0.8',
    title: 'DomoNote Changelog & Release Notes',
    caption: 'Latest features, improvements, and updates in DomoNote',
  },
  {
    path: 'privacy',
    changefreq: 'monthly',
    priority: '0.8',
    title: 'DomoNote Privacy Guarantee & Policy',
    caption: '100% offline, zero cloud leaks guarantee',
  },
  {
    path: 'support',
    changefreq: 'monthly',
    priority: '0.7',
    title: 'DomoNote Support & Submissions',
    caption: 'Help, feedback, and issue submissions',
  },
];

console.log(`🤖 Building sitemap for ${staticBaseRoutes.length} base routes and ${SEO_PAGES.length} catalog pages...`);

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
                            http://www.google.com/schemas/sitemap-image/1.1
                            http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd">
  <!-- Core Static Base Pages -->
${staticBaseRoutes
  .map(
    (r) => `  <url>
    <loc>${BASE_URL}/${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
    <image:image>
      <image:loc>${BASE_URL}/official_domonote.png</image:loc>
      <image:title>${escapeXml(r.title)}</image:title>
      <image:caption>${escapeXml(r.caption)}</image:caption>
    </image:image>
  </url>`
  )
  .join('\n')}

  <!-- Programmatic Feature, Model, Compare, Template, Guide, and Solution Pages -->
${SEO_PAGES.map((p) => {
  const cleanPath = p.path.replace(/^\/+/, '');
  const isHighPriority = p.category === 'features' || p.category === 'compare';
  return `  <url>
    <loc>${BASE_URL}/${cleanPath}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${isHighPriority ? '0.9' : '0.8'}</priority>
    <image:image>
      <image:loc>${BASE_URL}/official_domonote.png</image:loc>
      <image:title>${escapeXml(p.title)}</image:title>
      <image:caption>${escapeXml(p.description)}</image:caption>
    </image:image>
  </url>`;
}).join('\n')}
</urlset>
`;

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// 1. Write to public/sitemap.xml
const publicSitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
fs.writeFileSync(publicSitemapPath, sitemapXml.trim());
console.log(`✅ Generated sitemap with ${staticBaseRoutes.length + SEO_PAGES.length} URLs in ${publicSitemapPath}`);

// 2. Also write to dist/sitemap.xml if dist exists
const distDir = path.resolve(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  const distSitemapPath = path.resolve(distDir, 'sitemap.xml');
  fs.writeFileSync(distSitemapPath, sitemapXml.trim());
  console.log(`✅ Copied sitemap.xml to ${distSitemapPath}`);
}
