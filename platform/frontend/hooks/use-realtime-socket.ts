'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { AuthSession } from '@/lib/types';
import { createRealtimeSocket } from '@/lib/realtime-client';

interface RealtimeState {
  connectionError: string | null;
  socket: Socket | null;
  status: 'idle' | 'connecting' | 'connected' | 'disconnected';
}

export function useRealtimeSocket(session: AuthSession | null): RealtimeState {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<RealtimeState['status']>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.tokens.accessToken) {
      setSocket(null);
      setStatus('idle');
      setConnectionError(null);
      return;
    }

    const nextSocket = createRealtimeSocket(session.tokens.accessToken);

    setStatus('connecting');
    setSocket(nextSocket);

    const onConnect = () => {
      setStatus('connected');
      setConnectionError(null);
    };

    const onDisconnect = () => {
      setStatus('disconnected');
    };

    const onConnectError = (error: Error) => {
      setStatus('disconnected');
      setConnectionError(error.message);
    };

    nextSocket.on('connect', onConnect);
    nextSocket.on('disconnect', onDisconnect);
    nextSocket.on('connect_error', onConnectError);
    nextSocket.connect();

    return () => {
      nextSocket.off('connect', onConnect);
      nextSocket.off('disconnect', onDisconnect);
      nextSocket.off('connect_error', onConnectError);
      nextSocket.disconnect();
      setSocket((current) => (current === nextSocket ? null : current));
    };
  }, [session?.tokens.accessToken]);

  return { socket, status, connectionError };
}
