import { cn } from '@/lib/utils';
import { INVOICE_STATUS_CONFIG, type InvoiceStatus } from '@/lib/types';

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = INVOICE_STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', config.bg, config.color)} role="status" aria-label={`Invoice status: ${config.label}`}>
      <span className={cn('h-1.5 w-1.5 rounded-full', status === 'draft' ? 'bg-slate-400' : status === 'sent' ? 'bg-blue-500' : status === 'paid' ? 'bg-green-500' : 'bg-amber-500')} aria-hidden="true" />
      {config.label}
    </span>
  );
}
