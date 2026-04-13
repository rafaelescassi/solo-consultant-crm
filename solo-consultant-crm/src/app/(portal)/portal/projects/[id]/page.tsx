'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectStatusBadge } from '@/components/projects/project-status-badge';
import { PortalPhaseTracker } from '@/components/portal/portal-phase-tracker';
import { PortalPhaseDetail } from '@/components/portal/portal-phase-detail';
import { DateDisplay } from '@/components/shared/date-display';
import { Skeleton } from '@/components/ui/skeleton';
import { getMyProjectById } from '@/app/(portal)/actions';
import { ArrowLeft } from 'lucide-react';
import { PROJECT_TYPE_LABELS } from '@/lib/types';
import type { PortalProject } from '@/lib/types';
import { useParams } from 'next/navigation';

export default function PortalProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<PortalProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState(1);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyProjectById(id);
        setProject(data);
      } catch {
        // handled below
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">Project not found</h2>
        <p className="text-muted-foreground mt-2">This project may not exist or you may not have access.</p>
        <Link href="/portal" className="text-primary hover:underline mt-4 inline-block">
          &larr; Back to My Projects
        </Link>
      </div>
    );
  }

  const currentPhase = project.phases.find(p => p.phase_number === selectedPhase);

  return (
    <div className="space-y-6">
      <Link href="/portal" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to My Projects
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <Badge variant="secondary">{PROJECT_TYPE_LABELS[project.project_type]}</Badge>
                <ProjectStatusBadge status={project.status} />
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
            {project.started_at && <span>Started: <DateDisplay date={project.started_at} /></span>}
            {project.completed_at && <span>Completed: <DateDisplay date={project.completed_at} /></span>}
            {project.delivered_at && <span>Delivered: <DateDisplay date={project.delivered_at} /></span>}
          </div>
        </CardContent>
      </Card>

      {/* Phase Tracker */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-2">Development Progress</h2>
          <PortalPhaseTracker
            phases={project.phases}
            selectedPhase={selectedPhase}
            onSelectPhase={setSelectedPhase}
          />
        </CardContent>
      </Card>

      {/* Phase Detail */}
      {currentPhase && (
        <PortalPhaseDetail
          phase={currentPhase}
          comments={project.comments}
          deliverables={project.deliverables}
        />
      )}
    </div>
  );
}
