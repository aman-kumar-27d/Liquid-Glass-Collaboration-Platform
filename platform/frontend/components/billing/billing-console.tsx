'use client';

import { FormEvent, useEffect, useEffectEvent, useState } from 'react';
import { useAuthSession } from '@/hooks/use-auth-session';
import { apiRequest } from '@/lib/api-client';
import { SubscriptionPlanRecord, SubscriptionRecord } from '@/lib/types';
import { GlassCard } from '../liquid-glass/glass-card';

export function BillingConsole() {
  const { ready, session, setSession } = useAuthSession();
  const [plans, setPlans] = useState<SubscriptionPlanRecord[]>([]);
  const [current, setCurrent] = useState<SubscriptionRecord | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBilling = useEffectEvent(async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [plansEnvelope, currentEnvelope] = await Promise.all([
        apiRequest<SubscriptionPlanRecord[]>('/subscriptions/plans', {
          requiresAuth: true,
          session,
          onSessionChange: setSession
        }),
        apiRequest<SubscriptionRecord | null>('/subscriptions/current', {
          requiresAuth: true,
          session,
          onSessionChange: setSession
        })
      ]);

      setPlans(plansEnvelope.data);
      setCurrent(currentEnvelope.data);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to load billing data';
      setError(message);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!ready) {
      return;
    }

    void loadBilling();
  }, [ready, session, loadBilling]);

  const changePlan = async (plan: string) => {
    if (!session) {
      return;
    }

    const envelope = await apiRequest<SubscriptionRecord, { plan: string }>('/subscriptions/change-plan', {
      method: 'POST',
      body: { plan },
      requiresAuth: true,
      session,
      onSessionChange: setSession
    });

    setCurrent(envelope.data);
  };

  const submitCode =
    (path: '/subscriptions/apply-coupon' | '/subscriptions/redeem-code', code: string, reset: () => void) =>
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!session || !code.trim()) {
        return;
      }

      const envelope = await apiRequest<SubscriptionRecord, { code: string }>(path, {
        method: 'POST',
        body: { code: code.trim() },
        requiresAuth: true,
        session,
        onSessionChange: setSession
      });

      setCurrent(envelope.data);
      reset();
    };

  if (!ready) {
    return <div className="text-sm text-white/70">Loading session...</div>;
  }

  if (!session) {
    return <div className="text-sm text-white/70">Sign in to load subscription data.</div>;
  }

  return (
    <div className="space-y-6">
      {error ? (
        <GlassCard>
          <div className="text-sm text-rose-100">{error}</div>
        </GlassCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <GlassCard key={plan.plan}>
            <div className="text-sm text-white/60">{plan.plan.toUpperCase()}</div>
            <div className="mt-3 font-display text-3xl text-white">
              {plan.maxUsers === null ? 'Unlimited' : `${plan.maxUsers} users`}
            </div>
            <div className="mt-2 text-sm text-white/65">
              {plan.maxStorageGb === null ? 'Custom storage' : `${plan.maxStorageGb} GB storage`}
            </div>
            <button
              type="button"
              onClick={() => void changePlan(plan.plan)}
              className="mt-4 rounded-full border border-white/14 px-4 py-2 text-sm text-white/75"
            >
              Select Plan
            </button>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div className="text-sm uppercase tracking-[0.28em] text-white/60">Current Subscription</div>
            <button
              type="button"
              onClick={() => void loadBilling()}
              className="rounded-full border border-white/14 px-4 py-2 text-xs text-white/75"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div className="mt-4 space-y-3 text-sm text-white/75">
            <div>Plan: {current?.plan ?? 'trial'}</div>
            <div>
              Start date:{' '}
              {current?.startDate ? new Date(current.startDate).toLocaleDateString() : 'Pending'}
            </div>
            <div>
              Coupon metadata:{' '}
              {current?.metadata?.coupon ? JSON.stringify(current.metadata.coupon) : 'None'}
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <form className="space-y-3" onSubmit={submitCode('/subscriptions/apply-coupon', couponCode, () => setCouponCode(''))}>
              <div className="text-sm uppercase tracking-[0.28em] text-white/60">Apply Coupon</div>
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="SPRING100"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
              />
              <button
                type="submit"
                className="rounded-2xl border border-white/14 bg-white/10 px-4 py-3 text-sm text-white"
              >
                Apply
              </button>
            </form>
          </GlassCard>

          <GlassCard>
            <form className="space-y-3" onSubmit={submitCode('/subscriptions/redeem-code', redeemCode, () => setRedeemCode(''))}>
              <div className="text-sm uppercase tracking-[0.28em] text-white/60">Redeem Code</div>
              <input
                value={redeemCode}
                onChange={(event) => setRedeemCode(event.target.value)}
                placeholder="ENTERPRISE2026"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
              />
              <button
                type="submit"
                className="rounded-2xl border border-white/14 bg-white/10 px-4 py-3 text-sm text-white"
              >
                Redeem
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
