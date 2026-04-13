'use server';

import { createSupabaseServer } from '@/lib/supabase/server';
import type { DashboardMetrics, LeadStage } from '@/lib/types';

const ALL_STAGES: LeadStage[] = ['lead', 'contact_made', 'proposal_sent', 'negotiation', 'won', 'lost'];

export async function getDashboardMetrics(period?: string): Promise<DashboardMetrics> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Determine date range
  const now = new Date();
  let startDate: string;
  if (period === 'year') {
    startDate = `${now.getFullYear()}-01-01`;
  } else if (period === 'quarter') {
    const quarter = Math.floor(now.getMonth() / 3);
    startDate = `${now.getFullYear()}-${String(quarter * 3 + 1).padStart(2, '0')}-01`;
  } else {
    startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  }

  // Parallel queries
  const [invoicesRes, clientsRes, leadsRes, activityRes, yearInvoicesRes] = await Promise.all([
    supabase.from('invoices').select('total, status').gte('issue_date', startDate),
    supabase.from('clients').select('id').eq('is_archived', false),
    supabase.from('leads').select('stage, estimated_value'),
    supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('invoices').select('total, status, issue_date').eq('status', 'paid').gte('issue_date', `${now.getFullYear()}-01-01`),
  ]);

  const invoices = invoicesRes.data || [];
  const clients = clientsRes.data || [];
  const leads = leadsRes.data || [];
  const activity = activityRes.data || [];
  const yearInvoices = yearInvoicesRes.data || [];

  const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + Number(inv.total), 0);
  const totalOutstanding = invoices.filter(i => i.status !== 'paid' && i.status !== 'draft').reduce((sum, inv) => sum + Number(inv.total), 0);
  const openInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'draft').length;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;

  const wonLeads = leads.filter(l => l.stage === 'won').length;
  const lostLeads = leads.filter(l => l.stage === 'lost').length;
  const conversionRate = wonLeads + lostLeads > 0 ? Math.round((wonLeads / (wonLeads + lostLeads)) * 100) : 0;

  const pipelineByStage = ALL_STAGES.map(stage => {
    const stageLeads = leads.filter(l => l.stage === stage);
    return {
      stage,
      count: stageLeads.length,
      value: stageLeads.reduce((sum, l) => sum + (Number(l.estimated_value) || 0), 0),
    };
  });

  // Monthly revenue for chart
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0');
    const monthStr = `${now.getFullYear()}-${month}`;
    const monthRevenue = yearInvoices
      .filter(inv => inv.issue_date?.startsWith(monthStr))
      .reduce((sum, inv) => sum + Number(inv.total), 0);
    return {
      month: new Date(now.getFullYear(), i).toLocaleString('en', { month: 'short' }),
      revenue: monthRevenue,
    };
  });

  return {
    total_invoiced: totalInvoiced,
    total_paid: totalPaid,
    total_outstanding: totalOutstanding,
    active_clients: clients.length,
    open_invoices: openInvoices,
    overdue_invoices: overdueInvoices,
    conversion_rate: conversionRate,
    pipeline_by_stage: pipelineByStage,
    recent_activity: activity,
    monthly_revenue: monthlyRevenue,
  };
}
