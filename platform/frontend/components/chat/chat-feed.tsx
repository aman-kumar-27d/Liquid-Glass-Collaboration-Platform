import { GlassCard } from '../liquid-glass/glass-card';

const messages = [
  {
    author: 'Aarav',
    time: '10:14',
    text: 'Backend Phase 7 is stable on the updated dependency set. Admin and subscription contracts are now available.'
  },
  {
    author: 'Mira',
    time: '10:16',
    text: 'Frontend Phase 8 should expose billing, calls, and room workflows against those contracts next.'
  },
  {
    author: 'System',
    time: '10:18',
    text: 'TURN signaling baseline connected. File storage drivers available: local, minio.'
  }
];

export function ChatFeed() {
  return (
    <GlassCard>
      <div className="text-sm uppercase tracking-[0.28em] text-white/60">Conversation</div>
      <div className="mt-5 space-y-4">
        {messages.map((message) => (
          <div key={`${message.author}-${message.time}`} className="rounded-3xl border border-white/10 bg-slate-950/20 p-4">
            <div className="flex items-center justify-between text-sm text-white/55">
              <span className="font-semibold text-white/85">{message.author}</span>
              <span>{message.time}</span>
            </div>
            <div className="mt-3 text-sm leading-6 text-white/78">{message.text}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-3xl border border-white/12 bg-white/8 px-4 py-4 text-sm text-white/50">
        Message input, file upload, and typing state hook into `/api/v1/messages` and websocket events.
      </div>
    </GlassCard>
  );
}
