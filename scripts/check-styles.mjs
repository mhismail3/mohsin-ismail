#!/usr/bin/env node
/**
 * Guardrail that keeps styling on the shared design system (run by `npm run validate`).
 *
 * 1. Every CSS file under src/styles/ must be @imported by src/styles/index.css
 *    (no orphan or ad-hoc stylesheets; components don't import their own CSS).
 * 2. Raw color literals (#hex, rgb(), rgba(), hsl()) belong in tokens.css. Other files
 *    may not add new ones: counts are ratcheted against the baseline below. If you
 *    remove literals, lower the baseline; never raise it — add a token instead.
 * 3. JSX must not hard-code colors or import CSS directly.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './content.mjs';

// Raw color literals that existed when this check was introduced (2026-10). Ratchet down only.
const BASELINE = {
  'components/code-block.css': 42,
  'components/header.css': 102,
  'components/footnote.css': 9,
  'pages/about.css': 8,
  'components/progressive-image.css': 3,
  'components/lightbox.css': 2,
  'components/post-card.css': 2,
  'pages/project.css': 2,
  'components/table-of-contents.css': 1,
};
// JSX files allowed to contain a color literal, with the reason.
const JSX_COLOR_ALLOW = {
  'src/contexts/ThemeContext.jsx': 'meta theme-color must be a literal; keep in sync with --bg in tokens.css',
  'src/hooks/useDominantColor.js': 'builds rgb() strings from sampled image pixels at runtime',
};

const stylesDir = path.join(ROOT_DIR, 'src/styles');
const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/g;
const errors = [];

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  const full = path.join(dir, d.name);
  return d.isDirectory() ? walk(full) : [full];
});

const index = fs.readFileSync(path.join(stylesDir, 'index.css'), 'utf8');
const imported = new Set([...index.matchAll(/@import\s+['"]\.\/([^'"]+)['"]/g)].map((m) => m[1]));

for (const file of walk(stylesDir).filter((f) => f.endsWith('.css'))) {
  const rel = path.relative(stylesDir, file);
  if (rel === 'index.css') continue;
  if (!imported.has(rel)) errors.push(`src/styles/${rel} is not @imported in src/styles/index.css`);
  if (rel === 'tokens.css') continue;
  const css = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const count = (css.match(COLOR_RE) || []).length;
  const allowed = BASELINE[rel] ?? 0;
  if (count > allowed) {
    errors.push(`src/styles/${rel}: ${count} raw color literal(s), baseline ${allowed}. Use a var(--token) from tokens.css (add one there if needed).`);
  } else if (count < allowed) {
    console.log(`ℹ️  src/styles/${rel}: ${count} raw colors (baseline ${allowed}) — lower BASELINE in scripts/check-styles.mjs`);
  }
}

for (const file of walk(path.join(ROOT_DIR, 'src')).filter((f) => /\.(jsx?|tsx?)$/.test(f))) {
  const rel = path.relative(ROOT_DIR, file);
  const src = fs.readFileSync(file, 'utf8');
  if (/^import\s+['"][^'"]+\.css['"]/m.test(src) && rel !== 'src/main.jsx') errors.push(`${rel}: import CSS via src/styles/index.css, not from components`);
  const literals = src.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '').match(/['"`]#[0-9a-fA-F]{3,8}['"`]|['"`](?:rgba?|hsla?)\(/g);
  if (literals && !JSX_COLOR_ALLOW[rel]) errors.push(`${rel}: hard-coded color ${literals[0]} — use a CSS class + token instead`);
}

if (errors.length) {
  errors.forEach((e) => console.error(`❌ ${e}`));
  console.error(`\nStyle check failed: ${errors.length} problem(s). See guides/styling.md.`);
  process.exit(1);
}
console.log('✅ Styles OK: all stylesheets imported via index.css, no new raw colors outside tokens.css.');
