/**
 * Growth-loop business logic. Pure functions over a plain data object so the exact
 * same rules run on the Express server (JSON file) and in the offline client
 * fallback (localStorage).
 */
import type {
  AnalyticsEvent,
  Blueprint,
  CollegeSeed,
  LeaderboardEntry,
  LeaderboardResult,
  PublicUser,
  Referral,
  RegisterErrorCode,
  RegisterResult,
  Source,
  User,
} from './types.ts';
import { emailKey, isDisposableEmail, normalizePhone, type RegistrationInput } from './validation.ts';
import { collegeKey, firstName, makeId, makeReferralCode, makeToken, monogram } from './ids.ts';
import { COLLEGE_SEEDS } from './colleges.ts';

export { REWARD_AT } from './input.ts';
import { REWARD_AT } from './input.ts';
const MAX_EVENTS = 20000;
/** Campus Wi-Fi puts many real friends behind one IP, so we cap rather than block. */
const SAME_IP_COUNTED_PER_DAY = 2;

export interface Data {
  version: 1;
  users: User[];
  referrals: Referral[];
  blueprints: Record<string, Blueprint>;
  events: AnalyticsEvent[];
  seeds: CollegeSeed[];
}

export const emptyData = (seed: boolean): Data => ({ version: 1, users: [], referrals: [], blueprints: {}, events: [], seeds: seed ? COLLEGE_SEEDS : [] });

export interface Ctx {
  now: Date;
  ipHash?: string;
  demo?: boolean;
}

export type RegisterOutcome =
  | { ok: true; result: RegisterResult; events: Omit<AnalyticsEvent, 'sessionId'>[] }
  | { ok: false; code: RegisterErrorCode; message: string };

const MESSAGES: Record<RegisterErrorCode, string> = {
  duplicate_email: 'This email is already registered with a different WhatsApp number.',
  duplicate_phone: 'This WhatsApp number is already registered with a different email.',
  disposable_email: 'Please use an email you actually check — we send the joining link there.',
  invalid: 'Something in the form needs another look.',
};

const titleCase = (s: string) => s.trim().replace(/\s+/g, ' ').replace(/\b([a-z])/g, (c) => c.toUpperCase());

function uniqueCode(data: Data): string {
  for (;;) {
    const c = makeReferralCode();
    if (!data.users.some((u) => u.referralCode === c)) return c;
  }
}

export function toPublic(data: Data, u: User): PublicUser {
  const friends = data.referrals
    .filter((r) => r.referrerId === u.id && r.status === 'completed')
    .map((r) => {
      const f = data.users.find((x) => x.id === r.referredUserId);
      return { firstName: f ? firstName(f.name) : 'A friend', joinedAt: r.createdAt };
    });
  return {
    firstName: firstName(u.name),
    college: u.college,
    collegeKey: u.collegeKey,
    referralCode: u.referralCode,
    referralCount: u.referralCount,
    rewardUnlocked: u.rewardUnlocked,
    generatedProject: u.generatedProject,
    blueprintId: u.blueprintId,
    friends,
    createdAt: u.createdAt,
  };
}

export function register(data: Data, input: RegistrationInput, ctx: Ctx): RegisterOutcome {
  const phone = normalizePhone(input.phone);
  if (!phone) return { ok: false, code: 'invalid', message: MESSAGES.invalid };
  if (isDisposableEmail(input.email)) return { ok: false, code: 'disposable_email', message: MESSAGES.disposable_email };
  const ek = emailKey(input.email);

  const byEmail = data.users.find((u) => u.emailKey === ek);
  const byPhone = data.users.find((u) => u.phone === phone);
  if (byEmail && byEmail === byPhone) {
    // Same person coming back: hand them their dashboard instead of an error.
    return { ok: true, result: { status: 'existing', user: toPublic(data, byEmail), dashToken: byEmail.dashToken, notices: [] }, events: [] };
  }
  if (byEmail) return { ok: false, code: 'duplicate_email', message: MESSAGES.duplicate_email };
  if (byPhone) return { ok: false, code: 'duplicate_phone', message: MESSAGES.duplicate_phone };

  const now = ctx.now.toISOString();
  const college = titleCase(input.college);
  const user: User = {
    id: makeId(),
    name: titleCase(input.name),
    email: input.email,
    emailKey: ek,
    phone,
    college,
    collegeKey: collegeKey(college),
    branch: input.branch.toUpperCase().length <= 5 ? input.branch.toUpperCase() : titleCase(input.branch),
    year: input.year,
    originalProject: input.originalProject,
    generatedProject: input.generatedProject,
    blueprintId: input.blueprintId,
    referralCode: uniqueCode(data),
    referralCount: 0,
    rewardUnlocked: false,
    source: (input.referralCode ? 'referral' : input.source ?? 'direct') as Source,
    campaign: input.campaign,
    ipHash: ctx.ipHash,
    dashToken: makeToken(),
    demo: ctx.demo,
    createdAt: now,
  };
  // Prefer the canonical spelling of a seeded/known college so rows merge.
  const known = data.seeds.find((s) => s.key === user.collegeKey) ?? data.users.find((u) => u.collegeKey === user.collegeKey);
  if (known) user.college = 'builders' in known ? known.name : known.college;

  const notices: RegisterResult['notices'] = [];
  const events: Omit<AnalyticsEvent, 'sessionId'>[] = [];
  data.users.push(user);

  if (input.referralCode) {
    const referrer = data.users.find((u) => u.referralCode === input.referralCode);
    if (!referrer || referrer === user) {
      notices.push('invalid_referral');
    } else if (referrer.emailKey === ek || referrer.phone === phone) {
      notices.push('self_referral');
    } else {
      user.referredBy = referrer.referralCode;
      const dayAgo = ctx.now.getTime() - 86_400_000;
      const sameIpRecent = ctx.ipHash
        ? data.referrals.filter((r) => {
            if (r.referrerId !== referrer.id || r.status !== 'completed' || Date.parse(r.createdAt) < dayAgo) return false;
            return data.users.find((x) => x.id === r.referredUserId)?.ipHash === ctx.ipHash;
          }).length
        : 0;
      const rapidSelf = !!ctx.ipHash && referrer.ipHash === ctx.ipHash && ctx.now.getTime() - Date.parse(referrer.createdAt) < 120_000;
      const held = !ctx.demo && (sameIpRecent >= SAME_IP_COUNTED_PER_DAY || rapidSelf);
      data.referrals.push({
        id: makeId(),
        referrerId: referrer.id,
        referredUserId: user.id,
        referralCode: referrer.referralCode,
        status: held ? 'held' : 'completed',
        reason: held ? (rapidSelf ? 'same-device-burst' : 'same-ip-cap') : undefined,
        createdAt: now,
      });
      if (held) {
        notices.push('referral_held');
      } else {
        referrer.referralCount += 1;
        events.push({ name: 'referral_registered', ts: now, source: 'referral', college: referrer.college, props: { code: referrer.referralCode, count: referrer.referralCount } });
        if (referrer.referralCount >= REWARD_AT && !referrer.rewardUnlocked) {
          referrer.rewardUnlocked = true;
          events.push({ name: 'reward_unlocked', ts: now, source: 'referral', college: referrer.college, props: { code: referrer.referralCode } });
        }
      }
    }
  }

  // registration_completed is tracked client-side so it joins the visitor's session funnel.
  return { ok: true, result: { status: 'created', user: toPublic(data, user), dashToken: user.dashToken, notices }, events };
}

export function findByCode(data: Data, code: string) {
  return data.users.find((u) => u.referralCode === code.toUpperCase());
}

export function leaderboard(data: Data, opts: { collegeKey?: string; limit?: number } = {}): LeaderboardResult {
  const rows = new Map<string, { name: string; city?: string; builders: number }>();
  for (const s of data.seeds) rows.set(s.key, { name: s.name, city: s.city, builders: s.builders });
  for (const u of data.users) {
    const r = rows.get(u.collegeKey);
    if (r) r.builders += 1;
    else rows.set(u.collegeKey, { name: u.college, builders: 1 });
  }
  const all: LeaderboardEntry[] = [...rows.entries()]
    .sort((a, b) => b[1].builders - a[1].builders || a[1].name.localeCompare(b[1].name))
    .map(([key, r], i) => ({ rank: i + 1, key, name: r.name, city: r.city, builders: r.builders, monogram: monogram(r.name) }));
  const limit = opts.limit ?? 6;
  const result: LeaderboardResult = { entries: all.slice(0, limit), total: all.reduce((n, e) => n + e.builders, 0) };
  if (opts.collegeKey) {
    const i = all.findIndex((e) => e.key === opts.collegeKey);
    if (i >= 0) {
      const prev = all[i - 1];
      result.you = { ...all[i]!, toNext: prev ? prev.builders - all[i]!.builders + 1 : undefined, nextName: prev?.name };
    }
  }
  return result;
}

export function recordEvents(data: Data, events: AnalyticsEvent[]) {
  data.events.push(...events);
  if (data.events.length > MAX_EVENTS) data.events.splice(0, data.events.length - MAX_EVENTS);
}

/** Demo mode: a friend registers through the code. */
export function simulateReferral(data: Data, code: string, ctx: Ctx) {
  const referrer = findByCode(data, code);
  if (!referrer) return null;
  const names = ['Arjun Mehta', 'Sneha Reddy', 'Rahul Varma', 'Divya Nair', 'Karthik Rao', 'Ananya Iyer'];
  const n = data.users.filter((u) => u.demo).length;
  const name = names[n % names.length]!;
  const local = `${name.toLowerCase().replace(/\s/g, '.')}.${makeId(4)}`;
  return register(
    data,
    {
      name,
      email: `${local}@example.com`,
      phone: `9${String(Math.floor(1e8 + Math.random() * 9e8))}`,
      college: referrer.college,
      branch: 'CSE',
      year: 'Final year',
      referralCode: referrer.referralCode,
      source: 'referral',
    },
    { ...ctx, demo: true },
  );
}

export interface Stats {
  visitors: number;
  pageViews: number;
  projectsGenerated: number;
  shares: number;
  registrationsStarted: number;
  registrations: number;
  conversionRate: number;
  referralsCompleted: number;
  referralsHeld: number;
  referralLinkOpens: number;
  referralConversion: number;
  rewardsUnlocked: number;
  aiShare: number;
  funnel: { step: string; count: number }[];
  topColleges: LeaderboardEntry[];
  topReferrers: { firstName: string; college: string; count: number; code: string }[];
  sources: { source: string; visitors: number; registrations: number; conversion: number }[];
  daily: { day: string; visitors: number; registrations: number }[];
}

export function stats(data: Data, opts: { includeDemo?: boolean } = {}): Stats {
  const users = opts.includeDemo ? data.users : data.users.filter((u) => !u.demo);
  const ev = data.events;
  const sessionsBy = (name: string) => new Set(ev.filter((e) => e.name === name).map((e) => e.sessionId));
  const count = (name: string) => ev.filter((e) => e.name === name).length;
  const visitors = sessionsBy('page_view').size;
  const registeredSessions = sessionsBy('registration_completed').size;
  const generated = sessionsBy('project_generated').size;
  const aiCount = ev.filter((e) => e.name === 'project_generated' && e.props?.source === 'ai').length;
  const userIds = new Set(users.map((u) => u.id));
  const referralsCompleted = data.referrals.filter((r) => r.status === 'completed' && userIds.has(r.referredUserId)).length;
  const opens = sessionsBy('referral_link_opened').size;
  const referredRegs = users.filter((u) => u.referredBy).length;

  const firstSource = new Map<string, string>();
  for (const e of ev) if (e.name === 'page_view' && !firstSource.has(e.sessionId)) firstSource.set(e.sessionId, e.source ?? 'direct');
  const srcRows = new Map<string, { visitors: number; registrations: number }>();
  for (const s of firstSource.values()) {
    const r = srcRows.get(s) ?? { visitors: 0, registrations: 0 };
    r.visitors += 1;
    srcRows.set(s, r);
  }
  for (const u of users) {
    const r = srcRows.get(u.source) ?? { visitors: 0, registrations: 0 };
    r.registrations += 1;
    srcRows.set(u.source, r);
  }

  const days = new Map<string, { visitors: Set<string>; registrations: number }>();
  const dayOf = (iso: string) => iso.slice(0, 10);
  for (const e of ev) if (e.name === 'page_view') {
    const d = days.get(dayOf(e.ts)) ?? { visitors: new Set(), registrations: 0 };
    d.visitors.add(e.sessionId);
    days.set(dayOf(e.ts), d);
  }
  for (const u of users) {
    const d = days.get(dayOf(u.createdAt)) ?? { visitors: new Set(), registrations: 0 };
    d.registrations += 1;
    days.set(dayOf(u.createdAt), d);
  }

  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0);
  return {
    visitors,
    pageViews: count('page_view'),
    projectsGenerated: count('project_generated'),
    shares: count('project_shared') + count('whatsapp_clicked') + count('referral_link_copied'),
    registrationsStarted: sessionsBy('registration_started').size,
    registrations: users.length,
    conversionRate: pct(registeredSessions, visitors),
    referralsCompleted,
    referralsHeld: data.referrals.filter((r) => r.status === 'held').length,
    referralLinkOpens: opens,
    referralConversion: pct(referredRegs, opens),
    rewardsUnlocked: users.filter((u) => u.rewardUnlocked).length,
    aiShare: pct(aiCount, count('project_generated')),
    funnel: [
      { step: 'Visited', count: visitors },
      { step: 'Started typing', count: sessionsBy('project_input_started').size },
      { step: 'Got a blueprint', count: generated },
      { step: 'Opened registration', count: sessionsBy('registration_started').size },
      { step: 'Registered', count: registeredSessions },
      { step: 'Shared their link', count: new Set([...sessionsBy('whatsapp_clicked'), ...sessionsBy('referral_link_copied'), ...sessionsBy('project_shared')]).size },
    ],
    topColleges: leaderboard({ ...data, users }, { limit: 8 }).entries,
    topReferrers: [...users]
      .filter((u) => u.referralCount > 0)
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, 8)
      .map((u) => ({ firstName: firstName(u.name), college: u.college, count: u.referralCount, code: u.referralCode })),
    sources: [...srcRows.entries()]
      .map(([source, r]) => ({ source, ...r, conversion: pct(r.registrations, r.visitors) }))
      .sort((a, b) => b.registrations - a.registrations || b.visitors - a.visitors),
    daily: [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([day, d]) => ({ day, visitors: d.visitors.size, registrations: d.registrations })),
  };
}
