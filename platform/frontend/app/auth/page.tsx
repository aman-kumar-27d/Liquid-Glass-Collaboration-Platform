import Link from 'next/link';
import { GlassCard } from '@/components/liquid-glass/glass-card';

export default function AuthPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-16 lg:px-6">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard>
          <div className="text-sm uppercase tracking-[0.32em] text-white/60">Authentication</div>
          <h1 className="mt-4 font-display text-5xl text-white">
            Tenant-aware access for teams, admins, and operators.
          </h1>
          <p className="mt-5 max-w-xl text-white/72">
            This Phase 8 auth surface is aligned to the backend owner registration, login, refresh,
            and current-session contracts. The next step is wiring these forms to live API requests.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/workspace"
              className="rounded-full border border-white/20 bg-white/14 px-5 py-3 text-sm font-semibold text-white"
            >
              Continue to Workspace
            </Link>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60">Company Email</label>
              <div className="mt-2 rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-4 text-white/45">
                ops@liquidglass.ai
              </div>
            </div>
            <div>
              <label className="text-sm text-white/60">Password</label>
              <div className="mt-2 rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-4 text-white/45">
                ************
              </div>
            </div>
            <div className="rounded-2xl border border-cyan-300/18 bg-cyan-300/10 px-4 py-4 text-sm text-cyan-100">
              Planned wiring: `POST /api/v1/auth/login`, `POST /api/v1/auth/register-owner`, `GET /api/v1/auth/me`
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
