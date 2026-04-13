import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  company: z.string().max(200).optional().or(z.literal('')),
  source: z.enum(['referral', 'website', 'linkedin', 'cold_outreach', 'conference', 'other']).optional(),
  estimated_value: z.coerce.number().min(0, 'Value must be positive').optional(),
  notes: z.string().max(5000).optional().or(z.literal('')),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  stage: z.enum(['lead', 'contact_made', 'proposal_sent', 'negotiation', 'won', 'lost']).optional(),
  position: z.number().int().min(0).optional(),
});

export const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Valid email is required'),
  phone: z.string().max(50).optional().or(z.literal('')),
  company: z.string().max(200).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  notes: z.string().max(5000).optional().or(z.literal('')),
});

export const updateClientSchema = createClientSchema.partial();

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  unit_price: z.coerce.number().min(0, 'Price must be non-negative'),
});

export const createInvoiceSchema = z.object({
  client_id: z.string().uuid('Select a client'),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  tax_rate: z.coerce.number().min(0).max(100),
  notes: z.string().max(2000).optional().or(z.literal('')),
  items: z.array(invoiceItemSchema).min(1, 'At least one line item is required'),
});

export const updateProfileSchema = z.object({
  business_name: z.string().max(200).optional().or(z.literal('')),
  business_email: z.string().email().optional().or(z.literal('')),
  business_phone: z.string().max(50).optional().or(z.literal('')),
  business_address: z.string().max(500).optional().or(z.literal('')),
  business_website: z.string().url().optional().or(z.literal('')),
  invoice_prefix: z.string().min(1).max(10).optional(),
  default_tax_rate: z.coerce.number().min(0).max(100).optional(),
  default_payment_terms: z.coerce.number().int().positive().optional(),
  currency: z.string().length(3).optional(),
  bank_details: z.string().max(1000).optional().or(z.literal('')),
});
