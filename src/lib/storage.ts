/** Storage that never throws (private mode, blocked cookies, SSR-less previews). */
function safe(kind: 'local' | 'session') {
  const get = () => {
    try {
      return kind === 'local' ? window.localStorage : window.sessionStorage;
    } catch {
      return null;
    }
  };
  return {
    get<T>(key: string, fallback: T): T {
      try {
        const v = get()?.getItem(key);
        return v ? (JSON.parse(v) as T) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key: string, value: unknown) {
      try {
        get()?.setItem(key, JSON.stringify(value));
      } catch {
        /* ignore */
      }
    },
    remove(key: string) {
      try {
        get()?.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}
export const local = safe('local');
export const session = safe('session');
