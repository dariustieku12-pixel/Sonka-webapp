// Auth context — holds the logged-in user and JWT, persists to localStorage.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from './api';
import { TOKEN_KEY, USER_KEY } from './constants';
import type { User } from './types';

interface AuthState {
  user: User | null;
  ready: boolean; // false until the initial token check completes
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [ready, setReady] = useState(false);

  // On boot: if we have a token, verify it with /auth/me so the app
  // starts with fresh user data (and logs out cleanly if it expired).
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setReady(true);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        const fresh = res.data.user as User;
        setUser(fresh);
        localStorage.setItem(USER_KEY, JSON.stringify(fresh));
      })
      .catch(() => {
        // 401 handler in api.ts already cleared storage.
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const signIn = (token: string, u: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const refresh = async () => {
    const res = await api.get('/auth/me');
    const fresh = res.data.user as User;
    setUser(fresh);
    localStorage.setItem(USER_KEY, JSON.stringify(fresh));
  };

  return (
    <AuthContext.Provider value={{ user, ready, signIn, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
