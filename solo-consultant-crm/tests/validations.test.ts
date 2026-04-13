import { describe, it, expect } from 'vitest';
import {
  createLeadSchema,
  updateLeadSchema,
  createClientSchema,
  updateClientSchema,
  invoiceItemSchema,
  createInvoiceSchema,
  updateProfileSchema,
} from '@/lib/validations/index';

// ─── createLeadSchema ──────────────────────────────────

describe('createLeadSchema', () => {
  it('accepts a valid lead with all fields', () => {
    const result = createLeadSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '555-1234',
      company: 'Acme Inc',
      source: 'referral',
      estimated_value: 5000,
      notes: 'Met at conference',
    });
    expect(result.success).toBe(true);
  });

  it('accepts a lead with only the required name field', () => {
    const result = createLeadSchema.safeParse({ name: 'Jane Doe' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = createLeadSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing name', () => {
    const result = createLeadSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects a name exceeding 200 characters', () => {
    const result = createLeadSchema.safeParse({ name: 'A'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('accepts a name of exactly 200 characters', () => {
    const result = createLeadSchema.safeParse({ name: 'A'.repeat(200) });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email format', () => {
    const result = createLeadSchema.safeParse({ name: 'Test', email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('accepts a valid email', () => {
    const result = createLeadSchema.safeParse({ name: 'Test', email: 'test@example.com' });
    expect(result.success).toBe(true);
  });

  it('accepts an empty string email (optional behavior)', () => {
    const result = createLeadSchema.safeParse({ name: 'Test', email: '' });
    expect(result.success).toBe(true);
  });

  it('accepts an empty string phone', () => {
    const result = createLeadSchema.safeParse({ name: 'Test', phone: '' });
    expect(result.success).toBe(true);
  });

  it('rejects a phone exceeding 50 characters', () => {
    const result = createLeadSchema.safeParse({ name: 'Test', phone: 'X'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('accepts an empty string company', () => {
    const result = createLeadSchema.safeParse({ name: 'Test', company: '' });
    expect(result.success).toBe(true);
  });

  it('rejects company exceeding 200 characters', () => {
    const result = createLeadSchema.safeParse({ name: 'Test', company: 'X'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('accepts all valid source values', () => {
    const sources = ['referral', 'website', 'linkedin', 'cold_outreach', 'conference', 'other'];
    for (const source of sources) {
      const result = createLeadSchema.safeParse({ name: 'Test', source });
      expect(result.success).toBe(true);
    }
  });

  it('rejects an invalid source', () => {
    const result = createLeadSchema.safeParse({ name: 'Test', source: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('accepts estimated_value of 0', () => {
    const result = createLeadSchema.safeParse({ name: 'Test', estimated_value: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects a negative estimated_value', () => {
    const result = createLeadSchema.safeParse({ name: 'Test', estimated_value: -1 });
    expect(result.success).toBe(false);
  });

  it('accepts a large estimated_value', () => {
    const result = createLeadSchema.safeParse({ name: 'Test', estimated_value: 1_000_000 });
    expect(result.success).toBe(true);
  });

  it('coerces a string estimated_value to a number', () => {
    const result = createLeadSchema.safeParse({ name: 'Test', estimated_value: '1500' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estimated_value).toBe(1500);
    }
  });

  it('rejects notes exceeding 5000 characters', () => {
    const result = createLeadSchema.safeParse({ name: 'Test', notes: 'X'.repeat(5001) });
    expect(result.success).toBe(false);
  });

  it('accepts notes of exactly 5000 characters', () => {
    const result = createLeadSchema.safeParse({ name: 'Test', notes: 'X'.repeat(5000) });
    expect(result.success).toBe(true);
  });
});

// ─── updateLeadSchema ──────────────────────────────────

describe('updateLeadSchema', () => {
  it('accepts a partial update with only name', () => {
    const result = updateLeadSchema.safeParse({ name: 'Updated Name' });
    expect(result.success).toBe(true);
  });

  it('accepts an empty object (all fields optional)', () => {
    const result = updateLeadSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts all valid stage values', () => {
    const stages = ['lead', 'contact_made', 'proposal_sent', 'negotiation', 'won', 'lost'];
    for (const stage of stages) {
      const result = updateLeadSchema.safeParse({ stage });
      expect(result.success).toBe(true);
    }
  });

  it('rejects an invalid stage value', () => {
    const result = updateLeadSchema.safeParse({ stage: 'invalid_stage' });
    expect(result.success).toBe(false);
  });

  it('accepts a valid position', () => {
    const result = updateLeadSchema.safeParse({ position: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects a negative position', () => {
    const result = updateLeadSchema.safeParse({ position: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects a non-integer position', () => {
    const result = updateLeadSchema.safeParse({ position: 1.5 });
    expect(result.success).toBe(false);
  });

  it('accepts combined partial fields', () => {
    const result = updateLeadSchema.safeParse({
      name: 'Updated',
      stage: 'won',
      estimated_value: 10000,
    });
    expect(result.success).toBe(true);
  });
});

// ─── createClientSchema ────────────────────────────────

describe('createClientSchema', () => {
  it('accepts a valid client with required fields', () => {
    const result = createClientSchema.safeParse({
      name: 'Client A',
      email: 'client@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('accepts a client with all fields', () => {
    const result = createClientSchema.safeParse({
      name: 'Client A',
      email: 'client@example.com',
      phone: '555-5678',
      company: 'Big Corp',
      address: '123 Main St',
      notes: 'Good client',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = createClientSchema.safeParse({ email: 'client@example.com' });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = createClientSchema.safeParse({ name: '', email: 'client@example.com' });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = createClientSchema.safeParse({ name: 'Client A' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = createClientSchema.safeParse({ name: 'Client A', email: 'bad-email' });
    expect(result.success).toBe(false);
  });

  it('accepts empty string optional fields', () => {
    const result = createClientSchema.safeParse({
      name: 'Client A',
      email: 'a@b.com',
      phone: '',
      company: '',
      address: '',
      notes: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects address exceeding 500 characters', () => {
    const result = createClientSchema.safeParse({
      name: 'Client A',
      email: 'a@b.com',
      address: 'X'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

// ─── updateClientSchema ────────────────────────────────

describe('updateClientSchema', () => {
  it('accepts an empty object', () => {
    const result = updateClientSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts partial update with only name', () => {
    const result = updateClientSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
  });

  it('accepts partial update with only email', () => {
    const result = updateClientSchema.safeParse({ email: 'new@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email in partial update', () => {
    const result = updateClientSchema.safeParse({ email: 'not-valid' });
    expect(result.success).toBe(false);
  });
});

// ─── invoiceItemSchema ─────────────────────────────────

describe('invoiceItemSchema', () => {
  it('accepts a valid item', () => {
    const result = invoiceItemSchema.safeParse({
      description: 'Consulting services',
      quantity: 10,
      unit_price: 150,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty description', () => {
    const result = invoiceItemSchema.safeParse({
      description: '',
      quantity: 1,
      unit_price: 100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects description exceeding 500 characters', () => {
    const result = invoiceItemSchema.safeParse({
      description: 'X'.repeat(501),
      quantity: 1,
      unit_price: 100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero quantity', () => {
    const result = invoiceItemSchema.safeParse({
      description: 'Item',
      quantity: 0,
      unit_price: 100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative quantity', () => {
    const result = invoiceItemSchema.safeParse({
      description: 'Item',
      quantity: -5,
      unit_price: 100,
    });
    expect(result.success).toBe(false);
  });

  it('accepts zero unit_price', () => {
    const result = invoiceItemSchema.safeParse({
      description: 'Free item',
      quantity: 1,
      unit_price: 0,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative unit_price', () => {
    const result = invoiceItemSchema.safeParse({
      description: 'Item',
      quantity: 1,
      unit_price: -10,
    });
    expect(result.success).toBe(false);
  });

  it('coerces string quantity to number', () => {
    const result = invoiceItemSchema.safeParse({
      description: 'Item',
      quantity: '5',
      unit_price: 100,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(5);
    }
  });

  it('coerces string unit_price to number', () => {
    const result = invoiceItemSchema.safeParse({
      description: 'Item',
      quantity: 1,
      unit_price: '99.99',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.unit_price).toBe(99.99);
    }
  });
});

// ─── createInvoiceSchema ───────────────────────────────

describe('createInvoiceSchema', () => {
  const validItem = { description: 'Service', quantity: 1, unit_price: 100 };
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';

  it('accepts a valid invoice', () => {
    const result = createInvoiceSchema.safeParse({
      client_id: validUUID,
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      tax_rate: 10,
      notes: 'Thank you',
      items: [validItem],
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-UUID client_id', () => {
    const result = createInvoiceSchema.safeParse({
      client_id: 'not-a-uuid',
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      tax_rate: 0,
      items: [validItem],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty client_id', () => {
    const result = createInvoiceSchema.safeParse({
      client_id: '',
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      tax_rate: 0,
      items: [validItem],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty issue_date', () => {
    const result = createInvoiceSchema.safeParse({
      client_id: validUUID,
      issue_date: '',
      due_date: '2024-02-15',
      tax_rate: 0,
      items: [validItem],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty due_date', () => {
    const result = createInvoiceSchema.safeParse({
      client_id: validUUID,
      issue_date: '2024-01-15',
      due_date: '',
      tax_rate: 0,
      items: [validItem],
    });
    expect(result.success).toBe(false);
  });

  it('accepts tax_rate of 0', () => {
    const result = createInvoiceSchema.safeParse({
      client_id: validUUID,
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      tax_rate: 0,
      items: [validItem],
    });
    expect(result.success).toBe(true);
  });

  it('accepts tax_rate of 100', () => {
    const result = createInvoiceSchema.safeParse({
      client_id: validUUID,
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      tax_rate: 100,
      items: [validItem],
    });
    expect(result.success).toBe(true);
  });

  it('rejects tax_rate above 100', () => {
    const result = createInvoiceSchema.safeParse({
      client_id: validUUID,
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      tax_rate: 101,
      items: [validItem],
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative tax_rate', () => {
    const result = createInvoiceSchema.safeParse({
      client_id: validUUID,
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      tax_rate: -1,
      items: [validItem],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty items array', () => {
    const result = createInvoiceSchema.safeParse({
      client_id: validUUID,
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      tax_rate: 0,
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it('accepts multiple items', () => {
    const result = createInvoiceSchema.safeParse({
      client_id: validUUID,
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      tax_rate: 5,
      items: [validItem, { description: 'Another', quantity: 2, unit_price: 50 }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects if any item is invalid', () => {
    const result = createInvoiceSchema.safeParse({
      client_id: validUUID,
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      tax_rate: 5,
      items: [validItem, { description: '', quantity: 0, unit_price: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts notes as empty string', () => {
    const result = createInvoiceSchema.safeParse({
      client_id: validUUID,
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      tax_rate: 0,
      notes: '',
      items: [validItem],
    });
    expect(result.success).toBe(true);
  });

  it('rejects notes exceeding 2000 characters', () => {
    const result = createInvoiceSchema.safeParse({
      client_id: validUUID,
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      tax_rate: 0,
      notes: 'X'.repeat(2001),
      items: [validItem],
    });
    expect(result.success).toBe(false);
  });
});

// ─── updateProfileSchema ───────────────────────────────

describe('updateProfileSchema', () => {
  it('accepts an empty object', () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts valid business_name', () => {
    const result = updateProfileSchema.safeParse({ business_name: 'My Business' });
    expect(result.success).toBe(true);
  });

  it('accepts empty string business_name', () => {
    const result = updateProfileSchema.safeParse({ business_name: '' });
    expect(result.success).toBe(true);
  });

  it('rejects business_name exceeding 200 characters', () => {
    const result = updateProfileSchema.safeParse({ business_name: 'X'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('accepts valid business_email', () => {
    const result = updateProfileSchema.safeParse({ business_email: 'biz@example.com' });
    expect(result.success).toBe(true);
  });

  it('accepts empty string business_email', () => {
    const result = updateProfileSchema.safeParse({ business_email: '' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid business_email', () => {
    const result = updateProfileSchema.safeParse({ business_email: 'not-email' });
    expect(result.success).toBe(false);
  });

  it('accepts valid business_website', () => {
    const result = updateProfileSchema.safeParse({ business_website: 'https://example.com' });
    expect(result.success).toBe(true);
  });

  it('accepts empty string business_website', () => {
    const result = updateProfileSchema.safeParse({ business_website: '' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid business_website', () => {
    const result = updateProfileSchema.safeParse({ business_website: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('accepts invoice_prefix of valid length', () => {
    const result = updateProfileSchema.safeParse({ invoice_prefix: 'INV' });
    expect(result.success).toBe(true);
  });

  it('rejects invoice_prefix exceeding 10 characters', () => {
    const result = updateProfileSchema.safeParse({ invoice_prefix: 'X'.repeat(11) });
    expect(result.success).toBe(false);
  });

  it('rejects empty invoice_prefix (min 1)', () => {
    const result = updateProfileSchema.safeParse({ invoice_prefix: '' });
    expect(result.success).toBe(false);
  });

  it('accepts default_tax_rate of 0', () => {
    const result = updateProfileSchema.safeParse({ default_tax_rate: 0 });
    expect(result.success).toBe(true);
  });

  it('accepts default_tax_rate of 100', () => {
    const result = updateProfileSchema.safeParse({ default_tax_rate: 100 });
    expect(result.success).toBe(true);
  });

  it('rejects default_tax_rate above 100', () => {
    const result = updateProfileSchema.safeParse({ default_tax_rate: 101 });
    expect(result.success).toBe(false);
  });

  it('rejects negative default_tax_rate', () => {
    const result = updateProfileSchema.safeParse({ default_tax_rate: -1 });
    expect(result.success).toBe(false);
  });

  it('accepts valid currency (3 characters)', () => {
    const result = updateProfileSchema.safeParse({ currency: 'EUR' });
    expect(result.success).toBe(true);
  });

  it('rejects currency with wrong length', () => {
    const result2 = updateProfileSchema.safeParse({ currency: 'US' });
    expect(result2.success).toBe(false);
    const result4 = updateProfileSchema.safeParse({ currency: 'USDD' });
    expect(result4.success).toBe(false);
  });

  it('accepts positive integer default_payment_terms', () => {
    const result = updateProfileSchema.safeParse({ default_payment_terms: 30 });
    expect(result.success).toBe(true);
  });

  it('rejects zero default_payment_terms', () => {
    const result = updateProfileSchema.safeParse({ default_payment_terms: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative default_payment_terms', () => {
    const result = updateProfileSchema.safeParse({ default_payment_terms: -5 });
    expect(result.success).toBe(false);
  });

  it('accepts bank_details as empty string', () => {
    const result = updateProfileSchema.safeParse({ bank_details: '' });
    expect(result.success).toBe(true);
  });

  it('rejects bank_details exceeding 1000 characters', () => {
    const result = updateProfileSchema.safeParse({ bank_details: 'X'.repeat(1001) });
    expect(result.success).toBe(false);
  });
});
