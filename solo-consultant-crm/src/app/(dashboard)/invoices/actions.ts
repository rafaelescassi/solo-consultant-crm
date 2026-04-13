'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createInvoiceSchema } from '@/lib/validations';
import type { ActionResult } from '@/lib/types/actions';
import type { Invoice, InvoiceWithClient, InvoiceWithItems, InvoiceStatus, CreateInvoiceInput } from '@/lib/types';
import { sendInvoiceEmail } from '@/lib/email/send-invoice';

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

export async function getInvoices(status?: InvoiceStatus): Promise<InvoiceWithClient[]> {
  const { supabase } = await getAuthUser();

  let query = supabase
    .from('invoices')
    .select('*, client:clients(id, name, email, company)')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data || []).map(inv => ({
    ...inv,
    client: inv.client as unknown as InvoiceWithClient['client'],
  }));
}

export async function getInvoiceById(id: string): Promise<InvoiceWithItems | null> {
  const { supabase } = await getAuthUser();

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, client:clients(*), items:invoice_items(*)')
    .eq('id', id)
    .single();

  if (error || !invoice) return null;

  // Sort items by position
  const items = ((invoice as Record<string, unknown>).items as Array<Record<string, unknown>> || []).sort(
    (a: Record<string, unknown>, b: Record<string, unknown>) => (a.position as number) - (b.position as number)
  );

  return {
    ...invoice,
    client: (invoice as Record<string, unknown>).client,
    items,
  } as unknown as InvoiceWithItems;
}

export async function createInvoice(input: CreateInvoiceInput): Promise<ActionResult<Invoice>> {
  try {
    const { supabase, user } = await getAuthUser();
    const parsed = createInvoiceSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    // Get profile for invoice number
    const { data: profile } = await supabase
      .from('profiles').select('invoice_prefix, invoice_next_number, default_tax_rate').eq('id', user.id).single();

    if (!profile) return { success: false, error: 'Profile not found' };

    const invoiceNumber = `${profile.invoice_prefix}-${String(profile.invoice_next_number).padStart(3, '0')}`;

    // Calculate totals
    const subtotal = parsed.data.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const taxRate = parsed.data.tax_rate;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    // Insert invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client_id: parsed.data.client_id,
        invoice_number: invoiceNumber,
        status: 'draft',
        issue_date: parsed.data.issue_date,
        due_date: parsed.data.due_date,
        subtotal: Math.round(subtotal * 100) / 100,
        tax_rate: taxRate,
        tax_amount: Math.round(taxAmount * 100) / 100,
        total: Math.round(total * 100) / 100,
        notes: parsed.data.notes || null,
      })
      .select()
      .single();

    if (invoiceError) return { success: false, error: invoiceError.message };

    // Insert line items
    const items = parsed.data.items.map((item, index) => ({
      user_id: user.id,
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: Math.round(item.quantity * item.unit_price * 100) / 100,
      position: index,
    }));

    const { error: itemsError } = await supabase.from('invoice_items').insert(items);
    if (itemsError) return { success: false, error: itemsError.message };

    // Increment invoice number
    await supabase
      .from('profiles')
      .update({ invoice_next_number: profile.invoice_next_number + 1 })
      .eq('id', user.id);

    await logActivity(supabase, user.id, 'invoice_created',
      `Invoice ${invoiceNumber} created for $${total.toFixed(2)}`, 'invoice', invoice.id);

    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    return { success: true, data: invoice };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create invoice' };
  }
}

export async function updateInvoiceStatus(
  id: string, status: InvoiceStatus, paidDate?: string, paidMethod?: string
): Promise<ActionResult<void>> {
  try {
    const { supabase, user } = await getAuthUser();

    const updateData: Record<string, unknown> = { status };
    if (status === 'paid') {
      updateData.paid_date = paidDate || new Date().toISOString().split('T')[0];
      updateData.paid_method = paidMethod || null;
    }

    const { data: invoice, error } = await supabase
      .from('invoices').update(updateData).eq('id', id).select('invoice_number, total').single();

    if (error) return { success: false, error: error.message };

    const typeMap: Record<string, string> = { paid: 'invoice_paid', sent: 'invoice_sent', overdue: 'invoice_overdue' };
    const actType = typeMap[status] || 'invoice_sent';

    await logActivity(supabase, user.id, actType,
      `Invoice ${invoice.invoice_number} marked as ${status}`, 'invoice', id);

    revalidatePath('/invoices');
    revalidatePath(`/invoices/${id}`);
    revalidatePath('/dashboard');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update status' };
  }
}

export async function deleteInvoice(id: string): Promise<ActionResult<void>> {
  try {
    const { supabase } = await getAuthUser();

    // Only delete drafts
    const { data: invoice } = await supabase
      .from('invoices').select('status').eq('id', id).single();

    if (!invoice) return { success: false, error: 'Invoice not found' };
    if (invoice.status !== 'draft') return { success: false, error: 'Only draft invoices can be deleted' };

    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to delete invoice' };
  }
}

export async function sendInvoice(id: string): Promise<ActionResult<void>> {
  try {
    const { supabase, user } = await getAuthUser();

    // Get full invoice data
    const invoice = await getInvoiceById(id);
    if (!invoice) return { success: false, error: 'Invoice not found' };

    // Get profile for business info
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single();

    if (!profile) return { success: false, error: 'Profile not found' };

    // Send email
    try {
      await sendInvoiceEmail(invoice, profile);
    } catch (emailError) {
      return { success: false, error: 'Failed to send email. Please check your email configuration.' };
    }

    // Update status
    await supabase
      .from('invoices')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', id);

    await logActivity(supabase, user.id, 'invoice_sent',
      `Invoice ${invoice.invoice_number} sent to ${invoice.client.email}`, 'invoice', id);

    revalidatePath('/invoices');
    revalidatePath(`/invoices/${id}`);
    revalidatePath('/dashboard');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to send invoice' };
  }
}
