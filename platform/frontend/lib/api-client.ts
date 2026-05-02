import { writeStoredSession } from './auth-session';
import { ApiEnvelope, AuthSession } from './types';

const DEFAULT_API_BASE_URL = 'http://localhost:4000/api/v1';

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

interface RequestOptions<TBody> {
  body?: TBody;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  requiresAuth?: boolean;
  session?: AuthSession | null;
  onSessionChange?: (session: AuthSession | null) => void;
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_API_BASE_URL;
}

export { getApiBaseUrl };

function buildHeaders(session: AuthSession | null, body?: unknown) {
  const headers = new Headers();

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (session?.tokens.accessToken) {
    headers.set('Authorization', `Bearer ${session.tokens.accessToken}`);
  }

  return headers;
}

async function parseEnvelope<T>(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return (await response.json()) as ApiEnvelope<T>;
  }

  const text = await response.text();
  return {
    success: response.ok,
    data: text as T,
    error: response.ok ? null : text || 'Request failed',
    meta: null
  } satisfies ApiEnvelope<T>;
}

function normalizeSession(data: any, previousSession?: AuthSession | null): AuthSession {
  return {
    user: data.user,
    tokens: {
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
      expiresAt: data.tokens.expiresAt
    },
    company: data.company ?? previousSession?.company ?? null
  };
}

async function refreshSession(session: AuthSession, onSessionChange?: (session: AuthSession | null) => void) {
  const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refreshToken: session.tokens.refreshToken })
  });

  const envelope = await parseEnvelope<any>(response);

  if (!response.ok || !envelope.success) {
    writeStoredSession(null);
    onSessionChange?.(null);
    throw new ApiClientError(envelope.error ?? 'Session refresh failed', response.status);
  }

  const nextSession = normalizeSession(envelope.data, session);
  writeStoredSession(nextSession);
  onSessionChange?.(nextSession);
  return nextSession;
}

export async function apiRequest<TResponse, TBody = undefined>(
  path: string,
  options: RequestOptions<TBody> = {}
): Promise<ApiEnvelope<TResponse>> {
  const { body, method = 'GET', requiresAuth = false, session = null, onSessionChange } = options;

  let activeSession = session;

  const execute = async () => {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers: buildHeaders(activeSession, body),
      body: body === undefined ? undefined : JSON.stringify(body)
    });

    const envelope = await parseEnvelope<TResponse>(response);
    return { response, envelope };
  };

  let { response, envelope } = await execute();

  if (response.status === 401 && requiresAuth && activeSession?.tokens.refreshToken) {
    activeSession = await refreshSession(activeSession, onSessionChange);
    ({ response, envelope } = await execute());
  }

  if (!response.ok || !envelope.success) {
    throw new ApiClientError(envelope.error ?? 'Request failed', response.status);
  }

  return envelope;
}

export function createSessionFromAuthResponse(data: any, previousSession?: AuthSession | null) {
  return normalizeSession(data, previousSession);
}

export async function uploadFormRequest<TResponse>(
  path: string,
  formData: FormData,
  session: AuthSession,
  onSessionChange?: (session: AuthSession | null) => void
): Promise<ApiEnvelope<TResponse>> {
  let activeSession = session;

  const execute = async () => {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: 'POST',
      headers: activeSession?.tokens.accessToken
        ? {
            Authorization: `Bearer ${activeSession.tokens.accessToken}`
          }
        : undefined,
      body: formData
    });

    const envelope = await parseEnvelope<TResponse>(response);
    return { response, envelope };
  };

  let { response, envelope } = await execute();

  if (response.status === 401 && activeSession.tokens.refreshToken) {
    activeSession = await refreshSession(activeSession, onSessionChange);
    ({ response, envelope } = await execute());
  }

  if (!response.ok || !envelope.success) {
    throw new ApiClientError(envelope.error ?? 'Upload failed', response.status);
  }

  return envelope;
}
