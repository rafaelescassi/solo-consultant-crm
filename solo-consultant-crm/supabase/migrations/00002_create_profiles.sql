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
