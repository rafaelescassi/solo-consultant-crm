'use client';

import { useRouter } from 'next/navigation';
import { Zap, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PortalSidebar } from './portal-sidebar';
import { createBrowserClient } from '@supabase/ssr';
import { useState } from 'react';

export function PortalHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border" role="banner">
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        <div className="xl:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <PortalSidebar onNavClick={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        <span className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Zap className="h-5 w-5" />
          AI Dev Squad
        </span>
        <span className="text-sm text-muted-foreground hidden sm:inline">Client Portal</span>
      </div>

      <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground hover:text-foreground">
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </header>
  );
}
