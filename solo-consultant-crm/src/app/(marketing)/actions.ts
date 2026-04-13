'use server';

import { createServerClient } from '@supabase/ssr';
import { submitQuoteSchema } from '@/lib/validations';
import type { ActionResult } from '@/lib/types/actions';

export async function submitQuoteRequest(input: unknown): Promise<ActionResult<void>> {
  try {
    const parsed = submitQuoteSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const adminUserId = process.env.ADMIN_USER_ID;
    if (!adminUserId) return { success: false, error: 'Service configuration error' };

    // Use service role client for public form submission
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    const notes = [
      `Project Type: ${parsed.data.project_type}`,
      parsed.data.budget ? `Budget: ${parsed.data.budget}` : null,
      '',
      parsed.data.description,
    ].filter(Boolean).join('\n');

    const { error } = await supabase.from('leads').insert({
      user_id: adminUserId,
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company || null,
      source: 'website',
      stage: 'lead',
      notes,
    });

    if (error) return { success: false, error: error.message };

    // Log activity under admin user
    await supabase.from('activity_log').insert({
      user_id: adminUserId,
      type: 'lead_created',
      description: `New quote request from ${parsed.data.name} (${parsed.data.project_type})`,
      entity_type: 'lead',
      entity_id: '00000000-0000-0000-0000-000000000000', // placeholder since we don't have the lead ID
      metadata: {
        source: 'landing_page',
        project_type: parsed.data.project_type,
        budget: parsed.data.budget || null,
      },
    });

    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to submit quote request' };
  }
}
