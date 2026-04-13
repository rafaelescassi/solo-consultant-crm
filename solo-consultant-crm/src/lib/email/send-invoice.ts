import { Resend } from 'resend';
import type { InvoiceWithItems, Profile } from '@/lib/types';
import { renderInvoicePdf } from '@/lib/pdf/invoice-template';
import { formatCurrency } from '@/lib/utils';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');
  return new Resend(apiKey);
}

export async function sendInvoiceEmail(invoice: InvoiceWithItems, profile: Profile) {
  const resend = getResendClient();
  const pdfBuffer = await renderInvoicePdf(invoice, profile);

  const fromEmail = profile.business_email || 'invoices@resend.dev';
  const businessName = profile.business_name || 'ConsultCRM';

  await resend.emails.send({
    from: `${businessName} <${fromEmail}>`,
    to: [invoice.client.email],
    subject: `Invoice ${invoice.invoice_number} from ${businessName} - ${formatCurrency(invoice.total, profile.currency)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0F172A;">Invoice ${invoice.invoice_number}</h2>
        <p>Hi ${invoice.client.name},</p>
        <p>Please find attached invoice <strong>${invoice.invoice_number}</strong> for <strong>${formatCurrency(invoice.total, profile.currency)}</strong>.</p>
        <p><strong>Due Date:</strong> ${invoice.due_date}</p>
        ${profile.bank_details ? `<p><strong>Payment Details:</strong><br/>${profile.bank_details.replace(/\n/g, '<br/>')}</p>` : ''}
        <p>Thank you for your business!</p>
        <p style="color: #64748B; font-size: 12px;">— ${businessName}</p>
      </div>
    `,
    attachments: [
      {
        filename: `${invoice.invoice_number}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}
