import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Cron job: Check for overdue invoices and update their status.
 *
 * Triggered daily at 9:00 AM UTC by Vercel Cron (see vercel.json).
 * Uses the service role key to bypass RLS and update all users' invoices.
 *
 * To secure this endpoint, Vercel automatically adds an Authorization header
 * with a bearer token matching CRON_SECRET. We verify it below.
 */
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    // Use service role client to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all sent invoices past their due date
    const today = new Date().toISOString().split('T')[0];

    const { data: overdueInvoices, error } = await supabase
      .from('invoices')
      .update({ status: 'overdue' })
      .eq('status', 'sent')
      .lt('due_date', today)
      .select('id, invoice_number, user_id');

    if (error) {
      console.error('Failed to update overdue invoices:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity for each overdue invoice
    if (overdueInvoices && overdueInvoices.length > 0) {
      const activityEntries = overdueInvoices.map((invoice) => ({
        user_id: invoice.user_id,
        type: 'invoice_overdue' as const,
        description: `Invoice ${invoice.invoice_number} is overdue`,
        entity_type: 'invoice',
        entity_id: invoice.id,
      }));

      await supabase.from('activity_log').insert(activityEntries);
    }

    return NextResponse.json({
      success: true,
      updated: overdueInvoices?.length ?? 0,
    });
  } catch (e) {
    console.error('Cron job error:', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
