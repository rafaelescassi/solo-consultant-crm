import { describe, it, expect } from 'vitest';
import {
  LEAD_STAGES,
  LEAD_STAGE_LABELS,
  LEAD_STAGE_COLORS,
  LEAD_SOURCE_LABELS,
  INVOICE_STATUS_CONFIG,
  type LeadStage,
  type LeadSource,
  type InvoiceStatus,
} from '@/lib/types/index';

// ─── LEAD_STAGES ───────────────────────────────────────

describe('LEAD_STAGES', () => {
  it('contains exactly 6 stages', () => {
    expect(LEAD_STAGES).toHaveLength(6);
  });

  it('contains all expected stages', () => {
    expect(LEAD_STAGES).toContain('lead');
    expect(LEAD_STAGES).toContain('contact_made');
    expect(LEAD_STAGES).toContain('proposal_sent');
    expect(LEAD_STAGES).toContain('negotiation');
    expect(LEAD_STAGES).toContain('won');
    expect(LEAD_STAGES).toContain('lost');
  });

  it('has stages in the correct pipeline order', () => {
    expect(LEAD_STAGES).toEqual([
      'lead',
      'contact_made',
      'proposal_sent',
      'negotiation',
      'won',
      'lost',
    ]);
  });
});

// ─── LEAD_STAGE_LABELS ────────────────────────────────

describe('LEAD_STAGE_LABELS', () => {
  it('has a label for every stage in LEAD_STAGES', () => {
    for (const stage of LEAD_STAGES) {
      expect(LEAD_STAGE_LABELS[stage]).toBeDefined();
      expect(typeof LEAD_STAGE_LABELS[stage]).toBe('string');
      expect(LEAD_STAGE_LABELS[stage].length).toBeGreaterThan(0);
    }
  });

  it('has the correct human-readable labels', () => {
    expect(LEAD_STAGE_LABELS.lead).toBe('Lead');
    expect(LEAD_STAGE_LABELS.contact_made).toBe('Contact Made');
    expect(LEAD_STAGE_LABELS.proposal_sent).toBe('Proposal Sent');
    expect(LEAD_STAGE_LABELS.negotiation).toBe('Negotiation');
    expect(LEAD_STAGE_LABELS.won).toBe('Won');
    expect(LEAD_STAGE_LABELS.lost).toBe('Lost');
  });

  it('has exactly 6 entries (no extras)', () => {
    expect(Object.keys(LEAD_STAGE_LABELS)).toHaveLength(6);
  });
});

// ─── LEAD_STAGE_COLORS ────────────────────────────────

describe('LEAD_STAGE_COLORS', () => {
  it('has a color for every stage in LEAD_STAGES', () => {
    for (const stage of LEAD_STAGES) {
      expect(LEAD_STAGE_COLORS[stage]).toBeDefined();
      expect(typeof LEAD_STAGE_COLORS[stage]).toBe('string');
    }
  });

  it('all colors are Tailwind bg- classes', () => {
    for (const stage of LEAD_STAGES) {
      expect(LEAD_STAGE_COLORS[stage]).toMatch(/^bg-/);
    }
  });

  it('has exactly 6 entries', () => {
    expect(Object.keys(LEAD_STAGE_COLORS)).toHaveLength(6);
  });

  it('has specific expected color values', () => {
    expect(LEAD_STAGE_COLORS.lead).toBe('bg-slate-400');
    expect(LEAD_STAGE_COLORS.won).toBe('bg-green-400');
    expect(LEAD_STAGE_COLORS.lost).toBe('bg-red-400');
  });
});

// ─── LEAD_SOURCE_LABELS ───────────────────────────────

describe('LEAD_SOURCE_LABELS', () => {
  const expectedSources: LeadSource[] = [
    'referral',
    'website',
    'linkedin',
    'cold_outreach',
    'conference',
    'other',
  ];

  it('has a label for every source', () => {
    for (const source of expectedSources) {
      expect(LEAD_SOURCE_LABELS[source]).toBeDefined();
      expect(typeof LEAD_SOURCE_LABELS[source]).toBe('string');
      expect(LEAD_SOURCE_LABELS[source].length).toBeGreaterThan(0);
    }
  });

  it('has exactly 6 entries', () => {
    expect(Object.keys(LEAD_SOURCE_LABELS)).toHaveLength(6);
  });

  it('has the correct labels', () => {
    expect(LEAD_SOURCE_LABELS.referral).toBe('Referral');
    expect(LEAD_SOURCE_LABELS.website).toBe('Website');
    expect(LEAD_SOURCE_LABELS.linkedin).toBe('LinkedIn');
    expect(LEAD_SOURCE_LABELS.cold_outreach).toBe('Cold Outreach');
    expect(LEAD_SOURCE_LABELS.conference).toBe('Conference');
    expect(LEAD_SOURCE_LABELS.other).toBe('Other');
  });
});

// ─── INVOICE_STATUS_CONFIG ────────────────────────────

describe('INVOICE_STATUS_CONFIG', () => {
  const expectedStatuses: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue'];

  it('covers all 4 invoice statuses', () => {
    for (const status of expectedStatuses) {
      expect(INVOICE_STATUS_CONFIG[status]).toBeDefined();
    }
  });

  it('has exactly 4 entries', () => {
    expect(Object.keys(INVOICE_STATUS_CONFIG)).toHaveLength(4);
  });

  it('each config has label, color, and bg properties', () => {
    for (const status of expectedStatuses) {
      const config = INVOICE_STATUS_CONFIG[status];
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('color');
      expect(config).toHaveProperty('bg');
      expect(typeof config.label).toBe('string');
      expect(typeof config.color).toBe('string');
      expect(typeof config.bg).toBe('string');
    }
  });

  it('labels are non-empty human-readable strings', () => {
    expect(INVOICE_STATUS_CONFIG.draft.label).toBe('Draft');
    expect(INVOICE_STATUS_CONFIG.sent.label).toBe('Sent');
    expect(INVOICE_STATUS_CONFIG.paid.label).toBe('Paid');
    expect(INVOICE_STATUS_CONFIG.overdue.label).toBe('Overdue');
  });

  it('colors are Tailwind text- classes', () => {
    for (const status of expectedStatuses) {
      expect(INVOICE_STATUS_CONFIG[status].color).toMatch(/^text-/);
    }
  });

  it('bgs are Tailwind bg- classes', () => {
    for (const status of expectedStatuses) {
      expect(INVOICE_STATUS_CONFIG[status].bg).toMatch(/^bg-/);
    }
  });
});
