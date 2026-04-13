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
