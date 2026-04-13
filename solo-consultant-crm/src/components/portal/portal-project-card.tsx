import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectStatusBadge } from '@/components/projects/project-status-badge';
import { DateDisplay } from '@/components/shared/date-display';
import { cn } from '@/lib/utils';
import { PROJECT_TYPE_LABELS } from '@/lib/types';
import type { PortalProject, PhaseStatus } from '@/lib/types';

interface PortalProjectCardProps {
  project: PortalProject;
}

const DOT_COLORS: Record<PhaseStatus, string> = {
  pending: 'bg-muted border border-border',
  in_progress: 'bg-blue-500 animate-pulse',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

export function PortalProjectCard({ project }: PortalProjectCardProps) {
  const completedCount = project.phases.filter(p => p.status === 'completed').length;
  const sortedPhases = [...project.phases].sort((a, b) => a.phase_number - b.phase_number);

  return (
    <Link href={`/portal/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="text-lg font-semibold">{project.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{PROJECT_TYPE_LABELS[project.project_type]}</Badge>
              <ProjectStatusBadge status={project.status} />
            </div>
          </div>

          {/* Mini phase dots */}
          <div className="flex items-center gap-1.5 mt-4">
            {sortedPhases.map(phase => (
              <div
                key={phase.id}
                className={cn('w-3 h-3 rounded-full', DOT_COLORS[phase.status])}
                title={`${phase.phase_name}: ${phase.status}`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-2">
              {completedCount} of {project.phases.length} phases complete
            </span>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">
              {project.started_at ? (
                <>Started: <DateDisplay date={project.started_at} /></>
              ) : (
                <>Created: <DateDisplay date={project.created_at} /></>
              )}
            </p>
            <span className="text-sm font-medium text-primary">
              View Progress &rarr;
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
