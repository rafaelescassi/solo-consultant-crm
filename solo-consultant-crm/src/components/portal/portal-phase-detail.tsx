import { Card, CardContent } from '@/components/ui/card';
import { PhaseStatusBadge } from '@/components/projects/phase-status-badge';
import { DateDisplay } from '@/components/shared/date-display';
import { PortalDeliverables } from './portal-deliverables';
import type { ProjectPhase, ProjectComment, ProjectDeliverable } from '@/lib/types';

interface PortalPhaseDetailProps {
  phase: ProjectPhase;
  comments: ProjectComment[];
  deliverables: ProjectDeliverable[];
}

export function PortalPhaseDetail({ phase, comments, deliverables }: PortalPhaseDetailProps) {
  const phaseComments = comments.filter(c => c.phase_number === phase.phase_number);
  const phaseDeliverables = deliverables.filter(d => d.phase_number === phase.phase_number);

  return (
    <Card className="mt-4">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold">Phase {phase.phase_number}: {phase.phase_name}</h3>
          <PhaseStatusBadge status={phase.status} />
        </div>

        <div className="flex gap-4 text-xs text-muted-foreground mb-6">
          {phase.started_at && <span>Started: <DateDisplay date={phase.started_at} /></span>}
          {phase.completed_at && <span>Completed: <DateDisplay date={phase.completed_at} /></span>}
        </div>

        {/* Comments */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3">Comments</h4>
          {phaseComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments for this phase yet.</p>
          ) : (
            <div className="space-y-3">
              {phaseComments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-xs flex items-center justify-center flex-shrink-0">
                    A
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Admin</span>
                      <DateDisplay date={comment.created_at} format="relative" className="text-xs text-muted-foreground" />
                    </div>
                    <p className="text-sm text-foreground mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deliverables */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Deliverables</h4>
          <PortalDeliverables deliverables={phaseDeliverables} />
        </div>
      </CardContent>
    </Card>
  );
}
