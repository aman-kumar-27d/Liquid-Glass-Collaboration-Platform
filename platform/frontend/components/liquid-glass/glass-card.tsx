import { PropsWithChildren } from 'react';

export function GlassCard({ children }: PropsWithChildren) {
  return (
    <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-glass backdrop-blur-glass">
      {children}
    </div>
  );
}
