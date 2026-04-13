-- Pipeline stages for leads
CREATE TYPE lead_stage AS ENUM (
  'lead',
  'contact_made',
  'proposal_sent',
  'negotiation',
  'won',
  'lost'
);

-- Source channels for leads
CREATE TYPE lead_source AS ENUM (
  'referral',
  'website',
  'linkedin',
  'cold_outreach',
  'conference',
  'other'
);

-- Invoice lifecycle statuses
CREATE TYPE invoice_status AS ENUM (
  'draft',
  'sent',
  'paid',
  'overdue'
);

-- Activity types for the activity log
CREATE TYPE activity_type AS ENUM (
  'lead_created',
  'lead_stage_changed',
  'lead_converted',
  'client_created',
  'client_updated',
  'client_archived',
  'invoice_created',
  'invoice_sent',
  'invoice_paid',
  'invoice_overdue'
);
CREATE TABLE profiles (
  id              uuid        NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name   text        NULL,
  business_email  text        NULL,
  business_phone  text        NULL,
  business_address text       NULL,
  business_website text       NULL,
  logo_url        text        NULL,
  invoice_prefix  text        NOT NULL DEFAULT 'INV',
  invoice_next_number integer NOT NULL DEFAULT 1 CHECK (invoice_next_number > 0),
  default_tax_rate numeric(5,2) NOT NULL DEFAULT 0.00 CHECK (default_tax_rate >= 0 AND default_tax_rate <= 100),
  default_payment_terms integer NOT NULL DEFAULT 30 CHECK (default_payment_terms > 0),
  currency        text        NOT NULL DEFAULT 'USD',
  bank_details    text        NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Automatically create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
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
CREATE TABLE clients (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  email       text        NOT NULL,
  phone       text        NULL,
  company     text        NULL,
  address     text        NULL,
  notes       text        NULL,
  is_archived boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Add FK from leads to clients (now that clients table exists)
ALTER TABLE leads ADD CONSTRAINT fk_leads_converted_client
  FOREIGN KEY (converted_client_id) REFERENCES clients(id) ON DELETE SET NULL;

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_email ON clients(user_id, email);
CREATE INDEX idx_clients_archived ON clients(user_id, is_archived);
CREATE TABLE invoices (
  id              uuid           NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id       uuid           NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  invoice_number  text           NOT NULL,
  status          invoice_status NOT NULL DEFAULT 'draft',
  issue_date      date           NOT NULL DEFAULT CURRENT_DATE,
  due_date        date           NOT NULL,
  subtotal        numeric(12,2)  NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  tax_rate        numeric(5,2)   NOT NULL DEFAULT 0.00 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  tax_amount      numeric(12,2)  NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  total           numeric(12,2)  NOT NULL DEFAULT 0.00 CHECK (total >= 0),
  notes           text           NULL,
  paid_date       date           NULL,
  paid_method     text           NULL,
  sent_at         timestamptz    NULL,
  created_at      timestamptz    NOT NULL DEFAULT now(),
  updated_at      timestamptz    NOT NULL DEFAULT now()
);

CREATE TABLE invoice_items (
  id          uuid          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id  uuid          NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description text          NOT NULL,
  quantity    numeric(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price  numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  amount      numeric(12,2) NOT NULL CHECK (amount >= 0),
  position    integer       NOT NULL DEFAULT 0,
  created_at  timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(user_id, client_id);
CREATE INDEX idx_invoices_status ON invoices(user_id, status);
CREATE INDEX idx_invoices_due_date ON invoices(user_id, due_date);
CREATE UNIQUE INDEX idx_invoices_number_unique ON invoices(user_id, invoice_number);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_user_id ON invoice_items(user_id);
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
-- ═══ PROFILES ═══
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ═══ LEADS ═══
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own leads"
  ON leads FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON leads FOR DELETE USING (auth.uid() = user_id);

-- ═══ CLIENTS ═══
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own clients"
  ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE USING (auth.uid() = user_id);

-- ═══ INVOICES ═══
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own invoices"
  ON invoices FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
  ON invoices FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices"
  ON invoices FOR DELETE USING (auth.uid() = user_id);

-- ═══ INVOICE ITEMS ═══
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoice items"
  ON invoice_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own invoice items"
  ON invoice_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoice items"
  ON invoice_items FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoice items"
  ON invoice_items FOR DELETE USING (auth.uid() = user_id);

-- ═══ ACTIVITY LOG ═══
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON activity_log FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activity"
  ON activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Create storage bucket for business logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

CREATE POLICY "Users can upload own logo"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own logo"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own logo"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own logo"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- Generic trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
