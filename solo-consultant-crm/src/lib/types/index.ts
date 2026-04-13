// ─── Enums ───────────────────────────────────────────
export type LeadStage = 'lead' | 'contact_made' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
export type LeadSource = 'referral' | 'website' | 'linkedin' | 'cold_outreach' | 'conference' | 'other';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type ActivityType =
  | 'lead_created' | 'lead_stage_changed' | 'lead_converted'
  | 'client_created' | 'client_updated' | 'client_archived'
  | 'invoice_created' | 'invoice_sent' | 'invoice_paid' | 'invoice_overdue'
  | 'project_created' | 'project_started' | 'project_phase_updated'
  | 'project_completed' | 'project_delivered' | 'project_cancelled';
export type EntityType = 'lead' | 'client' | 'invoice' | 'project';
export type ProjectType = 'website' | 'landing_page' | 'web_app' | 'mobile_app' | 'crm' | 'erp' | 'ecommerce' | 'internal_tool' | 'other';
export type ProjectStatus = 'draft' | 'approved' | 'in_progress' | 'review' | 'completed' | 'delivered' | 'cancelled';
export type PhaseStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type UserRole = 'admin' | 'client';

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
  role: UserRole;
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
  portal_user_id: string | null;
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

export interface Project {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  description: string | null;
  project_type: ProjectType;
  status: ProjectStatus;
  estimated_value: number | null;
  notes: string | null;
  invoice_id: string | null;
  repository_url: string | null;
  live_url: string | null;
  started_at: string | null;
  completed_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectPhase {
  id: string;
  project_id: string;
  phase_number: number;
  phase_name: string;
  status: PhaseStatus;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  phase_number: number;
  user_id: string;
  content: string;
  is_client_visible: boolean;
  created_at: string;
}

export interface ProjectDeliverable {
  id: string;
  project_id: string;
  phase_number: number;
  user_id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  is_client_visible: boolean;
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

export interface ProjectWithClient extends Project {
  client: Pick<Client, 'id' | 'name' | 'email' | 'company'>;
}

export interface ProjectWithDetails extends Project {
  client: Pick<Client, 'id' | 'name' | 'email' | 'company'>;
  phases: ProjectPhase[];
  comments: ProjectComment[];
  deliverables: ProjectDeliverable[];
}

export interface PortalProject {
  id: string;
  name: string;
  description: string | null;
  project_type: ProjectType;
  status: ProjectStatus;
  started_at: string | null;
  completed_at: string | null;
  delivered_at: string | null;
  created_at: string;
  phases: ProjectPhase[];
  comments: ProjectComment[];
  deliverables: ProjectDeliverable[];
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
  active_projects: number;
  completed_projects: number;
  in_progress_projects: number;
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

export interface CreateProjectInput {
  client_id: string;
  name: string;
  description?: string;
  project_type: ProjectType;
  estimated_value?: number;
  notes?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  project_type?: ProjectType;
  status?: ProjectStatus;
  estimated_value?: number;
  notes?: string;
  invoice_id?: string | null;
  repository_url?: string;
  live_url?: string;
}

export interface UpdatePhaseInput {
  status: PhaseStatus;
  notes?: string;
}

export interface CreateCommentInput {
  project_id: string;
  phase_number: number;
  content: string;
  is_client_visible?: boolean;
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

export const PROJECT_TYPES: ProjectType[] = [
  'website', 'landing_page', 'web_app', 'mobile_app',
  'crm', 'erp', 'ecommerce', 'internal_tool', 'other',
];

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  website: 'Website',
  landing_page: 'Landing Page',
  web_app: 'Web App',
  mobile_app: 'Mobile App',
  crm: 'CRM',
  erp: 'ERP',
  ecommerce: 'E-Commerce',
  internal_tool: 'Internal Tool',
  other: 'Other',
};

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
  approved: { label: 'Approved', color: 'text-blue-600', bg: 'bg-blue-50' },
  in_progress: { label: 'In Progress', color: 'text-violet-600', bg: 'bg-violet-50' },
  review: { label: 'In Review', color: 'text-amber-600', bg: 'bg-amber-50' },
  completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-50' },
  delivered: { label: 'Delivered', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50' },
};

export const PHASE_STATUS_CONFIG: Record<PhaseStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-slate-500', bg: 'bg-slate-100' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50' },
  completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-50' },
  failed: { label: 'Failed', color: 'text-red-600', bg: 'bg-red-50' },
};

export const PHASE_NAMES = [
  'Research',
  'Planning',
  'Design',
  'Frontend',
  'Backend',
  'Testing',
  'Deployment',
] as const;
