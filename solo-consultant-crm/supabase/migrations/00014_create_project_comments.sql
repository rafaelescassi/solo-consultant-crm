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
