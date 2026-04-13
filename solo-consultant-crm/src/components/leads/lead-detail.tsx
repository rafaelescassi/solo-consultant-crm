'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Building2, DollarSign, Calendar, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { DateDisplay } from '@/components/shared/date-display';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ConvertLeadButton } from './convert-lead-button';
import { LeadForm } from './lead-form';
import { updateLead, deleteLead } from '@/app/(dashboard)/leads/actions';
import {
  LEAD_STAGES, LEAD_STAGE_LABELS, LEAD_SOURCE_LABELS,
  type Lead, type LeadStage, type ActivityLogEntry,
} from '@/lib/types';

interface LeadDetailProps {
  lead: Lead;
  activities: ActivityLogEntry[];
}

export function LeadDetail({ lead, activities }: LeadDetailProps) {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState<LeadStage>(lead.stage);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleStageChange = async (stage: LeadStage) => {
    const oldStage = currentStage;
    setCurrentStage(stage);

    const result = await updateLead(lead.id, { stage });
    if (!result.success) {
      setCurrentStage(oldStage);
      toast.error(result.error);
    } else {
      toast.success(`Moved to ${LEAD_STAGE_LABELS[stage]}`);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteLead(lead.id);
      if (result.success) {
        toast.success('Lead deleted');
        router.push('/leads');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to delete lead');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left: Info */}
      <div className="xl:col-span-2 space-y-6">
        {/* Actions bar */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={currentStage} onValueChange={(v) => v && handleStageChange(v as LeadStage)}>
            <SelectTrigger className="w-[180px]" aria-label="Change lead stage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STAGES.map(stage => (
                <SelectItem key={stage} value={stage}>{LEAD_STAGE_LABELS[stage]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ConvertLeadButton lead={{ ...lead, stage: currentStage }} />

          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)} className="gap-1">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowDelete(true)} className="gap-1 text-destructive hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </div>

        {/* Contact info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={Mail} label="Email" value={lead.email} />
            <InfoRow icon={Phone} label="Phone" value={lead.phone} />
            <InfoRow icon={Building2} label="Company" value={lead.company} />
            <InfoRow
              icon={DollarSign}
              label="Estimated Value"
              value={lead.estimated_value != null ? undefined : null}
              customValue={lead.estimated_value != null ? <CurrencyDisplay amount={lead.estimated_value} /> : undefined}
            />
            <InfoRow icon={Calendar} label="Created" value={undefined} customValue={<DateDisplay date={lead.created_at} format="long" />} />
            {lead.source && <InfoRow icon={Calendar} label="Source" value={LEAD_SOURCE_LABELS[lead.source]} />}
          </CardContent>
        </Card>

        {/* Notes */}
        {lead.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right: Activity Timeline */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {activities.map(activity => (
                  <div key={activity.id} className="text-sm">
                    <p>{activity.description}</p>
                    <DateDisplay date={activity.created_at} format="relative" className="text-xs text-muted-foreground" />
                    <Separator className="mt-3" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <LeadForm open={showEdit} onOpenChange={setShowEdit} lead={lead} onSuccess={() => router.refresh()} />
      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Lead"
        description={`Are you sure you want to delete "${lead.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, customValue }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  customValue?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {customValue || (
          <p className="text-sm">{value || <span className="text-muted-foreground italic">Not provided</span>}</p>
        )}
      </div>
    </div>
  );
}
