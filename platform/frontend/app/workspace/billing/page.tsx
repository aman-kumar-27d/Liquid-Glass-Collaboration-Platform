import { BillingConsole } from '@/components/billing/billing-console';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { GlassCard } from '@/components/liquid-glass/glass-card';

export default function WorkspaceBillingPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <GlassCard>
          <PageHeader
            eyebrow="Billing"
            title="Subscriptions, coupons, and redeem codes"
            description="This Phase 8 billing surface maps to the backend subscription, coupon, and redeem-code contracts."
          />
        </GlassCard>

        <BillingConsole />
      </div>
    </AppShell>
  );
}
