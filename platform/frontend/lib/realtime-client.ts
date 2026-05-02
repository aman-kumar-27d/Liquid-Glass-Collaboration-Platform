import { io, Socket } from 'socket.io-client';

const DEFAULT_WS_BASE_URL = 'http://localhost:4000';

function stripApiSuffix(url: string) {
  return url.replace(/\/api\/v\d+\/?$/, '');
}

export function getRealtimeBaseUrl() {
  const explicit = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, '');
  if (explicit) {
    return explicit;
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
  if (apiBaseUrl) {
    return stripApiSuffix(apiBaseUrl);
  }

  return DEFAULT_WS_BASE_URL;
}

export function createRealtimeSocket(accessToken: string) {
  return io(getRealtimeBaseUrl(), {
    auth: {
      token: accessToken
    },
    transports: ['websocket', 'polling'],
    autoConnect: false
  });
}

export function emitWithAck<TResponse, TPayload>(socket: Socket, event: string, payload: TPayload) {
  return new Promise<TResponse>((resolve, reject) => {
    socket.emit(event, payload, (response: TResponse | { error?: string; message?: string }) => {
      if (
        response &&
        typeof response === 'object' &&
        ('error' in response || 'message' in response) &&
        !('success' in response)
      ) {
        reject(new Error((response as { error?: string; message?: string }).error ?? (response as { message?: string }).message ?? 'Socket request failed'));
        return;
      }

      resolve(response as TResponse);
    });
  });
}
