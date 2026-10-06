import type { Blueprint, LeaderboardResult, RegisterResult } from '@shared/types';
import type { Stats } from '@shared/domain';
import { ApiError, type Api, type Dashboard, type ReferrerInfo } from './types';

/** The offline twin (zod + domain rules) is only downloaded if the backend is unreachable. */
const local = () => import('./localApi').then((m) => m.localApi);

export { ApiError } from './types';
export type { Dashboard, ReferrerInfo } from './types';

/** Thrown when the server can't be reached at all (not for 4xx/5xx with a JSON body). */
class Offline extends Error {}

let offline = false;
export const isOffline = () => offline;

async function http<T>(path: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), init.timeoutMs ?? 20000);
  let res: Response;
  try {
    res = await fetch(path, { ...init, signal: ctrl.signal, headers: { 'content-type': 'application/json', ...init.headers } });
  } catch {
    throw new Offline();
  } finally {
    clearTimeout(timer);
  }
  const isJson = res.headers.get('content-type')?.includes('application/json');
  // A static host answers /api/* with index.html — treat that as "no backend".
  if (!isJson) {
    if (res.status === 204) return undefined as T;
    throw new Offline();
  }
  const body = await res.json();
  if (!res.ok) {
    if (res.status >= 500) throw new Offline();
    throw new ApiError(res.status, body?.error?.code ?? 'error', body?.error?.message ?? 'Something needs another look.', body?.error?.fields);
  }
  return body as T;
}

const remote: Api = {
  health: () => http('/api/health', { timeoutMs: 4000 }),
  aiify: async (project, opts) => (await http<{ blueprint: Blueprint }>('/api/aiify', { method: 'POST', body: JSON.stringify({ project, demo: opts?.demo }), timeoutMs: 25000 })).blueprint,
  blueprint: async (id) => (await http<{ blueprint: Blueprint }>(`/api/blueprints/${id}`)).blueprint,
  register: (input) => http<RegisterResult>('/api/register', { method: 'POST', body: JSON.stringify(input) }),
  me: (code, token) => http<Dashboard>(`/api/me/${code}`, { headers: { 'x-dash-token': token } }),
  referrer: (code) => http<ReferrerInfo>(`/api/r/${encodeURIComponent(code)}`),
  leaderboard: (collegeKey) => http<LeaderboardResult>(`/api/leaderboard${collegeKey ? `?college=${encodeURIComponent(collegeKey)}` : ''}`),
  colleges: async () => (await http<{ colleges: string[] }>('/api/colleges')).colleges,
  events: (events) => http('/api/events', { method: 'POST', body: JSON.stringify({ events }) }),
  demoReferral: (code, token) => http<Dashboard>('/api/demo/referral', { method: 'POST', body: JSON.stringify({ code }), headers: { 'x-dash-token': token } }),
  adminStats: (key, includeDemo) => http<Stats>(`/api/admin/stats${includeDemo ? '?demo=1' : ''}`, { headers: { 'x-admin-key': key } }),
};

/**
 * Every call tries the server; if it's unreachable we switch to the local twin for
 * the rest of the session. Rate limits on AI-ify also fall back, so a student never
 * sees “try again later” instead of their result.
 */
export const api = new Proxy(remote, {
  get(target, prop: keyof Api) {
    return async (...args: unknown[]) => {
      if (!offline) {
        try {
          return await (target[prop] as (...a: unknown[]) => Promise<unknown>)(...args);
        } catch (e) {
          if (e instanceof Offline) {
            offline = true;
            console.info('[ai-ify] backend unreachable — continuing in local mode');
          } else if (prop === 'aiify' && e instanceof ApiError && e.status === 429) {
            return (await local()).aiify(...(args as Parameters<Api['aiify']>));
          } else throw e;
        }
      }
      const l = await local();
      return (l[prop] as (...a: unknown[]) => Promise<unknown>)(...args);
    };
  },
}) as Api;
