'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { CurrencyDisplay } from '@/components/shared/currency-display';

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface InvoiceLineItemsProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  errors?: Record<string, string>[];
}

export function InvoiceLineItems({ items, onChange, errors }: InvoiceLineItemsProps) {
  const addItem = () => {
    onChange([...items, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      return { ...item, [field]: value };
    });
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Line Items</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
          <Plus className="h-3.5 w-3.5" /> Add Item
        </Button>
      </div>

      {/* Header */}
      <div className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-2 text-xs text-muted-foreground font-medium px-1">
        <span>Description</span>
        <span>Qty</span>
        <span>Unit Price</span>
        <span className="text-right">Amount</span>
        <span />
      </div>

      {items.map((item, index) => {
        const amount = (item.quantity || 0) * (item.unit_price || 0);
        const itemErrors = errors?.[index];

        return (
          <div key={index} className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-2 items-start">
            <div>
              <Input
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                placeholder="Service description"
                className="h-9 text-sm"
                aria-label={`Item ${index + 1} description`}
              />
              {itemErrors?.description && (
                <p className="text-xs text-destructive mt-0.5">{itemErrors.description}</p>
              )}
            </div>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={item.quantity || ''}
              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
              className="h-9 text-sm"
              aria-label={`Item ${index + 1} quantity`}
            />
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.unit_price || ''}
                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                className="h-9 text-sm pl-5"
                aria-label={`Item ${index + 1} unit price`}
              />
            </div>
            <div className="flex items-center justify-end h-9">
              <CurrencyDisplay amount={amount} className="text-sm font-medium" />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(index)}
              disabled={items.length <= 1}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
              aria-label={`Remove item ${index + 1}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
