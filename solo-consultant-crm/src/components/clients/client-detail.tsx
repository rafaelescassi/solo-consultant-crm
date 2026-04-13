'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Mail, Phone, Building2, MapPin, Pencil, Archive, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { DateDisplay } from '@/components/shared/date-display';
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { archiveClient } from '@/app/(dashboard)/clients/actions';
import type { ClientWithStats, Invoice } from '@/lib/types';

interface ClientDetailProps {
  client: ClientWithStats;
  invoices: Invoice[];
}

export function ClientDetail({ client, invoices }: ClientDetailProps) {
  const router = useRouter();
  const [showArchive, setShowArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const result = await archiveClient(client.id);
      if (result.success) {
        toast.success('Client archived');
        router.push('/clients');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to archive client');
    } finally {
      setArchiving(false);
    }
  };

  const outstanding = client.total_invoiced - client.total_paid;

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.push(`/clients/${client.id}/edit`)} className="gap-1">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowArchive(true)} className="gap-1 text-destructive hover:text-destructive">
          <Archive className="h-3.5 w-3.5" /> Archive
        </Button>
      </div>

      {/* Contact info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ContactCard icon={Mail} label="Email" value={client.email} />
        <ContactCard icon={Phone} label="Phone" value={client.phone} />
        <ContactCard icon={Building2} label="Company" value={client.company} />
        <ContactCard icon={MapPin} label="Address" value={client.address} />
      </div>

      {/* Notes */}
      {client.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Revenue summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Invoiced</p>
            <CurrencyDisplay amount={client.total_invoiced} className="text-2xl font-bold" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Paid</p>
            <CurrencyDisplay amount={client.total_paid} className="text-2xl font-bold text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <CurrencyDisplay amount={outstanding} className="text-2xl font-bold text-amber-600" />
          </CardContent>
        </Card>
      </div>

      {/* Invoices table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Invoices ({invoices.length})</CardTitle>
          <Link href={`/invoices/new?client=${client.id}`}>
            <Button size="sm" className="gap-1">
              <Plus className="h-3.5 w-3.5" /> New Invoice
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No invoices yet</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(invoice => (
                    <TableRow
                      key={invoice.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/invoices/${invoice.id}`)}
                    >
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell><CurrencyDisplay amount={invoice.total} /></TableCell>
                      <TableCell><DateDisplay date={invoice.issue_date} /></TableCell>
                      <TableCell><InvoiceStatusBadge status={invoice.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showArchive}
        onOpenChange={setShowArchive}
        title="Archive Client"
        description={`Are you sure you want to archive "${client.name}"? Their invoices will be preserved.`}
        confirmLabel="Archive"
        variant="destructive"
        onConfirm={handleArchive}
        loading={archiving}
      />
    </div>
  );
}

function ContactCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | null }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm truncate">{value || <span className="text-muted-foreground italic">Not provided</span>}</p>
        </div>
      </CardContent>
    </Card>
  );
}
