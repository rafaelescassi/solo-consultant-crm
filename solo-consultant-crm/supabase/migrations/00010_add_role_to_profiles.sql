ALTER TABLE profiles
  ADD COLUMN role text NOT NULL DEFAULT 'admin'
  CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'client'));
