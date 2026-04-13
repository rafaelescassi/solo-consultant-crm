import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { ClientTable } from '@/components/clients/client-table';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { getClients } from '@/app/(dashboard)/clients/actions';

export default async function ClientsPage() {
  return (
    <div>
      <PageHeader title="Clients" description="Manage your client relationships">
        <Link href="/clients/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Client
          </Button>
        </Link>
      </PageHeader>
      <Suspense fallback={<TableSkeleton />}>
        <ClientsContent />
      </Suspense>
    </div>
  );
}

async function ClientsContent() {
  const clients = await getClients();
  return <ClientTable initialClients={clients} />;
}
