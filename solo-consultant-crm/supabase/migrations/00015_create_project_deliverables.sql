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
