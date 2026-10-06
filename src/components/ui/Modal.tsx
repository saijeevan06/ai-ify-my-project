import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { DUR, EASE } from '@/lib/motion';
import { useMediaQuery } from '@/hooks/useUtils';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  wide?: boolean;
}

/** Figma: Modal. Bottom sheet below 768px, centred dialog above. Focus-trapped. */
export function Modal({ open, onClose, label, children, wide }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const sheet = !useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => {
      const first = panel.current?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])');
      (first ?? panel.current)?.focus();
    }, 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !panel.current) return;
      const f = [...panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')];
      if (!f.length) return;
      const first = f[0]!;
      const last = f[f.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open, onClose]);

  const from = reduce ? { opacity: 0 } : sheet ? { y: '100%' } : { opacity: 0, y: 12 };
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
          <motion.div
            className="absolute inset-0 bg-ink/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.normal }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            initial={from}
            animate={{ opacity: 1, y: 0 }}
            exit={from}
            transition={{ duration: DUR.emphasis, ease: EASE }}
            className={cn(
              'relative z-10 max-h-[94dvh] w-full overflow-y-auto overscroll-contain bg-paper outline-none',
              'rounded-t-hero border-t border-ink md:rounded-hero md:border',
              wide ? 'md:max-w-[960px]' : 'md:max-w-[560px]',
            )}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/95 px-5 py-3 md:px-7">
              <span className="t-label text-ink">{label}</span>
              <button data-close onClick={onClose} aria-label="Close" className="grid size-11 place-items-center rounded-btn text-ink hover:bg-sunken">
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>
            <div className="px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 md:px-7 md:pb-8">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
