import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadSEOPages() {
  const catalogPath = path.resolve(__dirname, '../src/data/seo-catalog.ts');

  // Method 1: Try esbuild (installed with vite)
  try {
    const esbuild = require('esbuild');
    const result = esbuild.buildSync({
      entryPoints: [catalogPath],
      bundle: true,
      format: 'cjs',
      write: false,
    });
    const mod = { exports: {} };
    const fn = new Function('module', 'exports', result.outputFiles[0].text);
    fn(mod, mod.exports);
    if (Array.isArray(mod.exports.SEO_PAGES)) {
      return mod.exports.SEO_PAGES;
    }
  } catch (e) {
    // Continue to fallback
  }

  // Method 2: Fallback to typescript compiler (installed in devDependencies)
  try {
    const ts = require('typescript');
    const tsCode = fs.readFileSync(catalogPath, 'utf-8');
    const jsCode = ts.transpileModule(tsCode, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText;
    const mod = { exports: {} };
    const fn = new Function('module', 'exports', jsCode);
    fn(mod, mod.exports);
    if (Array.isArray(mod.exports.SEO_PAGES)) {
      return mod.exports.SEO_PAGES;
    }
  } catch (err) {
    console.error('❌ Failed to transpile src/data/seo-catalog.ts:', err);
  }

  return [];
}

export const SEO_PAGES = loadSEOPages();
