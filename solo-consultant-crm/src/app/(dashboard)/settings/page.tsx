import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { SettingsForm } from '@/components/settings/settings-form';
import { FormSkeleton } from '@/components/shared/loading-skeleton';
import { getProfile } from '@/app/(dashboard)/settings/actions';

export default async function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage your business profile and preferences" />
      <Suspense fallback={<FormSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}

async function SettingsContent() {
  const profile = await getProfile();
  return <SettingsForm profile={profile} />;
}
