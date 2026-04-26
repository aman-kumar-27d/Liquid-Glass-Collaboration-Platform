import { AuthSession } from './types';

const AUTH_SESSION_KEY = 'liquid-glass-auth-session';

export function getAuthSessionKey() {
  return AUTH_SESSION_KEY;
}

export function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function writeStoredSession(session: AuthSession | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}
