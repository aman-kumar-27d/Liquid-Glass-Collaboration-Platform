'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { useAuthSession } from '@/hooks/use-auth-session';
import { apiRequest } from '@/lib/api-client';
import { AdminUserRecord, RoomRecord } from '@/lib/types';
import { GlassCard } from '../liquid-glass/glass-card';

export function AdminConsole() {
  const { ready, session, setSession } = useAuthSession();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin =
    session?.user.role === 'company_admin' || session?.user.role === 'master_admin';

  const loadAdminData = useEffectEvent(async () => {
    if (!session || !isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [usersEnvelope, roomsEnvelope] = await Promise.all([
        apiRequest<AdminUserRecord[]>('/admin/users', {
          requiresAuth: true,
          session,
          onSessionChange: setSession
        }),
        apiRequest<RoomRecord[]>('/admin/rooms', {
          requiresAuth: true,
          session,
          onSessionChange: setSession
        })
      ]);

      setUsers(usersEnvelope.data);
      setRooms(roomsEnvelope.data);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to load admin data';
      setError(message);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!ready) {
      return;
    }

    void loadAdminData();
  }, [ready, session, loadAdminData]);

  const toggleUserStatus = async (user: AdminUserRecord) => {
    if (!session) {
      return;
    }

    await apiRequest<AdminUserRecord, { isActive: boolean }>(`/admin/users/${user.id}`, {
      method: 'PATCH',
      body: { isActive: !user.isActive },
      requiresAuth: true,
      session,
      onSessionChange: setSession
    });

    setUsers((current) =>
      current.map((entry) =>
        entry.id === user.id ? { ...entry, isActive: !entry.isActive } : entry
      )
    );
  };

  if (!ready) {
    return <div className="text-sm text-white/70">Loading session...</div>;
  }

  if (!session) {
    return <div className="text-sm text-white/70">Sign in with an admin-capable session first.</div>;
  }

  if (!isAdmin) {
    return (
      <GlassCard>
        <div className="text-sm text-white/70">
          This surface requires `company_admin` or `master_admin` role.
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <GlassCard>
        <div className="flex items-center justify-between">
          <div className="text-sm uppercase tracking-[0.28em] text-white/60">Users</div>
          <button
            type="button"
            onClick={() => void loadAdminData()}
            className="rounded-full border border-white/14 px-4 py-2 text-xs text-white/75"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error ? <div className="mt-4 text-sm text-rose-100">{error}</div> : null}

        <div className="mt-5 space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-4 md:grid-cols-[1fr_auto_auto_auto]"
            >
              <div>
                <div className="font-medium text-white">{user.name}</div>
                <div className="mt-1 text-sm text-white/60">{user.email}</div>
              </div>
              <div className="text-sm text-white/65">{user.role}</div>
              <div className="text-sm text-cyan-100">{user.isActive ? 'active' : 'paused'}</div>
              <button
                type="button"
                onClick={() => void toggleUserStatus(user)}
                className="rounded-full border border-white/14 px-3 py-2 text-xs text-white/75"
              >
                {user.isActive ? 'Pause' : 'Restore'}
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Rooms</div>
        <div className="mt-4 space-y-3 text-sm text-white/75">
          {rooms.map((room) => (
            <div key={room.id} className="rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-4">
              <div className="font-medium text-white">{room.name}</div>
              <div className="mt-1 text-white/60">{room.type}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
