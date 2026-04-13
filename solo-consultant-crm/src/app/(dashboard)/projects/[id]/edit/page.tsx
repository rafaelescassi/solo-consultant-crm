import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ProjectForm } from '@/components/projects/project-form';
import { FormSkeleton } from '@/components/shared/loading-skeleton';
import { getProjectById } from '@/app/(dashboard)/projects/actions';
import { getClients } from '@/app/(dashboard)/clients/actions';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  return (
    <div>
      <PageHeader title="Edit Project" />
      <Suspense fallback={<FormSkeleton />}>
        <EditProjectForm id={id} />
      </Suspense>
    </div>
  );
}

async function EditProjectForm({ id }: { id: string }) {
  const [project, clients] = await Promise.all([
    getProjectById(id),
    getClients(),
  ]);
  if (!project) notFound();
  return <ProjectForm project={project} clients={clients} />;
}
