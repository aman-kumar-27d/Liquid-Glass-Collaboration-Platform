import { AuthSession, RoomRecord } from '@/lib/types';
import { GlassCard } from '../liquid-glass/glass-card';

interface PresencePanelProps {
  activeRoom: RoomRecord | null;
  session: AuthSession | null;
}

export function PresencePanel({ activeRoom, session }: PresencePanelProps) {
  const memberCount = activeRoom?.members?.length ?? 0;

  return (
    <GlassCard>
      <div className="text-sm uppercase tracking-[0.28em] text-white/60">Presence</div>
      <div className="mt-4 space-y-3">
        <div className="rounded-2xl border border-white/8 bg-slate-950/20 px-4 py-3">
          <div className="font-medium text-white">{session?.user.name ?? 'Guest session'}</div>
          <div className="mt-1 text-sm text-white/60">{session?.user.role ?? 'no_auth'}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/20 px-4 py-3">
          <div className="font-medium text-white">{activeRoom?.name ?? 'No room selected'}</div>
          <div className="mt-1 text-sm text-white/60">
            {activeRoom ? `${activeRoom.type} | ${memberCount} members` : 'Choose a room to inspect it'}
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/20 px-4 py-3 text-sm text-white/60">
          Websocket presence and typing state still need live client wiring after this REST-driven
          Phase 8 pass.
        </div>
      </div>
    </GlassCard>
  );
}
