import { Suspense } from 'react';
import { getLeadsByStage } from '@/app/(dashboard)/leads/actions';
import { PageHeader } from '@/components/layout/page-header';
import { PipelineBoard } from '@/components/leads/pipeline-board';
import { PipelineSkeleton } from '@/components/shared/loading-skeleton';

export default async function LeadsPage() {
  return (
    <div>
      <PageHeader title="Pipeline" description="Track and manage your leads through the sales pipeline" />
      <Suspense fallback={<PipelineSkeleton />}>
        <PipelineContent />
      </Suspense>
    </div>
  );
}

async function PipelineContent() {
  const columns = await getLeadsByStage();
  return <PipelineBoard initialColumns={columns} />;
}
