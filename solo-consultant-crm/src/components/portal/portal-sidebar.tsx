'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FolderOpen, HelpCircle, Zap } from 'lucide-react';

const navItems = [
  { href: '/portal', label: 'My Projects', icon: FolderOpen },
  { href: 'mailto:support@aidevsquad.com', label: 'Help & Support', icon: HelpCircle, external: true },
];

interface PortalSidebarProps {
  onNavClick?: () => void;
}

export function PortalSidebar({ onNavClick }: PortalSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="h-full flex flex-col bg-card">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <span className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Zap className="h-5 w-5" />
          AI Dev Squad
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Portal navigation" role="navigation">
        {navItems.map(item => {
          const isActive = !item.external && (pathname === item.href || pathname.startsWith(item.href + '/'));
          const Component = item.external ? 'a' : Link;
          const extraProps = item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

          return (
            <Component
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
              {...extraProps}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Component>
          );
        })}
      </nav>
    </aside>
  );
}
