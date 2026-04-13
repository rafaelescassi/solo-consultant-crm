import { PageHeader } from '@/components/layout/page-header';
import { ClientForm } from '@/components/clients/client-form';

export default function NewClientPage() {
  return (
    <div>
      <PageHeader title="New Client" description="Add a new client to your database" />
      <ClientForm />
    </div>
  );
}
