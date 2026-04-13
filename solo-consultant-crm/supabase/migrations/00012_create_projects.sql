CREATE TABLE projects (
  id               uuid           NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id        uuid           NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  name             text           NOT NULL,
  description      text           NULL,
  project_type     project_type   NOT NULL DEFAULT 'website',
  status           project_status NOT NULL DEFAULT 'draft',
  estimated_value  numeric(12,2)  NULL CHECK (estimated_value >= 0),
  notes            text           NULL,
  invoice_id       uuid           NULL REFERENCES invoices(id) ON DELETE SET NULL,
  repository_url   text           NULL,
  live_url         text           NULL,
  started_at       timestamptz    NULL,
  completed_at     timestamptz    NULL,
  delivered_at     timestamptz    NULL,
  created_at       timestamptz    NOT NULL DEFAULT now(),
  updated_at       timestamptz    NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_client_id ON projects(user_id, client_id);
CREATE INDEX idx_projects_status ON projects(user_id, status);
CREATE INDEX idx_projects_created_at ON projects(user_id, created_at DESC);
