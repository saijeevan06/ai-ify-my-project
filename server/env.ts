import { existsSync, readFileSync } from 'node:fs';

// Minimal .env loader (avoids a dependency). Real env vars win.
for (const file of ['.env.local', '.env']) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]!] === undefined) process.env[m[1]!] = m[2]!.replace(/^["']|["']$/g, '');
  }
}

const bool = (v: string | undefined, d: boolean) => (v === undefined || v === '' ? d : v === 'true' || v === '1');

export const env = {
  port: Number(process.env.PORT ?? 8787),
  production: process.env.NODE_ENV === 'production' || process.argv.includes('--prod'),
  publicUrl: (process.env.PUBLIC_URL ?? 'http://localhost:5173').replace(/\/$/, ''),
  dataDir: process.env.DATA_DIR ?? './data',
  ipSalt: process.env.IP_SALT ?? 'aiify-dev-salt',
  adminKey: process.env.ADMIN_KEY ?? 'aiify-admin',
  seedLeaderboard: bool(process.env.SEED_LEADERBOARD, true),
  demoMode: bool(process.env.DEMO_MODE, !(process.env.NODE_ENV === 'production' || process.argv.includes('--prod'))),
  aiKey: process.env.ANTHROPIC_API_KEY ?? '',
  aiModel: process.env.AI_MODEL ?? 'claude-opus-5-5',
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS ?? 15000),
};
