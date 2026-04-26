import { ChatWorkspace } from '@/components/chat/chat-workspace';
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
            description="Rooms and messages now load from the backend and support room creation plus text message sending. Websocket presence and typing still need live client-side event wiring."
          />
        </GlassCard>

        <ChatWorkspace />
      </div>
    </AppShell>
  );
}
