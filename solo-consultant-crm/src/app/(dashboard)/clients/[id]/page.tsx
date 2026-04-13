import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ClientDetail } from '@/components/clients/client-detail';
import { DetailSkeleton } from '@/components/shared/loading-skeleton';
import { getClientById, getClientInvoices } from '@/app/(dashboard)/clients/actions';

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ClientDetailContent id={id} />
    </Suspense>
  );
}

async function ClientDetailContent({ id }: { id: string }) {
  const [client, invoices] = await Promise.all([
    getClientById(id),
    getClientInvoices(id),
  ]);

  if (!client) notFound();

  return (
    <div>
      <PageHeader title={client.name} description={client.company || 'Client details'} />
      <ClientDetail client={client} invoices={invoices} />
    </div>
  );
}
