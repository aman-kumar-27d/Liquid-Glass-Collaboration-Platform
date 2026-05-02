'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useEffectEvent, useState } from 'react';
import { useAuthSession } from '@/hooks/use-auth-session';
import { apiRequest } from '@/lib/api-client';
import {
  AdminUserRecord,
  AnalyticsDashboardRecord,
  RoomRecord,
  SubscriptionRecord,
  UsageSummaryRecord
} from '@/lib/types';
import { PageHeader } from '../layout/page-header';
import { StatCard } from '../layout/stat-card';
import { GlassCard } from '../liquid-glass/glass-card';

const authRoute = '/auth' as Route;

interface DashboardState {
  analytics: AnalyticsDashboardRecord | null;
  rooms: RoomRecord[];
  subscription: SubscriptionRecord | null;
  usageSummary: UsageSummaryRecord | null;
  users: AdminUserRecord[];
}

export function DashboardOverview() {
  const { ready, session, setSession } = useAuthSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<DashboardState>({
    analytics: null,
    rooms: [],
    subscription: null,
    usageSummary: null,
    users: []
  });

  const loadDashboard = useEffectEvent(async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const roomsRequest = apiRequest<RoomRecord[]>('/rooms', {
        requiresAuth: true,
        session,
        onSessionChange: setSession
      });
      const subscriptionRequest = apiRequest<SubscriptionRecord | null>('/subscriptions/current', {
        requiresAuth: true,
        session,
        onSessionChange: setSession
      });
      const analyticsRequest = apiRequest<AnalyticsDashboardRecord>('/analytics/dashboard', {
        requiresAuth: true,
        session,
        onSessionChange: setSession
      });
      const usageSummaryRequest = apiRequest<UsageSummaryRecord>('/analytics/usage-summary', {
        requiresAuth: true,
        session,
        onSessionChange: setSession
      });
      const usersRequest =
        session.user.role === 'company_admin' || session.user.role === 'master_admin'
          ? apiRequest<AdminUserRecord[]>('/admin/users', {
              requiresAuth: true,
              session,
              onSessionChange: setSession
            })
          : Promise.resolve(null);

      const [roomsEnvelope, subscriptionEnvelope, analyticsEnvelope, usageSummaryEnvelope, usersEnvelope] = await Promise.all([
        roomsRequest,
        subscriptionRequest,
        analyticsRequest,
        usageSummaryRequest,
        usersRequest
      ]);

      setState({
        analytics: analyticsEnvelope.data,
        rooms: roomsEnvelope.data,
        subscription: subscriptionEnvelope.data,
        usageSummary: usageSummaryEnvelope.data,
        users: usersEnvelope?.data ?? []
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to load workspace data';
      setError(message);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!ready) {
      return;
    }

    void loadDashboard();
  }, [ready, session, loadDashboard]);

  if (!ready) {
    return <LoadingCard label="Loading session..." />;
  }

  if (!session) {
    return (
      <GlassCard>
        <PageHeader
          eyebrow="Workspace Access"
          title="Sign in to load tenant data"
          description="The dashboard is wired to live tenant APIs and requires a local auth session from the Phase 8 auth screen."
          action={
            <Link
              href={authRoute}
              className="rounded-full border border-white/20 bg-white/14 px-4 py-2 text-sm text-white"
            >
              Open Auth
            </Link>
          }
        />
      </GlassCard>
    );
  }

  const activeUsers = state.users.filter((user) => user.isActive).length;
  const subscriptionPlan = state.subscription?.plan?.toUpperCase() ?? session.company?.plan ?? 'TRIAL';
  const dashboardCurrent = state.analytics?.current;
  const topUsageEvent =
    state.usageSummary &&
    Object.entries(state.usageSummary.counts).sort((left, right) => right[1] - left[1])[0];

  return (
    <div className="space-y-6">
      <GlassCard>
        <PageHeader
          eyebrow="Tenant Overview"
          title="Operations command surface"
          description="This dashboard now reads live room and subscription data, plus analytics snapshots and usage summaries from the backend."
          action={
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100"
            >
              {loading ? 'Refreshing...' : `${session.user.role} | refresh`}
            </button>
          }
        />
      </GlassCard>

      {error ? (
        <GlassCard>
          <div className="text-sm text-rose-100">{error}</div>
        </GlassCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current Plan" value={subscriptionPlan} detail="Current active subscription" />
        <StatCard
          label="Open Rooms"
          value={String(dashboardCurrent?.openRooms ?? state.rooms.length)}
          detail={state.rooms.length ? state.rooms[0].name : 'No rooms yet'}
        />
        <StatCard
          label="Tenant Users"
          value={String(dashboardCurrent?.activeUsers ?? (state.users.length || 1))}
          detail={state.users.length ? `${activeUsers} active accounts` : 'Admin scope not available'}
        />
        <StatCard
          label="Usage Events"
          value={String(state.usageSummary?.totalEvents ?? 0)}
          detail={topUsageEvent ? `${topUsageEvent[0]} leads with ${topUsageEvent[1]}` : session.user.email}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard>
          <div className="text-sm uppercase tracking-[0.28em] text-white/60">Recent Activity</div>
          <div className="mt-4 space-y-3">
            {state.analytics?.recentEvents.length ? (
              state.analytics.recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-4"
                >
                  <div className="font-medium text-white">{event.eventType}</div>
                  <div className="mt-1 text-sm text-white/60">
                    {new Date(event.occurredAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-white/65">
                {loading ? 'Loading analytics...' : 'No recent usage events yet.'}
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-sm uppercase tracking-[0.28em] text-white/60">Analytics Snapshot</div>
          <div className="mt-4 space-y-3 text-sm text-white/75">
            <div>Company: {session.company?.name ?? session.user.companyId}</div>
            <div>Plan: {subscriptionPlan}</div>
            <div>
              Active calls: {dashboardCurrent?.activeCalls ?? 0}
            </div>
            <div>
              Files tracked: {dashboardCurrent?.files ?? 0}
            </div>
            <div>
              Latest snapshot:{' '}
              {state.analytics?.latestSnapshot?.snapshotDate ?? 'No daily snapshot yet'}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <GlassCard>
      <div className="text-sm text-white/70">{label}</div>
    </GlassCard>
  );
}
