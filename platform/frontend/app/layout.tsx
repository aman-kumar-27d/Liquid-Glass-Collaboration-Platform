import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liquid Glass Collaboration Platform',
  description: 'Enterprise collaboration workspace with a liquid-glass interface.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
