'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useRealtimeSocket } from '@/hooks/use-realtime-socket';
import { apiRequest } from '@/lib/api-client';
import { emitWithAck } from '@/lib/realtime-client';
import {
  ApiEnvelope,
  CallParticipantRecord,
  RoomRecord,
  ScreenShareRecord,
  VideoCallRecord
} from '@/lib/types';
import { GlassCard } from '../liquid-glass/glass-card';

export function CallsConsole() {
  const { ready, session, setSession } = useAuthSession();
  const { socket, status: socketStatus, connectionError } = useRealtimeSocket(session);
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<VideoCallRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [activeScreenShare, setActiveScreenShare] = useState<ScreenShareRecord | null>(null);
  const [mediaReady, setMediaReady] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [callNotice, setCallNotice] = useState<string | null>(null);
  const [peerConnectionStates, setPeerConnectionStates] = useState<Record<string, string>>({});
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const offeredTargetsRef = useRef<Set<string>>(new Set());
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);

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
      if (!envelope.data) {
        setActiveScreenShare(null);
        setCallNotice(null);
        offeredTargetsRef.current.clear();
      }
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to load call state';
      setError(message);
    } finally {
      setLoading(false);
    }
  });

  const stopStream = (stream: MediaStream | null) => {
    stream?.getTracks().forEach((track) => track.stop());
  };

  const resetPeerConnections = useEffectEvent(() => {
    peerConnectionsRef.current.forEach((connection) => connection.close());
    peerConnectionsRef.current.clear();
    offeredTargetsRef.current.clear();
    setRemoteStreams({});
    setPeerConnectionStates({});
  });

  const teardownMedia = useEffectEvent(() => {
    stopStream(displayStreamRef.current);
    stopStream(cameraStreamRef.current);
    displayStreamRef.current = null;
    cameraStreamRef.current = null;
    setLocalStream(null);
    setMediaReady(false);
    setCameraEnabled(true);
    setMicrophoneEnabled(true);
    setActiveScreenShare(null);
    setCallNotice(null);
    resetPeerConnections();
  });

  const buildIceServers = () => {
    const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
    const username = process.env.NEXT_PUBLIC_TURN_USERNAME;
    const credential = process.env.NEXT_PUBLIC_TURN_PASSWORD;

    if (turnUrl && username && credential) {
      return [{ urls: turnUrl, username, credential }];
    }

    return [{ urls: 'stun:stun.l.google.com:19302' }];
  };

  const ensureLocalMedia = useEffectEvent(async () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = microphoneEnabled;
      });
      cameraStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = cameraEnabled;
      });
      setLocalStream(displayStreamRef.current ?? cameraStreamRef.current);
      setMediaReady(true);
      return cameraStreamRef.current;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Browser media capture is not available');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
    stream.getAudioTracks().forEach((track) => {
      track.enabled = microphoneEnabled;
    });
    stream.getVideoTracks().forEach((track) => {
      track.enabled = cameraEnabled;
    });
    cameraStreamRef.current = stream;
    setLocalStream(stream);
    setMediaReady(true);
    setCallNotice(null);
    return stream;
  });

  const ensurePeerConnection = useEffectEvent((remoteUserId: string) => {
    const existing = peerConnectionsRef.current.get(remoteUserId);
    if (existing) {
      return existing;
    }

    const connection = new RTCPeerConnection({
      iceServers: buildIceServers()
    });

    connection.onicecandidate = (event) => {
      if (!event.candidate || !socket || !activeCall) {
        return;
      }

      socket.emit('call.candidate', {
        callId: activeCall.id,
        targetUserId: remoteUserId,
        candidate: event.candidate.toJSON()
      });
    };

    connection.ontrack = (event) => {
      const [stream] = event.streams;
      if (!stream) {
        return;
      }

      setRemoteStreams((current) => ({
        ...current,
        [remoteUserId]: stream
      }));
    };

    connection.onconnectionstatechange = () => {
      const nextState = connection.connectionState;
      setPeerConnectionStates((current) => ({
        ...current,
        [remoteUserId]: nextState
      }));

      if (nextState === 'failed') {
        setCallNotice(`Peer connection degraded for ${remoteUserId}.`);
      }
    };

    connection.oniceconnectionstatechange = () => {
      if (connection.iceConnectionState === 'failed') {
        setCallNotice(`ICE negotiation failed for ${remoteUserId}.`);
      }
    };

    const sourceStream = displayStreamRef.current ?? cameraStreamRef.current;
    sourceStream?.getTracks().forEach((track) => {
      connection.addTrack(track, sourceStream);
    });

    peerConnectionsRef.current.set(remoteUserId, connection);
    return connection;
  });

  const createOfferFor = useEffectEvent(async (remoteUserId: string) => {
    if (!socket || !activeCall || !session || remoteUserId === session.user.id) {
      return;
    }

    const connection = ensurePeerConnection(remoteUserId);
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);

    socket.emit('call.offer', {
      callId: activeCall.id,
      targetUserId: remoteUserId,
      sdp: offer
    });

    offeredTargetsRef.current.add(remoteUserId);
  });

  const joinedCall = Boolean(
    activeCall?.participants.some(
      (participant) => participant.userId === session?.user.id && !participant.leftAt
    )
  );

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

  useEffect(() => {
    if (!activeCall) {
      return;
    }

    offeredTargetsRef.current.clear();
  }, [activeCall?.id]);

  useEffect(() => {
    if (!activeCall || !joinedCall) {
      return;
    }

    if (socketStatus === 'disconnected') {
      setCallNotice('Realtime connection lost. Reconnecting call signaling...');
    }

    if (socketStatus === 'connected') {
      setCallNotice(null);
    }
  }, [socketStatus, activeCall, joinedCall]);

  useEffect(() => {
    if (!socket || !activeCall || !joinedCall || !mediaReady) {
      return;
    }

    const activeParticipants = activeCall.participants.filter(
      (participant) => !participant.leftAt && participant.userId !== session?.user.id
    );

    for (const participant of activeParticipants) {
      if (!offeredTargetsRef.current.has(participant.userId)) {
        void createOfferFor(participant.userId);
      }
    }
  }, [socket, activeCall, joinedCall, mediaReady, session?.user.id, createOfferFor]);

  useEffect(() => {
    if (!socket || socketStatus !== 'connected' || !activeCall || !joinedCall) {
      return;
    }

    void emitWithAck<ApiEnvelope<CallParticipantRecord>, { callId: string }>(socket, 'call.join', {
      callId: activeCall.id
    })
      .then(() => loadActiveCall())
      .catch((requestError) => {
        const message =
          requestError instanceof Error ? requestError.message : 'Failed to restore call signaling';
        setCallNotice(message);
      });
  }, [socket, socketStatus, activeCall?.id, joinedCall, loadActiveCall]);

  const startCall = async () => {
    if (!session || !activeRoomId) {
      return;
    }

    try {
      await ensureLocalMedia();
      setCallNotice(null);
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
      await loadActiveCall();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to start call';
      setError(message);
    }
  };

  const joinCall = async () => {
    if (!session || !activeCall) {
      return;
    }

    try {
      await ensureLocalMedia();
      setCallNotice(null);

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
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to join call';
      setError(message);
    }
  };

  const leaveCall = async () => {
    if (!session || !activeCall) {
      return;
    }

    try {
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

      teardownMedia();
      await loadActiveCall();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to leave call';
      setError(message);
    }
  };

  const endCall = async () => {
    if (!session || !activeCall) {
      return;
    }

    try {
      await apiRequest(`/calls/${activeCall.id}/end`, {
        method: 'POST',
        requiresAuth: true,
        session,
        onSessionChange: setSession
      });

      setActiveCall(null);
      teardownMedia();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to end call';
      setError(message);
    }
  };

  const toggleMicrophone = () => {
    const nextEnabled = !microphoneEnabled;
    cameraStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = nextEnabled;
    });
    displayStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = nextEnabled;
    });
    setMicrophoneEnabled(nextEnabled);
  };

  const toggleCamera = () => {
    const nextEnabled = !cameraEnabled;
    cameraStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = nextEnabled;
    });

    if (!displayStreamRef.current) {
      peerConnectionsRef.current.forEach((connection) => {
        const sender = connection.getSenders().find((item) => item.track?.kind === 'video');
        const track = cameraStreamRef.current?.getVideoTracks()[0] ?? null;
        if (sender) {
          void sender.replaceTrack(nextEnabled ? track : null);
        }
      });
    }

    setCameraEnabled(nextEnabled);
  };

  const startScreenShare = async () => {
    if (!session || !activeCall) {
      return;
    }

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen sharing is not available in this browser or context');
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      displayStreamRef.current = stream;
      setLocalStream(stream);
      const videoTrack = stream.getVideoTracks()[0];

      if (videoTrack) {
        peerConnectionsRef.current.forEach((connection) => {
          const sender = connection.getSenders().find((item) => item.track?.kind === 'video');
          if (sender) {
            void sender.replaceTrack(videoTrack);
          }
        });
      }

      videoTrack?.addEventListener('ended', () => {
        void stopScreenShare();
      });

      let share: ScreenShareRecord;
      if (socket && socketStatus === 'connected') {
        const envelope = await emitWithAck<ApiEnvelope<ScreenShareRecord>, { callId: string }>(
          socket,
          'screen.start',
          { callId: activeCall.id }
        );
        share = envelope.data;
      } else {
        const envelope = await apiRequest<ScreenShareRecord, { callId: string }>('/screen-share/start', {
          method: 'POST',
          body: { callId: activeCall.id },
          requiresAuth: true,
          session,
          onSessionChange: setSession
        });
        share = envelope.data;
      }

      setActiveScreenShare(share);
      setCallNotice(null);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to start screen share';
      setError(message);
    }
  };

  const stopScreenShare = async () => {
    if (!session || !activeCall || !activeScreenShare) {
      return;
    }

    try {
      if (socket && socketStatus === 'connected') {
        await emitWithAck<ApiEnvelope<ScreenShareRecord>, { callId: string }>(socket, 'screen.stop', {
          callId: activeCall.id
        });
      } else {
        await apiRequest(`/screen-share/${activeCall.id}/stop`, {
          method: 'POST',
          requiresAuth: true,
          session,
          onSessionChange: setSession
        });
      }

      stopStream(displayStreamRef.current);
      displayStreamRef.current = null;
      setActiveScreenShare(null);

      const cameraStream = await ensureLocalMedia();
      const cameraVideoTrack = cameraStream.getVideoTracks()[0];
      peerConnectionsRef.current.forEach((connection) => {
        const sender = connection.getSenders().find((item) => item.track?.kind === 'video');
        if (sender && cameraVideoTrack) {
          void sender.replaceTrack(cameraVideoTrack);
        }
      });
      setLocalStream(cameraStream);
      setCallNotice(null);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Failed to stop screen share';
      setError(message);
    }
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

      if (payload.leftAt) {
        const connection = peerConnectionsRef.current.get(payload.userId);
        connection?.close();
        peerConnectionsRef.current.delete(payload.userId);
        setPeerConnectionStates((current) => {
          const clone = { ...current };
          delete clone[payload.userId];
          return clone;
        });
        setRemoteStreams((current) => {
          const clone = { ...current };
          delete clone[payload.userId];
          return clone;
        });
      }
    };

    const onCallOffer = async (payload: {
      callId: string;
      fromUserId: string;
      targetUserId: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      if (
        !session ||
        payload.targetUserId !== session.user.id ||
        !activeCall ||
        payload.callId !== activeCall.id
      ) {
        return;
      }

      await ensureLocalMedia();
      const connection = ensurePeerConnection(payload.fromUserId);
      await connection.setRemoteDescription(payload.sdp);
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);
      socket.emit('call.answer', {
        callId: payload.callId,
        targetUserId: payload.fromUserId,
        sdp: answer
      });
    };

    const onCallAnswer = async (payload: {
      callId: string;
      fromUserId: string;
      targetUserId: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      if (
        !session ||
        payload.targetUserId !== session.user.id ||
        !activeCall ||
        payload.callId !== activeCall.id
      ) {
        return;
      }

      const connection = ensurePeerConnection(payload.fromUserId);
      await connection.setRemoteDescription(payload.sdp);
    };

    const onCallCandidate = async (payload: {
      callId: string;
      fromUserId: string;
      targetUserId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      if (
        !session ||
        payload.targetUserId !== session.user.id ||
        !activeCall ||
        payload.callId !== activeCall.id
      ) {
        return;
      }

      const connection = ensurePeerConnection(payload.fromUserId);
      await connection.addIceCandidate(payload.candidate);
    };

    const onScreenStarted = (payload: ScreenShareRecord) => {
      if (activeCall && payload.callId === activeCall.id) {
        setActiveScreenShare(payload);
      }
    };

    const onScreenStopped = (payload: ScreenShareRecord) => {
      if (activeCall && payload.callId === activeCall.id) {
        setActiveScreenShare(null);
      }
    };

    socket.on('call.joined', onCallJoined);
    socket.on('call.left', onCallLeft);
    socket.on('call.offer', onCallOffer);
    socket.on('call.answer', onCallAnswer);
    socket.on('call.candidate', onCallCandidate);
    socket.on('screen.started', onScreenStarted);
    socket.on('screen.stopped', onScreenStopped);

    return () => {
      socket.off('call.joined', onCallJoined);
      socket.off('call.left', onCallLeft);
      socket.off('call.offer', onCallOffer);
      socket.off('call.answer', onCallAnswer);
      socket.off('call.candidate', onCallCandidate);
      socket.off('screen.started', onScreenStarted);
      socket.off('screen.stopped', onScreenStopped);
    };
  }, [socket, session, activeCall, ensureLocalMedia, ensurePeerConnection]);

  useEffect(() => () => teardownMedia(), [teardownMedia]);

  const activeParticipants =
    activeCall?.participants.filter((participant) => !participant.leftAt) ?? [];

  if (!ready) {
    return <div className="text-sm text-white/70">Loading session...</div>;
  }

  if (!session) {
    return <div className="text-sm text-white/70">Sign in to load active room calls.</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <GlassCard>
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Call Grid</div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {rooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => setActiveRoomId(room.id)}
              className={`rounded-[28px] border p-5 text-left transition ${
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

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <VideoTile
            label={activeScreenShare?.userId === session.user.id ? 'You are sharing screen' : 'Local Preview'}
            stream={localStream}
            subtitle={
              mediaReady
                ? `Mic ${microphoneEnabled ? 'on' : 'muted'} | Camera ${
                    displayStreamRef.current ? 'screen' : cameraEnabled ? 'on' : 'off'
                  }`
                : 'Media idle'
            }
            muted
          />
          {activeParticipants
            .filter((participant) => participant.userId !== session.user.id)
            .map((participant) => (
              <VideoTile
                key={participant.id}
                label={participant.userId}
                stream={remoteStreams[participant.userId] ?? null}
                subtitle={
                  remoteStreams[participant.userId]
                    ? peerConnectionStates[participant.userId] ?? 'remote media connected'
                    : peerConnectionStates[participant.userId] ?? 'awaiting media'
                }
              />
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
            <div>Participants: {activeParticipants.length}</div>
            <div>
              Screen share: {activeScreenShare ? `active by ${activeScreenShare.userId}` : 'inactive'}
            </div>
            <div>
              Media: mic {microphoneEnabled ? 'on' : 'muted'} | camera {cameraEnabled ? 'on' : 'off'}
            </div>
            {error ? <div className="text-rose-100">{error}</div> : null}
            {callNotice ? <div className="text-amber-100">{callNotice}</div> : null}
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
            <button
              type="button"
              onClick={toggleMicrophone}
              disabled={!mediaReady}
              className="rounded-full border border-white/14 px-4 py-2 text-sm text-white/75 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {microphoneEnabled ? 'Mute Mic' : 'Unmute Mic'}
            </button>
            <button
              type="button"
              onClick={toggleCamera}
              disabled={!mediaReady || Boolean(displayStreamRef.current)}
              className="rounded-full border border-white/14 px-4 py-2 text-sm text-white/75 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cameraEnabled ? 'Turn Camera Off' : 'Turn Camera On'}
            </button>
            <button
              type="button"
              onClick={() => void startScreenShare()}
              disabled={!activeCall || !joinedCall || Boolean(activeScreenShare)}
              className="rounded-full border border-white/14 px-4 py-2 text-sm text-white/75 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Share Screen
            </button>
            <button
              type="button"
              onClick={() => void stopScreenShare()}
              disabled={!activeCall || activeScreenShare?.userId !== session.user.id}
              className="rounded-full border border-white/14 px-4 py-2 text-sm text-white/75 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Stop Share
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function VideoTile({
  label,
  muted = false,
  stream,
  subtitle
}: {
  label: string;
  muted?: boolean;
  stream: MediaStream | null;
  subtitle: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) {
      return;
    }

    node.srcObject = stream;
  }, [stream]);

  return (
    <div className="aspect-video rounded-[28px] border border-white/12 bg-gradient-to-br from-white/10 to-slate-950/30 p-5">
      <div className="text-sm text-white/55">{subtitle}</div>
      <div className="mt-3 font-display text-2xl text-white">{label}</div>
      <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10 bg-slate-950/35">
        <video
          ref={videoRef}
          autoPlay
          muted={muted}
          playsInline
          className="h-48 w-full object-cover"
        />
      </div>
    </div>
  );
}
