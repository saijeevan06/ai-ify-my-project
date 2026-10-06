import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { emptyData, type Data } from '../shared/domain.ts';
import { env } from './env.ts';

/**
 * Single-process JSON store: in-memory reads, debounced atomic writes.
 * Enough for a 7-day / ~500-registration campaign on one instance.
 * Swap `load`/`flush` for Supabase or MongoDB if you scale horizontally — the
 * domain functions in shared/domain.ts only need a `Data` object.
 */
const file = join(env.dataDir, 'db.json');
mkdirSync(env.dataDir, { recursive: true });

function load(): Data {
  if (!existsSync(file)) return emptyData(env.seedLeaderboard);
  try {
    const d = JSON.parse(readFileSync(file, 'utf8')) as Data;
    if (!env.seedLeaderboard) d.seeds = [];
    else if (!d.seeds?.length) d.seeds = emptyData(true).seeds;
    return d;
  } catch (e) {
    console.error('[store] could not read db.json, starting fresh', e);
    return emptyData(env.seedLeaderboard);
  }
}

const data = load();
let timer: NodeJS.Timeout | null = null;

function flush() {
  timer = null;
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, JSON.stringify(data));
  renameSync(tmp, file);
}

export const store = {
  read: () => data,
  /** Mutate synchronously, persist shortly after. Node's single thread makes each call atomic. */
  write<T>(fn: (d: Data) => T): T {
    const out = fn(data);
    if (!timer) timer = setTimeout(flush, 250);
    return out;
  },
  flushNow: () => {
    if (timer) clearTimeout(timer);
    flush();
  },
};

process.on('SIGINT', () => {
  store.flushNow();
  process.exit(0);
});
process.on('SIGTERM', () => {
  store.flushNow();
  process.exit(0);
});
