import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { ProjectTable } from '@/components/projects/project-table';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { getProjects } from '@/app/(dashboard)/projects/actions';

export default async function ProjectsPage() {
  return (
    <div>
      <PageHeader title="Projects" description="Manage your AI development projects">
        <Link href="/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Project
          </Button>
        </Link>
      </PageHeader>
      <Suspense fallback={<TableSkeleton />}>
        <ProjectsContent />
      </Suspense>
    </div>
  );
}

async function ProjectsContent() {
  const projects = await getProjects();
  return <ProjectTable projects={projects} />;
}
