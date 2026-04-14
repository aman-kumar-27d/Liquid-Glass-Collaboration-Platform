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
          <div className="text-sm uppercase tracking-[0.32em] text-white/60">Phase 0-2 Baseline</div>
          <h1 className="mt-4 max-w-2xl font-display text-5xl leading-tight text-white">
            Liquid glass collaboration infrastructure with tenant-safe foundations.
          </h1>
          <p className="mt-6 max-w-xl text-base text-white/75">
            The repository now includes the monorepo shell, backend auth foundation, platform docs,
            local infrastructure, and a web shell aligned to the implementation plan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/workspace"
              className="rounded-full border border-white/20 bg-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Open Workspace Shell
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
