'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, FileText, AlertTriangle, TrendingUp, FolderKanban, Rocket, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardsProps {
  activeClients: number;
  openInvoices: number;
  overdueInvoices: number;
  conversionRate: number;
  activeProjects?: number;
  inProgressProjects?: number;
  completedProjects?: number;
}

export function MetricsCards({ activeClients, openInvoices, overdueInvoices, conversionRate, activeProjects = 0, inProgressProjects = 0, completedProjects = 0 }: MetricsCardsProps) {
  const cards = [
    { label: 'Active Clients', value: activeClients, icon: Users, accent: false },
    { label: 'Open Invoices', value: openInvoices, icon: FileText, accent: false },
    { label: 'Overdue Invoices', value: overdueInvoices, icon: AlertTriangle, accent: overdueInvoices > 0 },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, accent: false },
    { label: 'Active Projects', value: activeProjects, icon: FolderKanban, accent: false },
    { label: 'In Progress', value: inProgressProjects, icon: Rocket, accent: false },
    { label: 'Completed Projects', value: completedProjects, icon: CheckCircle, accent: false },
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
