// Zod-free helpers the landing page needs on first load.

export const YEARS = ['1st year', '2nd year', '3rd year', 'Final year', 'Graduated'] as const;

/** Cheap client+server check before spending a model call. */
export function projectInputProblem(raw: string): string | null {
  const s = raw.trim();
  if (s.length === 0) return 'Start with the project you already have.';
  if (s.length < 4 || !/[a-z]{3,}/i.test(s)) return 'Tell us a bit more — try 2–3 words, like “smart parking system”.';
  if (s.length > 140) return 'Keep it to one line — the name of the project is enough.';
  return null;
}

/** Friends needed to unlock the AI Builder Pack. */
export const REWARD_AT = 3;
