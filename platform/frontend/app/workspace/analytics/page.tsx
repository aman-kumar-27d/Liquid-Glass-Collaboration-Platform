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
            description="This workspace surfaces analytics dashboard metrics, usage-history filters, event charts, and recent activity from the analytics endpoints."
          />
        </GlassCard>

        <AnalyticsConsole />
      </div>
    </AppShell>
  );
}
