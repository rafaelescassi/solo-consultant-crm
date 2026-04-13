'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyDisplay } from '@/components/shared/currency-display';

interface RevenueOverviewProps {
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  onPeriodChange?: (period: string) => void;
}

export function RevenueOverview({ totalInvoiced, totalPaid, totalOutstanding, onPeriodChange }: RevenueOverviewProps) {
  const [period, setPeriod] = useState('month');

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    onPeriodChange?.(value);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
        <Select value={period} onValueChange={(v) => v && handlePeriodChange(v)}>
          <SelectTrigger className="w-[140px] h-8 text-xs" aria-label="Select time period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Invoiced</p>
            <CurrencyDisplay amount={totalInvoiced} className="text-2xl font-bold" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Received</p>
            <CurrencyDisplay amount={totalPaid} className="text-2xl font-bold text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <CurrencyDisplay amount={totalOutstanding} className="text-2xl font-bold text-amber-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
