CREATE TABLE leads (
  id                  uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                text        NOT NULL,
  email               text        NULL,
  phone               text        NULL,
  company             text        NULL,
  source              lead_source NULL,
  stage               lead_stage  NOT NULL DEFAULT 'lead',
  estimated_value     numeric(12,2) NULL CHECK (estimated_value >= 0),
  notes               text        NULL,
  position            integer     NOT NULL DEFAULT 0,
  converted_client_id uuid        NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_stage ON leads(user_id, stage);
CREATE INDEX idx_leads_created_at ON leads(user_id, created_at DESC);
