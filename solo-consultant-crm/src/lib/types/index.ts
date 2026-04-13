// ─── Enums ───────────────────────────────────────────
export type LeadStage = 'lead' | 'contact_made' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
export type LeadSource = 'referral' | 'website' | 'linkedin' | 'cold_outreach' | 'conference' | 'other';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type ActivityType =
  | 'lead_created' | 'lead_stage_changed' | 'lead_converted'
  | 'client_created' | 'client_updated' | 'client_archived'
  | 'invoice_created' | 'invoice_sent' | 'invoice_paid' | 'invoice_overdue';
export type EntityType = 'lead' | 'client' | 'invoice';

// ─── Database Row Types ──────────────────────────────
export interface Profile {
  id: string;
  business_name: string | null;
  business_email: string | null;
  business_phone: string | null;
  business_address: string | null;
  business_website: string | null;
  logo_url: string | null;
  invoice_prefix: string;
  invoice_next_number: number;
  default_tax_rate: number;
  default_payment_terms: number;
  currency: string;
  bank_details: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: LeadSource | null;
  stage: LeadStage;
  estimated_value: number | null;
  notes: string | null;
  position: number;
  converted_client_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  address: string | null;
  notes: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  paid_date: string | null;
  paid_method: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  user_id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  position: number;
  created_at: string;
}

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  type: ActivityType;
  description: string;
  entity_type: EntityType;
  entity_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ─── Joined / Computed Types ─────────────────────────
export interface InvoiceWithClient extends Invoice {
  client: Pick<Client, 'id' | 'name' | 'email' | 'company'>;
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
  client: Client;
}

export interface ClientWithStats extends Client {
  total_invoiced: number;
  total_paid: number;
  invoice_count: number;
}

export interface PipelineColumn {
  stage: LeadStage;
  leads: Lead[];
}

export interface DashboardMetrics {
  total_invoiced: number;
  total_paid: number;
  total_outstanding: number;
  active_clients: number;
  open_invoices: number;
  overdue_invoices: number;
  conversion_rate: number;
  pipeline_by_stage: { stage: LeadStage; count: number; value: number }[];
  recent_activity: ActivityLogEntry[];
  monthly_revenue: { month: string; revenue: number }[];
}

// ─── Form Input Types ────────────────────────────────
export interface CreateLeadInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: LeadSource;
  estimated_value?: number;
  notes?: string;
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {
  stage?: LeadStage;
  position?: number;
}

export interface CreateClientInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientInput extends Partial<CreateClientInput> {}

export interface CreateInvoiceInput {
  client_id: string;
  issue_date: string;
  due_date: string;
  tax_rate: number;
  notes?: string;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
  }[];
}

export interface UpdateProfileInput {
  business_name?: string;
  business_email?: string;
  business_phone?: string;
  business_address?: string;
  business_website?: string;
  invoice_prefix?: string;
  default_tax_rate?: number;
  default_payment_terms?: number;
  currency?: string;
  bank_details?: string;
}

// ─── Constants ───────────────────────────────────────
export const LEAD_STAGES: LeadStage[] = ['lead', 'contact_made', 'proposal_sent', 'negotiation', 'won', 'lost'];

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  lead: 'Lead',
  contact_made: 'Contact Made',
  proposal_sent: 'Proposal Sent',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

export const LEAD_STAGE_COLORS: Record<LeadStage, string> = {
  lead: 'bg-slate-400',
  contact_made: 'bg-blue-400',
  proposal_sent: 'bg-violet-400',
  negotiation: 'bg-amber-400',
  won: 'bg-green-400',
  lost: 'bg-red-400',
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  referral: 'Referral',
  website: 'Website',
  linkedin: 'LinkedIn',
  cold_outreach: 'Cold Outreach',
  conference: 'Conference',
  other: 'Other',
};

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
  sent: { label: 'Sent', color: 'text-blue-600', bg: 'bg-blue-50' },
  paid: { label: 'Paid', color: 'text-green-600', bg: 'bg-green-50' },
  overdue: { label: 'Overdue', color: 'text-amber-600', bg: 'bg-amber-50' },
};
