import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import { Download, Printer } from 'lucide-react';
import { SOURCES } from '@shared/types';
import { PATTERNS } from '@shared/patterns';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { CropMarks, Highlighter, Label, Tag } from '@/components/ui/primitives';
import { RewardCard } from '@/components/growth/Referral';
import { useJourney } from '@/hooks/useJourney';
import { copyText, displayUrl } from '@/lib/share';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/services/api';
import { cn } from '@/lib/cn';

const CHANNELS = SOURCES.filter((s) => !['referral', 'direct', 'other'].includes(s));
const origin = () => (import.meta.env.VITE_PUBLIC_URL as string | undefined)?.replace(/\/$/, '') || window.location.origin;

/** /qr — tracked campaign links + a print-ready poster per channel. */
export function QRPage() {
  const [source, setSource] = useState<string>('poster');
  const [campaign, setCampaign] = useState('');
  const [svg, setSvg] = useState('');
  const toast = useToast();
  const url = `${origin()}/?source=${source}${campaign ? `&campaign=${encodeURIComponent(campaign.trim().toLowerCase().replace(/\s+/g, '-'))}` : ''}`;

  useEffect(() => {
    QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#111111', light: '#FFFFFF' } }).then(setSvg);
  }, [url]);

  const downloadPng = async () => {
    const data = await QRCode.toDataURL(url, { width: 1200, margin: 2, color: { dark: '#111111', light: '#FFFFFF' } });
    Object.assign(document.createElement('a'), { href: data, download: `ai-ify-qr-${source}${campaign ? `-${campaign}` : ''}.png` }).click();
  };

  return (
    <section className="wrap flex flex-col gap-10 py-12 md:py-16">
      <div className="no-print flex flex-col gap-3">
        <Label>Growth tools / campaign links</Label>
        <h1 className="t-h1">One link per channel.</h1>
        <p className="t-body-lg max-w-[56ch] text-ink-2">Every channel gets its own tracked link and QR, so the admin dashboard can compare posters vs WhatsApp vs clubs.</p>
      </div>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="no-print flex flex-col gap-6 lg:col-span-5">
          <fieldset className="flex flex-col gap-3">
            <legend className="t-small mb-2 font-medium">Channel</legend>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((s) => (
                <button key={s} type="button" aria-pressed={source === s} onClick={() => setSource(s)} className={cn('min-h-11 rounded-full border px-4 text-[14px] capitalize', source === s ? 'border-ink bg-ink text-dark-text' : 'border-line bg-surface hover:bg-sunken')}>
                  {s}
                </button>
              ))}
            </div>
          </fieldset>
          <Field label="Campaign tag · optional" name="campaign" placeholder="e.g. cse-block-notice-board" value={campaign} onChange={(e) => setCampaign(e.target.value)} hint="Use one per poster location or ambassador." />
          <div className="flex flex-col gap-2">
            <Label>Tracking URL</Label>
            <code className="break-all rounded-md border border-line bg-surface p-3 font-mono text-[13px]">{url}</code>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={async () => (await copyText(url)) && toast('Link copied.')}>
              Copy link
            </Button>
            <Button variant="secondary" onClick={downloadPng} icon={<Download size={16} />}>
              QR PNG
            </Button>
            <Button onClick={() => window.print()} icon={<Printer size={16} />}>
              Print poster
            </Button>
          </div>
        </div>
        {/* Print-friendly poster (A5 portrait proportions) */}
        <div className="lg:col-span-6 lg:col-start-7">
          <article className="crop relative mx-auto flex aspect-[148/210] w-full max-w-[460px] flex-col justify-between border border-ink bg-surface p-8 print:max-w-none print:border-0">
            <CropMarks />
            <div className="flex flex-col gap-4">
              <Label>Free AI workshop · final year</Label>
              <p className="text-[44px] font-semibold leading-[0.92] tracking-[-0.05em]">
                GOT A PROJECT?
                <br />
                <Highlighter>AI-IFY IT.</Highlighter>
              </p>
              <p className="t-body text-ink-2">Scan, type your project, get an AI-powered version in seconds. Then build it live with us.</p>
            </div>
            <div className="flex items-end justify-between gap-6">
              <div className="flex flex-col gap-2">
                <Tag>60 minutes · free</Tag>
                <span className="font-mono text-[12px] text-muted">{displayUrl(origin())}</span>
              </div>
              {svg && <img className="size-36 shrink-0" alt={`QR code for ${displayUrl(url)}`} src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} />}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/** /og — renders the 1200×630 social preview; in dev, saves it to public/og.png. */
export function OgPage() {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('');
  const save = async () => {
    if (!ref.current) return;
    await document.fonts.ready;
    const dataUrl = await toPng(ref.current, { width: 1200, height: 630, pixelRatio: 1 });
    const r = await fetch('/api/dev/og', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ dataUrl }) });
    setStatus(r.ok ? 'Saved to public/og.png' : 'Save failed (dev server only)');
  };
  return (
    <div className="flex flex-col items-start gap-4 overflow-x-auto p-6">
      <div className="no-print flex items-center gap-4">
        <Button onClick={save}>Save og.png</Button>
        <span className="t-small text-muted">{status}</span>
      </div>
      <div ref={ref} style={{ width: 1200, height: 630 }} className="relative flex shrink-0 flex-col justify-between bg-paper p-16 [background-image:linear-gradient(to_right,rgb(17_17_17/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(17_17_17/0.04)_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="flex items-center justify-between">
          <span className="text-[28px] font-semibold tracking-[-0.03em]">AI-ify</span>
          <span className="t-label !text-[16px] text-muted">Free AI workshop · final-year engineers</span>
        </div>
        <div className="flex items-end justify-between gap-12">
          <p className="text-[120px] font-semibold leading-[0.9] tracking-[-0.05em]">
            GOT A PROJECT?
            <br />
            AI-IFY IT.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-[20px] border border-ink bg-surface px-8 py-6">
          <p className="flex items-center gap-4 text-[24px] text-muted">
            <span className="font-mono text-error">−</span>
            <span className="line-through">Smart parking system</span>
            <span className="t-label !text-[14px]">v1.0</span>
          </p>
          <p className="flex items-center gap-4">
            <span className="font-mono text-[24px] text-success">+</span>
            <span className="text-[40px] font-semibold tracking-[-0.03em]">
              <span className="hl">AI Smart Parking Intelligence</span>
            </span>
            <span className="t-label !text-[14px] text-ink">v2.0-ai · 9.1/10</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const PROMPTS = [
  ['Scope it', 'I am a final-year student building “{project}”. List the smallest version that still demonstrates {technique}, with the dataset I should use and how I will measure it.'],
  ['Debug it', 'Here is my error and the 30 lines around it. Explain the cause in two sentences, then give the minimal fix. Don’t rewrite unrelated code.'],
  ['Evaluate it', 'Write 10 test inputs for my {technique} feature, including 3 edge cases, and the output I should expect for each.'],
  ['Explain it', 'Explain how {technique} works in my project as if to an external examiner, in under 120 words, with one diagram described in text.'],
];
const CHECKLIST = ['One-line problem statement a non-engineer understands', 'Dataset chosen, licence checked, 100+ samples', 'Baseline without AI working end to end', 'One AI feature with a measurable metric', 'Live demo path under 2 minutes', 'Architecture diagram + README', 'Examiner Q&A: limits, ethics, next steps'];

/** /pack — the AI Builder Pack, unlocked at 3 referrals. */
export function PackPage() {
  const { me } = useJourney();
  const badge = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (!me) return setCount(0);
    api.me(me.code, me.token).then((d) => setCount(d.user.referralCount)).catch(() => setCount(0));
  }, [me]);
  if (count === null) return <div className="wrap h-[60vh]" />;
  if (count < 3) {
    return (
      <section className="wrap grid grid-cols-1 gap-10 py-16 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <Label>AI Builder Pack</Label>
          <h1 className="t-h1">Almost yours.</h1>
          <p className="t-body-lg text-ink-2">Three friends through your link unlock everything below.</p>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <RewardCard count={count} />
        </div>
      </section>
    );
  }
  const downloadBadge = async () => {
    if (!badge.current) return;
    const url = await toPng(badge.current, { pixelRatio: 3 });
    Object.assign(document.createElement('a'), { href: url, download: 'ai-builder-badge.png' }).click();
  };
  const byDifficulty = ['Beginner', 'Intermediate', 'Advanced'] as const;
  return (
    <section className="wrap flex flex-col gap-16 py-12 md:py-16">
      <div className="flex flex-col gap-4">
        <Label>Reward / AI Builder Pack</Label>
        <h1 className="t-display">
          <Highlighter animate>Unlocked.</Highlighter>
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <Label n="01" tone="ink">
            AI project ideas, by difficulty
          </Label>
          {byDifficulty.map((d) => (
            <div key={d} className="flex flex-col gap-2">
              <Tag kind={d}>{d}</Tag>
              <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                {PATTERNS.filter((p) => p.difficulty === d).map((p) => (
                  <li key={p.id} className="border-b border-line py-2.5">
                    <span className="font-medium">{p.projectName}</span>
                    <span className="t-small block text-muted">{p.upgrades.map((u) => u[2]).join(' · ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-10 lg:col-span-5">
          <div className="flex flex-col gap-3">
            <Label n="02" tone="ink">
              Prompt library
            </Label>
            {PROMPTS.map(([t, p]) => (
              <div key={t} className="rounded-md border border-line bg-surface p-4">
                <p className="font-medium">{t}</p>
                <p className="t-small mt-1 text-ink-2">{p}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <Label n="03" tone="ink">
              Final-year checklist
            </Label>
            <ul>
              {CHECKLIST.map((c) => (
                <li key={c} className="flex gap-3 border-b border-line py-2.5 text-[15px]">
                  <span aria-hidden className="mt-1 size-4 shrink-0 rounded-[3px] border border-ink" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <Label n="04" tone="ink">
              Workshop resources
            </Label>
            <p className="t-body text-ink-2">Recording, slides and the starter repo arrive on WhatsApp after the session.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Label n="05" tone="ink">
              Digital badge
            </Label>
            <div ref={badge} className="flex w-[300px] flex-col gap-6 rounded-hero bg-dark p-6 text-dark-text">
              <span className="t-label text-dark-muted">AI Builder · 2026</span>
              <span className="text-[32px] font-semibold leading-none tracking-[-0.03em]">
                <span className="hl text-ink">{me?.firstName ?? 'Builder'}</span>
              </span>
              <span className="t-small text-dark-muted">{me?.college}</span>
            </div>
            <Button variant="secondary" onClick={downloadBadge} icon={<Download size={16} />}>
              Download badge
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
