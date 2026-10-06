import { forwardRef, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Blueprint } from '@shared/types';

/**
 * Figma: ShareCard. Laid out at 360×450 and exported at 3× → 1080×1350 (4:5),
 * the shape WhatsApp and Instagram show without cropping.
 */
export const ShareCard = forwardRef<HTMLDivElement, { bp: Blueprint; host: string }>(function ShareCard({ bp, host }, ref) {
  return (
    <div
      ref={ref}
      style={{ width: 360, height: 450 }}
      className="flex shrink-0 flex-col justify-between overflow-hidden rounded-hero bg-dark p-7 text-dark-text"
    >
      <div className="flex flex-col gap-5">
        <p className="t-label !text-[11px] text-dark-muted">I AI-ified my college project.</p>
        <div className="flex flex-col gap-2.5">
          <p className="t-label !text-[11px] text-dark-muted">Project</p>
          <p className="text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] text-ink">
            <span className="hl">{bp.projectName}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <p className="flex items-baseline gap-2">
          <span className="text-[48px] font-semibold leading-none tracking-[-0.04em]">{bp.score}</span>
          <span className="t-label !text-[11px] text-dark-muted">/ 10 AI score</span>
        </p>
        <div className="flex flex-col gap-1.5">
          <p className="t-label !text-[11px] text-dark-muted">Top upgrades</p>
          {bp.aiUpgrades.slice(0, 3).map((u, i) => (
            <p key={u.title} className="font-mono text-[14px] leading-[1.4]">
              0{i + 1}&nbsp;&nbsp;{u.title}
            </p>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[16px] font-medium">
          AI-ify yours
          <span className="grid size-7 place-items-center rounded-[6px] bg-accent text-ink">
            <ArrowRight size={14} strokeWidth={2.25} />
          </span>
        </span>
        <span className="t-label !text-[11px] text-dark-muted">{host}</span>
      </div>
    </div>
  );
});

/** Scales the fixed 360px card down on narrow screens without changing the export. */
export function ScaledShareCard({ bp, host, cardRef }: { bp: Blueprint; host: string; cardRef: React.Ref<HTMLDivElement> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / 360)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={wrap} className="w-full max-w-[360px]" style={{ height: 450 * scale }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 360 }}>
        <ShareCard ref={cardRef} bp={bp} host={host} />
      </div>
    </div>
  );
}
