import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { Stats } from '@shared/domain';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Label } from '@/components/ui/primitives';
import { api, ApiError, isOffline } from '@/services/api';
import { useInterval } from '@/hooks/useUtils';
import { session } from '@/lib/storage';
import { cn } from '@/lib/cn';

const fmt = (n: number) => n.toLocaleString('en-IN');

function Tile({ label, value, sub, hero }: { label: string; value: string; sub?: string; hero?: boolean }) {
  return (
    <div className={cn('flex flex-col gap-2 rounded-md border bg-surface p-5', hero ? 'border-ink' : 'border-line')}>
      <Label>{label}</Label>
      <span className="tabular text-[36px] font-semibold leading-none tracking-[-0.03em]">{value}</span>
      {sub && <span className="t-small text-muted">{sub}</span>}
    </div>
  );
}

/** Single-series horizontal bars, direct-labelled; the label is the tooltip's twin. */
function Funnel({ steps }: { steps: Stats['funnel'] }) {
  const max = Math.max(1, ...steps.map((s) => s.count));
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((s, i) => {
        const prev = steps[i - 1]?.count;
        const rate = prev ? Math.round((s.count / prev) * 100) : null;
        return (
          <li key={s.step} className="group grid grid-cols-[150px_1fr_110px] items-center gap-4" title={`${s.step}: ${fmt(s.count)}${rate !== null ? ` · ${rate}% of previous step` : ''}`}>
            <span className="t-small text-ink-2">{s.step}</span>
            <span className="relative h-5">
              <span className="absolute inset-y-0 left-0 rounded-r-[4px] bg-ink transition-opacity group-hover:opacity-80" style={{ width: `max(2px, ${(s.count / max) * 100}%)` }} />
            </span>
            <span className="tabular text-right text-[14px]">
              <span className="font-medium">{fmt(s.count)}</span>
              {rate !== null && <span className="text-muted"> · {rate}%</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** One measure per chart (no dual axis): two small multiples share the day columns. */
function Daily({ days, k, title }: { days: Stats['daily']; k: 'visitors' | 'registrations'; title: string }) {
  const max = Math.max(1, ...days.map((d) => d[k]));
  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="t-small font-medium">{title}</figcaption>
      <div className="flex h-28 items-end gap-[2px] border-b border-line">
        {days.map((d) => (
          <span key={d.day} className="group relative flex h-full flex-1 items-end" title={`${d.day}: ${fmt(d[k])} ${k}`}>
            <span className="w-full rounded-t-[4px] bg-ink group-hover:opacity-80" style={{ height: `${Math.max(2, (d[k] / max) * 100)}%` }} />
          </span>
        ))}
      </div>
      <div className="flex justify-between t-micro text-muted">
        <span>{days[0]?.day.slice(5) ?? ''}</span>
        <span>max {fmt(max)}</span>
        <span>{days[days.length - 1]?.day.slice(5) ?? ''}</span>
      </div>
    </figure>
  );
}

export default function Admin() {
  const [key, setKey] = useState(() => session.get('aiify.admin', ''));
  const [includeDemo, setIncludeDemo] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!key) return;
    try {
      setStats(await api.adminStats(key, includeDemo));
      setError(null);
      session.set('aiify.admin', key);
    } catch (e) {
      setStats(null);
      setError(e instanceof ApiError ? e.message : 'Could not load stats.');
    }
  }, [key, includeDemo]);
  useEffect(() => {
    load();
  }, [load]);
  useInterval(load, stats ? 15000 : null);

  if (!stats) {
    const submit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setKey(String(new FormData(e.currentTarget).get('key') ?? ''));
    };
    return (
      <section className="wrap flex min-h-[70vh] max-w-[480px] flex-col justify-center gap-6 py-24">
        <Label>Admin / growth dashboard</Label>
        <h1 className="t-h2">Campaign numbers.</h1>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Admin key" name="key" type="password" autoComplete="off" error={error ?? undefined} />
          <Button type="submit">Open dashboard</Button>
        </form>
      </section>
    );
  }

  const s = stats;
  const target = 500;
  return (
    <section className="wrap flex flex-col gap-12 py-12 md:py-16">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-3">
          <Label>Admin / growth dashboard {isOffline() ? '· local data' : '· live'}</Label>
          <h1 className="t-h1">
            {fmt(s.registrations)} / {target} registrations
          </h1>
          <div className="h-2 w-full max-w-[520px] overflow-hidden rounded-full bg-sunken" role="progressbar" aria-valuenow={s.registrations} aria-valuemax={target}>
            <span className="block h-full rounded-full border border-ink bg-accent" style={{ width: `${Math.min(100, (s.registrations / target) * 100)}%` }} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="t-small flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={includeDemo} onChange={(e) => setIncludeDemo(e.target.checked)} className="size-4 accent-ink" />
            Include demo users
          </label>
          {!isOffline() && (
            <a
              className="t-small inline-flex min-h-11 items-center rounded-btn border border-ink px-4 hover:bg-sunken"
              href="/api/admin/export.csv"
              onClick={async (e) => {
                e.preventDefault();
                const r = await fetch('/api/admin/export.csv', { headers: { 'x-admin-key': key } });
                const url = URL.createObjectURL(await r.blob());
                Object.assign(document.createElement('a'), { href: url, download: 'registrations.csv' }).click();
                URL.revokeObjectURL(url);
              }}
            >
              Export CSV
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Visitors" value={fmt(s.visitors)} sub={`${fmt(s.pageViews)} page views`} />
        <Tile label="Projects generated" value={fmt(s.projectsGenerated)} sub={`${s.aiShare}% via AI model`} />
        <Tile label="Registrations" value={fmt(s.registrations)} sub={`${fmt(s.registrationsStarted)} opened the form`} hero />
        <Tile label="Conversion" value={`${s.conversionRate}%`} sub="sessions: visit → register" />
        <Tile label="Referrals" value={fmt(s.referralsCompleted)} sub={s.referralsHeld ? `${s.referralsHeld} held for review` : 'none held'} />
        <Tile label="Referral conversion" value={`${s.referralConversion}%`} sub={`${fmt(s.referralLinkOpens)} invite opens`} />
        <Tile label="Rewards unlocked" value={fmt(s.rewardsUnlocked)} />
        <Tile label="Shares" value={fmt(s.shares)} sub="WhatsApp, copies, cards" />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Label tone="ink">Funnel · sessions</Label>
          <Funnel steps={s.funnel} />
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Daily days={s.daily} k="visitors" title="Visitors per day" />
          <Daily days={s.daily} k="registrations" title="Registrations per day" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-1">
          <Label tone="ink">Traffic sources · first touch</Label>
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="t-label border-b border-ink text-muted">
                <th className="py-2 font-medium">Source</th>
                <th className="py-2 text-right font-medium">Visitors</th>
                <th className="py-2 text-right font-medium">Reg.</th>
                <th className="py-2 text-right font-medium">Conv.</th>
              </tr>
            </thead>
            <tbody className="tabular">
              {s.sources.map((r) => (
                <tr key={r.source} className="border-b border-line">
                  <td className="py-2.5 capitalize">{r.source}</td>
                  <td className="py-2.5 text-right">{fmt(r.visitors)}</td>
                  <td className="py-2.5 text-right font-medium">{fmt(r.registrations)}</td>
                  <td className="py-2.5 text-right">{r.visitors ? `${r.conversion}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-4">
          <Label tone="ink">Top colleges</Label>
          <ol className="text-[14px]">
            {s.topColleges.map((c) => (
              <li key={c.key} className="flex justify-between gap-4 border-b border-line py-2.5">
                <span className="truncate">
                  <span className="mr-3 font-mono text-muted">{String(c.rank).padStart(2, '0')}</span>
                  {c.name}
                </span>
                <span className="tabular font-medium">{fmt(c.builders)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex flex-col gap-4">
          <Label tone="ink">Top referrers</Label>
          {s.topReferrers.length ? (
            <ol className="text-[14px]">
              {s.topReferrers.map((r) => (
                <li key={r.code} className="flex justify-between gap-4 border-b border-line py-2.5">
                  <span className="truncate">
                    {r.firstName} <span className="text-muted">· {r.college}</span>
                  </span>
                  <span className="tabular font-medium">{r.count}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="t-small text-muted">No referrals yet.</p>
          )}
        </div>
      </div>
      <p className="t-small text-muted">
        Make channel links on the <a className="underline" href="/qr">QR &amp; links page</a>. Campaign tags (?source=…) are captured first-touch and stored with each registration.
      </p>
    </section>
  );
}
