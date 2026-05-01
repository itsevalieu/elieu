import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { API_BASE } from '@/lib/config';

interface AuthState {
  isAuthenticated: boolean;
  bootstrapped: boolean;
  email: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

function decodeCookiePair(line: string, name: string): string | null {
  const m = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`, 'i').exec(line.trim());
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

function readCookieTokens(res: Response): { access: string | null; refresh: string | null } {
  let access: string | null = null;
  let refresh: string | null = null;
  const h = res.headers as Headers & { getSetCookie?: () => string[] };
  const lines =
    typeof h.getSetCookie === 'function'
      ? h.getSetCookie()
      : (() => {
          const merged = res.headers.get('set-cookie');
          return merged ? merged.split(/,(?=\s*[A-Za-z_][\w.-]*=)/) : [];
        })();

  for (const line of lines) {
    if (!access) access = decodeCookiePair(line, 'access_token');
    if (!refresh) refresh = decodeCookiePair(line, 'refresh_token');
  }
  return { access, refresh };
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  bootstrapped: false,
  email: null,

  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    let accessToken: string | undefined;
    let refreshToken: string | undefined;
    let resolvedEmail = email.trim();

    if (res.ok) {
      const data = await res.json().catch(() => ({} as Record<string, unknown>));

      accessToken =
        typeof data.accessToken === 'string' ? data.accessToken : typeof data.access_token === 'string' ? data.access_token : undefined;
      refreshToken =
        typeof data.refreshToken === 'string'
          ? data.refreshToken
          : typeof data.refresh_token === 'string'
            ? data.refresh_token
            : undefined;
      const bodyEmail =
        typeof data.email === 'string' ? data.email : typeof data.userEmail === 'string' ? data.userEmail : '';
      if (bodyEmail) resolvedEmail = bodyEmail;

      const fromCookies = readCookieTokens(res);
      accessToken ||= fromCookies.access ?? undefined;
      refreshToken ||= fromCookies.refresh ?? undefined;
    }

    if (!res.ok || !accessToken) throw new Error('Login failed');

    await SecureStore.setItemAsync('access_token', accessToken);
    if (refreshToken) await SecureStore.setItemAsync('refresh_token', refreshToken);
    set({ isAuthenticated: true, email: resolvedEmail });
  },

  logout: async () => {
    const token = await SecureStore.getItemAsync('access_token');
    try {
      if (token) {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      /* best-effort */
    }

    await SecureStore.deleteItemAsync('access_token').catch(() => undefined);
    await SecureStore.deleteItemAsync('refresh_token').catch(() => undefined);
    set({ isAuthenticated: false, email: null });
  },

  checkAuth: async () => {
    const token = await SecureStore.getItemAsync('access_token');
    set({
      isAuthenticated: !!token,
      bootstrapped: true,
    });
  },
}));
