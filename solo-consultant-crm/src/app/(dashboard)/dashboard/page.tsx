import { Suspense } from 'react';
import { getDashboardMetrics } from '@/app/(dashboard)/actions';
import { PageHeader } from '@/components/layout/page-header';
import { MetricsCards } from '@/components/dashboard/metrics-cards';
import { RevenueOverview } from '@/components/dashboard/revenue-overview';
import { PipelineSummary } from '@/components/dashboard/pipeline-summary';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { DashboardSkeleton } from '@/components/shared/loading-skeleton';

export default async function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your consulting business" />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

async function DashboardContent() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-6">
      <MetricsCards
        activeClients={metrics.active_clients}
        openInvoices={metrics.open_invoices}
        overdueInvoices={metrics.overdue_invoices}
        conversionRate={metrics.conversion_rate}
        activeProjects={metrics.active_projects}
        inProgressProjects={metrics.in_progress_projects}
        completedProjects={metrics.completed_projects}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueOverview
          totalInvoiced={metrics.total_invoiced}
          totalPaid={metrics.total_paid}
          totalOutstanding={metrics.total_outstanding}
        />
        <PipelineSummary pipelineByStage={metrics.pipeline_by_stage} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueChart data={metrics.monthly_revenue} />
        <ActivityFeed activities={metrics.recent_activity} />
      </div>
    </div>
  );
}
