'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DateDisplay } from '@/components/shared/date-display';
import { toast } from 'sonner';
import { getDeliverableDownloadUrl } from '@/app/(portal)/actions';
import { FileText, Image, File, Download } from 'lucide-react';
import type { ProjectDeliverable } from '@/lib/types';

interface PortalDeliverablesProps {
  deliverables: ProjectDeliverable[];
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '')) return Image;
  if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext || '')) return FileText;
  return File;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PortalDeliverables({ deliverables }: PortalDeliverablesProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  async function handleDownload(deliverable: ProjectDeliverable) {
    setDownloading(deliverable.id);
    try {
      const result = await getDeliverableDownloadUrl(deliverable.id);
      if (result.success) {
        window.open(result.data, '_blank');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to download file');
    } finally {
      setDownloading(null);
    }
  }

  if (deliverables.length === 0) {
    return <p className="text-sm text-muted-foreground">No deliverables yet for this phase.</p>;
  }

  return (
    <div className="space-y-2">
      {deliverables.map(deliverable => {
        const Icon = getFileIcon(deliverable.file_name);
        return (
          <div key={deliverable.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <Icon className="w-8 h-8 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{deliverable.file_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(deliverable.file_size)}
                {deliverable.file_size && ' · '}
                <DateDisplay date={deliverable.created_at} format="relative" />
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(deliverable)}
              disabled={downloading === deliverable.id}
              className="gap-1"
              aria-label={`Download ${deliverable.file_name}`}
            >
              <Download className="h-4 w-4" />
              {downloading === deliverable.id ? 'Loading...' : 'Download'}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
