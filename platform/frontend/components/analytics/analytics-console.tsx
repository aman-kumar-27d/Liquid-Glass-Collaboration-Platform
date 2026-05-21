'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useDeferredValue, useEffect, useEffectEvent, useMemo, useState } from 'react';
import { useAuthSession } from '@/hooks/use-auth-session';
import { apiRequest } from '@/lib/api-client';
import {
  AnalyticsDashboardRecord,
  UsageEventRecord,
  UsageSummaryRecord
} from '@/lib/types';
import { StatCard } from '../layout/stat-card';
import { GlassCard } from '../liquid-glass/glass-card';

interface PlatformStatsRecord {
  companies: number;
  activeUsers: number;
  messages: number;
  files: number;
  activeSubscriptions: number;
  latestSnapshot: {
    snapshotDate: string;
  } | null;
}

interface AnalyticsState {
  dashboard: AnalyticsDashboardRecord | null;
  platformStats: PlatformStatsRecord | null;
  usageSummary: UsageSummaryRecord | null;
}

const chatRoute = '/workspace/chat' as Route;

function createDateRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);

  return {
    dateFrom: start.toISOString().slice(0, 10),
    dateTo: end.toISOString().slice(0, 10)
  };
}

function defaultDateRange() {
  return createDateRange(7);
}

export function AnalyticsConsole() {
  const { ready, session, setSession } = useAuthSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(defaultDateRange());
  const [historyFilter, setHistoryFilter] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [state, setState] = useState<AnalyticsState>({
    dashboard: null,
    platformStats: null,
    usageSummary: null
  });
  const deferredHistoryFilter = useDeferredValue(historyFilter);

  const isMasterAdmin = session?.user.role === 'master_admin';

  const loadAnalytics = useEffectEvent(async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dashboardRequest = apiRequest<AnalyticsDashboardRecord>('/analytics/dashboard', {
        requiresAuth: true,
        session,
        onSessionChange: setSession
      });
      const summaryQuery = new URLSearchParams({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      });

      if (selectedEventType !== 'all') {
        summaryQuery.set('eventType', selectedEventType);
      }

      const summaryRequest = apiRequest<UsageSummaryRecord>(
        `/analytics/usage-summary?${summaryQuery.toString()}`,
        {
          requiresAuth: true,
          session,
          onSessionChange: setSession
        }
      );
      const platformRequest = isMasterAdmin
        ? apiRequest<PlatformStatsRecord>('/master/system-stats', {
            requiresAuth: true,
            session,
            onSessionChange: setSession
          })
        : Promise.resolve(null);

      const [dashboardEnvelope, summaryEnvelope, platformEnvelope] = await Promise.all([
        dashboardRequest,
        summaryRequest,
        platformRequest
      ]);

      setState({
        dashboard: dashboardEnvelope.data,
        platformStats: platformEnvelope?.data ?? null,
        usageSummary: summaryEnvelope.data
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to load analytics';
      setError(message);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!ready) {
      return;
    }

    void loadAnalytics();
  }, [ready, session, filters, selectedEventType, loadAnalytics]);

  const filteredRecentEvents = useMemo(() => {
    const query = deferredHistoryFilter.trim().toLowerCase();
    const events = state.dashboard?.recentEvents ?? [];
    const focusedEvents =
      selectedEventType === 'all'
        ? events
        : events.filter((event) => event.eventType === selectedEventType);

    if (!query) {
      return focusedEvents;
    }

    return focusedEvents.filter((event) => {
      const haystack = [
        event.eventType,
        event.entityType ?? '',
        event.entityId ?? ''
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [deferredHistoryFilter, state.dashboard?.recentEvents]);

  const historySeries = useMemo(() => {
    return filteredRecentEvents
      .slice()
      .reverse()
      .map((event, index) => ({
        label: `${index + 1}`,
        value: 1,
        description: event.eventType
      }));
  }, [filteredRecentEvents]);

  const topEvents = useMemo(() => {
    const counts = Object.entries(state.usageSummary?.counts ?? {});
    return counts.sort((left, right) => right[1] - left[1]).slice(0, 6);
  }, [state.usageSummary?.counts]);

  const timelineSeries = useMemo(() => {
    return (state.usageSummary?.timeline ?? []).map((bucket) => ({
      label: bucket.bucket.slice(5),
      value: bucket.total,
      description: `${bucket.total} events`
    }));
  }, [state.usageSummary?.timeline]);

  const entitySeries = useMemo(() => {
    return (state.usageSummary?.entityBreakdown ?? []).map((entry) => ({
      label: entry.label,
      value: entry.total,
      description: `${entry.total} events`
    }));
  }, [state.usageSummary?.entityBreakdown]);

  const peakBucket = useMemo(() => {
    const timeline = state.usageSummary?.timeline ?? [];
    return timeline.reduce<(typeof timeline)[number] | null>((currentPeak, bucket) => {
      if (!currentPeak || bucket.total > currentPeak.total) {
        return bucket;
      }

      return currentPeak;
    }, null);
  }, [state.usageSummary?.timeline]);

  const averagePerDay = useMemo(() => {
    const timeline = state.usageSummary?.timeline ?? [];

    if (!timeline.length) {
      return '0';
    }

    return (Number(state.usageSummary?.totalEvents ?? 0) / timeline.length).toFixed(1);
  }, [state.usageSummary?.timeline, state.usageSummary?.totalEvents]);

  if (!ready) {
    return (
      <GlassCard>
        <div className="text-sm text-white/70">Loading session...</div>
      </GlassCard>
    );
  }

  if (!session) {
    return (
      <GlassCard>
        <div className="text-sm text-white/70">Sign in to load analytics.</div>
      </GlassCard>
    );
  }

  const current = state.dashboard?.current;

  return (
    <div className="space-y-6">
      {error ? (
        <GlassCard>
          <div className="text-sm text-rose-100">{error}</div>
        </GlassCard>
      ) : null}

      <GlassCard>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.28em] text-white/60">History Filters</div>
            <div className="mt-4 flex flex-wrap gap-3">
              <label className="text-sm text-white/65">
                <span>Date From</span>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(event) =>
                    setFilters((currentFilters) => ({
                      ...currentFilters,
                      dateFrom: event.target.value
                    }))
                  }
                  className="mt-2 block rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-white"
                />
              </label>
              <label className="text-sm text-white/65">
                <span>Date To</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(event) =>
                    setFilters((currentFilters) => ({
                      ...currentFilters,
                      dateTo: event.target.value
                    }))
                  }
                  className="mt-2 block rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-white"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setFilters(createDateRange(days))}
                  className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/75"
                >
                  Last {days} days
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:items-end">
            <label className="text-sm text-white/65">
              <span>Focus event type</span>
              <select
                value={selectedEventType}
                onChange={(event) => setSelectedEventType(event.target.value)}
                className="mt-2 block rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-white"
              >
                <option value="all">All event types</option>
                {(state.usageSummary?.eventTypes ?? []).map((eventType) => (
                  <option key={eventType} value={eventType}>
                    {eventType}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-white/65">
              <span>Filter event history</span>
              <input
                type="text"
                value={historyFilter}
                onChange={(event) => setHistoryFilter(event.target.value)}
                placeholder="message, file, call..."
                className="mt-2 block rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-white placeholder:text-white/35"
              />
            </label>
            <button
              type="button"
              onClick={() => void loadAnalytics()}
              className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100"
            >
              {loading ? 'Refreshing...' : 'Refresh Analytics'}
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tracked Events"
          value={String(state.usageSummary?.totalEvents ?? 0)}
          detail={
            selectedEventType === 'all'
              ? `${filters.dateFrom} to ${filters.dateTo}`
              : `${selectedEventType} in selected range`
          }
        />
        <StatCard
          label="Average / Day"
          value={averagePerDay}
          detail={`${state.usageSummary?.timeline.length ?? 0} timeline buckets`}
        />
        <StatCard
          label="Peak Day"
          value={peakBucket?.bucket ?? 'N/A'}
          detail={peakBucket ? `${peakBucket.total} events` : 'No event history yet'}
        />
        <StatCard
          label="Live Tenant Users"
          value={String(current?.activeUsers ?? 0)}
          detail={`${current?.openRooms ?? 0} rooms | ${current?.activeCalls ?? 0} active calls`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Messages"
          value={String(current?.messages ?? 0)}
          detail="Current tenant message records"
        />
        <StatCard
          label="Files"
          value={String(current?.files ?? 0)}
          detail="Files indexed in current tenant"
        />
        <StatCard
          label="Latest Snapshot"
          value={state.dashboard?.latestSnapshot?.snapshotDate ?? 'N/A'}
          detail={state.dashboard?.subscription?.plan ?? 'unknown plan'}
        />
      </div>

      {isMasterAdmin && state.platformStats ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Companies" value={String(state.platformStats.companies)} detail="Platform scope" />
          <StatCard label="Platform Users" value={String(state.platformStats.activeUsers)} detail="Active accounts" />
          <StatCard label="Subscriptions" value={String(state.platformStats.activeSubscriptions)} detail="Active plans" />
          <StatCard
            label="Platform Snapshot"
            value={state.platformStats.latestSnapshot?.snapshotDate ?? 'N/A'}
            detail="Latest daily aggregate"
          />
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard
          title="Event Mix"
          subtitle="Usage-summary counts across the selected range and focus filter"
          items={topEvents.map(([label, value]) => ({
            label,
            value,
            description: `${value} events`
          }))}
        />
        <ChartCard
          title="Activity Trend"
          subtitle="Daily totals across the selected range"
          items={timelineSeries}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard
          title="Entity Breakdown"
          subtitle="Most active entity groups within the focused event set"
          items={entitySeries}
        />
        <ChartCard
          title="Recent Event Flow"
          subtitle="Most recent activity matching the current history filters"
          items={historySeries}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard>
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm uppercase tracking-[0.28em] text-white/60">Recent Event History</div>
            <div className="text-xs text-white/45">
              {filteredRecentEvents.length} of {(state.dashboard?.recentEvents ?? []).length} events
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {filteredRecentEvents.length ? (
              filteredRecentEvents.map((event) => (
                <HistoryRow key={event.id} event={event} />
              ))
            ) : (
              <div className="text-sm text-white/65">
                {loading ? 'Loading events...' : 'No events match the current history filter.'}
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-sm uppercase tracking-[0.28em] text-white/60">Summary Notes</div>
          <div className="mt-4 space-y-3 text-sm text-white/75">
            <div>Top event: {topEvents[0] ? `${topEvents[0][0]} (${topEvents[0][1]})` : 'No usage data yet'}</div>
            <div>Focused event type: {selectedEventType === 'all' ? 'all events' : selectedEventType}</div>
            <div>Current plan: {state.dashboard?.subscription?.plan ?? 'unknown'}</div>
            <div>Latest snapshot: {state.dashboard?.latestSnapshot?.snapshotDate ?? 'not generated yet'}</div>
            <div>Recent events shown: {filteredRecentEvents.length}</div>
            <div>
              Need more message-level detail?{' '}
              <Link href={chatRoute} className="text-cyan-200 underline decoration-cyan-200/35 underline-offset-4">
                Open chat workspace
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function ChartCard({
  items,
  subtitle,
  title
}: {
  items: Array<{ label: string; value: number; description: string }>;
  subtitle: string;
  title: string;
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <GlassCard>
      <div className="text-sm uppercase tracking-[0.28em] text-white/60">{title}</div>
      <div className="mt-2 text-sm text-white/65">{subtitle}</div>

      <div className="mt-6 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={`${item.label}-${item.description}`} className="space-y-2">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="truncate text-white/85">{item.label}</span>
                <span className="text-white/55">{item.description}</span>
              </div>
              <div className="h-3 rounded-full bg-white/8">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-cyan-300/85 to-sky-500/85"
                  style={{ width: `${Math.max((item.value / maxValue) * 100, 6)}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-white/65">No chart data available for the current filter.</div>
        )}
      </div>
    </GlassCard>
  );
}

function HistoryRow({ event }: { event: UsageEventRecord }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="font-medium text-white">{event.eventType}</div>
        <div className="text-xs text-white/55">{new Date(event.occurredAt).toLocaleString()}</div>
      </div>
      <div className="mt-2 text-sm text-white/60">
        {event.entityType ?? 'event'} {event.entityId ? `| ${event.entityId}` : ''}
      </div>
    </div>
  );
}
