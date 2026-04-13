import { formatDate, formatRelativeDate } from '@/lib/utils';

interface DateDisplayProps {
  date: string;
  format?: 'short' | 'long' | 'relative';
  className?: string;
}

export function DateDisplay({ date, format = 'short', className }: DateDisplayProps) {
  const absoluteDate = formatDate(date, format === 'long' ? 'long' : 'short');
  const display = format === 'relative' ? formatRelativeDate(date) : absoluteDate;

  return (
    <time dateTime={date} title={absoluteDate} className={className} aria-label={absoluteDate}>
      {display}
    </time>
  );
}
