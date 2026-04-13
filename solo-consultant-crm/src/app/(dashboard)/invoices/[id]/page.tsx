import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { InvoiceDetail } from '@/components/invoices/invoice-detail';
import { DetailSkeleton } from '@/components/shared/loading-skeleton';
import { getInvoiceById } from '@/app/(dashboard)/invoices/actions';

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<DetailSkeleton />}>
      <InvoiceDetailContent id={id} />
    </Suspense>
  );
}

async function InvoiceDetailContent({ id }: { id: string }) {
  const invoice = await getInvoiceById(id);
  if (!invoice) notFound();

  return (
    <div>
      <PageHeader
        title={`Invoice ${invoice.invoice_number}`}
        description={`For ${invoice.client.name}`}
      />
      <InvoiceDetail invoice={invoice} />
    </div>
  );
}
