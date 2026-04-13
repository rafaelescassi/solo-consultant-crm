'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { DateDisplay } from '@/components/shared/date-display';
import { toast } from 'sonner';
import { uploadDeliverable, deleteDeliverable } from '@/app/(dashboard)/projects/actions';
import { FileText, Image, File, Upload, Trash2, Download } from 'lucide-react';
import type { ProjectDeliverable } from '@/lib/types';

interface PhaseDeliverablesProps {
  projectId: string;
  phaseNumber: number;
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

export function PhaseDeliverables({ projectId, phaseNumber, deliverables }: PhaseDeliverablesProps) {
  const [uploading, setUploading] = useState(false);
  const [isClientVisible, setIsClientVisible] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const phaseDeliverables = deliverables.filter(d => d.phase_number === phaseNumber);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.set('file', file);
        formData.set('project_id', projectId);
        formData.set('phase_number', String(phaseNumber));
        formData.set('is_client_visible', String(isClientVisible));

        const result = await uploadDeliverable(formData);
        if (result.success) {
          toast.success(`Uploaded ${file.name}`);
        } else {
          toast.error(`Failed to upload ${file.name}: ${result.error}`);
        }
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleDelete(id: string) {
    try {
      const result = await deleteDeliverable(id);
      if (result.success) {
        toast.success('Deliverable deleted');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to delete deliverable');
    }
  }

  return (
    <div>
      {/* File list */}
      <div className="space-y-2">
        {phaseDeliverables.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No deliverables yet</p>
        ) : (
          phaseDeliverables.map(deliverable => {
            const Icon = getFileIcon(deliverable.file_name);
            return (
              <div key={deliverable.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50">
                <Icon className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{deliverable.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(deliverable.file_size)}
                    {' · '}
                    <DateDisplay date={deliverable.created_at} format="relative" />
                    {deliverable.is_client_visible ? ' · Client visible' : ' · Internal only'}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(deliverable.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  aria-label={`Delete ${deliverable.file_name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Upload area */}
      <div className="mt-4">
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-medium mt-2">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, DOC, PNG, JPG up to 50MB</p>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            multiple
            onChange={e => handleUpload(e.target.files)}
            disabled={uploading}
          />
        </div>
        <label className="flex items-center gap-2 text-sm mt-3">
          <input
            type="checkbox"
            checked={isClientVisible}
            onChange={e => setIsClientVisible(e.target.checked)}
            className="rounded border-border"
          />
          Make visible to client
        </label>
        {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
      </div>
    </div>
  );
}
