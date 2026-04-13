'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createClientSchema, updateClientSchema } from '@/lib/validations';
import type { ActionResult } from '@/lib/types/actions';
import type { Client, ClientWithStats, Invoice } from '@/lib/types';

async function getAuthUser() {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return { supabase, user };
}

async function logActivity(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  userId: string, type: string, description: string,
  entityType: string, entityId: string, metadata?: Record<string, unknown>
) {
  await supabase.from('activity_log').insert({
    user_id: userId, type, description, entity_type: entityType,
    entity_id: entityId, metadata: metadata || null,
  });
}

export async function getClients(search?: string): Promise<Client[]> {
  const { supabase } = await getAuthUser();

  let query = supabase
    .from('clients')
    .select('*')
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`name.ilike.${term},email.ilike.${term},company.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getClientById(id: string): Promise<ClientWithStats | null> {
  const { supabase } = await getAuthUser();

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !client) return null;

  // Get invoice stats
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total, status')
    .eq('client_id', id);

  const stats = (invoices || []).reduce(
    (acc, inv) => ({
      total_invoiced: acc.total_invoiced + Number(inv.total),
      total_paid: acc.total_paid + (inv.status === 'paid' ? Number(inv.total) : 0),
      invoice_count: acc.invoice_count + 1,
    }),
    { total_invoiced: 0, total_paid: 0, invoice_count: 0 }
  );

  return { ...client, ...stats };
}

export async function getClientInvoices(clientId: string): Promise<Invoice[]> {
  const { supabase } = await getAuthUser();

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createClient(input: unknown): Promise<ActionResult<Client>> {
  try {
    const { supabase, user } = await getAuthUser();
    const parsed = createClientSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const cleanData = {
      ...parsed.data,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      address: parsed.data.address || null,
      notes: parsed.data.notes || null,
      user_id: user.id,
    };

    const { data: client, error } = await supabase
      .from('clients').insert(cleanData).select().single();

    if (error) return { success: false, error: error.message };

    await logActivity(supabase, user.id, 'client_created', `Client "${client.name}" created`, 'client', client.id);

    revalidatePath('/clients');
    revalidatePath('/dashboard');
    return { success: true, data: client };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create client' };
  }
}

export async function updateClient(id: string, input: unknown): Promise<ActionResult<Client>> {
  try {
    const { supabase, user } = await getAuthUser();
    const parsed = updateClientSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) updateData[key] = value === '' ? null : value;
    }

    const { data: client, error } = await supabase
      .from('clients').update(updateData).eq('id', id).select().single();

    if (error) return { success: false, error: error.message };

    await logActivity(supabase, user.id, 'client_updated', `Client "${client.name}" updated`, 'client', client.id);

    revalidatePath('/clients');
    revalidatePath(`/clients/${id}`);
    return { success: true, data: client };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update client' };
  }
}

export async function archiveClient(id: string): Promise<ActionResult<void>> {
  try {
    const { supabase, user } = await getAuthUser();

    const { data: client, error } = await supabase
      .from('clients').update({ is_archived: true }).eq('id', id).select('name').single();

    if (error) return { success: false, error: error.message };

    await logActivity(supabase, user.id, 'client_archived', `Client "${client.name}" archived`, 'client', id);

    revalidatePath('/clients');
    revalidatePath('/dashboard');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to archive client' };
  }
}

export async function restoreClient(id: string): Promise<ActionResult<void>> {
  try {
    const { supabase } = await getAuthUser();

    const { error } = await supabase
      .from('clients').update({ is_archived: false }).eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/clients');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to restore client' };
  }
}
