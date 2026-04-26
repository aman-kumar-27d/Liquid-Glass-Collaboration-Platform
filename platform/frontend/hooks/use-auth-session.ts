'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { getAuthSessionKey, readStoredSession, writeStoredSession } from '@/lib/auth-session';
import { AuthSession } from '@/lib/types';

export function useAuthSession() {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  const syncSession = useEffectEvent(() => {
    setSessionState(readStoredSession());
  });

  useEffect(() => {
    syncSession();
    setReady(true);

    const onStorage = (event: StorageEvent) => {
      if (event.key === getAuthSessionKey()) {
        syncSession();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [syncSession]);

  const setSession = (nextSession: AuthSession | null) => {
    writeStoredSession(nextSession);
    setSessionState(nextSession);
  };

  return {
    ready,
    session,
    setSession,
    clearSession: () => setSession(null)
  };
}
