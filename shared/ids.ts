// No 0/O/1/I/L — referral codes get read aloud and typed from posters.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const ID_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

function randomInts(n: number): Uint32Array {
  const a = new Uint32Array(n);
  globalThis.crypto.getRandomValues(a);
  return a;
}

export const makeId = (len = 12) => Array.from(randomInts(len), (x) => ID_ALPHABET[x % ID_ALPHABET.length]).join('');
export const makeReferralCode = (len = 5) => Array.from(randomInts(len), (x) => CODE_ALPHABET[x % CODE_ALPHABET.length]).join('');
export const makeToken = () => makeId(24);

export const firstName = (name: string) => (name.trim().split(/\s+/)[0] ?? '').slice(0, 20);

const COLLEGE_STOP = new Set(['the', 'of', 'and', 'for', '&', 'college', 'engineering', 'institute', 'technology', 'university', 'school', 'science', 'sciences']);

/** Normalise free-typed college names so “VNR VJIET”, “vnr-vjiet ” etc. group together. */
export function collegeKey(name: string): string {
  const words = name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const core = words.filter((w) => !COLLEGE_STOP.has(w));
  return (core.length ? core : words).join('-').slice(0, 60);
}

export function monogram(name: string): string {
  const words = name.replace(/[^a-zA-Z\s]/g, ' ').split(/\s+/).filter((w) => w && !['of', 'and', 'the', 'for'].includes(w.toLowerCase()));
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase() || '··';
}
