import { AnalyticsConsole } from '@/components/analytics/analytics-console';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { GlassCard } from '@/components/liquid-glass/glass-card';

export default function WorkspaceAnalyticsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <GlassCard>
          <PageHeader
            eyebrow="Analytics"
            title="Tenant and platform activity view"
            description="This workspace now supports analytics comparison ranges, export-ready reports, richer chart breakdowns, and a dedicated platform view for master admins."
          />
        </GlassCard>

        <AnalyticsConsole />
      </div>
    </AppShell>
  );
}
