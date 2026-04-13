import { formatCurrency } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
}

export function CurrencyDisplay({ amount, currency = 'USD', className }: CurrencyDisplayProps) {
  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {formatCurrency(amount, currency)}
    </span>
  );
}
