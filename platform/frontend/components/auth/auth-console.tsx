'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { startTransition, useState } from 'react';
import { apiRequest, createSessionFromAuthResponse } from '@/lib/api-client';
import { useAuthSession } from '@/hooks/use-auth-session';
import { GlassCard } from '../liquid-glass/glass-card';

type Mode = 'login' | 'register';

const workspaceRoute = '/workspace' as Route;

export function AuthConsole() {
  const router = useRouter();
  const { ready, session, setSession, clearSession } = useAuthSession();
  const [mode, setMode] = useState<Mode>('login');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({
    email: 'ops@liquidglass.ai',
    password: 'changeme123'
  });
  const [registerForm, setRegisterForm] = useState({
    name: 'Platform Owner',
    email: 'owner@liquidglass.ai',
    password: 'changeme123',
    companyName: 'Liquid Glass Labs',
    companyDomain: 'liquid-glass-labs'
  });

  const submit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const envelope =
        mode === 'login'
          ? await apiRequest<any, typeof loginForm>('/auth/login', {
              method: 'POST',
              body: loginForm
            })
          : await apiRequest<any, typeof registerForm>('/auth/register-owner', {
              method: 'POST',
              body: registerForm
            });

      const nextSession = createSessionFromAuthResponse(envelope.data, session);
      setSession(nextSession);
      startTransition(() => {
        router.push(workspaceRoute);
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Authentication request failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <GlassCard>
        <div className="text-sm uppercase tracking-[0.32em] text-white/60">Authentication</div>
        <h1 className="mt-4 font-display text-5xl text-white">
          Tenant-aware access for teams, admins, and operators.
        </h1>
        <p className="mt-5 max-w-xl text-white/72">
          Login and owner registration now call the live backend. Session tokens are stored locally
          for temporary Phase 8 development until cookie-based auth is introduced.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-full px-5 py-3 text-sm transition ${
              mode === 'login'
                ? 'border border-white/20 bg-white/14 text-white'
                : 'border border-white/10 text-white/65 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-full px-5 py-3 text-sm transition ${
              mode === 'register'
                ? 'border border-white/20 bg-white/14 text-white'
                : 'border border-white/10 text-white/65 hover:text-white'
            }`}
          >
            Register Owner
          </button>
        </div>

        {ready && session ? (
          <div className="mt-8 rounded-3xl border border-emerald-300/18 bg-emerald-300/10 p-5 text-sm text-emerald-100">
            <div className="font-semibold">{session.user.name}</div>
            <div className="mt-1 text-emerald-100/80">{session.user.email}</div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={workspaceRoute}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white"
              >
                Open Workspace
              </Link>
              <button
                type="button"
                onClick={clearSession}
                className="rounded-full border border-white/14 px-4 py-2 text-white/75"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : null}
      </GlassCard>

      <GlassCard>
        <div className="space-y-4">
          {mode === 'login' ? (
            <>
              <Field
                label="Email"
                value={loginForm.email}
                onChange={(value) => setLoginForm((current) => ({ ...current, email: value }))}
              />
              <Field
                label="Password"
                type="password"
                value={loginForm.password}
                onChange={(value) => setLoginForm((current) => ({ ...current, password: value }))}
              />
            </>
          ) : (
            <>
              <Field
                label="Owner Name"
                value={registerForm.name}
                onChange={(value) => setRegisterForm((current) => ({ ...current, name: value }))}
              />
              <Field
                label="Company Email"
                value={registerForm.email}
                onChange={(value) => setRegisterForm((current) => ({ ...current, email: value }))}
              />
              <Field
                label="Password"
                type="password"
                value={registerForm.password}
                onChange={(value) =>
                  setRegisterForm((current) => ({ ...current, password: value }))
                }
              />
              <Field
                label="Company Name"
                value={registerForm.companyName}
                onChange={(value) =>
                  setRegisterForm((current) => ({ ...current, companyName: value }))
                }
              />
              <Field
                label="Company Domain"
                value={registerForm.companyDomain}
                onChange={(value) =>
                  setRegisterForm((current) => ({ ...current, companyDomain: value }))
                }
              />
            </>
          )}

          {error ? (
            <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="rounded-2xl border border-cyan-300/18 bg-cyan-300/10 px-4 py-4 text-sm text-cyan-100">
            API target: `NEXT_PUBLIC_API_BASE_URL` or `http://localhost:4000/api/v1`
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="w-full rounded-2xl border border-white/18 bg-white/14 px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : mode === 'login' ? 'Login' : 'Create Company'}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

interface FieldProps {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}

function Field({ label, onChange, type = 'text', value }: FieldProps) {
  return (
    <label className="block">
      <div className="text-sm text-white/60">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-4 text-white outline-none transition focus:border-cyan-300/30"
      />
    </label>
  );
}
