import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Blueprint } from '@shared/types';
import { Aiifier } from '@/components/aiify/Aiifier';
import { ProjectResult } from '@/components/aiify/ProjectResult';
import { Button } from '@/components/ui/Button';
import { Highlighter, Label, Tag } from '@/components/ui/primitives';
import { useJourney } from '@/hooks/useJourney';
import { track } from '@/lib/analytics';
import { DUR, EASE } from '@/lib/motion';
import type { ReferrerInfo } from '@/services/api';

const EXAMPLES = [
  { before: 'Smart attendance system', after: 'AI-Powered Attendance Intelligence', ups: ['Face recognition', 'Attendance prediction', 'AI insights', 'Anomaly detection'], diff: 'Intermediate' as const, time: '1–2 weeks', score: 8.7 },
  { before: 'College placement portal', after: 'AI Interview Coach & Placement Portal', ups: ['Resume screening', 'Mock interviews', 'Placement prediction', 'Job matching'], diff: 'Intermediate' as const, time: '2–3 weeks', score: 9.0 },
  { before: 'Expense tracker', after: 'AI Expense Intelligence', ups: ['Receipt scanning', 'Auto-categorisation', 'Spending forecasts', 'Money assistant'], diff: 'Beginner' as const, time: '1–2 weeks', score: 8.3 },
];

/** Right-column margin note: a live diff that cycles through real examples. */
function LiveDiff() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % EXAMPLES.length), 4200);
    return () => window.clearInterval(t);
  }, [reduce]);
  const ex = EXAMPLES[i]!;
  return (
    <div className="flex flex-col gap-4" aria-label="Example transformation">
      <Label>Margin note / what the button does</Label>
      <div className="rounded-lg border border-line bg-surface p-5 md:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: reduce ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -8 }}
            transition={{ duration: DUR.normal, ease: EASE }}
            className="flex flex-col gap-4"
          >
            <p className="flex items-center gap-3 text-[15px] text-muted">
              <span className="t-label">01</span>
              <span className="font-mono text-error">−</span>
              <span className="line-through">{ex.before}</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="t-label pt-1.5">02</span>
              <span className="pt-0.5 font-mono text-success">+</span>
              <span className="text-[22px] font-semibold leading-[1.2] tracking-[-0.02em]">
                <Highlighter animate delay={250}>
                  {ex.after}
                </Highlighter>
              </span>
            </p>
            <hr className="border-line" />
            <ul className="flex flex-wrap gap-2">
              {ex.ups.map((u) => (
                <li key={u}>
                  <Tag kind="concept">{u}</Tag>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Tag kind={ex.diff}>{ex.diff}</Tag>
              <span className="t-label text-ink">{ex.time}</span>
              <span className="t-label text-ink">AI potential {ex.score.toFixed(1)} / 10</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="font-mono text-[12px] leading-[1.5] text-muted">↑ Same project. Four AI upgrades. Yours takes about four seconds.</p>
    </div>
  );
}

export function Hero({ referrer }: { referrer: ReferrerInfo | null }) {
  const { blueprint, setBlueprint, openRegister } = useJourney();
  const [fresh, setFresh] = useState(false);

  const onResult = useCallback(
    (bp: Blueprint) => {
      setBlueprint(bp);
      setFresh(true);
      window.setTimeout(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    },
    [setBlueprint],
  );

  return (
    <>
      <section className="wrap pb-16 pt-10 md:pt-16 lg:pb-[120px] lg:pt-24" aria-labelledby="hero-title">
        {referrer?.valid && (
          <p className="mb-8 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-ink bg-surface px-4 py-3 text-[14px]">
            <Tag kind="you">Invite</Tag>
            <span>
              <strong className="font-medium">{referrer.firstName}</strong>
              {referrer.college ? ` from ${referrer.college}` : ''} invited you. AI-ify your project, then join them.
            </span>
          </p>
        )}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="flex flex-col gap-6 lg:col-span-7 lg:gap-7">
            <Label>AI-ify my project / 01</Label>
            <h1 id="hero-title" className="t-display">
              GOT A PROJECT?
              <br />
              AI-IFY IT.
            </h1>
            <p className="t-body-lg max-w-[36ch] text-ink-2">Turn your existing college project into a stronger AI-powered project — in seconds.</p>
            <div className="mt-2">
              <Aiifier onResult={onResult} />
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {['Your project stays yours', 'No AI experience required'].map((m) => (
                <li key={m} className="t-label text-muted">
                  {m}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5 lg:pl-6 lg:pt-[148px]">
            <LiveDiff />
          </div>
        </div>
        <span id="hero-end" aria-hidden />
      </section>

      {blueprint && (
        <section id="result" className="wrap scroll-mt-24 pb-16 lg:pb-24" aria-label="Your AI-ified project">
          <ProjectResult key={blueprint.id} bp={blueprint} onReserve={() => openRegister('result')} />
          <TransitionCTA highlight={fresh} />
        </section>
      )}
    </>
  );
}

/** After value: “You have the idea. Now build it.” */
function TransitionCTA({ highlight }: { highlight: boolean }) {
  const { openRegister, me } = useJourney();
  return (
    <div className="on-dark mt-6 grid grid-cols-1 gap-8 rounded-hero bg-dark px-6 py-10 text-dark-text md:px-10 md:py-14 lg:grid-cols-12 lg:items-end">
      <div className="flex flex-col gap-4 lg:col-span-8">
        <Label tone="dark">Next / the workshop</Label>
        <h2 className="t-h1">
          YOU HAVE THE IDEA.
          <br />
          NOW BUILD IT.
        </h2>
        <p className="t-body-lg max-w-[44ch] text-dark-muted">Join our free 60-minute workshop and learn how to turn ideas like this into working AI projects.</p>
      </div>
      <div className="lg:col-span-4 lg:justify-self-end">
        <Button
          variant="accent"
          size="lg"
          block
          className="w-full lg:w-auto"
          onClick={() => {
            track('workshop_cta_clicked', { where: 'transition', fresh: highlight });
            if (me) window.location.assign('/me');
            else openRegister('transition');
          }}
        >
          {me ? 'You’re in — open dashboard' : 'Reserve My Spot'}
        </Button>
      </div>
    </div>
  );
}
