'use client';

import { useState } from 'react';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { toast } from 'sonner';
import { triggerBuild } from '@/app/(dashboard)/projects/actions';

interface TriggerBuildButtonProps {
  projectId: string;
  status: string;
}

export function TriggerBuildButton({ projectId, status }: TriggerBuildButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (status !== 'approved') return null;

  async function handleTrigger() {
    setLoading(true);
    try {
      const result = await triggerBuild(projectId);
      if (result.success) {
        toast.success('Build started! Phase 1 (Research) is now in progress.');
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to start build');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white gap-2"
        size="lg"
      >
        <Rocket className="h-4 w-4" />
        Start Build
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Start AI Build?"
        description="This will begin the 7-phase AI development process. Phase 1 (Research) will start immediately."
        confirmLabel="Start Build"
        onConfirm={handleTrigger}
        loading={loading}
      />
    </>
  );
}
