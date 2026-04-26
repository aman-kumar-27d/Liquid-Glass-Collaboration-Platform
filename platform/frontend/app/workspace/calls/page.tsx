import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { GlassCard } from '@/components/liquid-glass/glass-card';

const participants = ['Aarav', 'Mira', 'Noah', 'Sana'];

export default function WorkspaceCallsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <GlassCard>
          <PageHeader
            eyebrow="Calls"
            title="Room calls and screen-share coordination"
            description="This surface tracks the backend baseline for call lifecycle, participants, screen-share state, and WebRTC signaling."
            action={
              <div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">
                Active room call detected
              </div>
            }
          />
        </GlassCard>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <GlassCard>
            <div className="text-sm uppercase tracking-[0.28em] text-white/60">Call Grid</div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {participants.map((participant) => (
                <div
                  key={participant}
                  className="aspect-video rounded-[28px] border border-white/12 bg-gradient-to-br from-white/10 to-slate-950/30 p-5"
                >
                  <div className="text-sm text-white/55">Connected</div>
                  <div className="mt-3 font-display text-2xl text-white">{participant}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard>
              <div className="text-sm uppercase tracking-[0.28em] text-white/60">Controls</div>
              <div className="mt-4 space-y-3 text-sm text-white/75">
                <div>Start and join via `/api/v1/calls/*`</div>
                <div>Screen share start/stop via `/api/v1/screen-share/*`</div>
                <div>WebRTC offer, answer, and candidate over websocket signaling</div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="text-sm uppercase tracking-[0.28em] text-white/60">Next Work</div>
              <div className="mt-4 space-y-3 text-sm text-white/75">
                <div>Media device handling</div>
                <div>Active speaker indication</div>
                <div>Call quality and reconnect states</div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
