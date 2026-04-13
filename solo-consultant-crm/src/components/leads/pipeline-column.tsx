'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import { LEAD_STAGE_LABELS, LEAD_STAGE_COLORS, type LeadStage, type Lead } from '@/lib/types';
import { LeadCard } from './lead-card';

interface PipelineColumnProps {
  stage: LeadStage;
  leads: Lead[];
  onLeadClick: (leadId: string) => void;
}

export function PipelineColumn({ stage, leads, onLeadClick }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const totalValue = leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);

  return (
    <div
      className={cn(
        'w-[280px] flex-shrink-0 flex flex-col rounded-lg bg-muted/50 border',
        isOver && 'ring-2 ring-primary/50 bg-primary/5'
      )}
      role="region"
      aria-label={`${LEAD_STAGE_LABELS[stage]} stage, ${leads.length} leads`}
    >
      {/* Column header */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn('h-2.5 w-2.5 rounded-full', LEAD_STAGE_COLORS[stage])} aria-hidden="true" />
          <span className="font-medium text-sm">{LEAD_STAGE_LABELS[stage]}</span>
          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5">
            {leads.length}
          </Badge>
        </div>
        {totalValue > 0 && (
          <p className="text-xs text-muted-foreground">{formatCurrency(totalValue)}</p>
        )}
      </div>

      {/* Cards area */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[100px]"
      >
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onLeadClick(lead.id)}
            />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Drop leads here</p>
        )}
      </div>
    </div>
  );
}
