'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserPlus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { convertLeadToClient } from '@/app/(dashboard)/leads/actions';
import { toast } from 'sonner';
import type { Lead } from '@/lib/types';

interface ConvertLeadButtonProps {
  lead: Lead;
}

export function ConvertLeadButton({ lead }: ConvertLeadButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [convertedId, setConvertedId] = useState<string | null>(lead.converted_client_id);

  if (convertedId) {
    return (
      <Link href={`/clients/${convertedId}`}>
        <Button variant="outline" className="gap-2 text-green-600 border-green-600 hover:bg-green-50">
          <ExternalLink className="h-4 w-4" />
          View Client Profile
        </Button>
      </Link>
    );
  }

  if (lead.stage !== 'won') {
    return null;
  }

  const handleConvert = async () => {
    setLoading(true);
    try {
      const result = await convertLeadToClient(lead.id);
      if (result.success) {
        toast.success('Lead converted to client!');
        setConvertedId(result.data.id);
        setShowConfirm(false);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to convert lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setShowConfirm(true)} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
        <UserPlus className="h-4 w-4" />
        Convert to Client
      </Button>
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Convert Lead to Client"
        description={`This will create a new client record from "${lead.name}" with their existing contact information. The lead will be linked to the new client.`}
        confirmLabel="Convert"
        onConfirm={handleConvert}
        loading={loading}
      />
    </>
  );
}
