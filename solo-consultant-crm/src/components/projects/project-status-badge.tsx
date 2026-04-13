import { cn } from '@/lib/utils';
import { PROJECT_STATUS_CONFIG, type ProjectStatus } from '@/lib/types';

const DOT_COLORS: Record<ProjectStatus, string> = {
  draft: 'bg-slate-400',
  approved: 'bg-blue-500',
  in_progress: 'bg-violet-500',
  review: 'bg-amber-500',
  completed: 'bg-green-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-500',
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = PROJECT_STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', config.bg, config.color)} role="status" aria-label={`Project status: ${config.label}`}>
      <span className={cn('h-1.5 w-1.5 rounded-full', DOT_COLORS[status])} aria-hidden="true" />
      {config.label}
    </span>
  );
}
