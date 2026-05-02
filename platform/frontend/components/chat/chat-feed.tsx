'use client';

import { FormEvent } from 'react';
import { MessageRecord, RoomRecord, StoredFile } from '@/lib/types';
import { GlassCard } from '../liquid-glass/glass-card';

interface ChatFeedProps {
  activeRoom: RoomRecord | null;
  attachments: StoredFile[];
  draft: string;
  fileUploading: boolean;
  loading: boolean;
  messages: MessageRecord[];
  onDraftChange: (value: string) => void;
  onFileSelect: (files: FileList | null) => void;
  onRemoveAttachment: (fileId: string) => void;
  onSend: () => Promise<void>;
}

export function ChatFeed({
  activeRoom,
  attachments,
  draft,
  fileUploading,
  loading,
  messages,
  onDraftChange,
  onFileSelect,
  onRemoveAttachment,
  onSend
}: ChatFeedProps) {
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSend();
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Conversation</div>
        <div className="text-xs text-white/55">{activeRoom?.name ?? 'Select a room'}</div>
      </div>

      <div className="mt-5 space-y-4">
        {messages.length ? (
          messages.map((message) => (
            <div key={message.id} className="rounded-3xl border border-white/10 bg-slate-950/20 p-4">
              <div className="flex items-center justify-between text-sm text-white/55">
                <span className="font-semibold text-white/85">{message.senderId}</span>
                <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="mt-3 text-sm leading-6 text-white/78">{message.content}</div>
              {message.files.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.files.map((file) => (
                    <span
                      key={file.id}
                      className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-white/70"
                    >
                      {file.originalName}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-4 text-sm text-white/65">
            {loading ? 'Loading room messages...' : 'No messages in this room yet.'}
          </div>
        )}
      </div>

      <form className="mt-5 space-y-3" onSubmit={submit}>
        {attachments.length ? (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => onRemoveAttachment(file.id)}
                className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs text-cyan-100"
              >
                {file.originalName} x
              </button>
            ))}
          </div>
        ) : null}
        <textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder={activeRoom ? `Message ${activeRoom.name}` : 'Select a room first'}
          disabled={!activeRoom || loading}
          rows={4}
          className="w-full rounded-3xl border border-white/12 bg-white/8 px-4 py-4 text-sm text-white outline-none transition focus:border-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div className="flex flex-wrap gap-3">
          <label className="rounded-2xl border border-white/14 bg-white/10 px-4 py-3 text-sm text-white">
            <input
              type="file"
              multiple
              onChange={(event) => onFileSelect(event.target.files)}
              disabled={!activeRoom || fileUploading || loading}
              className="hidden"
            />
            {fileUploading ? 'Uploading...' : 'Attach Files'}
          </label>
          <button
            type="submit"
            disabled={!activeRoom || (!draft.trim() && !attachments.length) || loading || fileUploading}
            className="rounded-2xl border border-white/14 bg-white/10 px-4 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>
    </GlassCard>
  );
}
