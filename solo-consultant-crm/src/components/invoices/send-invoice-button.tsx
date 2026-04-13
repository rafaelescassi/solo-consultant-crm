'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { sendInvoice } from '@/app/(dashboard)/invoices/actions';
import { toast } from 'sonner';
import type { InvoiceStatus } from '@/lib/types';

interface SendInvoiceButtonProps {
  invoiceId: string;
  currentStatus: InvoiceStatus;
}

export function SendInvoiceButton({ invoiceId, currentStatus }: SendInvoiceButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const result = await sendInvoice(invoiceId);
      if (result.success) {
        toast.success('Invoice sent successfully!');
        setShowConfirm(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to send invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        onClick={() => setShowConfirm(true)}
        className="gap-1"
      >
        <Send className="h-3.5 w-3.5" />
        {currentStatus === 'sent' ? 'Resend Invoice' : 'Send Invoice'}
      </Button>
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Send Invoice"
        description="This will generate a PDF and email it to the client. The invoice status will be updated to 'Sent'."
        confirmLabel="Send"
        onConfirm={handleSend}
        loading={loading}
      />
    </>
  );
}
