import { cn } from '@/lib/utils';
import { PHASE_STATUS_CONFIG, type PhaseStatus } from '@/lib/types';

const DOT_COLORS: Record<PhaseStatus, string> = {
  pending: 'bg-slate-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

export function PhaseStatusBadge({ status }: { status: PhaseStatus }) {
  const config = PHASE_STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', config.bg, config.color)} role="status" aria-label={`Phase status: ${config.label}`}>
      <span className={cn('h-1.5 w-1.5 rounded-full', DOT_COLORS[status])} aria-hidden="true" />
      {config.label}
    </span>
  );
}
