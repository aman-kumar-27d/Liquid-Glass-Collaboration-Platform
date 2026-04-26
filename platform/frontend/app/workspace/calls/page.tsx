import { CallsConsole } from '@/components/calls/calls-console';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { GlassCard } from '@/components/liquid-glass/glass-card';

export default function WorkspaceCallsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <GlassCard>
          <PageHeader
            eyebrow="Calls"
            title="Room calls and screen-share coordination"
            description="This page now loads live active-call state by room and can start, join, and leave calls against the current backend baseline."
            action={
              <div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">
                REST baseline wired
              </div>
            }
          />
        </GlassCard>

        <CallsConsole />
      </div>
    </AppShell>
  );
}
