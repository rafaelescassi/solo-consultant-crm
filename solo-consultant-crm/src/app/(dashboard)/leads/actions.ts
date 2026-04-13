'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createLeadSchema, updateLeadSchema } from '@/lib/validations';
import type { ActionResult } from '@/lib/types/actions';
import type { Lead, Client, PipelineColumn, LeadStage, CreateLeadInput, UpdateLeadInput, LEAD_STAGES } from '@/lib/types';

const ALL_STAGES: LeadStage[] = ['lead', 'contact_made', 'proposal_sent', 'negotiation', 'won', 'lost'];

async function getAuthUser() {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return { supabase, user };
}

async function logActivity(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  userId: string,
  type: string,
  description: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>
) {
  await supabase.from('activity_log').insert({
    user_id: userId,
    type,
    description,
    entity_type: entityType,
    entity_id: entityId,
    metadata: metadata || null,
  });
}

export async function getLeadsByStage(): Promise<PipelineColumn[]> {
  const { supabase } = await getAuthUser();

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const columns: PipelineColumn[] = ALL_STAGES.map(stage => ({
    stage,
    leads: (leads || []).filter(l => l.stage === stage),
  }));

  return columns;
}

export async function createLead(input: CreateLeadInput): Promise<ActionResult<Lead>> {
  try {
    const { supabase, user } = await getAuthUser();
    const parsed = createLeadSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const cleanData = {
      ...parsed.data,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      notes: parsed.data.notes || null,
      source: parsed.data.source || null,
      estimated_value: parsed.data.estimated_value ?? null,
      user_id: user.id,
      stage: 'lead' as const,
      position: 0,
    };

    const { data: lead, error } = await supabase
      .from('leads')
      .insert(cleanData)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await logActivity(supabase, user.id, 'lead_created', `New lead "${lead.name}" added`, 'lead', lead.id);

    revalidatePath('/leads');
    revalidatePath('/dashboard');
    return { success: true, data: lead };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create lead' };
  }
}

export async function updateLead(id: string, input: UpdateLeadInput): Promise<ActionResult<Lead>> {
  try {
    const { supabase, user } = await getAuthUser();
    const parsed = updateLeadSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // If stage is changing, log stage change
    let oldStage: string | null = null;
    if (parsed.data.stage) {
      const { data: existing } = await supabase.from('leads').select('stage').eq('id', id).single();
      if (existing) oldStage = existing.stage;
    }

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) {
        updateData[key] = value === '' ? null : value;
      }
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    if (oldStage && parsed.data.stage && oldStage !== parsed.data.stage) {
      await logActivity(supabase, user.id, 'lead_stage_changed',
        `Lead "${lead.name}" moved to ${parsed.data.stage.replace('_', ' ')}`,
        'lead', lead.id,
        { old_stage: oldStage, new_stage: parsed.data.stage }
      );
    }

    revalidatePath('/leads');
    revalidatePath('/dashboard');
    return { success: true, data: lead };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update lead' };
  }
}

export async function deleteLead(id: string): Promise<ActionResult<void>> {
  try {
    const { supabase } = await getAuthUser();

    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/leads');
    revalidatePath('/dashboard');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to delete lead' };
  }
}

export async function convertLeadToClient(leadId: string): Promise<ActionResult<Client>> {
  try {
    const { supabase, user } = await getAuthUser();

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) return { success: false, error: 'Lead not found' };
    if (lead.converted_client_id) return { success: false, error: 'Lead already converted' };

    // Create client from lead data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        name: lead.name,
        email: lead.email || `${lead.name.toLowerCase().replace(/\s/g, '.')}@example.com`,
        phone: lead.phone,
        company: lead.company,
        notes: lead.notes,
      })
      .select()
      .single();

    if (clientError) return { success: false, error: clientError.message };

    // Link lead to client
    await supabase
      .from('leads')
      .update({ converted_client_id: client.id })
      .eq('id', leadId);

    await logActivity(supabase, user.id, 'lead_converted', `Lead "${lead.name}" converted to client`, 'lead', leadId);
    await logActivity(supabase, user.id, 'client_created', `Client "${client.name}" created from lead`, 'client', client.id);

    revalidatePath('/leads');
    revalidatePath('/clients');
    revalidatePath('/dashboard');
    return { success: true, data: client };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to convert lead' };
  }
}

export async function updateLeadPositions(
  updates: { id: string; stage: LeadStage; position: number }[]
): Promise<ActionResult<void>> {
  try {
    const { supabase } = await getAuthUser();

    for (const update of updates) {
      await supabase
        .from('leads')
        .update({ stage: update.stage, position: update.position })
        .eq('id', update.id);
    }

    revalidatePath('/leads');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update positions' };
  }
}
