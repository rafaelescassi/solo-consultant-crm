CREATE TYPE project_type AS ENUM (
  'website', 'landing_page', 'web_app', 'mobile_app',
  'crm', 'erp', 'ecommerce', 'internal_tool', 'other'
);

CREATE TYPE project_status AS ENUM (
  'draft', 'approved', 'in_progress', 'review',
  'completed', 'delivered', 'cancelled'
);

CREATE TYPE phase_status AS ENUM (
  'pending', 'in_progress', 'completed', 'failed'
);
