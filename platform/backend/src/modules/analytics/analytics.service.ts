import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, IsNull, MoreThanOrEqual, Repository } from 'typeorm';
import { Company } from '../companies/company.entity';
import { StoredFile } from '../files/file.entity';
import { Message } from '../messages/message.entity';
import { Room } from '../rooms/room.entity';
import { Subscription } from '../subscription/subscription.entity';
import { User } from '../users/user.entity';
import { VideoCall } from '../video/video-call.entity';
import { AnalyticsDailySnapshot } from './analytics-daily-snapshot.entity';
import { UsageSummaryQueryDto } from './analytics.dto';
import { UsageEvent } from './usage-event.entity';

interface AnalyticsActor {
  companyId: string;
  role: string;
  sub: string;
}

export interface TimelineBucket {
  bucket: string;
  total: number;
  counts: Record<string, number>;
}

export interface UsageSummaryData {
  dateFrom: string;
  dateTo: string;
  eventType: string | null;
  eventTypes: string[];
  counts: Record<string, number>;
  totalEvents: number;
  timeline: TimelineBucket[];
  entityBreakdown: Array<{
    label: string;
    total: number;
  }>;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UsageEvent)
    private readonly usageEventsRepository: Repository<UsageEvent>,
    @InjectRepository(AnalyticsDailySnapshot)
    private readonly snapshotsRepository: Repository<AnalyticsDailySnapshot>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(StoredFile)
    private readonly filesRepository: Repository<StoredFile>,
    @InjectRepository(VideoCall)
    private readonly videoCallsRepository: Repository<VideoCall>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>
  ) {}

  async recordEvent(input: {
    companyId?: string | null;
    userId?: string | null;
    eventType: string;
    entityType?: string;
    entityId?: string | null;
    metadata?: Record<string, unknown> | null;
    occurredAt?: Date;
  }) {
    const event = this.usageEventsRepository.create({
      companyId: input.companyId ?? null,
      userId: input.userId ?? null,
      eventType: input.eventType,
      entityType: input.entityType ?? undefined,
      entityId: input.entityId ?? null,
      metadata: input.metadata ?? null,
      occurredAt: input.occurredAt ?? new Date()
    });

    await this.usageEventsRepository.save(event);
    return event;
  }

  async getTenantDashboard(actor: AnalyticsActor) {
    const [users, rooms, messages, files, activeCalls, currentSubscription, latestSnapshot, recentEvents] =
      await Promise.all([
        this.usersRepository.count({ where: { companyId: actor.companyId, isActive: true } }),
        this.roomsRepository.count({ where: { companyId: actor.companyId, deletedAt: IsNull() } }),
        this.messagesRepository.count({ where: { companyId: actor.companyId, deletedAt: IsNull() } }),
        this.filesRepository.count({ where: { companyId: actor.companyId, deletedAt: IsNull() } }),
        this.videoCallsRepository.count({ where: { companyId: actor.companyId, endedAt: IsNull() } }),
        this.subscriptionsRepository.findOne({
          where: { companyId: actor.companyId, isActive: true },
          order: { createdAt: 'DESC' }
        }),
        this.snapshotsRepository.findOne({
          where: { companyId: actor.companyId, scope: 'tenant' },
          order: { snapshotDate: 'DESC' }
        }),
        this.usageEventsRepository.find({
          where: {
            companyId: actor.companyId
          },
          order: { occurredAt: 'DESC' },
          take: 10
        })
      ]);

    return {
      success: true,
      data: {
        current: {
          activeUsers: users,
          openRooms: rooms,
          messages,
          files,
          activeCalls
        },
        subscription: currentSubscription,
        latestSnapshot,
        recentEvents
      },
      error: null,
      meta: null
    };
  }

  async getUsageSummary(actor: AnalyticsActor, query: UsageSummaryQueryDto) {
    const data = await this.buildUsageSummary(actor.companyId, query);

    return {
      success: true,
      data,
      error: null,
      meta: null
    };
  }

  async getPlatformUsageSummary(query: UsageSummaryQueryDto) {
    const data = await this.buildUsageSummary(null, query);

    return {
      success: true,
      data,
      error: null,
      meta: null
    };
  }

  async getPlatformDashboard() {
    const [companies, users, messages, files, activeSubscriptions, latestSnapshot, recentEvents] =
      await Promise.all([
        this.companiesRepository.count(),
        this.usersRepository.count({ where: { isActive: true } }),
        this.messagesRepository.count({ where: { deletedAt: IsNull() } }),
        this.filesRepository.count({ where: { deletedAt: IsNull() } }),
        this.subscriptionsRepository.count({ where: { isActive: true } }),
        this.snapshotsRepository.findOne({
          where: { scope: 'platform', companyId: IsNull() },
          order: { snapshotDate: 'DESC' }
        }),
        this.usageEventsRepository.find({
          order: { occurredAt: 'DESC' },
          take: 12
        })
      ]);

    return {
      success: true,
      data: {
        current: {
          companies,
          activeUsers: users,
          messages,
          files,
          activeSubscriptions
        },
        latestSnapshot,
        recentEvents
      },
      error: null,
      meta: null
    };
  }

  async getUsageComparison(actor: AnalyticsActor, query: UsageSummaryQueryDto) {
    const data = await this.buildUsageComparison(actor.companyId, query);

    return {
      success: true,
      data,
      error: null,
      meta: null
    };
  }

  async getPlatformUsageComparison(query: UsageSummaryQueryDto) {
    const data = await this.buildUsageComparison(null, query);

    return {
      success: true,
      data,
      error: null,
      meta: null
    };
  }

  async getPlatformStats() {
    const [companies, users, messages, files, activeSubscriptions, latestSnapshot] = await Promise.all([
      this.companiesRepository.count(),
      this.usersRepository.count({ where: { isActive: true } }),
      this.messagesRepository.count({ where: { deletedAt: IsNull() } }),
      this.filesRepository.count({ where: { deletedAt: IsNull() } }),
      this.subscriptionsRepository.count({ where: { isActive: true } }),
      this.snapshotsRepository.findOne({
        where: { scope: 'platform', companyId: IsNull() },
        order: { snapshotDate: 'DESC' }
      })
    ]);

    return {
      success: true,
      data: {
        companies,
        activeUsers: users,
        messages,
        files,
        activeSubscriptions,
        latestSnapshot
      },
      error: null,
      meta: null
    };
  }

  private async buildUsageSummary(companyId: string | null, query: UsageSummaryQueryDto): Promise<UsageSummaryData> {
    const now = new Date();
    const start = query.dateFrom
      ? toStartOfDay(query.dateFrom)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const end = query.dateTo ? toEndOfDay(query.dateTo) : now;

    const events = await this.usageEventsRepository.find(buildEventFindOptions(companyId, start, end));

    const filteredEvents = query.eventType
      ? events.filter((event) => event.eventType === query.eventType)
      : events;

    const counts = filteredEvents.reduce<Record<string, number>>((accumulator, event) => {
      accumulator[event.eventType] = (accumulator[event.eventType] ?? 0) + 1;
      return accumulator;
    }, {});

    const eventTypes = Array.from(new Set(events.map((event) => event.eventType))).sort();
    const timeline = buildTimelineBuckets(filteredEvents, start, end);
    const entityBreakdown = Object.entries(
      filteredEvents.reduce<Record<string, number>>((accumulator, event) => {
        const label = event.entityType ?? 'event';
        accumulator[label] = (accumulator[label] ?? 0) + 1;
        return accumulator;
      }, {})
    )
      .sort((left, right) => right[1] - left[1])
      .slice(0, 6)
      .map(([label, total]) => ({ label, total }));

    return {
      dateFrom: start.toISOString(),
      dateTo: end.toISOString(),
      eventType: query.eventType ?? null,
      eventTypes,
      counts,
      totalEvents: filteredEvents.length,
      timeline,
      entityBreakdown
    };
  }

  private async buildUsageComparison(companyId: string | null, query: UsageSummaryQueryDto) {
    const now = new Date();
    const currentStart = query.dateFrom
      ? toStartOfDay(query.dateFrom)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const currentEnd = query.dateTo ? toEndOfDay(query.dateTo) : now;
    const periodMs = Math.max(currentEnd.getTime() - currentStart.getTime(), 24 * 60 * 60 * 1000);
    const previousEnd = new Date(currentStart.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - periodMs);

    const [current, previous] = await Promise.all([
      this.buildUsageSummary(companyId, query),
      this.buildUsageSummary(companyId, {
        dateFrom: previousStart.toISOString(),
        dateTo: previousEnd.toISOString(),
        eventType: query.eventType
      })
    ]);

    const delta = current.totalEvents - previous.totalEvents;
    const deltaPercent = previous.totalEvents
      ? Number((((current.totalEvents - previous.totalEvents) / previous.totalEvents) * 100).toFixed(2))
      : current.totalEvents > 0
        ? 100
        : 0;

    return {
      current,
      previous,
      delta,
      deltaPercent
    };
  }

  async aggregateDailySnapshots(targetDate: Date, companyId: string | null) {
    const dateFrom = new Date(targetDate);
    dateFrom.setHours(0, 0, 0, 0);
    const dateTo = new Date(targetDate);
    dateTo.setHours(23, 59, 59, 999);
    const snapshotDate = dateFrom.toISOString().slice(0, 10);

    const where = companyId
      ? { companyId, occurredAt: Between(dateFrom, dateTo) }
      : { occurredAt: Between(dateFrom, dateTo) };

    const events = await this.usageEventsRepository.find({
      where
    });

    const counts = events.reduce<Record<string, number>>((accumulator, event) => {
      accumulator[event.eventType] = (accumulator[event.eventType] ?? 0) + 1;
      return accumulator;
    }, {});

    const scope = companyId ? 'tenant' : 'platform';
    const existing = await this.snapshotsRepository.findOne({
      where: {
        companyId: companyId ?? IsNull(),
        scope,
        snapshotDate
      }
    });

    const snapshot = existing ?? this.snapshotsRepository.create({
      companyId,
      scope,
      snapshotDate,
      summary: {}
    });
    snapshot.summary = {
      events: counts,
      totalEvents: events.length
    };

    return this.snapshotsRepository.save(snapshot);
  }
}

function buildEventFindOptions(companyId: string | null, start: Date, end: Date) {
  return {
    where: companyId
      ? {
          companyId,
          occurredAt: Between(start, end)
        }
      : {
          occurredAt: Between(start, end)
        },
    order: { occurredAt: 'ASC' as const }
  };
}

function toStartOfDay(value: string) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toEndOfDay(value: string) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function buildTimelineBuckets(events: UsageEvent[], start: Date, end: Date): TimelineBucket[] {
  const buckets = new Map<string, TimelineBucket>();
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    buckets.set(key, {
      bucket: key,
      total: 0,
      counts: {}
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const event of events) {
    const key = event.occurredAt.toISOString().slice(0, 10);
    const bucket = buckets.get(key);

    if (!bucket) {
      continue;
    }

    bucket.total += 1;
    bucket.counts[event.eventType] = (bucket.counts[event.eventType] ?? 0) + 1;
  }

  return Array.from(buckets.values());
}
