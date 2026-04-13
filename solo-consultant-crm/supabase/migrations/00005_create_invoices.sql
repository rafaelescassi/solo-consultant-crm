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
