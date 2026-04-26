import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/layout/stat-card';
import { GlassCard } from '@/components/liquid-glass/glass-card';

const plans = [
  { label: 'Trial', value: '10 users', detail: '2 GB storage' },
  { label: 'Pro', value: '100 users', detail: '100 GB storage' },
  { label: 'Enterprise', value: 'Unlimited', detail: 'Custom controls' }
];

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

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <StatCard key={plan.label} label={plan.label} value={plan.value} detail={plan.detail} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <GlassCard>
            <div className="text-sm uppercase tracking-[0.28em] text-white/60">Current Subscription</div>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <div>Current plan endpoint: `GET /api/v1/subscriptions/current`</div>
              <div>Plan change endpoint: `POST /api/v1/subscriptions/change-plan`</div>
              <div>Coupon application endpoint: `POST /api/v1/subscriptions/apply-coupon`</div>
              <div>Redeem code endpoint: `POST /api/v1/subscriptions/redeem-code`</div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="text-sm uppercase tracking-[0.28em] text-white/60">Master Admin Surfaces</div>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <div>Manage companies and subscriptions</div>
              <div>Create coupons and redeem codes</div>
              <div>Prepare analytics and enforcement rules next</div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
