import { ChannelList } from '@/components/chat/channel-list';
import { ChatFeed } from '@/components/chat/chat-feed';
import { PresencePanel } from '@/components/chat/presence-panel';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/layout/page-header';
import { GlassCard } from '@/components/liquid-glass/glass-card';

export default function WorkspaceChatPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <GlassCard>
          <PageHeader
            eyebrow="Messaging"
            title="Realtime workspace communication"
            description="This page aligns to `/api/v1/rooms`, `/api/v1/messages`, reactions, file attachments, and websocket presence and typing events."
          />
        </GlassCard>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.4fr_0.8fr]">
          <ChannelList />
          <ChatFeed />
          <PresencePanel />
        </div>
      </div>
    </AppShell>
  );
}
