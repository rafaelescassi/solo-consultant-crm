-- AI Dev Squad Platform - Extension Migrations (00010-00020)
-- Run this AFTER the original FULL_MIGRATION.sql
-- Fixed ordering: portal_user_id added before RLS policies that reference it

-- 00010: Add role to profiles
ALTER TABLE profiles
  ADD COLUMN role text NOT NULL DEFAULT 'admin'
  CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'client'));

-- 00020 (moved up): Add portal_user_id to clients - needed by RLS policies below
ALTER TABLE clients
  ADD COLUMN portal_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX idx_clients_portal_user_id
  ON clients(portal_user_id) WHERE portal_user_id IS NOT NULL;

-- 00011: Create project enums
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

-- 00012: Create projects table
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

-- 00013: Create project_phases table
CREATE TABLE project_phases (
  id              uuid         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id      uuid         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_number    integer      NOT NULL CHECK (phase_number >= 1 AND phase_number <= 7),
  phase_name      text         NOT NULL,
  status          phase_status NOT NULL DEFAULT 'pending',
  started_at      timestamptz  NULL,
  completed_at    timestamptz  NULL,
  notes           text         NULL,
  created_at      timestamptz  NOT NULL DEFAULT now(),
  updated_at      timestamptz  NOT NULL DEFAULT now(),
  UNIQUE(project_id, phase_number)
);

CREATE INDEX idx_project_phases_project_id ON project_phases(project_id);

-- 00014: Create project_comments table
CREATE TABLE project_comments (
  id                uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id        uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_number      integer     NOT NULL CHECK (phase_number >= 1 AND phase_number <= 7),
  user_id           uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content           text        NOT NULL,
  is_client_visible boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_comments_project_id ON project_comments(project_id, phase_number);
CREATE INDEX idx_project_comments_created_at ON project_comments(project_id, created_at DESC);

-- 00015: Create project_deliverables table
CREATE TABLE project_deliverables (
  id                uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id        uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_number      integer     NOT NULL CHECK (phase_number >= 1 AND phase_number <= 7),
  user_id           uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name         text        NOT NULL,
  file_url          text        NOT NULL,
  file_size         bigint      NULL,
  is_client_visible boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_deliverables_project_id ON project_deliverables(project_id, phase_number);

-- 00016: Extend activity_type enum
ALTER TYPE activity_type ADD VALUE 'project_created';
ALTER TYPE activity_type ADD VALUE 'project_started';
ALTER TYPE activity_type ADD VALUE 'project_phase_updated';
ALTER TYPE activity_type ADD VALUE 'project_completed';
ALTER TYPE activity_type ADD VALUE 'project_delivered';
ALTER TYPE activity_type ADD VALUE 'project_cancelled';

-- 00017: RLS policies for all new tables

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view own projects"
  ON projects FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can create projects"
  ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update own projects"
  ON projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can delete own projects"
  ON projects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Client can view their projects"
  ON projects FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE portal_user_id = auth.uid())
  );

ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view project phases"
  ON project_phases FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can create project phases"
  ON project_phases FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can update project phases"
  ON project_phases FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Client can view their project phases"
  ON project_phases FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p JOIN clients c ON c.id = p.client_id
      WHERE c.portal_user_id = auth.uid()
    )
  );

ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view project comments"
  ON project_comments FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can create project comments"
  ON project_comments FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can delete project comments"
  ON project_comments FOR DELETE USING (
    auth.uid() = user_id AND
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Client can view visible comments"
  ON project_comments FOR SELECT USING (
    is_client_visible = true AND
    project_id IN (
      SELECT p.id FROM projects p JOIN clients c ON c.id = p.client_id
      WHERE c.portal_user_id = auth.uid()
    )
  );

ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view project deliverables"
  ON project_deliverables FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can upload deliverables"
  ON project_deliverables FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can delete deliverables"
  ON project_deliverables FOR DELETE USING (
    auth.uid() = user_id AND
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Client can view visible deliverables"
  ON project_deliverables FOR SELECT USING (
    is_client_visible = true AND
    project_id IN (
      SELECT p.id FROM projects p JOIN clients c ON c.id = p.client_id
      WHERE c.portal_user_id = auth.uid()
    )
  );

-- 00018: Triggers for new tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON project_phases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS trigger AS $$
DECLARE
  phase_names text[] := ARRAY['Research', 'Planning', 'Design', 'Frontend', 'Backend', 'Testing', 'Deployment'];
  i integer;
BEGIN
  FOR i IN 1..7 LOOP
    INSERT INTO project_phases (project_id, phase_number, phase_name)
    VALUES (NEW.id, i, phase_names[i]);
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_project();

-- 00019: Storage for deliverables
INSERT INTO storage.buckets (id, name, public)
VALUES ('deliverables', 'deliverables', false);

CREATE POLICY "Admin can upload project deliverables"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'deliverables' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admin can view project deliverables"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'deliverables' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admin can delete project deliverables"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'deliverables' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
