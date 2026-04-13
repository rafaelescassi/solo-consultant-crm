import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/projects/project-detail';
import { DetailSkeleton } from '@/components/shared/loading-skeleton';
import { getProjectById } from '@/app/(dashboard)/projects/actions';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ProjectContent id={id} />
    </Suspense>
  );
}

async function ProjectContent({ id }: { id: string }) {
  const project = await getProjectById(id);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
