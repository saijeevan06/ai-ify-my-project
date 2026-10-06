import { useRef, useState } from 'react';
import { Download, Link2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { Blueprint } from '@shared/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { useJourney } from '@/hooks/useJourney';
import { copyText, displayUrl, openWhatsApp, projectShareText, projectUrl } from '@/lib/share';
import { track } from '@/lib/analytics';
import { ScaledShareCard } from './ShareCard';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function ShareModal({ open, onClose, bp }: { open: boolean; onClose: () => void; bp: Blueprint }) {
  const { me } = useJourney();
  const toast = useToast();
  const card = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<'share' | 'download' | null>(null);
  const text = projectShareText(bp, me?.code);
  const host = displayUrl(window.location.origin);

  const render = async () => {
    if (!card.current) throw new Error('no card');
    await document.fonts.ready;
    return toPng(card.current, { pixelRatio: 3, cacheBust: true, width: 360, height: 450, style: { transform: 'none' } });
  };

  const fileFrom = async (dataUrl: string) => new File([await (await fetch(dataUrl)).blob()], `ai-ify-${slug(bp.projectName)}.png`, { type: 'image/png' });

  const shareWhatsApp = async () => {
    track('whatsapp_clicked', { where: 'share_card' });
    track('project_shared', { channel: 'whatsapp_card' });
    setBusy('share');
    try {
      // Phones: native share sheet with the image attached → pick WhatsApp.
      const file = await fileFrom(await render());
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return;
      }
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return;
    } finally {
      setBusy(null);
    }
    openWhatsApp(text);
  };

  const download = async () => {
    setBusy('download');
    try {
      const a = document.createElement('a');
      a.href = await render();
      a.download = `ai-ify-${slug(bp.projectName)}.png`;
      a.click();
      track('project_shared', { channel: 'download' });
    } catch {
      toast('Couldn’t render the card — try a screenshot instead.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    if (await copyText(projectUrl(bp, me?.code))) {
      track('project_shared', { channel: 'copy' });
      toast('Link copied. Paste it anywhere.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} label="Share this project" wide>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[360px_1fr]">
        <ScaledShareCard bp={bp} host={host} cardRef={card} />
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Label>Message preview</Label>
            <pre className="whitespace-pre-wrap rounded-md border border-line bg-surface p-4 font-sans text-[14px] leading-[1.5] text-ink-2">{text}</pre>
          </div>
          <div className="flex flex-col gap-3">
            <Button size="lg" block onClick={shareWhatsApp} loading={busy === 'share'} loadingText="Preparing card…">
              Share on WhatsApp
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" block onClick={download} loading={busy === 'download'} loadingText="Rendering…" icon={<Download size={16} />}>
                Download
              </Button>
              <Button variant="secondary" block onClick={copy} icon={<Link2 size={16} />}>
                Copy link
              </Button>
            </div>
            <p className="t-small text-muted">On your phone, the card attaches to the WhatsApp message. On a laptop, download it and drop it in the chat.</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
