import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ClientForm } from '@/components/clients/client-form';
import { FormSkeleton } from '@/components/shared/loading-skeleton';
import { getClientById } from '@/app/(dashboard)/clients/actions';

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<FormSkeleton />}>
      <EditClientContent id={id} />
    </Suspense>
  );
}

async function EditClientContent({ id }: { id: string }) {
  const client = await getClientById(id);
  if (!client) notFound();

  return (
    <div>
      <PageHeader title="Edit Client" description={`Editing ${client.name}`} />
      <ClientForm client={client} />
    </div>
  );
}
