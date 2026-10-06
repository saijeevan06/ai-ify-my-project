/**
 * Offline twin of the Express API. Same domain rules (shared/domain.ts), stored in
 * localStorage. Used automatically when /api is unreachable — e.g. a static deploy
 * or a dropped connection mid-demo — so the journey never dead-ends.
 */
import { emptyData, findByCode, leaderboard, recordEvents, register, simulateReferral, stats, toPublic, type Data } from '@shared/domain';
import { patternOrInvalid } from '@shared/matcher';
import { RegistrationSchema, projectInputProblem } from '@shared/validation';
import { firstName } from '@shared/ids';
import type { AnalyticsEvent } from '@shared/types';
import { local } from '@/lib/storage';
import { ApiError, type Api } from './types';

const KEY = 'aiify.localdb';
const load = (): Data => local.get<Data | null>(KEY, null) ?? emptyData(true);
function tx<T>(fn: (d: Data) => T): T {
  const d = load();
  const out = fn(d);
  local.set(KEY, d);
  return out;
}

export const localApi: Api = {
  async health() {
    return { ok: true, ai: false, demo: true, offline: true };
  },
  async aiify(project) {
    const problem = projectInputProblem(project);
    if (problem) throw new ApiError(400, 'invalid_project', problem);
    const bp = patternOrInvalid(project);
    if (!bp) throw new ApiError(422, 'invalid_project', 'That doesn’t look like a project yet. Try something like “smart parking system”.');
    tx((d) => {
      d.blueprints[bp.id] = bp;
    });
    return bp;
  },
  async blueprint(id) {
    const bp = load().blueprints[id];
    if (!bp) throw new ApiError(404, 'not_found', 'That project link has expired.');
    return bp;
  },
  async register(input) {
    const parsed = RegistrationSchema.safeParse(input);
    if (!parsed.success) {
      throw new ApiError(400, 'invalid', 'Check the highlighted fields.', Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
    }
    const out = tx((d) => {
      const r = register(d, parsed.data, { now: new Date() });
      if (r.ok) recordEvents(d, r.events.map((e) => ({ ...e, sessionId: 'local' })));
      return r;
    });
    if (!out.ok) throw new ApiError(409, out.code, out.message);
    return out.result;
  },
  async me(code, token) {
    const d = load();
    const u = findByCode(d, code);
    if (!u || u.dashToken !== token) throw new ApiError(404, 'not_found', 'We couldn’t find that dashboard.');
    return { user: toPublic(d, u), leaderboard: leaderboard(d, { collegeKey: u.collegeKey, limit: 5 }) };
  },
  async referrer(code) {
    const u = findByCode(load(), code);
    return u ? { valid: true, code: u.referralCode, firstName: firstName(u.name), college: u.college, project: u.generatedProject ?? null } : { valid: false };
  },
  async leaderboard(collegeKey) {
    return leaderboard(load(), { collegeKey, limit: 6 });
  },
  async colleges() {
    const d = load();
    return [...new Set([...d.seeds.map((s) => s.name), ...d.users.map((u) => u.college)])].sort();
  },
  async events(events: AnalyticsEvent[]) {
    tx((d) => recordEvents(d, events));
  },
  async demoReferral(code, token) {
    const res = tx((d) => {
      const u = findByCode(d, code);
      if (!u || u.dashToken !== token) return null;
      const r = simulateReferral(d, code, { now: new Date() });
      if (r?.ok) recordEvents(d, r.events.map((e) => ({ ...e, sessionId: 'local-demo' })));
      return u;
    });
    if (!res) throw new ApiError(404, 'not_found', 'Unknown code');
    return this.me(code, token);
  },
  async adminStats(_key, includeDemo) {
    return stats(load(), { includeDemo });
  },
};
