'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { useAuthSession } from '@/hooks/use-auth-session';
import { apiRequest } from '@/lib/api-client';
import { MessageRecord, RoomRecord } from '@/lib/types';
import { ChannelList } from './channel-list';
import { ChatFeed } from './chat-feed';
import { PresencePanel } from './presence-panel';

export function ChatWorkspace() {
  const { ready, session, setSession } = useAuthSession();
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<RoomRecord | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useEffectEvent(async () => {
    if (!session) {
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

  const loadActiveRoom = useEffectEvent(async () => {
    if (!session || !activeRoomId) {
      setActiveRoom(null);
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [roomEnvelope, messagesEnvelope] = await Promise.all([
        apiRequest<RoomRecord>(`/rooms/${activeRoomId}`, {
          requiresAuth: true,
          session,
          onSessionChange: setSession
        }),
        apiRequest<MessageRecord[]>(`/messages?roomId=${activeRoomId}&limit=50`, {
          requiresAuth: true,
          session,
          onSessionChange: setSession
        })
      ]);

      setActiveRoom(roomEnvelope.data);
      setMessages(messagesEnvelope.data);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to load room data';
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

    void loadActiveRoom();
  }, [ready, session, activeRoomId, loadActiveRoom]);

  const createRoom = async (name: string) => {
    if (!session) {
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const envelope = await apiRequest<RoomRecord, { name: string; type: string }>('/rooms', {
        method: 'POST',
        body: { name, type: 'channel' },
        requiresAuth: true,
        session,
        onSessionChange: setSession
      });

      setRooms((current) => [envelope.data, ...current]);
      setActiveRoomId(envelope.data.id);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to create room';
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const sendMessage = async () => {
    if (!session || !activeRoomId || !draft.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const envelope = await apiRequest<MessageRecord, { roomId: string; content: string; type: string }>(
        '/messages',
        {
          method: 'POST',
          body: {
            roomId: activeRoomId,
            content: draft.trim(),
            type: 'text'
          },
          requiresAuth: true,
          session,
          onSessionChange: setSession
        }
      );

      setMessages((current) => [...current, envelope.data]);
      setDraft('');
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to send message';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return <div className="text-sm text-white/70">Loading session...</div>;
  }

  if (!session) {
    return <div className="text-sm text-white/70">Sign in from the auth page to load chat data.</div>;
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-3xl border border-rose-300/20 bg-rose-300/10 px-4 py-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.4fr_0.8fr]">
        <ChannelList
          activeRoomId={activeRoomId}
          creating={creating}
          onCreateRoom={createRoom}
          onSelectRoom={setActiveRoomId}
          rooms={rooms}
        />
        <ChatFeed
          activeRoom={activeRoom}
          draft={draft}
          loading={loading}
          messages={messages}
          onDraftChange={setDraft}
          onSend={sendMessage}
        />
        <PresencePanel activeRoom={activeRoom} session={session} />
      </div>
    </div>
  );
}
