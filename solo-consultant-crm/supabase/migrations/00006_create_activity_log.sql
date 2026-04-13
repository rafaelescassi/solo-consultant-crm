CREATE TABLE activity_log (
  id          uuid          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        activity_type NOT NULL,
  description text          NOT NULL,
  entity_type text          NOT NULL,
  entity_id   uuid          NOT NULL,
  metadata    jsonb         NULL,
  created_at  timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
