import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/primitives';
import { focusProjectInput, useJourney } from '@/hooks/useJourney';
import { useScrolledPast } from '@/hooks/useUtils';
import { DUR, EASE } from '@/lib/motion';
import { cn } from '@/lib/cn';

const LINKS = [
  ['How it works', '/#how'],
  ['Leaderboard', '/#leaderboard'],
  ['Workshop', '/#workshop'],
] as const;

function useGoToAiify() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return () => {
    if (pathname === '/') focusProjectInput();
    else {
      navigate('/');
      window.setTimeout(focusProjectInput, 120);
    }
  };
}

/** Figma: Navbar — 72px desktop / 64px mobile. */
export function Navbar() {
  const { me } = useJourney();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const go = useGoToAiify();
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={cn('sticky top-0 z-40 border-b bg-paper/95 transition-colors duration-[300ms]', scrolled ? 'border-line' : 'border-transparent')}>
      <nav className="wrap flex h-16 items-center justify-between gap-4 lg:h-[72px]" aria-label="Main">
        <Link to="/" className="flex items-baseline gap-2 whitespace-nowrap rounded-sm" aria-label="AI-ify My Project — home">
          <span className="text-[20px] font-semibold tracking-[-0.03em]">AI-ify</span>
          <span className="t-label hidden text-muted sm:inline">/ my project</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map(([l, h]) => (
            <a key={l} href={h} className="text-[14px] text-ink-2 underline-offset-4 hover:text-ink hover:underline">
              {l}
            </a>
          ))}
          {me && (
            <Link to="/me" className="text-[14px] text-ink-2 underline-offset-4 hover:text-ink hover:underline">
              Dashboard
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:block">
            <Button onClick={go}>AI-ify My Project</Button>
          </span>
          <span className="md:hidden">
            <Button onClick={go}>AI-ify</Button>
          </span>
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label="Menu" className="grid size-12 place-items-center rounded-btn border border-line md:hidden">
            {open ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DUR.normal, ease: EASE }}
            className="overflow-hidden border-t border-line bg-paper md:hidden"
          >
            <ul className="wrap flex flex-col py-2">
              {[...LINKS, ...(me ? ([['Your dashboard', '/me']] as const) : [])].map(([l, h], i) => (
                <li key={l}>
                  <a href={h} onClick={() => setOpen(false)} className="flex min-h-14 items-center justify-between border-b border-line text-[20px] font-medium tracking-[-0.02em] last:border-0">
                    {l}
                    <span className="t-label text-muted">0{i + 1}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/** Mobile-only bottom CTA, after the hero has left the viewport. */
export function StickyCTA() {
  const { blueprint, me, registerOpen, openRegister } = useJourney();
  const past = useScrolledPast('hero-end');
  const nearEnd = useScrolledPast('final-cta-start');
  const go = useGoToAiify();
  const navigate = useNavigate();
  const show = past && !nearEnd && !registerOpen;
  const label = me ? 'Your dashboard' : blueprint ? 'Reserve My Spot' : 'AI-ify My Project';
  const act = () => (me ? navigate('/me') : blueprint ? openRegister('sticky') : go());
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          exit={{ y: '110%' }}
          transition={{ duration: DUR.normal, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 md:hidden"
        >
          <Button size="lg" block onClick={act}>
            {label}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="wrap flex flex-col gap-12 pb-28 pt-16 md:pb-10 lg:pt-20">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="flex flex-col gap-2">
            <p className="t-h3 font-semibold">AI-ify My Project</p>
            <p className="t-body text-ink-2">
              Build smarter. <br className="sm:hidden" />
              Start with what you already know.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-[14px] text-ink-2 sm:flex sm:flex-wrap">
            {[...LINKS, ['FAQ', '/#faq'], ['Privacy', '/privacy']].map(([l, h]) => (
              <li key={l}>
                <a href={h} className="underline-offset-4 hover:text-ink hover:underline">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between gap-2 border-t border-line pt-6 sm:flex-row">
          <Label>© 2026 AI-ify · Free AI workshop for final-year engineers</Label>
          <Label>Your project stays yours.</Label>
        </div>
      </div>
    </footer>
  );
}

