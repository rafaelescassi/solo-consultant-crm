'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { DateDisplay } from '@/components/shared/date-display';
import { cn } from '@/lib/utils';
import type { Lead } from '@/lib/types';
import { LEAD_SOURCE_LABELS } from '@/lib/types';

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id, data: { lead } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={cn(
          'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/30 transition-all',
          isDragging && 'shadow-lg scale-[1.02] opacity-80 z-50'
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label={`Lead: ${lead.name}${lead.company ? ` at ${lead.company}` : ''}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        <CardContent className="p-3">
          <div className="space-y-2">
            <div>
              <p className="font-medium text-sm leading-tight">{lead.name}</p>
              {lead.company && (
                <p className="text-xs text-muted-foreground">{lead.company}</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              {lead.estimated_value != null && lead.estimated_value > 0 ? (
                <CurrencyDisplay amount={lead.estimated_value} className="text-sm font-semibold" />
              ) : (
                <span className="text-xs text-muted-foreground">No value</span>
              )}
              {lead.source && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {LEAD_SOURCE_LABELS[lead.source]}
                </Badge>
              )}
            </div>
            <DateDisplay date={lead.created_at} format="relative" className="text-[11px] text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
