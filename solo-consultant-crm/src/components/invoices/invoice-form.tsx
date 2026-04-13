'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { InvoiceLineItems, type LineItem } from './invoice-line-items';
import { createInvoice } from '@/app/(dashboard)/invoices/actions';
import { toast } from 'sonner';
import type { Client, CreateInvoiceInput } from '@/lib/types';

interface InvoiceFormProps {
  clients: Client[];
  defaultClientId?: string;
  defaultTaxRate?: number;
}

export function InvoiceForm({ clients, defaultClientId, defaultTaxRate = 0 }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState(defaultClientId || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [taxRate, setTaxRate] = useState(defaultTaxRate);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0 },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 0),
    [items]
  );
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = async (sendAfterSave: boolean = false) => {
    setErrors({});

    if (!clientId) {
      setErrors({ client: 'Please select a client' });
      return;
    }
    if (!issueDate) {
      setErrors({ issue_date: 'Issue date is required' });
      return;
    }
    if (!dueDate) {
      setErrors({ due_date: 'Due date is required' });
      return;
    }
    if (items.some(item => !item.description.trim())) {
      toast.error('All line items need a description');
      return;
    }
    if (items.some(item => item.quantity <= 0)) {
      toast.error('Quantity must be positive');
      return;
    }

    setLoading(true);
    try {
      const input: CreateInvoiceInput = {
        client_id: clientId,
        issue_date: issueDate,
        due_date: dueDate,
        tax_rate: taxRate,
        notes: notes || undefined,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      const result = await createInvoice(input);

      if (result.success) {
        toast.success('Invoice created');
        router.push(`/invoices/${result.data.id}`);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-[800px] mx-auto">
      <CardHeader>
        <CardTitle>New Invoice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Client selector */}
        <div className="space-y-2">
          <Label htmlFor="client">Client *</Label>
          <Select value={clientId} onValueChange={(v) => v && setClientId(v)}>
            <SelectTrigger id="client" aria-label="Select client">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} {client.company ? `(${client.company})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.client && <p className="text-xs text-destructive">{errors.client}</p>}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="issue_date">Issue Date *</Label>
            <Input
              id="issue_date"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
            {errors.issue_date && <p className="text-xs text-destructive">{errors.issue_date}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date *</Label>
            <Input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            {errors.due_date && <p className="text-xs text-destructive">{errors.due_date}</p>}
          </div>
        </div>

        {/* Tax rate */}
        <div className="space-y-2 max-w-[200px]">
          <Label htmlFor="tax_rate">Tax Rate (%)</Label>
          <Input
            id="tax_rate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
          />
        </div>

        <Separator />

        {/* Line items */}
        <InvoiceLineItems items={items} onChange={setItems} />

        <Separator />

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-[280px] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <CurrencyDisplay amount={subtotal} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({taxRate}%)</span>
              <CurrencyDisplay amount={taxAmount} />
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <CurrencyDisplay amount={total} />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes (optional)..."
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={() => handleSubmit(false)} disabled={loading}>
            {loading ? 'Creating...' : 'Save as Draft'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
