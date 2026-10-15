#!/usr/bin/env node
/**
 * Real-browser check of the built site (desktop + iPhone, light + dark).
 *
 * Usage:
 *   npm run build:only           # or npm run build (slow: re-optimizes images)
 *   npm run check:browser -- --out shots/after [--compare shots/before]
 *        [--url http://localhost:5173] [--pages /posts/x,/about] [--only-pages]
 *
 * Without --url it serves ./dist with `vite preview` on a free local port.
 * For each page × viewport × theme it saves a full-page PNG and records:
 *   console errors, page errors, failed requests (>=400), broken images,
 *   horizontal overflow (with the widest offending elements), broken internal links.
 * With --compare it pixel-diffs against a previous --out directory.
 * Exits 1 on any functional problem (not on visual diffs — review those by eye).
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright-core';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]]);
    return acc;
  }, []),
);

const DEFAULT_PAGES = [
  '/',
  '/blog',
  '/about',
  '/portfolio',
  '/portfolio/tron',
  '/portfolio/niya',
  '/posts/2026-03-08-tron-got-a-lot-more-real', // long, TOC
  '/posts/2025-12-19-from-html-tools-to-homebrew-cli-tools', // code + images
  '/posts/2025-11-30-welcome-this-is-my-website', // image gallery
  '/posts/2025-12-02-brian-eno-art-quote', // attributed quote
  '/posts/2025-12-29-mini-blog-posts-feature', // mini post
];
const extra = typeof args.pages === 'string' ? args.pages.split(',').map((p) => p.trim()).filter(Boolean) : [];
const PAGES = args['only-pages'] ? extra : [...DEFAULT_PAGES, ...extra];

const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } },
};
const THEMES = ['light', 'dark'];
const outDir = path.resolve(root, typeof args.out === 'string' ? args.out : 'shots/latest');
const compareDir = typeof args.compare === 'string' ? path.resolve(root, args.compare) : null;

const freePort = () => new Promise((resolve) => {
  const s = net.createServer();
  s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
});

async function startPreview() {
  if (!fs.existsSync(path.join(root, 'dist/index.html'))) {
    throw new Error('dist/ missing — run `npm run build:only` (or `npm run build`) first');
  }
  const port = await freePort();
  const proc = spawn(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  const url = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i += 1) {
    try { if ((await fetch(url)).ok) return { url, stop: () => proc.kill() }; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  proc.kill();
  throw new Error('vite preview did not start');
}

const findChrome = () => [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => p && fs.existsSync(p));

const slugify = (p) => (p === '/' ? 'home' : p.replace(/^\//, '').replace(/[^a-z0-9-]+/gi, '_'));

// Internal link validation against what the build actually produced.
function internalLinkProblem(href) {
  const u = new URL(href, 'http://x');
  const p = decodeURIComponent(u.pathname);
  if (p === '/' || ['/blog', '/about', '/portfolio'].includes(p.replace(/\/$/, ''))) return null;
  const route = p.match(/^\/(posts|portfolio)\/([^/]+)\/?$/);
  if (route) {
    if (fs.existsSync(path.join(root, 'dist', route[1], route[2], 'index.html'))) return null;
    // Drafts only exist on the dev server.
    if (route[1] === 'posts' && fs.existsSync(path.join(root, 'drafts', route[2], 'post.md'))) return null;
    return 'no prerendered page';
  }
  return fs.existsSync(path.join(root, 'dist', p)) ? null : 'file not in dist';
}

async function checkPage(context, base, pagePath, file) {
  const page = await context.newPage();
  const problems = { consoleErrors: [], pageErrors: [], failedRequests: [], brokenImages: [], overflow: null, brokenLinks: [] };
  // Third-party embeds (e.g. YouTube) pull ad/tracker hosts that local DNS blockers refuse; only first-party noise counts.
  const firstParty = (u) => !u || u.startsWith(base);
  page.on('console', (m) => {
    if (m.type() === 'error' && firstParty(m.location()?.url)) problems.consoleErrors.push(m.text().slice(0, 300));
  });
  page.on('pageerror', (e) => problems.pageErrors.push(String(e).slice(0, 300)));
  page.on('response', (r) => { if (r.status() >= 400) problems.failedRequests.push(`${r.status()} ${r.url()}`); });
  page.on('requestfailed', (r) => {
    const err = r.failure()?.errorText || '';
    if (!/ERR_ABORTED/.test(err) && firstParty(r.url())) problems.failedRequests.push(`${err} ${r.url()}`);
  });

  await page.goto(base + pagePath, { waitUntil: 'networkidle' });
  // Scroll through so lazy images load, then return to top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight * 0.8) {
      window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle');
  // Wait for every started image (lazy carousels, large originals) so screenshots are stable.
  await page.waitForFunction(() => [...document.images].every((img) => img.complete)
    && [...document.querySelectorAll('.progressive-image')].every((el) => !el.querySelector('img')
      || el.classList.contains('is-loaded') || el.classList.contains('has-error')), null, { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);

  const dom = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const scrollW = document.documentElement.scrollWidth;
    const offenders = [];
    if (scrollW > vw + 1) {
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width && r.right > vw + 1) {
          let clipped = false;
          for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
            const ox = getComputedStyle(a).overflowX;
            if (ox !== 'visible') { clipped = true; break; }
          }
          if (!clipped) offenders.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''} right=${Math.round(r.right)}`);
        }
      }
    }
    const brokenImages = [...document.images]
      .filter((img) => img.complete && img.naturalWidth === 0 && img.getAttribute('src'))
      .map((img) => img.getAttribute('src'))
      .concat([...document.querySelectorAll('.progressive-image.has-error')].map((el) => `ProgressiveImage error: ${el.getAttribute('aria-label') || el.className}`));
    const links = [...document.querySelectorAll('a[href]')]
      .map((a) => a.href)
      .filter((h) => h.startsWith(location.origin));
    return { vw, scrollW, offenders: offenders.slice(0, 5), brokenImages, links: [...new Set(links)] };
  });
  if (dom.scrollW > dom.vw + 1) problems.overflow = { viewport: dom.vw, scrollWidth: dom.scrollW, offenders: dom.offenders };
  problems.brokenImages = dom.brokenImages;
  problems.brokenLinks = dom.links.map((h) => [h, internalLinkProblem(h)]).filter(([, e]) => e).map(([h, e]) => `${new URL(h).pathname} (${e})`);

  // Third-party iframes (YouTube) render nondeterministically; mask them so diffs only show our UI.
  // Full page for layout, plus the first screen exactly as a visitor sees it. Chromium's full-page
  // capture can paint images inside horizontal scrollers (e.g. the About carousel) blank; trust the fold shot there.
  const shotOpts = { animations: 'disabled', mask: [page.locator('iframe')], maskColor: '#888' };
  await page.screenshot({ path: file.replace(/\.png$/, '--fold.png'), ...shotOpts });
  await page.screenshot({ path: file, fullPage: true, ...shotOpts });
  await page.close();
  return problems;
}

async function diff(a, b) {
  const [ia, ib] = await Promise.all([sharp(a).raw().ensureAlpha().toBuffer({ resolveWithObject: true }), sharp(b).raw().ensureAlpha().toBuffer({ resolveWithObject: true })]);
  if (ia.info.width !== ib.info.width || ia.info.height !== ib.info.height) {
    return { sizeChanged: `${ia.info.width}x${ia.info.height} -> ${ib.info.width}x${ib.info.height}` };
  }
  let changed = 0;
  for (let i = 0; i < ia.data.length; i += 4) {
    if (Math.abs(ia.data[i] - ib.data[i]) + Math.abs(ia.data[i + 1] - ib.data[i + 1]) + Math.abs(ia.data[i + 2] - ib.data[i + 2]) > 48) changed += 1;
  }
  return { changedPct: +((changed / (ia.info.width * ia.info.height)) * 100).toFixed(3) };
}

const server = typeof args.url === 'string' ? { url: args.url.replace(/\/$/, ''), stop: () => {} } : await startPreview();
const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
fs.mkdirSync(outDir, { recursive: true });
const results = [];
let failures = 0;
try {
  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    for (const theme of THEMES) {
      const context = await browser.newContext({ ...vp, colorScheme: theme, reducedMotion: 'reduce' });
      await context.addInitScript((t) => localStorage.setItem('theme-preference', t), theme);
      for (const p of PAGES) {
        const name = `${slugify(p)}--${vpName}-${theme}.png`;
        const file = path.join(outDir, name);
        const r = await checkPage(context, server.url, p, file);
        const bad = r.consoleErrors.length + r.pageErrors.length + r.failedRequests.length + r.brokenImages.length + r.brokenLinks.length + (r.overflow ? 1 : 0);
        failures += bad ? 1 : 0;
        const entry = { page: p, viewport: vpName, theme, screenshot: name, ok: !bad, ...r };
        if (compareDir && fs.existsSync(path.join(compareDir, name))) {
          entry.diff = await diff(path.join(compareDir, name), file);
          const fold = name.replace(/\.png$/, '--fold.png');
          if (fs.existsSync(path.join(compareDir, fold))) entry.foldDiff = await diff(path.join(compareDir, fold), path.join(outDir, fold));
        }
        results.push(entry);
        const fmt = (x) => (x.sizeChanged ? x.sizeChanged : `${x.changedPct}%`);
        const d = entry.diff ? ` diff:${fmt(entry.diff)}${entry.foldDiff ? ` fold:${fmt(entry.foldDiff)}` : ''}` : '';
        console.log(`${bad ? 'FAIL' : 'ok  '} ${vpName.padEnd(7)} ${theme.padEnd(5)} ${p}${d}`);
        if (bad) console.log('     ' + JSON.stringify({ ...r, overflow: r.overflow }, null, 0).slice(0, 800));
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  server.stop();
}
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify({ base: server.url, at: new Date().toISOString(), results }, null, 2));
const changed = (x) => x && (x.sizeChanged || x.changedPct > 0.5);
const visual = results.filter((r) => changed(r.diff) || changed(r.foldDiff));
console.log(`\n${results.length} checks, ${failures} with problems${compareDir ? `, ${visual.length} visibly different vs ${path.relative(root, compareDir)}` : ''}. Report: ${path.relative(root, outDir)}/report.json`);
visual.forEach((r) => console.log(`  changed: ${r.screenshot} full=${JSON.stringify(r.diff)} fold=${JSON.stringify(r.foldDiff)}`));
process.exit(failures ? 1 : 0);
