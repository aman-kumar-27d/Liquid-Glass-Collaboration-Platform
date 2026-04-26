import { AdminConsole } from '@/components/admin/admin-console';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { GlassCard } from '@/components/liquid-glass/glass-card';

export default function WorkspaceAdminPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <GlassCard>
          <PageHeader
            eyebrow="Admin"
            title="Tenant users and room governance"
            description="This view is aligned to the company-admin backend endpoints for user role updates and room lifecycle controls."
          />
        </GlassCard>

        <AdminConsole />
      </div>
    </AppShell>
  );
}
