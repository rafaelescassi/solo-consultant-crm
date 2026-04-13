'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PipelineColumn } from './pipeline-column';
import { LeadForm } from './lead-form';
import { updateLeadPositions } from '@/app/(dashboard)/leads/actions';
import { LEAD_STAGES, type PipelineColumn as PipelineColumnType, type Lead, type LeadStage } from '@/lib/types';

interface PipelineBoardProps {
  initialColumns: PipelineColumnType[];
}

export function PipelineBoard({ initialColumns }: PipelineBoardProps) {
  const router = useRouter();
  const [columns, setColumns] = useState<PipelineColumnType[]>(initialColumns);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeLead = activeId
    ? columns.flatMap(c => c.leads).find(l => l.id === activeId) || null
    : null;

  const findColumnByLeadId = useCallback((leadId: string): LeadStage | null => {
    for (const col of columns) {
      if (col.leads.some(l => l.id === leadId)) return col.stage;
    }
    return null;
  }, [columns]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeStage = findColumnByLeadId(active.id as string);
    // Check if dropping over a column directly or over a card in a column
    const overStage = LEAD_STAGES.includes(over.id as LeadStage)
      ? (over.id as LeadStage)
      : findColumnByLeadId(over.id as string);

    if (!activeStage || !overStage || activeStage === overStage) return;

    setColumns(prev => {
      const newColumns = prev.map(col => ({ ...col, leads: [...col.leads] }));
      const sourceCol = newColumns.find(c => c.stage === activeStage)!;
      const destCol = newColumns.find(c => c.stage === overStage)!;

      const leadIndex = sourceCol.leads.findIndex(l => l.id === active.id);
      if (leadIndex === -1) return prev;

      const [movedLead] = sourceCol.leads.splice(leadIndex, 1);
      movedLead.stage = overStage;

      // Find insertion index
      const overIndex = destCol.leads.findIndex(l => l.id === over.id);
      if (overIndex >= 0) {
        destCol.leads.splice(overIndex, 0, movedLead);
      } else {
        destCol.leads.push(movedLead);
      }

      return newColumns;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    // Collect all position updates
    const updates: { id: string; stage: LeadStage; position: number }[] = [];
    for (const col of columns) {
      col.leads.forEach((lead, index) => {
        updates.push({ id: lead.id, stage: col.stage, position: index });
      });
    }

    // Optimistic - positions are already updated in state
    await updateLeadPositions(updates);
  };

  const handleLeadClick = (leadId: string) => {
    router.push(`/leads/${leadId}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div />
        <Button onClick={() => setShowForm(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          className="flex gap-4 overflow-x-auto pb-4"
          style={{ height: 'calc(100vh - 220px)' }}
          role="application"
          aria-label="Pipeline board with draggable lead cards"
        >
          {columns.map(column => (
            <PipelineColumn
              key={column.stage}
              stage={column.stage}
              leads={column.leads}
              onLeadClick={handleLeadClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead ? (
            <Card className="w-[260px] shadow-lg scale-[1.02] opacity-90">
              <CardContent className="p-3">
                <p className="font-medium text-sm">{activeLead.name}</p>
                {activeLead.company && (
                  <p className="text-xs text-muted-foreground">{activeLead.company}</p>
                )}
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      <LeadForm
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
