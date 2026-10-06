import { PATTERNS, genericPattern, type Pattern } from './patterns.ts';
import type { Blueprint } from './types.ts';
import type { AIDraft } from './validation.ts';
import { makeId } from './ids.ts';

const norm = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()} `;
const stem = (w: string) => w.replace(/(ies|es|s)$/, '');

export function matchPattern(input: string): { pattern: Pattern; score: number } {
  const text = norm(input);
  const words = new Set(text.trim().split(' ').map(stem));
  let best: { pattern: Pattern; score: number } = { pattern: genericPattern(input), score: 0 };
  for (const p of PATTERNS) {
    let score = 0;
    for (const k of p.keywords) {
      const nk = norm(k).trim();
      if (nk.includes(' ')) {
        if (text.includes(` ${nk} `)) score += 3;
      } else if (words.has(stem(nk))) {
        score += nk.length > 4 ? 2 : 1;
      }
    }
    if (score > best.score) best = { pattern: p, score };
  }
  return best;
}

export function blueprintFromPattern(input: string): Blueprint {
  const { pattern: p } = matchPattern(input);
  return {
    id: makeId(10),
    original: input.trim(),
    projectName: p.projectName,
    summary: p.summary,
    aiUpgrades: p.upgrades.map(([title, description, concept]) => ({ title, description, concept })),
    techStack: p.techStack,
    difficulty: p.difficulty,
    estimatedTime: p.estimatedTime,
    score: p.score,
    whyItWorks: p.whyItWorks,
    aiConcepts: [...new Set(p.upgrades.map((u) => u[2]))],
    source: 'pattern',
    patternId: p.id,
    createdAt: new Date().toISOString(),
  };
}

const clip = (s: string, n: number) => {
  const t = s.replace(/\s+/g, ' ').replace(/[*_#`>]/g, '').trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};

/** Enforce every display limit on model output. Returns null if the draft isn't usable. */
export function sanitizeDraft(input: string, d: AIDraft): Blueprint | null {
  if (!d.isValidProject) return null;
  const upgrades = d.aiUpgrades
    .filter((u) => u.title && u.description)
    .slice(0, 4)
    .map((u) => ({ title: clip(u.title, 40), description: clip(u.description, 140), concept: clip(u.concept || 'AI', 24) }));
  if (upgrades.length < 3 || !d.projectName.trim()) return null;
  const score = Math.round(Math.min(9.8, Math.max(6, Number.isFinite(d.score) ? d.score : 8)) * 10) / 10;
  return {
    id: makeId(10),
    original: input.trim(),
    projectName: clip(d.projectName, 60),
    summary: clip(d.summary, 200),
    aiUpgrades: upgrades,
    techStack: [...new Set(d.techStack.map((t) => clip(t, 20)).filter(Boolean))].slice(0, 6),
    difficulty: d.difficulty,
    estimatedTime: clip(d.estimatedTime || '2–3 weeks', 20),
    score,
    whyItWorks: clip(d.whyItWorks, 420),
    aiConcepts: [...new Set(d.aiConcepts.map((c) => clip(c, 24)))].slice(0, 6),
    source: 'ai',
    createdAt: new Date().toISOString(),
  };
}

/** Pattern path with a sanity gate: one unknown word (“asdf”) isn't a project yet. */
export function patternOrInvalid(input: string): Blueprint | null {
  const { score } = matchPattern(input);
  const words = input.trim().split(/\s+/).filter((w) => /[a-z]{2,}/i.test(w));
  if (score === 0 && words.length < 2) return null;
  return blueprintFromPattern(input);
}
