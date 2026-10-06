import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Highlighter, Label, Reveal, SectionHead } from '@/components/ui/primitives';
import { ReferralTracker } from '@/components/growth/Referral';
import { focusProjectInput, useJourney } from '@/hooks/useJourney';
import { useCountUp } from '@/hooks/useUtils';
import { track } from '@/lib/analytics';
import { DUR, EASE, STAGGER } from '@/lib/motion';
import { cn } from '@/lib/cn';

/* ── 04 Before / After ───────────────────────────────────────── */
const UPGRADES = ['Face recognition', 'Attendance prediction', 'AI insights', 'Anomaly detection'];

export function BeforeAfter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  return (
    <section className="section wrap" aria-labelledby="ba-title">
      <SectionHead n="02" label="Before → after" title="One idea. Four AI upgrades." id="ba-title" />
      <div ref={ref} className="mt-12 grid grid-cols-1 gap-10 border-t border-ink pt-10 md:mt-16 lg:grid-cols-12 lg:items-center lg:gap-6 lg:pt-12">
        <div className="flex flex-col gap-4 lg:col-span-4">
          <Label>Before · v1.0</Label>
          <p className="t-h1 text-faint line-through decoration-2">Smart attendance system</p>
          <p className="t-body text-muted">Students tap a sheet. Teachers export it.</p>
        </div>
        <div className="relative lg:col-span-3">
          {/* Connector draws on scroll */}
          <motion.span
            aria-hidden
            className="absolute bottom-2 left-[4px] top-2 w-px origin-top border-l border-dashed border-ink"
            initial={{ scaleY: reduce ? 1 : 0 }}
            animate={{ scaleY: inView ? 1 : reduce ? 1 : 0 }}
            transition={{ duration: DUR.transform, ease: EASE }}
          />
          <ol className="flex flex-col gap-5">
            {UPGRADES.map((u, i) => (
              <motion.li
                key={u}
                className="relative flex items-center gap-4"
                initial={{ opacity: reduce ? 1 : 0, x: reduce ? 0 : -6 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: DUR.normal, ease: EASE, delay: 0.25 + i * 0.12 }}
              >
                <span aria-hidden className="size-[9px] shrink-0 rounded-full border border-ink bg-surface" />
                <span className="t-label text-muted">0{i + 1}</span>
                <span className="text-[16px] font-medium">{u}</span>
              </motion.li>
            ))}
          </ol>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-5">
          <Label tone="ink">After · v2.0-ai</Label>
          <p className="t-h1">
            <Highlighter animate={inView} delay={700}>
              AI-Powered Attendance Intelligence
            </Highlighter>
          </p>
          <p className="t-body max-w-[42ch] text-ink-2">Cameras mark attendance. A model flags who is drifting. Reports write themselves.</p>
        </div>
      </div>
    </section>
  );
}

/* ── 05 How it works ─────────────────────────────────────────── */
const STEPS = [
  { n: '01', t: 'Type it', d: 'Tell us what you’re building. One line is enough.', viz: <span className="rounded-sm border border-line bg-surface px-2 py-1 font-mono text-[12px]">Smart parking|</span> },
  { n: '02', t: 'AI-ify it', d: 'We find the AI opportunities that genuinely fit.', viz: <span className="flex gap-1.5">{[0, 1, 2, 3].map((i) => <span key={i} className="size-2.5 rounded-full border border-ink" />)}</span> },
  { n: '03', t: 'Get your blueprint', d: 'See features, stack, difficulty and build time.', viz: <span className="flex gap-1"><span className="rounded-full bg-sunken px-2 py-0.5 font-mono text-[10px]">PYTHON</span><span className="rounded-full bg-sunken px-2 py-0.5 font-mono text-[10px]">LLM</span></span> },
  { n: '04', t: 'Build it', d: 'Join the free workshop and start building.', viz: <span className="font-mono text-[12px]">60:00 ▸ live</span> },
];

export function HowItWorks() {
  return (
    <section id="how" className="section scroll-mt-16 bg-sunken" aria-labelledby="how-title">
      <div className="wrap">
        <SectionHead n="03" label="How it works" title="Four steps. One minute." id="how-title" />
        <ol className="mt-12 grid grid-cols-1 gap-0 md:mt-16 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * STAGGER} className="flex flex-col gap-4 border-t border-ink py-6 md:py-0 md:pt-6">
              <div className="flex items-center justify-between">
                <span className="t-label text-ink">{s.n}</span>
                <span aria-hidden className="text-ink-2">
                  {s.viz}
                </span>
              </div>
              <h3 className="t-h3">{s.t}</h3>
              <p className="t-body text-ink-2">{s.d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── 06 Example projects ─────────────────────────────────────── */
const EXAMPLES = [
  ['Smart Attendance', 'AI Attendance Intelligence', 'Face recognition marks attendance; a model flags students drifting below 75%.', 'Smart attendance system'],
  ['Library Management', 'AI Research Assistant', 'Semantic search across the catalogue and an assistant that summarises papers.', 'Library management system'],
  ['Placement Portal', 'AI Interview Coach', 'Mock interviews scored by an LLM against the actual job description.', 'College placement portal'],
  ['Smart Parking', 'AI Parking Intelligence', 'Computer vision counts free spots; a model predicts the rush before it hits.', 'Smart parking system'],
  ['E-commerce', 'AI Shopping Assistant', 'Recommendations from browsing behaviour and an assistant for sizing questions.', 'E-commerce website'],
  ['Campus Navigation', 'AI Campus Guide', 'Ask “where is the CSE seminar hall?” and get directions with landmarks.', 'Campus navigation app'],
] as const;

export function Examples() {
  const run = (input: string) => {
    focusProjectInput();
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('aiify:demo-type', { detail: input })), 500);
  };
  return (
    <section className="section wrap" aria-labelledby="ex-title">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHead n="04" label="What students are AI-ifying" title="Ordinary projects. Better versions." id="ex-title" />
        <p className="t-label text-muted">Already have an idea? Start there.</p>
      </div>
      <ul className="no-scrollbar -mx-[var(--pad)] mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--pad)] pb-2 md:mx-0 md:mt-16 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-3">
        {EXAMPLES.map(([before, after, opp, input], i) => (
          <li key={before} className="w-[300px] shrink-0 snap-start md:w-auto">
            <Reveal delay={i * STAGGER} className="h-full">
              <button
                onClick={() => run(input)}
                className="group flex h-full w-full flex-col gap-4 rounded-lg border border-line bg-surface p-6 text-left transition-colors duration-[180ms] hover:border-ink"
                aria-label={`Try: ${input}`}
              >
                <span className="flex items-center gap-2 text-[15px] text-muted">
                  <span className="font-mono text-error">−</span>
                  <span className="line-through">{before}</span>
                </span>
                <span className="flex items-start gap-2">
                  <span className="pt-1 font-mono text-[14px] text-success">+</span>
                  <span className="text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] md:text-[24px]">
                    <span className="bg-[linear-gradient(var(--color-accent),var(--color-accent))] bg-[length:0%_100%] bg-no-repeat px-1 -mx-1 transition-[background-size] duration-[500ms] ease-out-expo [box-decoration-break:clone] group-hover:bg-[length:100%_100%] group-focus-visible:bg-[length:100%_100%]">
                      {after}
                    </span>
                  </span>
                </span>
                <hr className="border-line" />
                <span className="flex flex-col gap-1.5">
                  <span className="t-label text-muted">AI opportunity</span>
                  <span className="t-small text-ink-2">{opp}</span>
                </span>
                <span className="t-label mt-auto pt-2 text-ink opacity-70 transition-opacity group-hover:opacity-100">Try this one →</span>
              </button>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── 07 Workshop ─────────────────────────────────────────────── */
function Stat({ to, text, label }: { to?: number; text?: string; label: string }) {
  const c = useCountUp<HTMLSpanElement>(to ?? 0);
  return (
    <div className="flex flex-col gap-2 border-t border-dark-text/20 pt-5">
      <span ref={c.ref} className="tabular text-[56px] font-semibold leading-[0.92] tracking-[-0.05em] md:text-[80px]">
        {text ?? (to! < 10 ? c.text.padStart(2, '0') : c.text)}
      </span>
      <span className="t-label text-dark-muted">{label}</span>
    </div>
  );
}

export function Workshop() {
  const { openRegister, me } = useJourney();
  return (
    <section id="workshop" className="wrap scroll-mt-20 pb-[var(--section)]" aria-labelledby="ws-title">
      <div className="on-dark flex flex-col gap-10 rounded-hero bg-dark px-6 py-12 text-dark-text md:px-12 md:py-16 lg:px-16">
        <Label tone="dark" n="05">
          The workshop
        </Label>
        <h2 id="ws-title" className="t-h1">
          YOUR PROJECT IS READY.
          <br />
          <span className="text-dark-muted">Now let’s build.</span>
        </h2>
        <div className="grid grid-cols-3 gap-4 md:gap-6">
          <Stat to={60} label="Minutes" />
          <Stat to={1} label="AI project" />
          <Stat text="Live" label="Build" />
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="t-body max-w-[52ch] text-dark-muted">Free and online. We take one student project live from idea to a working AI feature — then you do yours.</p>
          <Button
            variant="accent"
            size="lg"
            onClick={() => {
              track('workshop_cta_clicked', { where: 'workshop' });
              if (me) window.location.assign('/me');
              else openRegister('workshop');
            }}
            className="w-full md:w-auto"
            block
          >
            {me ? 'You’re in — dashboard' : 'Reserve My Spot'}
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ── 08 Referral explainer ───────────────────────────────────── */
export function ReferralSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView || reduce) {
      if (reduce) setCount(2);
      return;
    }
    const t = window.setInterval(() => setCount((c) => (c + 1) % 4), 1600);
    return () => window.clearInterval(t);
  }, [inView, reduce]);
  return (
    <section className="section wrap" aria-labelledby="ref-title">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col gap-10 lg:col-span-5">
          <SectionHead n="06" label="Bring 3 friends" title={<>Three friends. One AI Builder Pack.</>} id="ref-title" />
          <ol>
            {['Share your link on WhatsApp or your class group.', 'Friends AI-ify their project and register.', 'At three, the AI Builder Pack unlocks. Instantly.'].map((s, i) => (
              <li key={s} className="flex gap-4 border-t border-line py-4">
                <span className="t-label pt-1 text-ink">0{i + 1}</span>
                <span className="t-body text-ink-2">{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <div ref={ref} className="lg:col-span-6 lg:col-start-7">
          <ReferralTracker count={count} example />
        </div>
      </div>
    </section>
  );
}

/* ── 10 FAQ ──────────────────────────────────────────────────── */
const FAQS: [string, string][] = [
  ['What is AI-ify My Project?', 'A free tool that turns the project you already have into a stronger AI-powered version — upgrades, tech stack, difficulty, build time and why it works.'],
  ['Who is this for?', 'Final-year engineering students who have a project (or half an idea) and want it to stand out in reviews and interviews.'],
  ['Do I need AI experience?', 'No. If you can build a basic web or Python project, you can follow along. We start from your idea, not from theory.'],
  ['Is the workshop free?', 'Yes. 60 minutes, live, online, free. No card, no catch.'],
  ['How long does it take?', 'AI-ifying takes under a minute. Registering takes under 30 seconds. The workshop is 60 minutes.'],
  ['What happens after I register?', 'You get the joining link on WhatsApp and email, plus your personal referral link and dashboard.'],
  ['How does the referral system work?', 'Share your link. Every friend who registers through it counts toward your three. Your college also climbs the AI Builders Cup.'],
  ['What do I get after 3 referrals?', 'The AI Builder Pack: 50 project ideas by branch, a prompt library, a final-year checklist, workshop resources and a digital badge.'],
];

function FaqItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(i === 0);
  const reduce = useReducedMotion();
  const id = `faq-${i}`;
  return (
    <li className="border-t border-line">
      <h3>
        <button aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className="flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left">
          <span className="text-[18px] font-medium tracking-[-0.01em] md:text-[20px]">{q}</span>
          {open ? <Minus size={18} aria-hidden /> : <Plus size={18} aria-hidden />}
        </button>
      </h3>
      <motion.div id={id} initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} transition={{ duration: reduce ? 0 : DUR.normal, ease: EASE }} className="overflow-hidden">
        <p className="t-body max-w-[60ch] pb-6 text-ink-2">{a}</p>
      </motion.div>
    </li>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="section wrap scroll-mt-16" aria-labelledby="faq-title">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-4">
          <SectionHead n="08" label="FAQ" title={<>Questions, answered.</>} id="faq-title" />
        </div>
        <ul className="border-b border-line lg:col-span-8">
          {FAQS.map(([q, a], i) => (
            <FaqItem key={q} q={q} a={a} i={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 11 Final CTA ────────────────────────────────────────────── */
export function FinalCTA() {
  const { openRegister, me } = useJourney();
  return (
    <section className="wrap py-[calc(var(--section)+16px)]" aria-labelledby="final-title">
      <span id="final-cta-start" aria-hidden />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-6">
        <Reveal className="lg:col-span-7">
          <h2 id="final-title" className="t-display">
            YOUR PROJECT
            <br />
            IS JUST
            <br />
            THE START.
          </h2>
        </Reveal>
        <div className={cn('flex flex-col gap-6 lg:col-span-5 lg:items-end')}>
          <p className="t-h2">
            <Highlighter>AI-ify it.</Highlighter>
          </p>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <Button size="lg" block className="sm:flex-1 lg:flex-none" onClick={focusProjectInput}>
              AI-ify My Project
            </Button>
            <Button
              size="lg"
              variant="secondary"
              block
              className="sm:flex-1 lg:flex-none"
              onClick={() => {
                track('workshop_cta_clicked', { where: 'final' });
                if (me) window.location.assign('/me');
                else openRegister('final');
              }}
            >
              Reserve My Spot
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
