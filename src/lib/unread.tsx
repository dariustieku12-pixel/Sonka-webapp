// Background poll for unread chat messages. Exposes a single number
// via context so the bottom tab bar can show a red dot on Messages.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from './api';
import { useAuth } from './auth';

const UnreadContext = createContext<number>(0);

export function UnreadProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }
    let alive = true;
    const tick = async () => {
      try {
        const res = await api.get('/chat/conversations');
        if (!alive) return;
        const total = (res.data.conversations || []).reduce(
          (n: number, c: { unread?: number }) => n + (c.unread || 0),
          0
        );
        setCount(total);
      } catch {
        /* keep last known */
      }
    };
    tick();
    const t = window.setInterval(tick, 30000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, [user]);

  return <UnreadContext.Provider value={count}>{children}</UnreadContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUnreadCount(): number {
  return useContext(UnreadContext);
}
