import type { AnalyticsEvent, EventName } from '@shared/types';
import { api, isOffline } from '@/services/api';
import { getAttribution, sessionId } from './attribution';
import { local } from './storage';

let queue: AnalyticsEvent[] = [];
let timer: number | undefined;
const once = new Set<string>();

function flush(useBeacon = false) {
  window.clearTimeout(timer);
  timer = undefined;
  if (!queue.length) return;
  const batch = queue.splice(0, 50);
  if (useBeacon && !isOffline() && navigator.sendBeacon) {
    // text/plain avoids a CORS preflight; the server parses it.
    if (navigator.sendBeacon('/api/events', new Blob([JSON.stringify({ events: batch })], { type: 'text/plain' }))) return;
  }
  api.events(batch).catch(() => {
    /* analytics must never break the product */
  });
}

/** Track a funnel event. `onceKey` dedupes within the page session. */
export function track(name: EventName, props?: AnalyticsEvent['props'], onceKey?: string) {
  if (onceKey) {
    if (once.has(onceKey)) return;
    once.add(onceKey);
  }
  const a = getAttribution();
  const me = local.get<{ college?: string } | null>('aiify.me', null);
  queue.push({ name, ts: new Date().toISOString(), sessionId: sessionId(), source: a.source, campaign: a.campaign, college: me?.college, props });
  if (import.meta.env.DEV) console.debug('[track]', name, props ?? '');
  if (!timer) timer = window.setTimeout(() => flush(), 1500);
}

if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush(true);
  });
  window.addEventListener('pagehide', () => flush(true));
}
