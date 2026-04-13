-- Pipeline stages for leads
CREATE TYPE lead_stage AS ENUM (
  'lead',
  'contact_made',
  'proposal_sent',
  'negotiation',
  'won',
  'lost'
);

-- Source channels for leads
CREATE TYPE lead_source AS ENUM (
  'referral',
  'website',
  'linkedin',
  'cold_outreach',
  'conference',
  'other'
);

-- Invoice lifecycle statuses
CREATE TYPE invoice_status AS ENUM (
  'draft',
  'sent',
  'paid',
  'overdue'
);

-- Activity types for the activity log
CREATE TYPE activity_type AS ENUM (
  'lead_created',
  'lead_stage_changed',
  'lead_converted',
  'client_created',
  'client_updated',
  'client_archived',
  'invoice_created',
  'invoice_sent',
  'invoice_paid',
  'invoice_overdue'
);
