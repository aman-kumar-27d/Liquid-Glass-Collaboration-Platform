export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error: string | null;
  meta: Record<string, unknown> | null;
}

export interface CompanySummary {
  id: string;
  name: string;
  domain: string;
  plan: string;
}

export interface AuthUser {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
  company?: CompanySummary | null;
}

export interface RoomMember {
  id: string;
  roomId: string;
  userId: string;
  role: string;
  joinedAt: string;
}

export interface RoomRecord {
  id: string;
  companyId: string;
  name: string;
  type: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  members?: RoomMember[];
}

export interface StoredFile {
  id: string;
  companyId: string;
  roomId: string;
  messageId?: string | null;
  originalName: string;
  mimeType: string;
  size: number;
  fileUrl?: string | null;
  storageDriver: string;
  createdAt: string;
}

export interface MessageReaction {
  id: string;
  companyId: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface MessageRecord {
  id: string;
  companyId: string;
  roomId: string;
  senderId: string;
  content: string;
  type: string;
  parentMessageId?: string | null;
  editedAt?: string | null;
  deletedAt?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  reactions: MessageReaction[];
  files: StoredFile[];
}

export interface SubscriptionPlanRecord {
  plan: string;
  maxUsers: number | null;
  maxStorageGb: number | null;
}

export interface SubscriptionRecord {
  id: string;
  companyId: string;
  plan: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminUserRecord {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface CallParticipantRecord {
  id: string;
  callId: string;
  userId: string;
  joinedAt: string;
  leftAt?: string | null;
}

export interface VideoCallRecord {
  id: string;
  companyId: string;
  roomId: string;
  startedBy: string;
  endedAt?: string | null;
  createdAt: string;
  participants: CallParticipantRecord[];
}

export interface ScreenShareRecord {
  id: string;
  companyId: string;
  callId: string;
  userId: string;
  startedAt: string;
  endedAt?: string | null;
}

export interface UsageEventRecord {
  id: string;
  companyId?: string | null;
  userId?: string | null;
  eventType: string;
  entityType?: string | null;
  entityId?: string | null;
  occurredAt: string;
  metadata?: Record<string, unknown> | null;
}

export interface AnalyticsSnapshotRecord {
  id: string;
  companyId?: string | null;
  scope: string;
  snapshotDate: string;
  summary: Record<string, unknown>;
  createdAt: string;
}

export interface AnalyticsDashboardRecord {
  current: {
    activeUsers: number;
    openRooms: number;
    messages: number;
    files: number;
    activeCalls: number;
  };
  subscription: SubscriptionRecord | null;
  latestSnapshot: AnalyticsSnapshotRecord | null;
  recentEvents: UsageEventRecord[];
}

export interface UsageSummaryRecord {
  dateFrom: string;
  dateTo: string;
  counts: Record<string, number>;
  totalEvents: number;
}
