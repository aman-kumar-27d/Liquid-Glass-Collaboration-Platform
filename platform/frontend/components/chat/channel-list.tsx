import { GlassCard } from '../liquid-glass/glass-card';

const channels = [
  { name: '# general', unread: 4 },
  { name: '# product', unread: 0 },
  { name: '# design-sync', unread: 2 },
  { name: '# release-room', unread: 0 }
];

export function ChannelList() {
  return (
    <GlassCard>
      <div className="text-sm uppercase tracking-[0.28em] text-white/60">Rooms</div>
      <div className="mt-4 space-y-2">
        {channels.map((channel) => (
          <div
            key={channel.name}
            className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/20 px-4 py-3 text-sm text-white/80"
          >
            <span>{channel.name}</span>
            <span className="rounded-full bg-cyan-300/12 px-2 py-1 text-xs text-cyan-100">
              {channel.unread ? `${channel.unread} new` : 'clear'}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
