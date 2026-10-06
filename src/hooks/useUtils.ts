import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';

/** Count from 0 to `to` once the element is in view. */
export function useCountUp<T extends HTMLElement>(to: number, { duration = 0.9, decimals = 0 } = {}) {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const c = animate(0, to, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setValue(v) });
    return () => c.stop();
  }, [inView, to, duration, reduce]);
  return { ref, text: value.toFixed(decimals) };
}

export function useMediaQuery(q: string) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
}

/** True once the element with this id has scrolled above the viewport. */
export function useScrolledPast(id: string) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPast(!!e && !e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [id]);
  return past;
}

export function useInterval(fn: () => void, ms: number | null) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    if (ms === null) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === 'visible') saved.current();
    }, ms);
    return () => window.clearInterval(t);
  }, [ms]);
}
