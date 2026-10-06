import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';
import { projectInputProblem } from '@shared/input';
import { patternOrInvalid } from '@shared/matcher';
import type { Blueprint } from '@shared/types';
import { api, ApiError } from '@/services/api';
import { track } from '@/lib/analytics';
import { useJourney } from '@/hooks/useJourney';
import { Button } from '@/components/ui/Button';
import { CropMarks, Label } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { DUR, EASE } from '@/lib/motion';
import { cn } from '@/lib/cn';

type Phase = 'idle' | 'reading' | 'finding' | 'building' | 'ready';
const STEPS = ['Reading your project', 'Finding AI opportunities', 'Building your upgrade', 'Your project is ready'] as const;
const PHASE_STEP: Record<Phase, number> = { idle: 0, reading: 1, finding: 2, building: 3, ready: 4 };
const PROGRESS: Record<Phase, number> = { idle: 0, reading: 0.22, finding: 0.58, building: 0.86, ready: 1 };

export const SUGGESTIONS = ['Smart attendance system', 'E-commerce website', 'College placement portal', 'Smart parking system'];

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

/** Figma: ProjectInput + ProjectSuggestion + AIifyLoader. The signature interaction. */
export function Aiifier({ onResult }: { onResult: (bp: Blueprint) => void }) {
  const { demo } = useJourney();
  const toast = useToast();
  const reduce = useReducedMotion();
  const [value, setValue] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [litWords, setLitWords] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = phase !== 'idle';
  const started = useRef(false);

  const markStarted = (via: string) => {
    if (started.current) return;
    started.current = true;
    track('project_input_started', { via });
  };

  const run = useCallback(
    async (raw: string, opts: { demo?: boolean } = {}) => {
      const text = raw.trim();
      const problem = projectInputProblem(text);
      if (problem) {
        setError(problem);
        inputRef.current?.focus();
        return;
      }
      setError(null);
      setPhase('reading');
      setLitWords(0);
      const t0 = performance.now();
      const request = api.aiify(text, { demo: opts.demo || demo }).catch((e: unknown) => e);
      // Underline the student's own words one by one — we're reading *their* project.
      const words = text.split(/\s+/).length;
      for (let i = 1; i <= words; i++) window.setTimeout(() => setLitWords(i), reduce ? 0 : 140 * i);
      await wait(reduce ? 300 : 750);
      setPhase('finding');
      const res = await request;
      const elapsed = performance.now() - t0;
      if (elapsed < 1600) await wait(1600 - elapsed);

      let bp: Blueprint | null = null;
      if (res instanceof ApiError && (res.status === 400 || res.status === 422)) {
        setPhase('idle');
        setError(res.message);
        inputRef.current?.focus();
        return;
      } else if (res instanceof Error) {
        // Never show model/API errors. The pattern library always has an upgrade.
        bp = patternOrInvalid(text);
        toast('We’ve got an upgrade for you.', 'info');
      } else {
        bp = res as Blueprint;
      }
      if (!bp) {
        setPhase('idle');
        setError('That doesn’t look like a project yet. Try something like “smart parking system”.');
        return;
      }
      setPhase('building');
      await wait(reduce ? 200 : 650);
      setPhase('ready');
      await wait(reduce ? 150 : 450);
      track('project_generated', { source: bp.source, pattern: bp.patternId ?? null, score: bp.score });
      setPhase('idle');
      onResult(bp);
    },
    [demo, onResult, reduce, toast],
  );

  // Demo mode: the DemoBar types into the input like a person would.
  useEffect(() => {
    const onDemo = async (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      document.getElementById('ai-ify')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      markStarted('demo');
      setValue('');
      for (let i = 1; i <= text.length; i++) {
        await wait(reduce ? 0 : 45);
        setValue(text.slice(0, i));
      }
      await wait(250);
      run(text, { demo: true });
    };
    window.addEventListener('aiify:demo-type', onDemo);
    return () => window.removeEventListener('aiify:demo-type', onDemo);
  }, [run, reduce]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!busy) run(value);
  };

  const pick = (s: string) => {
    if (busy) return;
    markStarted('suggestion');
    setValue(s);
    run(s);
  };

  const step = PHASE_STEP[phase];
  const labelText = busy ? STEPS[step - 1] : 'Your project';
  const words = value.trim().split(/\s+/);

  return (
    <div id="ai-ify" className="flex flex-col gap-4">
      <form
        onSubmit={submit}
        className={cn(
          'crop relative rounded-hero border bg-surface transition-[border-color,box-shadow] duration-[180ms]',
          error ? 'border-error' : busy ? 'border-ink' : 'border-line focus-within:border-ink focus-within:shadow-[0_0_0_1px_#111]',
        )}
        aria-busy={busy}
      >
        <CropMarks />
        <div className="flex items-center justify-between px-5 pt-5 md:px-6 md:pt-6">
          <label htmlFor="project-input">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={labelText}
                className="block"
                initial={{ opacity: 0, y: reduce ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -4 }}
                transition={{ duration: DUR.fast }}
              >
                <Label n={busy ? String(step).padStart(2, '0') : '01'} tone={busy ? 'ink' : 'muted'} as="span">
                  {labelText}
                </Label>
              </motion.span>
            </AnimatePresence>
          </label>
          {busy && <span className="t-label tabular text-muted">{String(step).padStart(2, '0')} / 04</span>}
        </div>

        <div className="px-5 pb-1 pt-3 md:px-6">
          {busy ? (
            <p className="min-h-[44px] text-[22px] font-medium leading-[1.25] tracking-[-0.02em] text-ink md:text-[28px]" aria-live="polite">
              {words.map((w, i) => (
                <span key={i}>
                  <span className="kw" data-on={i < litWords}>
                    {w}
                  </span>{' '}
                </span>
              ))}
            </p>
          ) : (
            <input
              ref={inputRef}
              id="project-input"
              name="project"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
                markStarted('typing');
              }}
              placeholder="Describe your project…"
              autoComplete="off"
              enterKeyHint="go"
              maxLength={140}
              aria-invalid={!!error || undefined}
              aria-describedby="project-help"
              className="min-h-[44px] w-full bg-transparent text-[22px] leading-[1.25] tracking-[-0.02em] text-ink outline-none placeholder:text-faint focus-visible:outline-none md:text-[28px]"
            />
          )}
        </div>

        <AnimatePresence initial={false}>
          {busy && (
            <motion.ol
              key="steps"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduce ? DUR.fast : DUR.emphasis, ease: EASE }}
              className="overflow-hidden px-5 md:px-6"
              aria-label="Progress"
            >
              {STEPS.map((s, i) => {
                const n = i + 1;
                const done = n < step || phase === 'ready';
                const cur = n === step && phase !== 'ready';
                return (
                  <li key={s} className="flex items-center gap-4 border-t border-line py-3 first:mt-3">
                    <span className={cn('t-label tabular', done || cur ? 'text-ink' : 'text-faint')}>{String(n).padStart(2, '0')}</span>
                    <span className={cn('flex-1 text-[16px] md:text-[18px]', cur ? 'font-medium text-ink' : done ? 'text-ink-2' : 'text-faint')}>{s}</span>
                    <span className="t-label w-16 text-right text-muted">
                      {done ? (
                        <Check size={16} className="ml-auto text-ink" aria-label="done" />
                      ) : cur ? (
                        <motion.span animate={reduce ? undefined : { opacity: [1, 0.35, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-ink">
                          Working
                        </motion.span>
                      ) : (
                        '—'
                      )}
                    </span>
                  </li>
                );
              })}
            </motion.ol>
          )}
        </AnimatePresence>

        <div className={cn('flex flex-col gap-3 px-5 pb-5 pt-4 md:flex-row md:items-center md:justify-between md:px-6 md:pb-6', busy && 'hidden')}>
          <p id="project-help" className={cn('t-small', error ? 'text-error' : 'text-muted')} role={error ? 'alert' : undefined}>
            {error ?? 'Free · takes less than a minute'}
          </p>
          <Button type="submit" size="lg" className="w-full md:w-auto" block={false} disabled={!value.trim()}>
            AI-ify My Project
          </Button>
        </div>

        {/* 2px progress line along the card's bottom edge */}
        <div aria-hidden className="absolute inset-x-5 bottom-0 h-[2px] overflow-hidden md:inset-x-6">
          <motion.div
            className="h-full origin-left bg-ink"
            initial={false}
            animate={{ scaleX: PROGRESS[phase] }}
            transition={{ duration: phase === 'idle' ? 0 : reduce ? DUR.fast : 0.7, ease: EASE }}
          />
        </div>
      </form>

      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <span className="t-label shrink-0 text-muted md:pt-[15px]">Try →</span>
        <ul className="no-scrollbar -mx-[var(--pad)] flex gap-2 overflow-x-auto px-[var(--pad)] md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          {SUGGESTIONS.map((s) => (
            <li key={s} className="shrink-0">
              <button
                type="button"
                onClick={() => pick(s)}
                disabled={busy}
                className={cn(
                  'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[14px] transition-colors duration-[180ms]',
                  value === s && busy ? 'border-ink bg-ink text-dark-text' : 'border-line bg-surface text-ink hover:bg-sunken',
                )}
              >
                <span aria-hidden className={cn('font-mono', value === s && busy ? 'text-accent' : 'text-muted')}>
                  +
                </span>
                {s}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
