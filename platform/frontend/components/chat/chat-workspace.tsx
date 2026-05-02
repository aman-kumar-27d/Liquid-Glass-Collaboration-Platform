'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useRealtimeSocket } from '@/hooks/use-realtime-socket';
import { apiRequest, uploadFormRequest } from '@/lib/api-client';
import { emitWithAck } from '@/lib/realtime-client';
import { ApiEnvelope, MessageReaction, MessageRecord, RoomRecord, StoredFile } from '@/lib/types';
import { ChannelList } from './channel-list';
import { ChatFeed } from './chat-feed';
import { PresencePanel } from './presence-panel';

export function ChatWorkspace() {
  const { ready, session, setSession } = useAuthSession();
  const { socket, status: socketStatus, connectionError } = useRealtimeSocket(session);
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<RoomRecord | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [attachments, setAttachments] = useState<StoredFile[]>([]);
  const [draft, setDraft] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presence, setPresence] = useState<Record<string, string>>({});
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const typingStartedRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setAttachments([]);
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
    if (!session || !activeRoomId || (!draft.trim() && !attachments.length)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const envelope = await apiRequest<
        MessageRecord,
        { roomId: string; content: string; fileIds?: string[]; type: string }
      >(
        '/messages',
        {
          method: 'POST',
          body: {
            roomId: activeRoomId,
            content: draft.trim() || 'File attachment',
            fileIds: attachments.map((file) => file.id),
            type: 'text'
          },
          requiresAuth: true,
          session,
          onSessionChange: setSession
        }
      );

      setMessages((current) => [...current, envelope.data]);
      setDraft('');
      setAttachments([]);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to send message';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!session || !activeRoomId || !files?.length) {
      return;
    }

    setFileUploading(true);
    setError(null);

    try {
      const uploadedFiles: StoredFile[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('roomId', activeRoomId);

        const envelope = await uploadFormRequest<StoredFile>('/files/upload', formData, session, setSession);
        uploadedFiles.push(envelope.data);
      }

      setAttachments((current) => [...current, ...uploadedFiles]);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to upload file';
      setError(message);
    } finally {
      setFileUploading(false);
    }
  };

  const removeAttachment = (fileId: string) => {
    setAttachments((current) => current.filter((file) => file.id !== fileId));
  };

  const upsertMessage = useEffectEvent((nextMessage: MessageRecord) => {
    setMessages((current) => {
      const existingIndex = current.findIndex((message) => message.id === nextMessage.id);
      if (existingIndex === -1) {
        return [...current, nextMessage];
      }

      const clone = current.slice();
      clone[existingIndex] = nextMessage;
      return clone;
    });
  });

  useEffect(() => {
    if (!socket || socketStatus !== 'connected' || !activeRoomId) {
      return;
    }

    socket.emit('join_room', { roomId: activeRoomId });

    return () => {
      socket.emit('leave_room', { roomId: activeRoomId });
    };
  }, [socket, socketStatus, activeRoomId]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const onMessageCreated = (payload: MessageRecord) => {
      if (payload.roomId === activeRoomId) {
        upsertMessage(payload);
      }
    };

    const onMessageUpdated = (payload: MessageRecord) => {
      if (payload.roomId === activeRoomId) {
        upsertMessage(payload);
      }
    };

    const onMessageDeleted = (payload: MessageRecord) => {
      if (payload.roomId === activeRoomId) {
        setMessages((current) => current.filter((message) => message.id !== payload.id));
      }
    };

    const onReactionAdded = (payload: MessageReaction) => {
      setMessages((current) =>
        current.map((message) =>
          message.id === payload.messageId &&
          !message.reactions.some((reaction) => reaction.id === payload.id)
            ? { ...message, reactions: [...message.reactions, payload] }
            : message
        )
      );
    };

    const onPresenceChanged = (payload: { status: string; userId: string }) => {
      setPresence((current) => ({ ...current, [payload.userId]: payload.status }));
    };

    const onTypingStarted = (payload: { roomId: string; userId: string }) => {
      if (payload.roomId !== activeRoomId) {
        return;
      }

      setTypingUserIds((current) =>
        current.includes(payload.userId) ? current : [...current, payload.userId]
      );
    };

    const onTypingStopped = (payload: { roomId: string; userId: string }) => {
      if (payload.roomId !== activeRoomId) {
        return;
      }

      setTypingUserIds((current) => current.filter((userId) => userId !== payload.userId));
    };

    socket.on('message.created', onMessageCreated);
    socket.on('message.updated', onMessageUpdated);
    socket.on('message.deleted', onMessageDeleted);
    socket.on('reaction.added', onReactionAdded);
    socket.on('presence.changed', onPresenceChanged);
    socket.on('typing.started', onTypingStarted);
    socket.on('typing.stopped', onTypingStopped);

    return () => {
      socket.off('message.created', onMessageCreated);
      socket.off('message.updated', onMessageUpdated);
      socket.off('message.deleted', onMessageDeleted);
      socket.off('reaction.added', onReactionAdded);
      socket.off('presence.changed', onPresenceChanged);
      socket.off('typing.started', onTypingStarted);
      socket.off('typing.stopped', onTypingStopped);
    };
  }, [socket, activeRoomId, upsertMessage]);

  useEffect(() => {
    if (!socket || socketStatus !== 'connected' || !activeRoomId) {
      return;
    }

    if (!draft.trim()) {
      if (typingStartedRef.current) {
        socket.emit('typing_stop', { roomId: activeRoomId });
        typingStartedRef.current = false;
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      return;
    }

    if (!typingStartedRef.current) {
      socket.emit('typing_start', { roomId: activeRoomId });
      typingStartedRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { roomId: activeRoomId });
      typingStartedRef.current = false;
      typingTimeoutRef.current = null;
    }, 1200);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, socketStatus, activeRoomId, draft]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

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
      {connectionError ? (
        <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 px-4 py-4 text-sm text-amber-100">
          Websocket connection issue: {connectionError}
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
          attachments={attachments}
          draft={draft}
          fileUploading={fileUploading}
          loading={loading}
          messages={messages}
          onDraftChange={setDraft}
          onFileSelect={(files) => void uploadFiles(files)}
          onRemoveAttachment={removeAttachment}
          onSend={async () => {
            if (!session || !activeRoomId || (!draft.trim() && !attachments.length)) {
              return;
            }

            setLoading(true);
            setError(null);

            try {
              if (socket && socketStatus === 'connected') {
                const envelope = await emitWithAck<
                  ApiEnvelope<MessageRecord>,
                  { content: string; fileIds?: string[]; roomId: string; type: string }
                >(
                  socket,
                  'message.create',
                  {
                    roomId: activeRoomId,
                    content: draft.trim() || 'File attachment',
                    fileIds: attachments.map((file) => file.id),
                    type: 'text'
                  }
                );
                setMessages((current) => [...current, envelope.data]);
                setDraft('');
                setAttachments([]);
                return;
              }

              await sendMessage();
            } catch (requestError) {
              const message =
                requestError instanceof Error ? requestError.message : 'Failed to send message';
              setError(message);
            } finally {
              setLoading(false);
            }
          }}
        />
        <PresencePanel
          activeRoom={activeRoom}
          connectionStatus={socketStatus}
          presence={presence}
          session={session}
          typingUserIds={typingUserIds}
        />
      </div>
    </div>
  );
}
