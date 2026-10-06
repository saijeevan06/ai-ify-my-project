import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Play, X } from 'lucide-react';
import { useJourney } from '@/hooks/useJourney';
import { local, session } from '@/lib/storage';
import { cn } from '@/lib/cn';

/**
 * Presenter controls for the 2-minute demo (open the site with ?demo=1).
 * Every step drives the real UI — nothing is faked except the friends.
 */
export function DemoBar() {
  const { demo, setDemo, me, blueprint, openRegister, setMe, setBlueprint } = useJourney();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [min, setMin] = useState(() => window.innerWidth < 768);
  if (!demo) return null;

  const steps: { label: string; done: boolean; run: () => void }[] = [
    {
      label: 'AI-ify “Smart parking system”',
      done: !!blueprint,
      run: () => {
        if (pathname !== '/') navigate('/');
        window.setTimeout(() => window.dispatchEvent(new CustomEvent('aiify:demo-type', { detail: 'Smart parking system' })), pathname === '/' ? 0 : 300);
      },
    },
    {
      label: 'Register as a student',
      done: !!me,
      run: () => {
        if (pathname !== '/') navigate('/');
        openRegister('demo');
        window.setTimeout(() => window.dispatchEvent(new Event('aiify:demo-fill')), 50);
      },
    },
    {
      label: 'A friend joins (×3)',
      done: false,
      run: () => {
        if (pathname !== '/me') navigate('/me');
        window.setTimeout(() => window.dispatchEvent(new Event('aiify:demo-referral')), 200);
      },
    },
  ];

  const reset = () => {
    setMe(null);
    setBlueprint(null);
    local.remove('aiify.attr');
    session.remove('aiify.bp');
    navigate('/?demo=1');
    window.scrollTo({ top: 0 });
  };

  return (
    <aside className={cn("no-print fixed bottom-24 right-3 z-40 rounded-lg", min ? "w-auto" : "w-[min(280px,calc(100vw-24px))]", " border border-ink bg-surface text-ink shadow-key md:bottom-6 md:right-6")} aria-label="Demo controls">
      <div className={cn("flex items-center justify-between gap-3 px-4 py-2", !min && "border-b border-line")}>
        <button className="t-label text-ink" onClick={() => setMin((m) => !m)} aria-expanded={!min}>
          Demo mode {min ? '+' : '−'}
        </button>
        <button onClick={() => setDemo(false)} aria-label="Exit demo mode" className="grid size-8 place-items-center rounded-sm hover:bg-sunken">
          <X size={14} />
        </button>
      </div>
      {!min && (
        <ol className="flex flex-col p-2">
          {steps.map((s, i) => (
            <li key={s.label}>
              <button onClick={s.run} className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-[14px] hover:bg-sunken">
                <span className={cn('grid size-6 place-items-center rounded-full border font-mono text-[11px]', s.done ? 'border-ink bg-accent' : 'border-line')}>{i + 1}</span>
                <span className="flex-1">{s.label}</span>
                <Play size={12} aria-hidden />
              </button>
            </li>
          ))}
          <li>
            <button onClick={reset} className="t-label w-full px-2 py-2 text-left text-muted hover:text-ink">
              Reset journey
            </button>
          </li>
        </ol>
      )}
    </aside>
  );
}
