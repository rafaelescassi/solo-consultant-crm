import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { LeadDetail } from '@/components/leads/lead-detail';
import { DetailSkeleton } from '@/components/shared/loading-skeleton';

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<DetailSkeleton />}>
      <LeadDetailContent id={id} />
    </Suspense>
  );
}

async function LeadDetailContent({ id }: { id: string }) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !lead) notFound();

  // Get activity for this lead
  const { data: activities } = await supabase
    .from('activity_log')
    .select('*')
    .eq('entity_id', id)
    .eq('entity_type', 'lead')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div>
      <PageHeader title={lead.name} description={lead.company || 'Lead details'} />
      <LeadDetail lead={lead} activities={activities || []} />
    </div>
  );
}
