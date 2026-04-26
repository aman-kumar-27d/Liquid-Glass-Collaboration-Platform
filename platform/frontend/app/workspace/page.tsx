import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/layout/stat-card';
import { GlassCard } from '@/components/liquid-glass/glass-card';

const metrics = [
  { label: 'Active Users', value: '184', detail: 'Current tenant seats online now' },
  { label: 'Messages Today', value: '3.2K', detail: 'Backed by rooms and reactions baseline' },
  { label: 'Open Rooms', value: '26', detail: 'Private and shared team channels' },
  { label: 'Storage Used', value: '38 GB', detail: 'Local and MinIO drivers supported' }
];

export default function WorkspacePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <GlassCard>
          <PageHeader
            eyebrow="Tenant Overview"
            title="Operations command surface"
            description="This dashboard now reflects the current backend baseline: tenant-safe auth, rooms, messaging, files, calls, admin controls, and subscription contracts."
            action={
              <div className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
                Trial plan | 12 days remaining
              </div>
            }
          />
        </GlassCard>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <StatCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              detail={metric.detail}
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <GlassCard>
            <div className="text-sm uppercase tracking-[0.28em] text-white/60">Backend Status</div>
            <div className="mt-4 space-y-4 text-white/80">
              <div>Auth, company provisioning, and session rotation are already implemented.</div>
              <div>Rooms, membership, messages, reactions, file attachments, and call signaling exist as backend baselines.</div>
              <div>Admin, subscription, coupon, and redeem-code APIs are available for the next UI wiring pass.</div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="text-sm uppercase tracking-[0.28em] text-white/60">Next Delivery Work</div>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <div>Wire auth, dashboard, chat, billing, and admin views to live API requests.</div>
              <div>Finish analytics and jobs, then deepen file transfer and call-state workflows.</div>
              <div>Add route-level loading, empty, and error states once API integration begins.</div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
