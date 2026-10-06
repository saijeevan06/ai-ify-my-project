import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DUR, EASE } from '@/lib/motion';
import { cn } from '@/lib/cn';

type Kind = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  kind: Kind;
  text: string;
}

const Ctx = createContext<(text: string, kind?: Kind) => void>(() => {});
export const useToast = () => useContext(Ctx);

/** Figma: Toast. Dark, one line, polite live region. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const n = useRef(0);
  const show = useCallback((text: string, kind: Kind = 'success') => {
    const id = ++n.current;
    setItems((l) => [...l.slice(-2), { id, kind, text }]);
    window.setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 3600);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-8">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: DUR.normal, ease: EASE }}
              className="flex items-center gap-3 rounded-md bg-dark px-4 py-3.5 text-[14px] text-dark-text"
            >
              <span aria-hidden className={cn('size-2 rounded-full', t.kind === 'success' && 'bg-success', t.kind === 'error' && 'bg-error', t.kind === 'info' && 'bg-accent')} />
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
