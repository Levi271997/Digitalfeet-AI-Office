'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOffice } from '@/lib/office-context';

const TABS = [
  { href: '/', label: 'Office floor' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/agents/atlas', label: 'Agents' },
];

export function Header() {
  const pathname = usePathname();
  const { approvals, connected, agents } = useOffice();

  const isCurrent = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href.split('/').slice(0, 2).join('/')));

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark pixel">DF</div>
        <div>
          <div className="brand-name">Digitalfeet AI Office</div>
          <div className="conn">{connected ? `${agents.length} agents online` : 'Connecting to the office server…'}</div>
        </div>
      </div>
      <nav aria-label="Views" className="tabs">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} aria-current={isCurrent(t.href) ? 'page' : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>
      {approvals.length > 0 && (
        <Link href="/dashboard" className="needs-you">
          {approvals.length} need{approvals.length === 1 ? 's' : ''} you
        </Link>
      )}
    </header>
  );
}
