import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ProjectForm } from '@/components/projects/project-form';
import { FormSkeleton } from '@/components/shared/loading-skeleton';
import { getClients } from '@/app/(dashboard)/clients/actions';

export default async function NewProjectPage() {
  return (
    <div>
      <PageHeader title="New Project" description="Create a new AI development project" />
      <Suspense fallback={<FormSkeleton />}>
        <NewProjectForm />
      </Suspense>
    </div>
  );
}

async function NewProjectForm() {
  const clients = await getClients();
  return <ProjectForm clients={clients} />;
}
