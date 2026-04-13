'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { updateInvoiceStatus } from '@/app/(dashboard)/invoices/actions';
import { toast } from 'sonner';

interface MarkAsPaidButtonProps {
  invoiceId: string;
}

export function MarkAsPaidButton({ invoiceId }: MarkAsPaidButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMarkPaid = async () => {
    setLoading(true);
    try {
      const result = await updateInvoiceStatus(invoiceId, 'paid');
      if (result.success) {
        toast.success('Invoice marked as paid!');
        setShowConfirm(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to update invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(true)}
        className="gap-1 text-green-600 border-green-600 hover:bg-green-50"
      >
        <DollarSign className="h-3.5 w-3.5" />
        Mark as Paid
      </Button>
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Mark Invoice as Paid"
        description="This will update the invoice status to 'Paid' and record today as the payment date."
        confirmLabel="Mark as Paid"
        onConfirm={handleMarkPaid}
        loading={loading}
      />
    </>
  );
}
