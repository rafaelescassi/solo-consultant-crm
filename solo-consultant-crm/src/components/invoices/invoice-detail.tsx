'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Download, Trash2 } from 'lucide-react';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { DateDisplay } from '@/components/shared/date-display';
import { InvoiceStatusBadge } from './invoice-status-badge';
import { SendInvoiceButton } from './send-invoice-button';
import { MarkAsPaidButton } from './mark-as-paid-button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { deleteInvoice } from '@/app/(dashboard)/invoices/actions';
import { toast } from 'sonner';
import type { InvoiceWithItems } from '@/lib/types';
import { useState } from 'react';

interface InvoiceDetailProps {
  invoice: InvoiceWithItems;
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteInvoice(invoice.id);
      if (result.success) {
        toast.success('Invoice deleted');
        router.push('/invoices');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to delete invoice');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadPdf = () => {
    window.open(`/api/invoices/${invoice.id}/pdf`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3">
        <InvoiceStatusBadge status={invoice.status} />
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="gap-1">
            <Download className="h-3.5 w-3.5" /> Download PDF
          </Button>
          {(invoice.status === 'draft' || invoice.status === 'sent') && (
            <SendInvoiceButton invoiceId={invoice.id} currentStatus={invoice.status} />
          )}
          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
            <MarkAsPaidButton invoiceId={invoice.id} />
          )}
          {invoice.status === 'draft' && (
            <Button variant="outline" size="sm" onClick={() => setShowDelete(true)} className="gap-1 text-destructive hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* Invoice preview */}
      <Card className="max-w-[800px] mx-auto shadow-md">
        <CardContent className="p-8 md:p-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold">INVOICE</h2>
              <p className="text-lg text-muted-foreground">{invoice.invoice_number}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium">Issue Date</p>
              <DateDisplay date={invoice.issue_date} format="long" />
              <p className="font-medium mt-2">Due Date</p>
              <DateDisplay date={invoice.due_date} format="long" />
            </div>
          </div>

          {/* Bill to */}
          <div className="mb-8">
            <p className="text-sm font-medium text-muted-foreground mb-1">Bill To</p>
            <p className="font-semibold">{invoice.client.name}</p>
            {invoice.client.company && <p className="text-sm">{invoice.client.company}</p>}
            <p className="text-sm">{invoice.client.email}</p>
            {invoice.client.address && <p className="text-sm">{invoice.client.address}</p>}
          </div>

          <Separator className="mb-6" />

          {/* Line items */}
          <div className="rounded-md border mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right w-20">Qty</TableHead>
                  <TableHead className="text-right w-28">Unit Price</TableHead>
                  <TableHead className="text-right w-28">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right"><CurrencyDisplay amount={item.unit_price} /></TableCell>
                    <TableCell className="text-right"><CurrencyDisplay amount={item.amount} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-[280px] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <CurrencyDisplay amount={invoice.subtotal} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({invoice.tax_rate}%)</span>
                <CurrencyDisplay amount={invoice.tax_amount} />
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <CurrencyDisplay amount={invoice.total} />
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 pt-6 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Payment info */}
          {invoice.paid_date && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-800">
                Paid on <DateDisplay date={invoice.paid_date} format="long" />
                {invoice.paid_method && ` via ${invoice.paid_method}`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Invoice"
        description={`Are you sure you want to delete invoice ${invoice.invoice_number}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
