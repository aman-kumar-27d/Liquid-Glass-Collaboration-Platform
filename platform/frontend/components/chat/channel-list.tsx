'use client';

import { FormEvent, useState } from 'react';
import { RoomRecord } from '@/lib/types';
import { GlassCard } from '../liquid-glass/glass-card';

interface ChannelListProps {
  activeRoomId: string | null;
  creating: boolean;
  onCreateRoom: (name: string) => Promise<void>;
  onSelectRoom: (roomId: string) => void;
  rooms: RoomRecord[];
}

export function ChannelList({
  activeRoomId,
  creating,
  onCreateRoom,
  onSelectRoom,
  rooms
}: ChannelListProps) {
  const [roomName, setRoomName] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roomName.trim()) {
      return;
    }

    await onCreateRoom(roomName.trim());
    setRoomName('');
  };

  return (
    <GlassCard>
      <div className="text-sm uppercase tracking-[0.28em] text-white/60">Rooms</div>
      <div className="mt-4 space-y-2">
        {rooms.map((room) => {
          const active = room.id === activeRoomId;
          return (
            <button
              key={room.id}
              type="button"
              onClick={() => onSelectRoom(room.id)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
                active
                  ? 'border-cyan-300/30 bg-cyan-300/10 text-white'
                  : 'border-white/8 bg-slate-950/20 text-white/80'
              }`}
            >
              <span>{room.name}</span>
              <span className="rounded-full bg-white/8 px-2 py-1 text-xs text-white/65">
                {room.type}
              </span>
            </button>
          );
        })}
      </div>

      <form className="mt-5 space-y-3" onSubmit={submit}>
        <label className="block text-sm text-white/60">Create room</label>
        <input
          value={roomName}
          onChange={(event) => setRoomName(event.target.value)}
          placeholder="Design sync"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
        />
        <button
          type="submit"
          disabled={creating}
          className="w-full rounded-2xl border border-white/14 bg-white/10 px-4 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating ? 'Creating...' : 'Create Channel'}
        </button>
      </form>
    </GlassCard>
  );
}
