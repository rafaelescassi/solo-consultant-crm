import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { InvoiceTable } from '@/components/invoices/invoice-table';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { getInvoices } from '@/app/(dashboard)/invoices/actions';

export default async function InvoicesPage() {
  return (
    <div>
      <PageHeader title="Invoices" description="Manage and track your invoices">
        <Link href="/invoices/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Invoice
          </Button>
        </Link>
      </PageHeader>
      <Suspense fallback={<TableSkeleton />}>
        <InvoicesContent />
      </Suspense>
    </div>
  );
}

async function InvoicesContent() {
  const invoices = await getInvoices();
  return <InvoiceTable invoices={invoices} />;
}
