import { useEffect, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { Difficulty } from '@shared/types';
import { cn } from '@/lib/cn';
import { DUR, EASE, RISE } from '@/lib/motion';

type TagKind = 'tech' | 'concept' | 'status' | 'you' | 'locked' | Difficulty;
const dot: Partial<Record<TagKind, string>> = { Beginner: 'bg-success', Intermediate: 'bg-warning', Advanced: 'bg-error', status: 'bg-success' };

/** Figma: Tag. The only pill-shaped element in the system. */
export function Tag({ kind = 'tech', children, className }: { kind?: TagKind; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        't-label inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-[5px] text-ink',
        kind === 'tech' && 'bg-sunken',
        (kind === 'concept' || kind in dot) && 'border border-line bg-surface',
        kind === 'status' && '!border-ink',
        kind === 'you' && 'border border-ink bg-accent',
        kind === 'locked' && 'bg-sunken !text-muted',
        className,
      )}
    >
      {dot[kind] && <span aria-hidden className={cn('size-1.5 rounded-full', dot[kind])} />}
      {children}
    </span>
  );
}

/** Mono annotation label — “[01] / Your project”. */
export function Label({ n, children, className, as: As = 'p', tone = 'muted' }: { n?: string; children: ReactNode; className?: string; as?: 'p' | 'span' | 'h2' | 'h3' | 'div'; tone?: 'muted' | 'ink' | 'dark' }) {
  return (
    <As className={cn('t-label', tone === 'muted' && 'text-muted', tone === 'ink' && 'text-ink', tone === 'dark' && 'text-dark-muted', className)}>
      {n && <span>[{n}] / </span>}
      {children}
    </As>
  );
}

/**
 * Signature device: a highlighter swipe behind ink — never gradient text.
 * `animate` swipes it in (500ms) once, after `delay`.
 */
export function Highlighter({ children, animate = false, delay = 0, className }: { children: ReactNode; animate?: boolean; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  const [on, setOn] = useState(!animate || !!reduce);
  useEffect(() => {
    if (!animate || reduce) return;
    const t = window.setTimeout(() => setOn(true), delay);
    return () => window.clearTimeout(t);
  }, [animate, delay, reduce]);
  return (
    <span className={cn('hl', animate && 'hl-animate', className)} data-on={on}>
      {children}
    </span>
  );
}

/** Print registration corners. Parent needs the `crop` class. */
export function CropMarks() {
  return (
    <>
      <span aria-hidden className="crop-mark crop-tl" />
      <span aria-hidden className="crop-mark crop-tr" />
      <span aria-hidden className="crop-mark crop-bl" />
      <span aria-hidden className="crop-mark crop-br" />
    </>
  );
}

/** Section-level reveal: 12px rise + fade, once. Reduced motion: fade only. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : RISE }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduce ? DUR.fast : DUR.normal, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Section header: mono label + H2. */
export function SectionHead({ n, label, title, sub, dark, className, id }: { n: string; label: string; title: ReactNode; sub?: ReactNode; dark?: boolean; className?: string; id?: string }) {
  return (
    <Reveal className={cn('flex flex-col gap-4', className)}>
      <Label n={n} tone={dark ? 'dark' : 'muted'}>
        {label}
      </Label>
      <h2 id={id} className={cn('t-h2 max-w-[18ch]', dark && 'text-dark-text')}>
        {title}
      </h2>
      {sub && <p className={cn('t-body-lg max-w-[44ch]', dark ? 'text-dark-muted' : 'text-ink-2')}>{sub}</p>}
    </Reveal>
  );
}
