'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Zap, Menu } from 'lucide-react';

const navLinks = [
  { href: '#services', label: 'Services' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#testimonials', label: 'Testimonials' },
];

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY >= 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className={cn('flex items-center gap-2 text-lg font-semibold', scrolled ? 'text-primary' : 'text-white')}>
          <Zap className="h-5 w-5" />
          AI Dev Squad
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:underline underline-offset-4',
                scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden xl:flex items-center gap-3">
          <Link
            href="/login"
            className={cn(
              'text-sm font-medium transition-colors',
              scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'
            )}
          >
            Log In
          </Link>
          <a href="#quote">
            <Button
              variant={scrolled ? 'default' : 'outline'}
              className={cn(
                !scrolled && 'bg-white text-primary hover:bg-white/90 border-white'
              )}
            >
              Get a Quote
            </Button>
          </a>
        </div>

        {/* Mobile Menu */}
        <div className="xl:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className={cn(!scrolled && 'text-white hover:bg-white/10')} />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="h-16 flex items-center px-6 border-b border-border">
                <span className="flex items-center gap-2 text-lg font-semibold text-primary">
                  <Zap className="h-5 w-5" />
                  AI Dev Squad
                </span>
              </div>
              <nav className="px-3 py-4 space-y-1">
                {navLinks.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-4 px-3 space-y-2">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">Log In</Button>
                  </Link>
                  <a href="#quote" onClick={() => setOpen(false)}>
                    <Button className="w-full">Get a Quote</Button>
                  </a>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
