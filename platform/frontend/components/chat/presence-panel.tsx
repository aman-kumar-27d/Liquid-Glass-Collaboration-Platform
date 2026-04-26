import { GlassCard } from '../liquid-glass/glass-card';

const members = [
  { name: 'Aarav', status: 'In call' },
  { name: 'Mira', status: 'Reviewing design' },
  { name: 'Noah', status: 'Typing in #general' }
];

export function PresencePanel() {
  return (
    <GlassCard>
      <div className="text-sm uppercase tracking-[0.28em] text-white/60">Presence</div>
      <div className="mt-4 space-y-3">
        {members.map((member) => (
          <div key={member.name} className="rounded-2xl border border-white/8 bg-slate-950/20 px-4 py-3">
            <div className="font-medium text-white">{member.name}</div>
            <div className="mt-1 text-sm text-white/60">{member.status}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
