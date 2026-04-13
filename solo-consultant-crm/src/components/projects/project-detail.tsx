'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { DateDisplay } from '@/components/shared/date-display';
import { ProjectStatusBadge } from './project-status-badge';
import { PhaseStatusBadge } from './phase-status-badge';
import { PhaseTracker } from './phase-tracker';
import { PhaseComments } from './phase-comments';
import { PhaseDeliverables } from './phase-deliverables';
import { TriggerBuildButton } from './trigger-build-button';
import { updatePhaseStatus, updateProject } from '@/app/(dashboard)/projects/actions';
import { toast } from 'sonner';
import { ArrowLeft, Pencil, ExternalLink, GitBranch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PROJECT_TYPE_LABELS, PHASE_STATUS_CONFIG } from '@/lib/types';
import type { ProjectWithDetails, PhaseStatus } from '@/lib/types';

interface ProjectDetailProps {
  project: ProjectWithDetails;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const router = useRouter();
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [updatingPhase, setUpdatingPhase] = useState(false);

  const currentPhase = project.phases.find(p => p.phase_number === selectedPhase);

  async function handlePhaseStatusChange(newStatus: string | null) {
    if (!newStatus) return;
    setUpdatingPhase(true);
    try {
      const result = await updatePhaseStatus(project.id, selectedPhase, { status: newStatus as PhaseStatus });
      if (result.success) {
        toast.success(`Phase ${selectedPhase} updated to ${newStatus}`);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to update phase');
    } finally {
      setUpdatingPhase(false);
    }
  }

  async function handleStatusChange(newStatus: string | null) {
    if (!newStatus) return;
    try {
      const result = await updateProject(project.id, { status: newStatus });
      if (result.success) {
        toast.success(`Project status updated to ${newStatus}`);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to update status');
    }
  }

  return (
    <div className="space-y-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link href="/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>
        <div className="flex items-center gap-2">
          <TriggerBuildButton projectId={project.id} status={project.status} />
          <Button variant="outline" onClick={() => router.push(`/projects/${project.id}/edit`)} className="gap-2">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <Badge variant="secondary">{PROJECT_TYPE_LABELS[project.project_type]}</Badge>
                <ProjectStatusBadge status={project.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                Client:{' '}
                <Link href={`/clients/${project.client.id}`} className="text-foreground hover:underline">
                  {project.client.name}
                </Link>
                {project.client.email && ` (${project.client.email})`}
              </p>
            </div>
            <div className="flex-shrink-0">
              <Select value={project.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['draft', 'approved', 'in_progress', 'review', 'completed', 'delivered', 'cancelled'].map(s => (
                    <SelectItem key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-xs text-muted-foreground">Estimated Value</p>
              <p className="text-sm font-medium">
                {project.estimated_value ? <CurrencyDisplay amount={project.estimated_value} /> : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Started</p>
              <p className="text-sm font-medium">
                {project.started_at ? <DateDisplay date={project.started_at} /> : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium"><DateDisplay date={project.created_at} /></p>
            </div>
            <div className="flex gap-3">
              {project.repository_url && (
                <a href={project.repository_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                  <GitBranch className="h-4 w-4" /> Repo
                </a>
              )}
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                  <ExternalLink className="h-4 w-4" /> Live
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Tracker */}
      <Card>
        <CardContent className="p-6">
          <PhaseTracker
            phases={project.phases}
            selectedPhase={selectedPhase}
            onSelectPhase={setSelectedPhase}
          />
        </CardContent>
      </Card>

      {/* Phase Detail */}
      {currentPhase && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">Phase {currentPhase.phase_number}: {currentPhase.phase_name}</h2>
                <PhaseStatusBadge status={currentPhase.status} />
              </div>
              <Select
                value={currentPhase.status}
                onValueChange={handlePhaseStatusChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['pending', 'in_progress', 'completed', 'failed'] as const).map(s => (
                    <SelectItem key={s} value={s}>{PHASE_STATUS_CONFIG[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="comments">
              <TabsList>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
              </TabsList>
              <TabsContent value="comments" className="mt-4">
                <PhaseComments
                  projectId={project.id}
                  phaseNumber={selectedPhase}
                  comments={project.comments}
                />
              </TabsContent>
              <TabsContent value="deliverables" className="mt-4">
                <PhaseDeliverables
                  projectId={project.id}
                  phaseNumber={selectedPhase}
                  deliverables={project.deliverables}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
