import { motion, useReducedMotion } from 'motion/react';
import { Check, Download, Lock } from 'lucide-react';
import { REWARD_AT } from '@shared/input';
import type { PublicUser } from '@shared/types';
import { Button } from '@/components/ui/Button';
import { Highlighter, Label, Tag } from '@/components/ui/primitives';
import { DUR, EASE } from '@/lib/motion';
import { cn } from '@/lib/cn';

export const TRACKER_COPY = ['Your first referral is waiting.', 'Nice. One friend joined.', 'Almost there. One more friend.', 'Unlocked.'] as const;

/** Figma: ReferralTracker (Count=0…3). Segments fill with highlighter, 500ms. */
export function ReferralTracker({ count, example, className }: { count: number; example?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const c = Math.min(count, REWARD_AT);
  return (
    <section className={cn('flex flex-col gap-6 rounded-hero border bg-surface p-6 md:p-8', c >= REWARD_AT ? 'border-ink' : 'border-line', className)} aria-label="Referral progress">
      <div className="flex items-center justify-between gap-3">
        <Label n="03">{example ? 'Referrals · example' : 'Referrals'}</Label>
        {c >= REWARD_AT ? <Tag kind="status">Unlocked</Tag> : <Tag kind="locked">AI Builder Pack · locked</Tag>}
      </div>
      <p className="flex items-baseline gap-3" aria-live="polite">
        <motion.span key={c} initial={{ opacity: 0, y: reduce ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR.normal, ease: EASE }} className="tabular text-[48px] font-semibold leading-none tracking-[-0.04em] md:text-[56px]">
          {c} / {REWARD_AT}
        </motion.span>
        <span className="t-label text-ink">friends</span>
      </p>
      <div className="flex gap-2" role="progressbar" aria-valuemin={0} aria-valuemax={REWARD_AT} aria-valuenow={c}>
        {Array.from({ length: REWARD_AT }, (_, i) => (
          <span key={i} className="relative h-2 flex-1 overflow-hidden rounded-full bg-sunken">
            <motion.span
              className="absolute inset-0 origin-left rounded-full border border-ink bg-accent"
              initial={false}
              animate={{ scaleX: i < c ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : DUR.emphasis, ease: EASE, delay: reduce ? 0 : i * 0.08 }}
            />
          </span>
        ))}
      </div>
      <p className="text-[20px] font-medium tracking-[-0.01em]">{TRACKER_COPY[c]}</p>
    </section>
  );
}

/** Figma: ReferralStep (Waiting / Joined). */
export function ReferralSteps({ friends }: { friends: PublicUser['friends'] }) {
  return (
    <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {Array.from({ length: REWARD_AT }, (_, i) => {
        const f = friends[i];
        return (
          <li key={i} className={cn('flex items-center gap-3 rounded-md p-3 pr-4', f ? 'border border-line bg-surface' : 'bg-sunken')}>
            <span className={cn('grid size-8 shrink-0 place-items-center rounded-full border font-mono text-[12px]', f ? 'border-ink bg-accent' : 'border-line bg-surface')}>
              {f ? <Check size={14} strokeWidth={2.25} /> : `0${i + 1}`}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-medium">{f ? `${f.firstName} joined` : `Friend 0${i + 1}`}</span>
              <span className="block text-[12px] text-muted">{f ? timeAgo(f.joinedAt) : 'Waiting for a friend'}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function timeAgo(iso: string) {
  const s = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
}

export const PACK = [
  ['50 AI project ideas, sorted by branch', 'ideas'],
  ['Prompt library for building & debugging', 'prompts'],
  ['Final-year project checklist', 'checklist'],
  ['Workshop recordings & starter repo', 'resources'],
  ['AI Builder digital badge', 'badge'],
] as const;

/** Figma: RewardCard (Locked / Unlocked). */
export function RewardCard({ count, onOpen }: { count: number; onOpen?: () => void }) {
  const unlocked = count >= REWARD_AT;
  const left = REWARD_AT - count;
  return (
    <section className={cn('flex flex-col gap-5 rounded-hero border bg-surface p-6 md:p-8', unlocked ? 'border-ink' : 'border-line')} aria-label="AI Builder Pack">
      <div className="flex items-center justify-between gap-3">
        <Label tone={unlocked ? 'ink' : 'muted'}>Reward / AI Builder Pack</Label>
        {unlocked ? <Tag kind="status">Unlocked</Tag> : <Tag kind="locked">{left === 1 ? '1 friend to go' : `${left} friends to go`}</Tag>}
      </div>
      {unlocked ? (
        <h3 className="t-h2">
          <Highlighter animate delay={200}>
            You unlocked it.
          </Highlighter>
        </h3>
      ) : (
        <h3 className="t-h3">Bring {REWARD_AT} friends. Get the pack.</h3>
      )}
      <ul>
        {PACK.map(([item], i) => (
          <li key={item} className="flex items-center gap-4 border-t border-line py-3">
            <span className="t-label tabular text-muted">0{i + 1}</span>
            <span className={cn('flex-1 text-[15px] md:text-[16px]', unlocked ? 'text-ink' : 'text-muted')}>{item}</span>
            {!unlocked && <Lock size={14} className="text-faint" aria-hidden />}
          </li>
        ))}
      </ul>
      {unlocked && onOpen && (
        <Button size="lg" block onClick={onOpen} icon={<Download size={16} />}>
          Open your pack
        </Button>
      )}
    </section>
  );
}
