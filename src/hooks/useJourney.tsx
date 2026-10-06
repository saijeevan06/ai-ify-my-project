import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Blueprint } from '@shared/types';
import { local, session } from '@/lib/storage';
import { track } from '@/lib/analytics';

export interface Me {
  code: string;
  token: string;
  firstName: string;
  college: string;
  collegeKey: string;
}

interface Journey {
  blueprint: Blueprint | null;
  setBlueprint: (bp: Blueprint | null) => void;
  me: Me | null;
  setMe: (me: Me | null) => void;
  registerOpen: boolean;
  openRegister: (from: string) => void;
  closeRegister: () => void;
  demo: boolean;
  setDemo: (on: boolean) => void;
}

const Ctx = createContext<Journey | null>(null);

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [blueprint, setBp] = useState<Blueprint | null>(() => session.get<Blueprint | null>('aiify.bp', null));
  const [me, setMeState] = useState<Me | null>(() => local.get<Me | null>('aiify.me', null));
  const [registerOpen, setRegisterOpen] = useState(false);
  const [demo, setDemoState] = useState(() => new URLSearchParams(window.location.search).has('demo') || session.get('aiify.demo', false));
  if (demo) session.set('aiify.demo', true);

  const setBlueprint = useCallback((bp: Blueprint | null) => {
    setBp(bp);
    session.set('aiify.bp', bp);
  }, []);
  const setMe = useCallback((m: Me | null) => {
    setMeState(m);
    if (m) local.set('aiify.me', m);
    else local.remove('aiify.me');
  }, []);
  const openRegister = useCallback((from: string) => {
    track('registration_started', { from }, 'registration_started');
    setRegisterOpen(true);
  }, []);
  const closeRegister = useCallback(() => setRegisterOpen(false), []);
  const setDemo = useCallback((on: boolean) => {
    setDemoState(on);
    session.set('aiify.demo', on);
  }, []);

  const value = useMemo(
    () => ({ blueprint, setBlueprint, me, setMe, registerOpen, openRegister, closeRegister, demo, setDemo }),
    [blueprint, setBlueprint, me, setMe, registerOpen, openRegister, closeRegister, demo, setDemo],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useJourney() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useJourney outside JourneyProvider');
  return v;
}

/** Bring the hero input into view and focus it — used by every “AI-ify My Project” CTA. */
export function focusProjectInput() {
  const el = document.getElementById('project-input') as HTMLInputElement | null;
  if (!el) {
    window.location.href = '/#ai-ify';
    return;
  }
  document.getElementById('ai-ify')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => el.focus({ preventScroll: true }), 350);
}
