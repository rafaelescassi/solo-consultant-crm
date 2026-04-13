ALTER TABLE clients
  ADD COLUMN portal_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX idx_clients_portal_user_id
  ON clients(portal_user_id) WHERE portal_user_id IS NOT NULL;
