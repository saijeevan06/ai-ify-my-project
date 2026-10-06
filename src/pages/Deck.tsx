import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

/**
 * /deck — the 7-day growth plan as six 1280×720 slides, in the product's own
 * design system. In dev, “Export slides” saves PNGs that scripts/build-deck.mjs
 * turns into public/plan/Growth-Plan.pdf and deliverables/Growth-Plan.pptx.
 */

const W = 1280;
const H = 720;
const TOTAL = 6;

function L({ children, ink, className }: { children: ReactNode; ink?: boolean; className?: string }) {
  return <p className={cn('font-mono text-[13px] font-medium uppercase tracking-[0.02em]', ink ? 'text-ink' : 'text-muted', className)}>{children}</p>;
}

function Slide({ n, label, children, dark }: { n: number; label: string; children: ReactNode; dark?: boolean }) {
  return (
    <div
      data-slide={n}
      style={{ width: W, height: H }}
      className={cn(
        'relative flex shrink-0 flex-col overflow-hidden px-16 pb-12 pt-12',
        dark ? 'bg-dark text-dark-text' : 'bg-paper text-ink [background-image:linear-gradient(to_right,rgb(17_17_17/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(17_17_17/0.035)_1px,transparent_1px)] [background-size:24px_24px]',
      )}
    >
      <div className="flex items-center justify-between">
        <L className={dark ? '!text-dark-muted' : ''}>{label}</L>
        <L className={dark ? '!text-dark-muted' : ''}>AI-ify My Project · Growth plan</L>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <div className="flex items-center justify-between">
        <span className={cn('text-[18px] font-semibold tracking-[-0.03em]', dark ? 'text-dark-text' : 'text-ink')}>AI-ify</span>
        <L className={dark ? '!text-dark-muted' : ''}>
          0{n} / 0{TOTAL}
        </L>
      </div>
    </div>
  );
}

const hl = 'hl';

function S1() {
  return (
    <Slide n={1} label="[01] / The brief">
      <div className="flex flex-1 flex-col justify-center gap-10">
        <h1 className="text-[92px] font-semibold leading-[0.92] tracking-[-0.05em]">
          500 final-year
          <br />
          registrations.
          <br />
          <span className="text-muted">7 days. ₹2,000.</span>
        </h1>
        <div className="flex max-w-[980px] flex-col gap-3 rounded-[20px] border border-ink bg-surface px-8 py-6">
          <p className="flex items-center gap-4 text-[24px] text-muted">
            <span className="font-mono text-error">−</span>
            <span className="line-through">Buy ads for a workshop</span>
          </p>
          <p className="flex items-center gap-4 text-[34px] font-semibold tracking-[-0.03em]">
            <span className="font-mono text-[24px] text-success">+</span>
            <span className={hl}>Make the product the channel</span>
          </p>
        </div>
        <p className="max-w-[900px] text-[22px] leading-[1.45] text-ink-2">
          Give every student a better version of the project they already have — then make sharing it the easiest thing on the page.
        </p>
      </div>
    </Slide>
  );
}

function S2() {
  const rows: [string, string][] = [
    ['Budget', '₹2,000'],
    ['Est. cost per paid registration (student Instagram ads)', '~₹35'],
    ['Registrations ₹2,000 can buy', '~57'],
    ['Share of the 500 target', '~11%'],
  ];
  return (
    <Slide n={2} label="[02] / The math, then the insight">
      <div className="grid flex-1 grid-cols-12 items-center gap-10">
        <div className="col-span-6 flex flex-col gap-6">
          <h2 className="text-[52px] font-semibold leading-[1.02] tracking-[-0.035em]">The math says: don’t buy registrations.</h2>
          <div>
            {rows.map(([k, v], i) => (
              <div key={k} className={cn('flex items-baseline justify-between gap-6 border-t py-3', i === rows.length - 1 ? 'border-ink' : 'border-line')}>
                <span className="text-[18px] text-ink-2">{k}</span>
                <span className={cn('font-mono text-[22px]', i === rows.length - 1 && 'font-medium')}>{v}</span>
              </div>
            ))}
          </div>
          <p className="text-[20px] font-medium">So 9 in 10 registrations must come from students themselves.</p>
          <L>Estimates — validated by the Day 2–4 paid test</L>
        </div>
        <div className="col-span-6 flex flex-col gap-6 rounded-[20px] bg-dark p-10 text-dark-text">
          <L className="!text-dark-muted">The insight</L>
          <p className="text-[34px] font-semibold leading-[1.1] tracking-[-0.03em]">
            Final-years don’t want to “learn AI”. They want <span className={cn(hl, 'text-ink')}>their own project</span> to stand out.
          </p>
          <p className="text-[19px] leading-[1.5] text-dark-muted">
            October is placements and project reviews. A 60-minute workshop sounds like homework; a stronger version of the project they’ll defend in an interview sounds like a shortcut.
          </p>
          <p className="text-[19px] leading-[1.5]">So we lead with value: AI-ify the project they already have. Registering is the next step, not the entry fee.</p>
        </div>
      </div>
    </Slide>
  );
}

function S3() {
  const steps = [
    ['01', 'Type your project', '“Smart parking system”'],
    ['02', 'Get the blueprint', 'Value before any form'],
    ['03', 'Share the card', '1080×1350, WhatsApp-ready'],
    ['04', 'Register', '6 fields, < 30 sec'],
    ['05', 'Referral link', 'ai-ify.in/r/AX72K'],
    ['06', '3 friends', 'Unlock AI Builder Pack'],
    ['07', 'College climbs', 'AI Builders Cup'],
  ];
  return (
    <Slide n={3} label="[03] / The loop">
      <div className="flex flex-1 flex-col justify-center gap-12">
        <h2 className="text-[52px] font-semibold leading-[1.02] tracking-[-0.035em]">Every step is a reason to share.</h2>
        <div className="relative grid grid-cols-7 gap-3">
          <span className="absolute left-[3%] right-[3%] top-[22px] border-t border-dashed border-ink" aria-hidden />
          {steps.map(([n, t, d], i) => (
            <div key={n} className="relative flex flex-col gap-3">
              <span className={cn('relative z-10 grid size-11 place-items-center rounded-full border border-ink font-mono text-[14px]', i === 1 || i === 5 ? 'bg-accent' : 'bg-surface')}>{n}</span>
              <span className="text-[20px] font-medium leading-[1.2] tracking-[-0.01em]">{t}</span>
              <span className="text-[15px] leading-[1.35] text-muted">{d}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[
            ['K ≈ 0.5', 'Every 2 registrants bring 1 friend. On 335 seeded registrations that’s ~165 more.'],
            ['3 share moments', 'The blueprint card, the referral link, and “your college is #4”.'],
            ['Never dead-ends', 'No AI key, slow API or no backend? A 26-pattern fallback still gives every student a result.'],
          ].map(([k, d]) => (
            <div key={k} className="flex flex-col gap-2 border-t border-ink pt-4">
              <span className="text-[26px] font-semibold tracking-[-0.02em]">{k}</span>
              <span className="text-[16px] leading-[1.45] text-ink-2">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}

function S4() {
  const rows: [string, string, number, string][] = [
    ['College WhatsApp groups', '10 ambassadors × 2 colleges, posting their own share card', 200, '₹500'],
    ['Referral loop', 'Share card + /r/CODE links; AI Builder Pack at 3 friends', 165, '₹0'],
    ['Posters + QR', '100 A5 posters: labs, canteens, notice boards (?source=poster)', 60, '₹500'],
    ['Coding clubs · LinkedIn · Instagram', 'Club leads post the card; one tracked link per club', 45, '₹0'],
    ['Paid experiment', 'Instagram boost, 2 creatives A/B, scale the winner', 30, '₹1,000'],
  ];
  return (
    <Slide n={4} label="[04] / Channels & budget">
      <div className="flex flex-1 flex-col justify-center gap-6">
        <h2 className="text-[46px] font-semibold leading-[1.02] tracking-[-0.035em]">Five channels. Half the budget is one experiment.</h2>
        <div>
          <div className="grid grid-cols-[300px_1fr_150px_120px] gap-6 border-b border-ink pb-2">
            {['Channel', 'How', 'Registrations', 'Spend'].map((h, i) => (
              <L key={h} className={i > 1 ? 'text-right' : ''}>
                {h}
              </L>
            ))}
          </div>
          {rows.map(([c, how, r, s]) => (
            <div key={c} className="grid grid-cols-[300px_1fr_150px_120px] items-baseline gap-6 border-b border-line py-3">
              <span className="text-[19px] font-medium">{c}</span>
              <span className="text-[16px] text-ink-2">{how}</span>
              <span className="text-right font-mono text-[22px]">{r}</span>
              <span className="text-right font-mono text-[18px] text-ink-2">{s}</span>
            </div>
          ))}
          <div className="grid grid-cols-[300px_1fr_150px_120px] items-baseline gap-6 pt-4">
            <span className="text-[19px] font-semibold">Total</span>
            <span className="text-[16px] text-muted">Prizes ₹300 / 100 / 100 · posters ~₹5 · ads ₹500 test + ₹500 scale</span>
            <span className="text-right text-[30px] font-semibold tracking-[-0.03em]">
              <span className={hl}>500</span>
            </span>
            <span className="text-right font-mono text-[22px] font-medium">₹2,000</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}

function S5() {
  const days: [string, string, string, number][] = [
    ['Day 0', 'Prep', '10 ambassadors, tracked links + QR per channel, posters printed, demo run end to end', 0],
    ['Day 1', 'Seed', 'Ambassadors post their own AI-ified project card in class groups', 60],
    ['Day 2', 'Spread', 'Posters up · coding clubs post · paid A/B starts (₹500, 2 creatives)', 130],
    ['Day 3', 'Rivalry', 'First AI Builders Cup post: “Your college is #4”', 210],
    ['Day 4', 'Decide', 'Read the experiment, kill the loser, ambassador leaderboard', 290],
    ['Day 5', 'Scale', 'Last ₹500 behind the winner · nudge everyone at 1–2 / 3 friends', 370],
    ['Day 6', 'Push', 'College-vs-college push in groups · “one more friend” reminder', 440],
    ['Day 7', 'Close', 'Last call + workshop reminder · final cup standings', 500],
  ];
  return (
    <Slide n={5} label="[05] / 7-day plan">
      <div className="flex flex-1 flex-col justify-center gap-7">
        <h2 className="text-[52px] font-semibold leading-[1.02] tracking-[-0.035em]">Seed, spread, decide, scale.</h2>
        <div>
          {days.map(([d, k, what, cum]) => (
            <div key={d} className="grid grid-cols-[90px_110px_1fr_200px] items-center gap-6 border-t border-line py-[9px]">
              <span className="font-mono text-[15px] font-medium">{d}</span>
              <span className="text-[18px] font-medium">{k}</span>
              <span className="text-[16px] text-ink-2">{what}</span>
              <span className="flex items-center gap-3">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-sunken">
                  <span className="block h-full rounded-full bg-ink" style={{ width: `${(cum / 500) * 100}%` }} />
                </span>
                <span className="w-10 text-right font-mono text-[15px]">{cum}</span>
              </span>
            </div>
          ))}
        </div>
        <L>Cumulative registration target · tracked live in /admin by day and source</L>
      </div>
    </Slide>
  );
}

function S6() {
  const funnel: [string, string][] = [
    ['Visit → starts typing', '45%'],
    ['Typing → gets a blueprint', '85%'],
    ['Blueprint → opens registration', '35%'],
    ['Opens form → registers', '75%'],
    ['Registers → shares', '50%'],
  ];
  const tests: [string, string, string][] = [
    ['Value first vs form first', 'AI-ify before registering beats a register-first page', 'Registrations ÷ visitors'],
    ['Share card vs plain link', 'Their own blueprint card gets more friends to click', 'Invite opens per sharer, K'],
    ['College rivalry vs personal reward', '“Your college is #4” spreads further than “unlock the pack”', 'Share rate, K'],
  ];
  return (
    <Slide n={6} label="[06] / Measurement & experiments" dark>
      <div className="grid flex-1 grid-cols-12 items-center gap-12">
        <div className="col-span-5 flex flex-col gap-5">
          <h2 className="text-[46px] font-semibold leading-[1.04] tracking-[-0.035em]">Measure every step. Change one thing at a time.</h2>
          <div>
            {funnel.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between border-t border-dark-text/20 py-2.5">
                <span className="text-[17px] text-dark-muted">{k}</span>
                <span className="font-mono text-[20px]">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-[16px] leading-[1.45] text-dark-muted">
            Every link carries ?source=. A channel under 5% visit → registration after 300 visits gets cut on Day 4.
          </p>
        </div>
        <div className="col-span-7 flex flex-col gap-4">
          <L className="!text-dark-muted">Three tests</L>
          {tests.map(([t, h, m], i) => (
            <div key={t} className="flex gap-5 rounded-[16px] border border-dark-text/20 p-5">
              <span className={cn('grid size-10 shrink-0 place-items-center rounded-full font-mono text-[14px]', i === 0 ? 'bg-accent text-ink' : 'border border-dark-text/40')}>0{i + 1}</span>
              <div className="flex flex-col gap-1">
                <span className="text-[22px] font-semibold tracking-[-0.02em]">{t}</span>
                <span className="text-[16px] text-dark-muted">{h}</span>
                <span className="font-mono text-[13px] uppercase tracking-[0.02em] text-accent">Metric · {m}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}

const SLIDES = [S1, S2, S3, S4, S5, S6];

/** Fits a fixed 1280×720 slide to the available width without changing the export. */
function Fit({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setS(Math.min(1, el.clientWidth / W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={wrap} className="w-full overflow-hidden rounded-md border border-line shadow-sm" style={{ height: H * s }}>
      <div style={{ transform: `scale(${s})`, transformOrigin: 'top left', width: W }}>{children}</div>
    </div>
  );
}

export default function Deck() {
  const [status, setStatus] = useState('');
  const exportSlides = async () => {
    await document.fonts.ready;
    const nodes = [...document.querySelectorAll<HTMLElement>('[data-slide]')];
    for (const node of nodes) {
      setStatus(`Rendering ${node.dataset.slide} / ${nodes.length}…`);
      const dataUrl = await toPng(node, { width: W, height: H, pixelRatio: 2, style: { transform: 'none' } });
      const r = await fetch('/api/dev/save', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: `slide-${node.dataset.slide}.png`, dataUrl }) });
      if (!r.ok) return setStatus('Export failed — run the dev server (npm run dev).');
    }
    setStatus('Saved to deliverables/slides/. Now run: npm run deck');
  };
  return (
    <section className="wrap flex flex-col gap-6 py-10 md:py-14">
      <div className="no-print flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-2">
          <L>Growth plan · 6 slides</L>
          <h1 className="t-h2">500 registrations in 7 days, on ₹2,000.</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a href="/plan/Growth-Plan.pdf" className="t-small inline-flex min-h-12 items-center gap-2 rounded-btn border border-ink px-4 hover:bg-sunken">
            <Download size={16} /> PDF
          </a>
          {import.meta.env.DEV && <Button onClick={exportSlides}>Export slides</Button>}
        </div>
      </div>
      {status && <p className="t-small no-print text-muted">{status}</p>}
      <div className="flex flex-col gap-6">
        {SLIDES.map((S, i) => (
          <Fit key={i}>
            <S />
          </Fit>
        ))}
      </div>
    </section>
  );
}
