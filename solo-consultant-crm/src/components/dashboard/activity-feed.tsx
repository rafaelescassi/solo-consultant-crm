import { Target, Users, FileText, Send, DollarSign, AlertTriangle, Archive, PenLine, FolderKanban, Rocket, CheckCircle, Package, XCircle, type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateDisplay } from '@/components/shared/date-display';
import type { ActivityLogEntry, ActivityType } from '@/lib/types';

interface ActivityFeedProps {
  activities: ActivityLogEntry[];
}

const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  lead_created: Target,
  lead_stage_changed: PenLine,
  lead_converted: Users,
  client_created: Users,
  client_updated: PenLine,
  client_archived: Archive,
  invoice_created: FileText,
  invoice_sent: Send,
  invoice_paid: DollarSign,
  invoice_overdue: AlertTriangle,
  project_created: FolderKanban,
  project_started: Rocket,
  project_phase_updated: PenLine,
  project_completed: CheckCircle,
  project_delivered: Package,
  project_cancelled: XCircle,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  lead_created: 'text-slate-500',
  lead_stage_changed: 'text-blue-500',
  lead_converted: 'text-green-500',
  client_created: 'text-blue-500',
  client_updated: 'text-slate-500',
  client_archived: 'text-red-500',
  invoice_created: 'text-slate-500',
  invoice_sent: 'text-blue-500',
  invoice_paid: 'text-green-500',
  invoice_overdue: 'text-amber-500',
  project_created: 'text-violet-500',
  project_started: 'text-blue-500',
  project_phase_updated: 'text-violet-500',
  project_completed: 'text-green-500',
  project_delivered: 'text-emerald-500',
  project_cancelled: 'text-red-500',
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const items = activities.slice(0, 10);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-1">
            {items.map((activity, index) => {
              const Icon = ACTIVITY_ICONS[activity.type] || FileText;
              const colorClass = ACTIVITY_COLORS[activity.type] || 'text-slate-500';

              return (
                <div key={activity.id} className="flex items-start gap-3 py-2">
                  <div className="relative flex flex-col items-center">
                    <div className={`flex-shrink-0 ${colorClass}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    {index < items.length - 1 && (
                      <div className="w-px h-full bg-border absolute top-6 left-1/2 -translate-x-1/2" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{activity.description}</p>
                    <DateDisplay date={activity.created_at} format="relative" className="text-xs text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
