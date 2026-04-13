import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cn, formatCurrency, formatDate, formatRelativeDate } from '@/lib/utils';

// ─── cn() ──────────────────────────────────────────────

describe('cn()', () => {
  it('merges simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes via clsx', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('');
  });

  it('resolves Tailwind conflicts (last wins)', () => {
    const result = cn('px-4', 'px-2');
    expect(result).toBe('px-2');
  });

  it('merges Tailwind with conditional classes', () => {
    const result = cn('text-sm text-red-500', 'text-blue-500');
    expect(result).toBe('text-sm text-blue-500');
  });

  it('handles undefined and null inputs', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  it('handles array inputs', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });
});

// ─── formatCurrency() ──────────────────────────────────

describe('formatCurrency()', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative amounts', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('500.00');
    // Different environments may use minus sign or parentheses
  });

  it('formats large numbers with commas', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(99.999)).toBe('$100.00');
  });

  it('pads to 2 decimal places', () => {
    expect(formatCurrency(50)).toBe('$50.00');
  });

  it('formats EUR currency', () => {
    const result = formatCurrency(100, 'EUR');
    // The exact format depends on locale, but should contain the amount
    expect(result).toContain('100.00');
  });

  it('formats GBP currency', () => {
    const result = formatCurrency(250.5, 'GBP');
    expect(result).toContain('250.50');
  });

  it('formats small amounts', () => {
    expect(formatCurrency(0.01)).toBe('$0.01');
  });

  it('formats very large amounts', () => {
    const result = formatCurrency(9999999.99);
    expect(result).toBe('$9,999,999.99');
  });
});

// ─── formatDate() ──────────────────────────────────────

describe('formatDate()', () => {
  it('formats a date string in short format by default', () => {
    const result = formatDate('2024-03-15');
    expect(result).toBe('Mar 15, 2024');
  });

  it('formats a date string in long format', () => {
    const result = formatDate('2024-03-15', 'long');
    expect(result).toBe('March 15, 2024');
  });

  it('formats a Date object in short format', () => {
    const result = formatDate(new Date(2024, 0, 1), 'short');
    expect(result).toBe('Jan 1, 2024');
  });

  it('formats a Date object in long format', () => {
    const result = formatDate(new Date(2024, 11, 25), 'long');
    expect(result).toBe('December 25, 2024');
  });

  it('handles ISO date strings', () => {
    const result = formatDate('2024-06-15T10:30:00Z', 'short');
    expect(result).toContain('2024');
    expect(result).toContain('Jun');
  });
});

// ─── formatRelativeDate() ──────────────────────────────

describe('formatRelativeDate()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows relative time for a recent date', () => {
    const result = formatRelativeDate('2025-06-15T11:00:00Z');
    expect(result).toContain('hour');
    expect(result).toContain('ago');
  });

  it('shows relative time for yesterday', () => {
    const result = formatRelativeDate('2025-06-14T12:00:00Z');
    expect(result).toContain('day');
    expect(result).toContain('ago');
  });

  it('shows relative time for an old date', () => {
    const result = formatRelativeDate('2024-01-01T00:00:00Z');
    expect(result).toContain('ago');
  });

  it('handles Date objects', () => {
    const pastDate = new Date('2025-06-10T12:00:00Z');
    const result = formatRelativeDate(pastDate);
    expect(result).toContain('days ago');
  });

  it('includes "ago" suffix', () => {
    const result = formatRelativeDate('2025-06-01T00:00:00Z');
    expect(result).toContain('ago');
  });
});
