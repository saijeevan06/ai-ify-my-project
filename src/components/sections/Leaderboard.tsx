import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import type { LeaderboardEntry, LeaderboardResult } from '@shared/types';
import { Button } from '@/components/ui/Button';
import { Label, SectionHead, Tag } from '@/components/ui/primitives';
import { useJourney } from '@/hooks/useJourney';
import { api } from '@/services/api';
import { track } from '@/lib/analytics';
import { DUR, EASE } from '@/lib/motion';
import { cn } from '@/lib/cn';

/** Figma: LeaderboardRow (Top / Default / You). */
function Row({ e, max, you, i }: { e: LeaderboardEntry; max: number; you: boolean; i: number }) {
  const reduce = useReducedMotion();
  const top = e.rank <= 3;
  return (
    <motion.li
      initial={{ opacity: 0, y: reduce ? 0 : 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: DUR.normal, ease: EASE, delay: i * 0.06 }}
      className={cn(
        'grid grid-cols-[44px_40px_1fr_auto] items-center gap-x-3 py-4 md:grid-cols-[72px_44px_1fr_200px_140px] md:gap-x-6 md:py-5',
        you ? 'rounded-md border border-ink bg-surface px-3 md:px-6' : 'border-b border-line',
      )}
      aria-current={you || undefined}
    >
      <span className={cn('tabular', top ? 'text-[28px] font-semibold leading-none tracking-[-0.03em] md:text-[40px]' : 'font-mono text-[16px] md:text-[20px]')}>{String(e.rank).padStart(2, '0')}</span>
      <span className={cn('grid size-9 place-items-center rounded-sm font-mono text-[12px] md:size-11 md:text-[14px]', you ? 'border border-ink bg-accent' : 'bg-sunken')} aria-hidden>
        {e.monogram}
      </span>
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-medium leading-[1.3] tracking-[-0.01em] md:text-[18px]">{e.name}</span>
          {you && <Tag kind="you">You</Tag>}
        </span>
        {e.city && <span className="t-small hidden text-muted md:block">{e.city}</span>}
        <span className="h-[3px] w-full max-w-[120px] overflow-hidden rounded-full bg-sunken md:hidden">
          <span className="block h-full rounded-full bg-ink" style={{ width: `${(e.builders / max) * 100}%` }} />
        </span>
      </span>
      <span className="hidden h-1 overflow-hidden rounded-full bg-sunken md:block">
        <motion.span
          className="block h-full origin-left rounded-full bg-ink"
          style={{ width: `${(e.builders / max) * 100}%` }}
          initial={{ scaleX: reduce ? 1 : 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.transform, ease: EASE, delay: 0.1 + i * 0.06 }}
        />
      </span>
      <span className="flex flex-col items-end md:flex-row md:items-baseline md:justify-end md:gap-1.5">
        <span className="tabular text-[20px] font-semibold tracking-[-0.02em] md:text-[24px]">{e.builders}</span>
        <span className="t-label text-muted md:text-[14px] md:normal-case md:tracking-normal md:[font-family:var(--font-sans)]">builders</span>
      </span>
    </motion.li>
  );
}

export function LeaderboardList({ data, youKey }: { data: LeaderboardResult; youKey?: string }) {
  const max = Math.max(1, ...data.entries.map((e) => e.builders));
  const youInTop = data.entries.some((e) => e.key === youKey);
  if (!data.entries.length) {
    return <p className="t-body rounded-md border border-dashed border-line p-6 text-muted">Be the first builder from your college.</p>;
  }
  return (
    <ol>
      {data.entries.map((e, i) => (
        <Row key={e.key} e={e} max={max} you={e.key === youKey} i={i} />
      ))}
      {data.you && !youInTop && (
        <>
          <li aria-hidden className="t-label py-3 text-center text-faint">
            · · ·
          </li>
          <Row e={data.you} max={max} you i={data.entries.length} />
        </>
      )}
    </ol>
  );
}

/** Figma: CollegeRank. */
export function CollegeRank({ data, onShare }: { data: NonNullable<LeaderboardResult['you']>; onShare?: () => void }) {
  return (
    <div className="flex flex-col gap-5 rounded-lg border border-ink bg-surface p-5 md:flex-row md:items-center md:gap-8 md:px-7 md:py-6">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Label tone="ink">Your college</Label>
        <span className="truncate font-medium">{data.name}</span>
      </div>
      <span className="tabular text-[48px] font-semibold leading-none tracking-[-0.04em] md:text-[56px]">#{String(data.rank).padStart(2, '0')}</span>
      <div className="flex flex-col gap-1">
        <span className="font-medium">{data.builders} builders</span>
        <span className="t-small text-muted">{data.toNext ? `${data.toNext} more to overtake #${String(data.rank - 1).padStart(2, '0')}` : 'Top of the cup. Hold it.'}</span>
      </div>
      {onShare && (
        <Button onClick={onShare} className="w-full md:w-auto" block>
          Share to climb
        </Button>
      )}
    </div>
  );
}

export function LeaderboardSection() {
  const { me } = useJourney();
  const [data, setData] = useState<LeaderboardResult | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  useEffect(() => {
    api.leaderboard(me?.collegeKey).then(setData).catch(() => setData({ entries: [], total: 0 }));
  }, [me?.collegeKey]);
  useEffect(() => {
    if (inView) track('leaderboard_viewed', { where: 'home' }, 'leaderboard_viewed_home');
  }, [inView]);

  return (
    <section id="leaderboard" className="section scroll-mt-16 border-y border-line bg-surface" aria-labelledby="lb-title">
      <div ref={ref} className="wrap">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHead n="07" label="AI Builders Cup" title="Which college is building the most AI?" id="lb-title" />
          <Label>{data ? `${data.total.toLocaleString('en-IN')} builders · live` : 'Loading…'}</Label>
        </div>
        <div className="mt-10 md:mt-14">
          {data ? <LeaderboardList data={data} youKey={me?.collegeKey} /> : <div className="h-[420px] animate-pulse rounded-md bg-sunken" aria-hidden />}
        </div>
        {data?.you && (
          <div className="mt-8">
            <CollegeRank data={data.you} />
          </div>
        )}
        {!me && <p className="t-small mt-8 text-muted">Register to put your college on the board. Every friend you bring counts for your college too.</p>}
      </div>
    </section>
  );
}
