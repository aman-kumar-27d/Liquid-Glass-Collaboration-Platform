import Link from 'next/link';
import { GlassCard } from '@/components/liquid-glass/glass-card';

const milestones = [
  'Backend-first modular monolith',
  'Tenant-safe auth and provisioning',
  'Realtime rooms, messages, files, and calls',
  'Admin, analytics, and subscription controls'
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-16 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <GlassCard>
          <div className="text-sm uppercase tracking-[0.32em] text-white/60">Phase 8 Web Track</div>
          <h1 className="mt-4 max-w-2xl font-display text-5xl leading-tight text-white">
            Liquid glass collaboration workspace with tenant, billing, chat, and call surfaces.
          </h1>
          <p className="mt-6 max-w-xl text-base text-white/75">
            The backend now spans auth through admin and subscription baselines. This frontend phase
            starts exposing those contracts as real workspace views instead of a placeholder shell.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/workspace"
              className="rounded-full border border-white/20 bg-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Open Workspace
            </Link>
            <Link
              href="/auth"
              className="rounded-full border border-white/14 px-5 py-3 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
            >
              Auth Surface
            </Link>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-sm uppercase tracking-[0.32em] text-white/60">Delivery Track</div>
          <div className="mt-5 space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone} className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                {milestone}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
