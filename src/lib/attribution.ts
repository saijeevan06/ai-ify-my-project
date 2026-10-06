import { SOURCES, type Attribution, type Source } from '@shared/types';
import { local, session } from './storage';
import { makeId } from '@shared/ids';

const KEY = 'aiify.attr';

const asSource = (v: string | null): Source | undefined => {
  if (!v) return undefined;
  const s = v.toLowerCase();
  return (SOURCES as readonly string[]).includes(s) ? (s as Source) : 'other';
};

/**
 * First-touch source (which channel brought them), last-touch referral code.
 * Survives the whole journey so registration can be attributed.
 */
export function captureAttribution(): Attribution {
  const prev = local.get<Attribution | null>(KEY, null);
  const q = new URLSearchParams(window.location.search);
  const ref = q.get('ref')?.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) || undefined;
  const source = asSource(q.get('source') ?? q.get('utm_source'));
  const campaign = (q.get('campaign') ?? q.get('utm_campaign'))?.slice(0, 60) || undefined;
  const next: Attribution = {
    // A tagged channel always beats “direct” (e.g. /r/CODE lands untagged, then redirects with ?source=referral).
    source: prev?.source && prev.source !== 'direct' ? prev.source : (source ?? (ref ? 'referral' : 'direct')),
    campaign: prev?.campaign ?? campaign,
    ref: ref ?? prev?.ref,
    landing: prev?.landing ?? window.location.pathname,
  };
  local.set(KEY, next);
  return next;
}

export const getAttribution = (): Attribution => local.get<Attribution>(KEY, { source: 'direct' });

export function setRef(code: string) {
  local.set(KEY, { ...getAttribution(), ref: code.toUpperCase() });
}
export function clearRef() {
  const a = getAttribution();
  delete a.ref;
  local.set(KEY, a);
}

export function sessionId(): string {
  let id = session.get<string | null>('aiify.sid', null);
  if (!id) {
    id = makeId(14);
    session.set('aiify.sid', id);
  }
  return id;
}
