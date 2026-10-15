#!/usr/bin/env node
/**
 * Mechanical part of the private voice guide (guides/voice.md, git-ignored): flags patterns that make a draft read AI-written.
 * Advisory (exit 0) unless --strict. Ignores frontmatter, code blocks and blockquotes.
 *
 *   npm run lint:voice -- drafts/2026-10-15-my-draft/post.md [--strict]
 */
import fs from 'node:fs';
import matter from 'gray-matter';

const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const strict = process.argv.includes('--strict');
if (!files.length) {
  console.error('usage: npm run lint:voice -- <post.md> [...] [--strict]');
  process.exit(2);
}

const PHRASES = [
  [/\bit'?s not (just )?[^.,;]{1,40}[,;]? it'?s\b/i, 'contrast template "it\'s not X, it\'s Y"'],
  [/\bnot because\b[^.]{1,60}\bbut because\b/i, 'contrast template "not because X, but because Y"'],
  [/\bmuch less\b[^.]{1,80}\bmuch more\b/i, 'contrast template "much less X, much more Y"'],
  [/\bhere'?s the thing\b/i, 'announcer line'],
  [/\blet'?s dive in\b|\bdive (into|deep)\b|\bdelve\b/i, 'announcer / "delve"'],
  [/\bthe best part\??\b/i, 'announcer line'],
  [/\bgame[- ]changer\b|\bboon\b|\bpowerhouse\b|\bsupercharg|\bunlock(s|ed|ing)?\b|\belevate[sd]?\b|\bseamless(ly)?\b|\bultimate\b|\blandscape\b|\bjourney\b|\bfirst-class\b/i, 'hype word'],
  [/\bincredible\b|\bfantastic\b|\bterrific\b|\bmind-blowing\b|\brevolutionar/i, 'hype adjective'],
  [/\bquietly changes\b|\bmakes all the difference\b|\bat the end of the day\b/i, 'tidy moral closer'],
  [/^\s*[-*]\s+\*\*[^*]+\*\*\s*[-—:]/m, 'bold-label bullet (write prose or a plain list)'],
];

let total = 0;
for (const file of files) {
  const { content } = matter(fs.readFileSync(file, 'utf8'));
  const prose = content
    .replace(/```[\s\S]*?```/g, '')
    .split('\n')
    .filter((l) => !l.trim().startsWith('>'))
    .join('\n');
  const hits = [];
  const lineOf = (idx) => prose.slice(0, idx).split('\n').length;

  for (const m of prose.matchAll(/—/g)) hits.push([lineOf(m.index), 'em dash (use " - " or split the sentence)']);
  for (const [re, why] of PHRASES) {
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
    for (const m of prose.matchAll(g)) hits.push([lineOf(m.index), `${why}: "${m[0].trim().slice(0, 50)}"`]);
  }
  const bangs = (prose.match(/!(?!\[)/g) || []).length;
  if (bangs > 1) hits.push([0, `${bangs} exclamation marks (max 1 per post)`]);
  const italics = (prose.match(/(^|[^*])\*[^*\s][^*]*\*(?!\*)/g) || []).length;
  if (italics > 3) hits.push([0, `${italics} italic emphases (keep to 1-2)`]);
  const words = prose.split(/\s+/).filter(Boolean).length;
  const sentences = prose.split(/[.!?]+\s|\n+/).filter((s) => s.trim().split(/\s+/).length > 3);
  const avg = sentences.length ? Math.round(words / sentences.length) : 0;
  if (avg > 26) hits.push([0, `average sentence ~${avg} words (his posts run ~15-25)`]);

  hits.sort((a, b) => a[0] - b[0]);
  console.log(`${file}: ${words} words, ~${avg} words/sentence, ${hits.length} flag(s)`);
  hits.forEach(([line, why]) => console.log(`  ${line ? `line ~${line}: ` : ''}${why}`));
  total += hits.length;
}
process.exit(strict && total ? 1 : 0);
