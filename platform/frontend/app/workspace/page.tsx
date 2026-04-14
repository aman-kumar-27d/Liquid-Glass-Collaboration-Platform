import { AppShell } from '@/components/layout/app-shell';
import { GlassCard } from '@/components/liquid-glass/glass-card';

const metrics = [
  { label: 'Active Users', value: '184' },
  { label: 'Messages Today', value: '3.2K' },
  { label: 'Open Rooms', value: '26' },
  { label: 'Storage Used', value: '38 GB' }
];

export default function WorkspacePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <GlassCard>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.28em] text-white/60">Tenant Overview</div>
              <h1 className="mt-3 font-display text-4xl">Operations Command Surface</h1>
              <p className="mt-3 max-w-2xl text-white/70">
                This shell represents the web delivery target for chat, rooms, files, calls, and
                administrative control.
              </p>
            </div>
            <div className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              Trial Plan • 12 days remaining
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <GlassCard key={metric.label}>
              <div className="text-sm text-white/60">{metric.label}</div>
              <div className="mt-3 font-display text-3xl">{metric.value}</div>
            </GlassCard>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <GlassCard>
            <div className="text-sm uppercase tracking-[0.28em] text-white/60">Implementation Focus</div>
            <div className="mt-4 space-y-4 text-white/80">
              <div>Auth flows with refresh rotation and audit logs</div>
              <div>Tenant-safe REST and websocket contracts under `/api/v1`</div>
              <div>Rooms, messaging, file attachments, and call signaling phases next</div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="text-sm uppercase tracking-[0.28em] text-white/60">Realtime Readiness</div>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <div>Socket gateway reserved for room lifecycle and signaling</div>
              <div>Redis adapter planned for fanout and multi-node scale</div>
              <div>TURN and MinIO configured in local infrastructure layer</div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
