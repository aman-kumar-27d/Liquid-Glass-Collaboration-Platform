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
      entityType: input.entityType ?? null,
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
    const now = new Date();
    const start = query.dateFrom ? new Date(query.dateFrom) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const end = query.dateTo ? new Date(query.dateTo) : now;

    const events = await this.usageEventsRepository.find({
      where: {
        companyId: actor.companyId,
        occurredAt: Between(start, end)
      },
      order: { occurredAt: 'ASC' }
    });

    const counts = events.reduce<Record<string, number>>((accumulator, event) => {
      accumulator[event.eventType] = (accumulator[event.eventType] ?? 0) + 1;
      return accumulator;
    }, {});

    return {
      success: true,
      data: {
        dateFrom: start.toISOString(),
        dateTo: end.toISOString(),
        counts,
        totalEvents: events.length
      },
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
