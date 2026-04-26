import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { GlassCard } from '@/components/liquid-glass/glass-card';

const users = [
  { name: 'Aarav', role: 'company_admin', status: 'active' },
  { name: 'Mira', role: 'moderator', status: 'active' },
  { name: 'Noah', role: 'user', status: 'paused' }
];

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

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <GlassCard>
            <div className="text-sm uppercase tracking-[0.28em] text-white/60">Users</div>
            <div className="mt-5 space-y-3">
              {users.map((user) => (
                <div
                  key={user.name}
                  className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-4 md:grid-cols-[1fr_auto_auto]"
                >
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-sm text-white/65">{user.role}</div>
                  <div className="text-sm text-cyan-100">{user.status}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="text-sm uppercase tracking-[0.28em] text-white/60">Admin Actions</div>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <div>`GET /api/v1/admin/users`</div>
              <div>`PATCH /api/v1/admin/users/:id`</div>
              <div>`GET /api/v1/admin/rooms`</div>
              <div>`DELETE /api/v1/admin/rooms/:id`</div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
