import { AppShell } from '@/components/layout/app-shell';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { GlassCard } from '@/components/liquid-glass/glass-card';

export default function WorkspacePage() {
  return (
    <AppShell>
      <DashboardOverview />
    </AppShell>
  );
}
