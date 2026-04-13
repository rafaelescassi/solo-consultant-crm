import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PortalProjectCard } from '@/components/portal/portal-project-card';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { getMyProjects } from '@/app/(portal)/actions';
import { FolderKanban } from 'lucide-react';

export default async function PortalPage() {
  return (
    <div>
      <PageHeader title="My Projects" description="Track the progress of your AI development projects" />
      <Suspense fallback={<TableSkeleton />}>
        <PortalContent />
      </Suspense>
    </div>
  );
}

async function PortalContent() {
  const projects = await getMyProjects();

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderKanban className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-1">No projects yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your projects will appear here once they are created by our team.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <PortalProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
