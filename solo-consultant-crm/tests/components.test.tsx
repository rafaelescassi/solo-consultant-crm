import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// ─── EmptyState ────────────────────────────────────────

import { EmptyState } from '@/components/shared/empty-state';
import { Inbox } from 'lucide-react';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No items found"
        description="There are no items to display"
      />
    );
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('There are no items to display')).toBeInTheDocument();
  });

  it('renders an action button when actionLabel and onAction are provided', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        icon={Inbox}
        title="Empty"
        description="Nothing here"
        actionLabel="Create New"
        onAction={handleAction}
      />
    );
    const button = screen.getByText('Create New');
    expect(button).toBeInTheDocument();
  });

  it('does not render a button when actionLabel is missing', () => {
    render(
      <EmptyState
        icon={Inbox}
        title="Empty"
        description="Nothing here"
      />
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onAction when the button is clicked', async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup();
    render(
      <EmptyState
        icon={Inbox}
        title="Empty"
        description="Nothing here"
        actionLabel="Add Item"
        onAction={handleAction}
      />
    );
    await user.click(screen.getByText('Add Item'));
    expect(handleAction).toHaveBeenCalledOnce();
  });
});

// ─── CurrencyDisplay ──────────────────────────────────

import { CurrencyDisplay } from '@/components/shared/currency-display';

describe('CurrencyDisplay', () => {
  it('renders formatted USD amount by default', () => {
    render(<CurrencyDisplay amount={1234.56} />);
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
  });

  it('renders zero amount', () => {
    render(<CurrencyDisplay amount={0} />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('renders with a specified currency', () => {
    render(<CurrencyDisplay amount={100} currency="EUR" />);
    const el = screen.getByText(/100/);
    expect(el).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CurrencyDisplay amount={50} className="text-green-500" />);
    const el = screen.getByText('$50.00');
    expect(el).toHaveClass('text-green-500');
  });

  it('uses tabular-nums font variant', () => {
    render(<CurrencyDisplay amount={100} />);
    const el = screen.getByText('$100.00');
    expect(el).toHaveStyle({ fontVariantNumeric: 'tabular-nums' });
  });
});

// ─── DateDisplay ──────────────────────────────────────

import { DateDisplay } from '@/components/shared/date-display';

describe('DateDisplay', () => {
  it('renders a date in short format by default', () => {
    render(<DateDisplay date="2024-03-15" />);
    expect(screen.getByText('Mar 15, 2024')).toBeInTheDocument();
  });

  it('renders a date in long format', () => {
    render(<DateDisplay date="2024-03-15" format="long" />);
    expect(screen.getByText('March 15, 2024')).toBeInTheDocument();
  });

  it('renders a relative date', () => {
    render(<DateDisplay date={new Date().toISOString()} format="relative" />);
    // Should be something like "less than a minute ago"
    const timeEl = screen.getByRole('time');
    expect(timeEl).toBeInTheDocument();
  });

  it('renders a <time> element with dateTime attribute', () => {
    render(<DateDisplay date="2024-06-01" />);
    const timeEl = screen.getByRole('time');
    expect(timeEl).toHaveAttribute('dateTime', '2024-06-01');
  });

  it('applies custom className', () => {
    render(<DateDisplay date="2024-01-01" className="text-sm" />);
    const timeEl = screen.getByRole('time');
    expect(timeEl).toHaveClass('text-sm');
  });

  it('has a title attribute with the absolute date', () => {
    render(<DateDisplay date="2024-07-04" format="relative" />);
    const timeEl = screen.getByRole('time');
    expect(timeEl).toHaveAttribute('title', 'Jul 4, 2024');
  });

  it('has an aria-label with the absolute date', () => {
    render(<DateDisplay date="2024-12-25" format="short" />);
    const timeEl = screen.getByLabelText('Dec 25, 2024');
    expect(timeEl).toBeInTheDocument();
  });
});

// ─── InvoiceStatusBadge ────────────────────────────────

import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge';
import type { InvoiceStatus } from '@/lib/types';

describe('InvoiceStatusBadge', () => {
  const statuses: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue'];

  it.each(statuses)('renders the correct label for status "%s"', (status) => {
    const expectedLabels: Record<InvoiceStatus, string> = {
      draft: 'Draft',
      sent: 'Sent',
      paid: 'Paid',
      overdue: 'Overdue',
    };
    render(<InvoiceStatusBadge status={status} />);
    expect(screen.getByText(expectedLabels[status])).toBeInTheDocument();
  });

  it.each(statuses)('has role="status" for status "%s"', (status) => {
    render(<InvoiceStatusBadge status={status} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it.each(statuses)('has accessible aria-label for status "%s"', (status) => {
    const expectedLabels: Record<InvoiceStatus, string> = {
      draft: 'Draft',
      sent: 'Sent',
      paid: 'Paid',
      overdue: 'Overdue',
    };
    render(<InvoiceStatusBadge status={status} />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      `Invoice status: ${expectedLabels[status]}`
    );
  });
});

// ─── MetricsCards ─────────────────────────────────────

import { MetricsCards } from '@/components/dashboard/metrics-cards';

describe('MetricsCards', () => {
  const defaultProps = {
    activeClients: 12,
    openInvoices: 5,
    overdueInvoices: 2,
    conversionRate: 45,
  };

  it('renders all 4 metric labels', () => {
    render(<MetricsCards {...defaultProps} />);
    expect(screen.getByText('Active Clients')).toBeInTheDocument();
    expect(screen.getByText('Open Invoices')).toBeInTheDocument();
    expect(screen.getByText('Overdue Invoices')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
  });

  it('renders the correct values', () => {
    render(<MetricsCards {...defaultProps} />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('renders with zero values', () => {
    render(
      <MetricsCards
        activeClients={0}
        openInvoices={0}
        overdueInvoices={0}
        conversionRate={0}
      />
    );
    expect(screen.getAllByText('0')).toHaveLength(3);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});

// ─── PageHeader ───────────────────────────────────────

import { PageHeader } from '@/components/layout/page-header';

describe('PageHeader', () => {
  it('renders the title', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders as an h1 heading', () => {
    render(<PageHeader title="Clients" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Clients');
  });

  it('renders the description when provided', () => {
    render(<PageHeader title="Invoices" description="Manage your invoices" />);
    expect(screen.getByText('Manage your invoices')).toBeInTheDocument();
  });

  it('does not render description paragraph when not provided', () => {
    const { container } = render(<PageHeader title="Settings" />);
    expect(container.querySelector('.text-muted-foreground')).not.toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <PageHeader title="Leads">
        <button>Add Lead</button>
      </PageHeader>
    );
    expect(screen.getByText('Add Lead')).toBeInTheDocument();
  });

  it('does not render children wrapper when no children', () => {
    const { container } = render(<PageHeader title="Test" />);
    // The children wrapper div should not be present
    const flexDivs = container.querySelectorAll('.flex.items-center.gap-2');
    expect(flexDivs).toHaveLength(0);
  });
});
