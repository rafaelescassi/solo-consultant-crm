'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardsProps {
  activeClients: number;
  openInvoices: number;
  overdueInvoices: number;
  conversionRate: number;
}

export function MetricsCards({ activeClients, openInvoices, overdueInvoices, conversionRate }: MetricsCardsProps) {
  const cards = [
    { label: 'Active Clients', value: activeClients, icon: Users, accent: false },
    { label: 'Open Invoices', value: openInvoices, icon: FileText, accent: false },
    { label: 'Overdue Invoices', value: overdueInvoices, icon: AlertTriangle, accent: overdueInvoices > 0 },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, accent: false },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(card => (
        <Card key={card.label} className={cn(card.accent && 'border-l-4 border-l-amber-500')}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
              </div>
              <card.icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
