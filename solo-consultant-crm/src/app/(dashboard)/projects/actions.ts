'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createProjectSchema, updateProjectSchema, updatePhaseSchema, createCommentSchema } from '@/lib/validations';
import type { ActionResult } from '@/lib/types/actions';
import type {
  Project, ProjectWithClient, ProjectWithDetails,
  ProjectPhase, ProjectComment, ProjectDeliverable,
  ProjectStatus,
} from '@/lib/types';

async function getAuthAdmin() {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') throw new Error('Admin access required');
  return { supabase, user };
}

async function logActivity(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  userId: string, type: string, description: string,
  entityType: string, entityId: string, metadata?: Record<string, unknown>
) {
  await supabase.from('activity_log').insert({
    user_id: userId, type, description, entity_type: entityType,
    entity_id: entityId, metadata: metadata || null,
  });
}

// ─── Read ────────────────────────────────────────────

export async function getProjects(status?: ProjectStatus): Promise<ProjectWithClient[]> {
  const { supabase } = await getAuthAdmin();

  let query = supabase
    .from('projects')
    .select('*, client:clients(id, name, email, company)')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as ProjectWithClient[];
}

export async function getProjectById(id: string): Promise<ProjectWithDetails | null> {
  const { supabase } = await getAuthAdmin();

  const [projectRes, phasesRes, commentsRes, deliverablesRes] = await Promise.all([
    supabase
      .from('projects')
      .select('*, client:clients(id, name, email, company)')
      .eq('id', id)
      .single(),
    supabase
      .from('project_phases')
      .select('*')
      .eq('project_id', id)
      .order('phase_number', { ascending: true }),
    supabase
      .from('project_comments')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('project_deliverables')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (projectRes.error || !projectRes.data) return null;

  return {
    ...projectRes.data,
    client: projectRes.data.client,
    phases: phasesRes.data || [],
    comments: commentsRes.data || [],
    deliverables: deliverablesRes.data || [],
  } as ProjectWithDetails;
}

// ─── Create ──────────────────────────────────────────

export async function createProject(input: unknown): Promise<ActionResult<Project>> {
  try {
    const { supabase, user } = await getAuthAdmin();
    const parsed = createProjectSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const cleanData = {
      ...parsed.data,
      description: parsed.data.description || null,
      notes: parsed.data.notes || null,
      estimated_value: parsed.data.estimated_value ?? null,
      user_id: user.id,
    };

    const { data: project, error } = await supabase
      .from('projects').insert(cleanData).select().single();

    if (error) return { success: false, error: error.message };

    await logActivity(supabase, user.id, 'project_created',
      `Project "${project.name}" created`, 'project', project.id);

    revalidatePath('/projects');
    revalidatePath('/dashboard');
    return { success: true, data: project };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create project' };
  }
}

// ─── Update ──────────────────────────────────────────

export async function updateProject(id: string, input: unknown): Promise<ActionResult<Project>> {
  try {
    const { supabase, user } = await getAuthAdmin();
    const parsed = updateProjectSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) updateData[key] = value === '' ? null : value;
    }

    // Handle status transitions with timestamps
    if (parsed.data.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    if (parsed.data.status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }
    if (parsed.data.status === 'cancelled') {
      updateData.completed_at = null;
      updateData.delivered_at = null;
    }

    const { data: project, error } = await supabase
      .from('projects').update(updateData).eq('id', id).select().single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/projects');
    revalidatePath(`/projects/${id}`);
    revalidatePath('/dashboard');
    return { success: true, data: project };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update project' };
  }
}

// ─── Delete ──────────────────────────────────────────

export async function deleteProject(id: string): Promise<ActionResult<void>> {
  try {
    const { supabase, user } = await getAuthAdmin();

    // Verify project is draft or cancelled
    const { data: project } = await supabase
      .from('projects').select('status, name').eq('id', id).single();

    if (!project) return { success: false, error: 'Project not found' };
    if (project.status !== 'draft' && project.status !== 'cancelled') {
      return { success: false, error: 'Only draft or cancelled projects can be deleted' };
    }

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    await logActivity(supabase, user.id, 'project_cancelled',
      `Project "${project.name}" deleted`, 'project', id);

    revalidatePath('/projects');
    revalidatePath('/dashboard');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to delete project' };
  }
}

// ─── Trigger Build ───────────────────────────────────

export async function triggerBuild(id: string): Promise<ActionResult<Project>> {
  try {
    const { supabase, user } = await getAuthAdmin();

    // Verify project is approved
    const { data: project } = await supabase
      .from('projects').select('status, name').eq('id', id).single();

    if (!project) return { success: false, error: 'Project not found' };
    if (project.status !== 'approved') {
      return { success: false, error: 'Only approved projects can be started' };
    }

    const now = new Date().toISOString();

    // Set project to in_progress
    const { data: updated, error } = await supabase
      .from('projects')
      .update({ status: 'in_progress', started_at: now })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    // Set phase 1 (Research) to in_progress
    await supabase
      .from('project_phases')
      .update({ status: 'in_progress', started_at: now })
      .eq('project_id', id)
      .eq('phase_number', 1);

    await logActivity(supabase, user.id, 'project_started',
      `Project "${project.name}" build started`, 'project', id);

    revalidatePath('/projects');
    revalidatePath(`/projects/${id}`);
    revalidatePath('/dashboard');
    return { success: true, data: updated };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to start build' };
  }
}

// ─── Phase Management ────────────────────────────────

export async function updatePhaseStatus(
  projectId: string,
  phaseNumber: number,
  input: unknown
): Promise<ActionResult<ProjectPhase>> {
  try {
    const { supabase, user } = await getAuthAdmin();
    const parsed = updatePhaseSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const updateData: Record<string, unknown> = {
      status: parsed.data.status,
      notes: parsed.data.notes || null,
    };

    if (parsed.data.status === 'in_progress' ) {
      updateData.started_at = new Date().toISOString();
    }
    if (parsed.data.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: phase, error } = await supabase
      .from('project_phases')
      .update(updateData)
      .eq('project_id', projectId)
      .eq('phase_number', phaseNumber)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    // Check if all 7 phases are completed → set project to review
    const { data: allPhases } = await supabase
      .from('project_phases')
      .select('status')
      .eq('project_id', projectId);

    const allCompleted = allPhases && allPhases.length === 7 &&
      allPhases.every(p => p.status === 'completed');

    if (allCompleted) {
      await supabase
        .from('projects')
        .update({ status: 'review' })
        .eq('id', projectId);
    }

    // Get project name for activity log
    const { data: project } = await supabase
      .from('projects').select('name').eq('id', projectId).single();

    await logActivity(supabase, user.id, 'project_phase_updated',
      `Phase ${phaseNumber} of "${project?.name}" → ${parsed.data.status}`,
      'project', projectId, { phase_number: phaseNumber, status: parsed.data.status });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/projects');
    revalidatePath('/portal');
    return { success: true, data: phase };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update phase' };
  }
}

// ─── Comments ────────────────────────────────────────

export async function addPhaseComment(input: unknown): Promise<ActionResult<ProjectComment>> {
  try {
    const { supabase, user } = await getAuthAdmin();
    const parsed = createCommentSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const { data: comment, error } = await supabase
      .from('project_comments')
      .insert({
        project_id: parsed.data.project_id,
        phase_number: parsed.data.phase_number,
        user_id: user.id,
        content: parsed.data.content,
        is_client_visible: parsed.data.is_client_visible ?? true,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath(`/projects/${parsed.data.project_id}`);
    revalidatePath('/portal');
    return { success: true, data: comment };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to add comment' };
  }
}

export async function deleteComment(commentId: string): Promise<ActionResult<void>> {
  try {
    const { supabase } = await getAuthAdmin();

    const { error } = await supabase
      .from('project_comments').delete().eq('id', commentId);

    if (error) return { success: false, error: error.message };

    revalidatePath('/projects');
    revalidatePath('/portal');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to delete comment' };
  }
}

// ─── Deliverables ────────────────────────────────────

export async function uploadDeliverable(formData: FormData): Promise<ActionResult<ProjectDeliverable>> {
  try {
    const { supabase, user } = await getAuthAdmin();

    const file = formData.get('file') as File | null;
    const projectId = formData.get('project_id') as string;
    const phaseNumber = Number(formData.get('phase_number'));
    const isClientVisible = formData.get('is_client_visible') === 'true';

    if (!file || !projectId || !phaseNumber) {
      return { success: false, error: 'Missing required fields' };
    }

    // Upload to Supabase Storage
    const filePath = `${user.id}/${projectId}/${phaseNumber}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('deliverables')
      .upload(filePath, file);

    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage
      .from('deliverables')
      .getPublicUrl(filePath);

    const { data: deliverable, error } = await supabase
      .from('project_deliverables')
      .insert({
        project_id: projectId,
        phase_number: phaseNumber,
        user_id: user.id,
        file_name: file.name,
        file_url: filePath,
        file_size: file.size,
        is_client_visible: isClientVisible,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/portal');
    return { success: true, data: deliverable };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to upload deliverable' };
  }
}

export async function deleteDeliverable(id: string): Promise<ActionResult<void>> {
  try {
    const { supabase } = await getAuthAdmin();

    // Get file path first
    const { data: deliverable } = await supabase
      .from('project_deliverables').select('file_url, project_id').eq('id', id).single();

    if (!deliverable) return { success: false, error: 'Deliverable not found' };

    // Delete from storage
    await supabase.storage.from('deliverables').remove([deliverable.file_url]);

    // Delete record
    const { error } = await supabase
      .from('project_deliverables').delete().eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/projects/${deliverable.project_id}`);
    revalidatePath('/portal');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to delete deliverable' };
  }
}
