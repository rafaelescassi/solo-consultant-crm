import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LEAD_STAGE_LABELS, type LeadStage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PipelineSummaryProps {
  pipelineByStage: { stage: LeadStage; count: number; value: number }[];
}

const STAGE_BAR_COLORS: Record<LeadStage, string> = {
  lead: 'bg-slate-400',
  contact_made: 'bg-blue-400',
  proposal_sent: 'bg-violet-400',
  negotiation: 'bg-amber-400',
  won: 'bg-green-400',
  lost: 'bg-red-400',
};

const STAGE_DOT_COLORS: Record<LeadStage, string> = {
  lead: 'bg-slate-400',
  contact_made: 'bg-blue-400',
  proposal_sent: 'bg-violet-400',
  negotiation: 'bg-amber-400',
  won: 'bg-green-400',
  lost: 'bg-red-400',
};

export function PipelineSummary({ pipelineByStage }: PipelineSummaryProps) {
  const totalLeads = pipelineByStage.reduce((sum, s) => sum + s.count, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Pipeline Summary</CardTitle>
        <Link
          href="/leads"
          className="text-sm text-primary hover:underline"
          aria-label="View full pipeline"
        >
          View Pipeline &rarr;
        </Link>
      </CardHeader>
      <CardContent>
        {/* Stacked bar */}
        <div className="flex h-4 w-full rounded-full overflow-hidden mb-4" role="img" aria-label="Pipeline stage distribution">
          {pipelineByStage.map(stage => {
            if (stage.count === 0 || totalLeads === 0) return null;
            const widthPercent = (stage.count / totalLeads) * 100;
            return (
              <div
                key={stage.stage}
                className={cn(STAGE_BAR_COLORS[stage.stage], 'transition-all duration-300')}
                style={{ width: `${widthPercent}%` }}
                title={`${LEAD_STAGE_LABELS[stage.stage]}: ${stage.count}`}
              />
            );
          })}
          {totalLeads === 0 && (
            <div className="bg-muted w-full h-full" />
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
          {pipelineByStage.map(stage => (
            <div key={stage.stage} className="flex items-center gap-2 text-sm">
              <span className={cn('h-2.5 w-2.5 rounded-full flex-shrink-0', STAGE_DOT_COLORS[stage.stage])} aria-hidden="true" />
              <span className="text-muted-foreground truncate">{LEAD_STAGE_LABELS[stage.stage]}</span>
              <span className="font-medium ml-auto">{stage.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
