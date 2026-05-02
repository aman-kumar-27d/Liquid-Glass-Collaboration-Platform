'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useRealtimeSocket } from '@/hooks/use-realtime-socket';
import { apiRequest } from '@/lib/api-client';
import { emitWithAck } from '@/lib/realtime-client';
import { ApiEnvelope, CallParticipantRecord, RoomRecord, VideoCallRecord } from '@/lib/types';
import { GlassCard } from '../liquid-glass/glass-card';

export function CallsConsole() {
  const { ready, session, setSession } = useAuthSession();
  const { socket, status: socketStatus, connectionError } = useRealtimeSocket(session);
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<VideoCallRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useEffectEvent(async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    const roomsEnvelope = await apiRequest<RoomRecord[]>('/rooms', {
      requiresAuth: true,
      session,
      onSessionChange: setSession
    });

    setRooms(roomsEnvelope.data);
    if (!activeRoomId && roomsEnvelope.data.length) {
      setActiveRoomId(roomsEnvelope.data[0].id);
    }
  });

  const loadActiveCall = useEffectEvent(async () => {
    if (!session || !activeRoomId) {
      setActiveCall(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const envelope = await apiRequest<VideoCallRecord | null>(`/calls/rooms/${activeRoomId}/active`, {
        requiresAuth: true,
        session,
        onSessionChange: setSession
      });

      setActiveCall(envelope.data);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to load call state';
      setError(message);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!ready || !session) {
      return;
    }

    void loadRooms();
  }, [ready, session, loadRooms]);

  useEffect(() => {
    if (!ready || !session) {
      return;
    }

    void loadActiveCall();
  }, [ready, session, activeRoomId, loadActiveCall]);

  const startCall = async () => {
    if (!session || !activeRoomId) {
      return;
    }

    const envelope = await apiRequest<VideoCallRecord, { roomId: string }>('/calls/start', {
      method: 'POST',
      body: { roomId: activeRoomId },
      requiresAuth: true,
      session,
      onSessionChange: setSession
    });

    setActiveCall(envelope.data);
    if (socket && socketStatus === 'connected') {
      await emitWithAck<ApiEnvelope<CallParticipantRecord>, { callId: string }>(socket, 'call.join', {
        callId: envelope.data.id
      });
    }
  };

  const joinCall = async () => {
    if (!session || !activeCall) {
      return;
    }

    if (socket && socketStatus === 'connected') {
      await emitWithAck<ApiEnvelope<CallParticipantRecord>, { callId: string }>(socket, 'call.join', {
        callId: activeCall.id
      });
    } else {
      await apiRequest(`/calls/join`, {
        method: 'POST',
        body: { callId: activeCall.id },
        requiresAuth: true,
        session,
        onSessionChange: setSession
      });
    }

    await loadActiveCall();
  };

  const leaveCall = async () => {
    if (!session || !activeCall) {
      return;
    }

    if (socket && socketStatus === 'connected') {
      await emitWithAck<ApiEnvelope<CallParticipantRecord>, { callId: string }>(socket, 'call.leave', {
        callId: activeCall.id
      });
    } else {
      await apiRequest(`/calls/${activeCall.id}/leave`, {
        method: 'POST',
        requiresAuth: true,
        session,
        onSessionChange: setSession
      });
    }

    await loadActiveCall();
  };

  const endCall = async () => {
    if (!session || !activeCall) {
      return;
    }

    await apiRequest(`/calls/${activeCall.id}/end`, {
      method: 'POST',
      requiresAuth: true,
      session,
      onSessionChange: setSession
    });

    setActiveCall(null);
  };

  useEffect(() => {
    if (!socket) {
      return;
    }

    const onCallJoined = (payload: CallParticipantRecord) => {
      setActiveCall((current) => {
        if (!current || current.id !== payload.callId) {
          return current;
        }

        const participants = current.participants.some((participant) => participant.id === payload.id)
          ? current.participants.map((participant) =>
              participant.id === payload.id ? payload : participant
            )
          : [...current.participants, payload];

        return { ...current, participants };
      });
    };

    const onCallLeft = (payload: CallParticipantRecord) => {
      setActiveCall((current) => {
        if (!current || current.id !== payload.callId) {
          return current;
        }

        return {
          ...current,
          participants: current.participants.map((participant) =>
            participant.id === payload.id ? payload : participant
          )
        };
      });
    };

    socket.on('call.joined', onCallJoined);
    socket.on('call.left', onCallLeft);

    return () => {
      socket.off('call.joined', onCallJoined);
      socket.off('call.left', onCallLeft);
    };
  }, [socket]);

  if (!ready) {
    return <div className="text-sm text-white/70">Loading session...</div>;
  }

  if (!session) {
    return <div className="text-sm text-white/70">Sign in to load active room calls.</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <GlassCard>
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Rooms</div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {rooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => setActiveRoomId(room.id)}
              className={`aspect-video rounded-[28px] border p-5 text-left transition ${
                activeRoomId === room.id
                  ? 'border-cyan-300/30 bg-cyan-300/10'
                  : 'border-white/12 bg-gradient-to-br from-white/10 to-slate-950/30'
              }`}
            >
              <div className="text-sm text-white/55">{room.type}</div>
              <div className="mt-3 font-display text-2xl text-white">{room.name}</div>
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="space-y-6">
        <GlassCard>
          <div className="text-sm uppercase tracking-[0.28em] text-white/60">Call State</div>
          <div className="mt-4 space-y-3 text-sm text-white/75">
            <div>Selected room: {rooms.find((room) => room.id === activeRoomId)?.name ?? 'None'}</div>
            <div>
              Call status: {activeCall ? 'active' : loading ? 'loading' : 'idle'} | socket {socketStatus}
            </div>
            <div>
              Participants:{' '}
              {activeCall?.participants.filter((participant) => !participant.leftAt).length ?? 0}
            </div>
            {error ? <div className="text-rose-100">{error}</div> : null}
            {connectionError ? <div className="text-amber-100">{connectionError}</div> : null}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-sm uppercase tracking-[0.28em] text-white/60">Controls</div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void startCall()}
              className="rounded-full border border-white/14 px-4 py-2 text-sm text-white/75"
            >
              Start Call
            </button>
            <button
              type="button"
              onClick={() => void joinCall()}
              disabled={!activeCall}
              className="rounded-full border border-white/14 px-4 py-2 text-sm text-white/75 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Join
            </button>
            <button
              type="button"
              onClick={() => void leaveCall()}
              disabled={!activeCall}
              className="rounded-full border border-white/14 px-4 py-2 text-sm text-white/75 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Leave
            </button>
            <button
              type="button"
              onClick={() => void endCall()}
              disabled={!activeCall}
              className="rounded-full border border-white/14 px-4 py-2 text-sm text-white/75 disabled:cursor-not-allowed disabled:opacity-60"
            >
              End
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
