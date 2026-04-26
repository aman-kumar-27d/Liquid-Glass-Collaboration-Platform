import { GlassCard } from '../liquid-glass/glass-card';

interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
}

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <GlassCard>
      <div className="text-sm text-white/60">{label}</div>
      <div className="mt-3 font-display text-3xl text-white">{value}</div>
      {detail ? <div className="mt-2 text-sm text-white/65">{detail}</div> : null}
    </GlassCard>
  );
}
