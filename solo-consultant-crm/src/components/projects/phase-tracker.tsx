'use client';

import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import type { ProjectPhase, PhaseStatus } from '@/lib/types';

interface PhaseTrackerProps {
  phases: ProjectPhase[];
  selectedPhase: number;
  onSelectPhase: (phaseNumber: number) => void;
}

const CIRCLE_STYLES: Record<PhaseStatus, string> = {
  pending: 'bg-muted text-muted-foreground border-2 border-border',
  in_progress: 'bg-blue-500 text-white shadow-[0_0_0_4px_rgba(59,130,246,0.2)]',
  completed: 'bg-green-500 text-white',
  failed: 'bg-red-500 text-white',
};

const LABEL_STYLES: Record<PhaseStatus, string> = {
  pending: 'text-muted-foreground',
  in_progress: 'text-blue-600 font-semibold',
  completed: 'text-green-600',
  failed: 'text-red-600',
};

function getConnectorClass(leftStatus: PhaseStatus, rightStatus: PhaseStatus) {
  if (leftStatus === 'completed' && (rightStatus === 'completed' || rightStatus === 'in_progress')) {
    return 'bg-green-500';
  }
  return 'bg-border';
}

export function PhaseTracker({ phases, selectedPhase, onSelectPhase }: PhaseTrackerProps) {
  const sortedPhases = [...phases].sort((a, b) => a.phase_number - b.phase_number);

  return (
    <>
      {/* Desktop: horizontal */}
      <div className="hidden md:block" role="list" aria-label="Project development phases">
        <div className="flex items-center justify-between w-full py-6">
          {sortedPhases.map((phase, index) => (
            <div key={phase.id} className="flex items-center flex-1">
              <div
                role="listitem"
                aria-label={`Phase ${phase.phase_number}: ${phase.phase_name} — Status: ${phase.status}`}
                aria-current={phase.status === 'in_progress' ? 'step' : undefined}
                tabIndex={0}
                className="flex flex-col items-center cursor-pointer group w-20"
                onClick={() => onSelectPhase(phase.phase_number)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectPhase(phase.phase_number); } }}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
                    CIRCLE_STYLES[phase.status],
                    phase.status === 'in_progress' && 'animate-pulse',
                    selectedPhase === phase.phase_number && 'ring-2 ring-primary ring-offset-2'
                  )}
                >
                  {phase.status === 'completed' ? <Check className="h-4 w-4" /> :
                   phase.status === 'failed' ? <X className="h-4 w-4" /> :
                   phase.phase_number}
                </div>
                <p className={cn('text-xs font-medium mt-2', LABEL_STYLES[phase.status])}>
                  {phase.phase_name}
                </p>
              </div>
              {index < sortedPhases.length - 1 && (
                <div
                  className={cn('h-0.5 flex-1 mx-1', getConnectorClass(phase.status, sortedPhases[index + 1].status))}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden py-4" role="list" aria-label="Project development phases">
        {sortedPhases.map((phase, index) => (
          <div key={phase.id}>
            <div
              role="listitem"
              aria-label={`Phase ${phase.phase_number}: ${phase.phase_name} — Status: ${phase.status}`}
              aria-current={phase.status === 'in_progress' ? 'step' : undefined}
              tabIndex={0}
              className="flex items-start gap-4 cursor-pointer"
              onClick={() => onSelectPhase(phase.phase_number)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectPhase(phase.phase_number); } }}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 transition-all',
                    CIRCLE_STYLES[phase.status],
                    phase.status === 'in_progress' && 'animate-pulse',
                    selectedPhase === phase.phase_number && 'ring-2 ring-primary ring-offset-2'
                  )}
                >
                  {phase.status === 'completed' ? <Check className="h-4 w-4" /> :
                   phase.status === 'failed' ? <X className="h-4 w-4" /> :
                   phase.phase_number}
                </div>
                {index < sortedPhases.length - 1 && (
                  <div className={cn('w-0.5 h-6 mt-1', getConnectorClass(phase.status, sortedPhases[index + 1].status))} aria-hidden="true" />
                )}
              </div>
              <div className="pt-2 pb-4">
                <p className={cn('text-sm font-medium', LABEL_STYLES[phase.status])}>{phase.phase_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{phase.status.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
