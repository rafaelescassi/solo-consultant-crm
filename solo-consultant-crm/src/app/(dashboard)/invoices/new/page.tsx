import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { InvoiceForm } from '@/components/invoices/invoice-form';
import { FormSkeleton } from '@/components/shared/loading-skeleton';
import { getClients } from '@/app/(dashboard)/clients/actions';
import { getProfile } from '@/app/(dashboard)/settings/actions';

interface NewInvoicePageProps {
  searchParams: Promise<{ client?: string }>;
}

export default async function NewInvoicePage({ searchParams }: NewInvoicePageProps) {
  const params = await searchParams;

  return (
    <div>
      <PageHeader title="New Invoice" description="Create a new invoice for a client" />
      <Suspense fallback={<FormSkeleton />}>
        <NewInvoiceContent defaultClientId={params.client} />
      </Suspense>
    </div>
  );
}

async function NewInvoiceContent({ defaultClientId }: { defaultClientId?: string }) {
  const [clients, profile] = await Promise.all([
    getClients(),
    getProfile(),
  ]);

  return (
    <InvoiceForm
      clients={clients}
      defaultClientId={defaultClientId}
      defaultTaxRate={profile.default_tax_rate}
    />
  );
}
