'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import { GlassCard } from '../liquid-glass/glass-card';

const navItems = [
  { href: '/workspace' as Route, label: 'Dashboard' },
  { href: '/workspace/chat' as Route, label: 'Chat' },
  { href: '/workspace/calls' as Route, label: 'Calls' },
  { href: '/workspace/admin' as Route, label: 'Admin' },
  { href: '/workspace/billing' as Route, label: 'Billing' }
];

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 lg:px-6">
      <aside className="hidden w-72 flex-col gap-4 lg:flex">
        <GlassCard>
          <div className="text-sm uppercase tracking-[0.28em] text-white/60">Workspace</div>
          <div className="mt-3 font-display text-2xl">Liquid Glass</div>
          <div className="mt-6 space-y-2 text-sm text-white/70">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 transition ${
                    active
                      ? 'border border-white/15 bg-white/12 text-white'
                      : 'hover:bg-white/8 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-sm uppercase tracking-[0.28em] text-white/60">Phase 8</div>
          <div className="mt-4 space-y-3 text-sm text-white/75">
            <div>Tenant dashboard</div>
            <div>Realtime workspace views</div>
            <div>Admin and billing surfaces</div>
          </div>
        </GlassCard>
      </aside>

      <main className="flex-1">{children}</main>

      <aside className="hidden w-80 xl:block">
        <GlassCard>
          <div className="text-sm uppercase tracking-[0.28em] text-white/60">Presence</div>
          <div className="mt-4 space-y-4 text-sm text-white/75">
            <div>Tenant-aware session management</div>
            <div>Realtime typing and presence</div>
            <div>P2P large file transfer routing</div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-sm uppercase tracking-[0.28em] text-white/60">Stack</div>
          <div className="mt-4 space-y-3 text-sm text-white/75">
            <div>Next.js 16 App Router</div>
            <div>NestJS 11 backend contracts</div>
            <div>Tailwind 4 visual baseline</div>
          </div>
        </GlassCard>
      </aside>
    </div>
  );
}
