import { PropsWithChildren } from 'react';
import { GlassCard } from '../liquid-glass/glass-card';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 lg:px-6">
      <aside className="hidden w-72 flex-col gap-4 lg:flex">
        <GlassCard>
          <div className="text-sm uppercase tracking-[0.28em] text-white/60">Workspace</div>
          <div className="mt-3 font-display text-2xl">Liquid Glass</div>
          <div className="mt-6 space-y-3 text-sm text-white/70">
            <div>Dashboard</div>
            <div>Rooms</div>
            <div>Direct Messages</div>
            <div>Calls</div>
            <div>Admin</div>
          </div>
        </GlassCard>
      </aside>

      <main className="flex-1">{children}</main>

      <aside className="hidden w-80 xl:block">
        <GlassCard>
          <div className="text-sm uppercase tracking-[0.28em] text-white/60">Presence</div>
          <div className="mt-4 space-y-4 text-sm text-white/75">
            <div>Tenant-aware session management</div>
            <div>Realtime typing and presence</div>
            <div>P2P large file transfer routing</div>
          </div>
        </GlassCard>
      </aside>
    </div>
  );
}
