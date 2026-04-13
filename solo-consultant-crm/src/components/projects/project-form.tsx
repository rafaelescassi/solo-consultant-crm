'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import { createProjectSchema } from '@/lib/validations';
import { createProject, updateProject } from '@/app/(dashboard)/projects/actions';
import { PROJECT_TYPE_LABELS, PROJECT_TYPES } from '@/lib/types';
import { ProjectStatusBadge } from './project-status-badge';
import type { ProjectWithDetails, Client, ProjectType, CreateProjectInput } from '@/lib/types';

type FormData = CreateProjectInput;

interface ProjectFormProps {
  project?: ProjectWithDetails | null;
  clients: Client[];
}

export function ProjectForm({ project, clients }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!project;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createProjectSchema) as any,
    defaultValues: project ? {
      name: project.name,
      client_id: project.client_id,
      project_type: project.project_type,
      description: project.description || '',
      estimated_value: project.estimated_value ?? undefined,
      notes: project.notes || '',
    } : {
      name: '',
      client_id: '',
      project_type: 'website',
      description: '',
      notes: '',
    },
  });

  const selectedClientId = watch('client_id');
  const selectedProjectType = watch('project_type');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = isEdit
        ? await updateProject(project.id, data)
        : await createProject(data);

      if (result.success) {
        toast.success(isEdit ? 'Project updated' : 'Project created');
        router.push(isEdit ? `/projects/${project.id}` : '/projects');
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
    <Card className="max-w-[600px] mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{isEdit ? 'Edit Project' : 'New Project'}</CardTitle>
          {isEdit && project && <ProjectStatusBadge status={project.status} />}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input id="name" {...register('name')} placeholder="e.g. Acme Corp Website Redesign" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_id">Client *</Label>
            <Select value={selectedClientId} onValueChange={(v) => v && setValue('client_id', v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.filter(c => !c.is_archived).map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}{client.company ? ` (${client.company})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.client_id && <p className="text-xs text-destructive">{errors.client_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_type">Project Type *</Label>
            <Select value={selectedProjectType} onValueChange={(v) => v && setValue('project_type', v as ProjectType)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {PROJECT_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.project_type && <p className="text-xs text-destructive">{errors.project_type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} placeholder="Describe the project scope..." rows={4} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_value">Estimated Value ($)</Label>
            <Input id="estimated_value" type="number" step="0.01" min="0" {...register('estimated_value')} placeholder="0.00" />
            {errors.estimated_value && <p className="text-xs text-destructive">{errors.estimated_value.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register('notes')} placeholder="Internal notes..." rows={3} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
