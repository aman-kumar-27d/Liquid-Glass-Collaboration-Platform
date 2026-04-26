import { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">{eyebrow}</div>
        <h1 className="mt-3 font-display text-4xl text-white">{title}</h1>
        <p className="mt-3 max-w-2xl text-white/70">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
