import { lazy, Suspense, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ImageIcon, Link2, MessageCircle } from 'lucide-react';
import type { Blueprint } from '@shared/types';
import { Button } from '@/components/ui/Button';
import { CropMarks, Highlighter, Label, Tag } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { useCountUp } from '@/hooks/useUtils';
import { useJourney } from '@/hooks/useJourney';
import { copyText, openWhatsApp, projectShareText, projectUrl } from '@/lib/share';
import { track } from '@/lib/analytics';
import { DUR, EASE, STAGGER } from '@/lib/motion';
const ShareModal = lazy(() => import('./ShareModal').then((m) => ({ default: m.ShareModal })));

/** Figma: Score — ten-segment meter, the partial segment in highlighter. */
export function Score({ value, compact }: { value: number; compact?: boolean }) {
  const { ref, text } = useCountUp<HTMLDivElement>(value, { decimals: 1 });
  return (
    <div ref={ref} className="flex flex-col gap-3">
      <Label n="06">AI project potential</Label>
      <p className="flex items-baseline gap-1.5">
        <span className={compact ? 't-h1 tabular' : 'tabular text-[48px] font-semibold leading-none tracking-[-0.04em] lg:text-[56px]'}>{text}</span>
        <span className="font-mono text-[16px] text-muted">/ 10</span>
      </p>
      <div className="flex gap-1" role="img" aria-label={`${value} out of 10`}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={i < Math.floor(value) ? 'h-2 flex-1 rounded-[1px] bg-ink' : i < value ? 'h-2 flex-1 rounded-[1px] bg-accent ring-1 ring-ink ring-inset' : 'h-2 flex-1 rounded-[1px] bg-sunken'} />
        ))}
      </div>
    </div>
  );
}

/** Figma: FeatureRow. */
function FeatureRow({ i, title, description, concept }: { i: number; title: string; description: string; concept: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.li
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.normal, ease: EASE, delay: 0.35 + i * STAGGER }}
      className="grid grid-cols-[28px_1fr] gap-x-3 gap-y-2 border-t border-line py-5 md:grid-cols-[40px_1fr_auto] md:gap-x-6"
    >
      <span className="t-label tabular pt-1.5 text-muted">{String(i + 1).padStart(2, '0')}</span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h4 className="text-[18px] font-medium leading-[1.3] tracking-[-0.01em] md:text-[20px]">{title}</h4>
        <p className="t-small text-ink-2 md:text-[16px] md:leading-[1.55]">{description}</p>
      </div>
      <div className="col-start-2 md:col-start-3 md:pt-1">
        <Tag kind="concept">{concept}</Tag>
      </div>
    </motion.li>
  );
}

interface Props {
  bp: Blueprint;
  /** "shared" = someone else's project (no share row, CTA to try their own). */
  mode?: 'own' | 'shared';
  onReserve?: () => void;
  onTryYours?: () => void;
}

/** Figma: ProjectResult. A project blueprint, not a chat transcript. */
export function ProjectResult({ bp, mode = 'own', onReserve, onTryYours }: Props) {
  const { me } = useJourney();
  const toast = useToast();
  const reduce = useReducedMotion();
  const [shareOpen, setShareOpen] = useState(false);
  const code = me?.code;

  const shareWhatsApp = () => {
    track('whatsapp_clicked', { where: 'result' });
    track('project_shared', { channel: 'whatsapp' });
    openWhatsApp(projectShareText(bp, code));
  };
  const copyLink = async () => {
    if (await copyText(projectUrl(bp, code))) {
      track('project_shared', { channel: 'copy' });
      toast('Link copied. Paste it anywhere.');
    }
  };

  return (
    <article className="crop relative rounded-hero border border-ink bg-surface px-5 py-6 md:px-10 md:py-10" aria-labelledby="bp-title">
      <CropMarks />
      <header className="flex flex-wrap items-center justify-between gap-2">
        <Label tone="ink">{mode === 'shared' ? 'Shared blueprint' : 'AI-ify result / 01'}</Label>
        <Label>v1.0 → v2.0-ai{bp.source === 'ai' ? ' · generated' : ''}</Label>
      </header>

      {/* The diff: transformation as a version bump */}
      <div className="mt-6 flex flex-col gap-3 md:mt-8">
        <motion.p
          className="flex items-center gap-3 text-[16px] text-muted md:gap-4 md:text-[20px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.fast }}
        >
          <span aria-hidden className="font-mono text-[14px] text-error md:text-[16px]">
            −
          </span>
          <span className="line-through decoration-1">{bp.original}</span>
          <span className="sr-only">became</span>
        </motion.p>
        <motion.h3
          id="bp-title"
          className="flex items-start gap-3 md:gap-4"
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.emphasis, ease: EASE, delay: 0.1 }}
        >
          <span aria-hidden className="pt-2 font-mono text-[14px] text-success md:pt-4 md:text-[16px]">
            +
          </span>
          <span className="t-h2 lg:!text-[56px] lg:!leading-none lg:!tracking-[-0.035em]">
            <Highlighter animate delay={350}>
              {bp.projectName}
            </Highlighter>
          </span>
        </motion.h3>
      </div>

      <p className="t-body-lg mt-5 max-w-[56ch] text-ink-2 md:mt-6">{bp.summary}</p>

      <div className="mt-8 grid grid-cols-1 gap-10 md:mt-10 lg:grid-cols-12 lg:gap-6">
        <section className="lg:col-span-8" aria-label="AI upgrades">
          <Label n="02" className="pb-3">
            AI upgrades
          </Label>
          <ol>
            {bp.aiUpgrades.map((u, i) => (
              <FeatureRow key={u.title} i={i} {...u} />
            ))}
          </ol>
        </section>
        <aside className="grid grid-cols-2 gap-x-4 gap-y-8 lg:col-span-4 lg:col-start-9 lg:flex lg:flex-col lg:gap-7">
          <div className="col-span-2 flex flex-col gap-3">
            <Label n="03">Tech stack</Label>
            <ul className="flex flex-wrap gap-2">
              {bp.techStack.map((t) => (
                <li key={t}>
                  <Tag>{t}</Tag>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <Label n="04">Difficulty</Label>
            <div>
              <Tag kind={bp.difficulty}>{bp.difficulty}</Tag>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label n="05">Build time</Label>
            <p className="t-h3">{bp.estimatedTime}</p>
          </div>
          <div className="col-span-2">
            <Score value={bp.score} />
          </div>
        </aside>
      </div>

      <section className="mt-10 flex max-w-[68ch] flex-col gap-3" aria-label="Why this works">
        <Label n="07">Why this works</Label>
        <p className="t-body text-ink-2">{bp.whyItWorks}</p>
      </section>

      <footer className="mt-10 flex flex-col gap-6 border-t border-line pt-6 md:flex-row md:items-end md:justify-between">
        {mode === 'own' ? (
          <>
            <div className="flex flex-col gap-3">
              <Label>Share this project</Label>
              <div className="grid grid-cols-2 gap-3 sm:flex">
                <Button variant="secondary" onClick={shareWhatsApp} icon={<MessageCircle size={16} />}>
                  WhatsApp
                </Button>
                <Button variant="secondary" onClick={copyLink} icon={<Link2 size={16} />}>
                  Copy link
                </Button>
                <Button variant="secondary" className="col-span-2" block onClick={() => setShareOpen(true)} icon={<ImageIcon size={16} />}>
                  Share card
                </Button>
              </div>
            </div>
            {onReserve && (
              <Button size="lg" onClick={onReserve} className="w-full md:w-auto" block>
                Reserve My Spot
              </Button>
            )}
          </>
        ) : (
          <>
            <p className="t-body text-ink-2">What would yours become?</p>
            <Button size="lg" onClick={onTryYours} className="w-full md:w-auto" block>
              AI-ify yours
            </Button>
          </>
        )}
      </footer>
      {mode === 'own' && shareOpen && (
        <Suspense fallback={null}>
          <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} bp={bp} />
        </Suspense>
      )}
    </article>
  );
}
