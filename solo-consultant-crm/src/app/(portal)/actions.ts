'use server';

import { createSupabaseServer } from '@/lib/supabase/server';
import type { ActionResult } from '@/lib/types/actions';
import type { PortalProject } from '@/lib/types';

async function getAuthClient() {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'client') throw new Error('Client access required');

  // Get the client record linked to this portal user
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('portal_user_id', user.id)
    .single();

  if (!client) throw new Error('No client profile linked to this account');

  return { supabase, user, clientId: client.id };
}

export async function getMyProjects(): Promise<PortalProject[]> {
  const { supabase, clientId } = await getAuthClient();

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, description, project_type, status, started_at, completed_at, delivered_at, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  if (!projects || projects.length === 0) return [];

  // Fetch phases for all projects
  const projectIds = projects.map(p => p.id);
  const [phasesRes, commentsRes, deliverablesRes] = await Promise.all([
    supabase
      .from('project_phases')
      .select('*')
      .in('project_id', projectIds)
      .order('phase_number', { ascending: true }),
    supabase
      .from('project_comments')
      .select('*')
      .in('project_id', projectIds)
      .eq('is_client_visible', true)
      .order('created_at', { ascending: true }),
    supabase
      .from('project_deliverables')
      .select('*')
      .in('project_id', projectIds)
      .eq('is_client_visible', true)
      .order('created_at', { ascending: false }),
  ]);

  const phases = phasesRes.data || [];
  const comments = commentsRes.data || [];
  const deliverables = deliverablesRes.data || [];

  return projects.map(p => ({
    ...p,
    phases: phases.filter(ph => ph.project_id === p.id),
    comments: comments.filter(c => c.project_id === p.id),
    deliverables: deliverables.filter(d => d.project_id === p.id),
  }));
}

export async function getMyProjectById(projectId: string): Promise<PortalProject | null> {
  const { supabase, clientId } = await getAuthClient();

  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name, description, project_type, status, started_at, completed_at, delivered_at, created_at')
    .eq('id', projectId)
    .eq('client_id', clientId)
    .single();

  if (error || !project) return null;

  const [phasesRes, commentsRes, deliverablesRes] = await Promise.all([
    supabase
      .from('project_phases')
      .select('*')
      .eq('project_id', projectId)
      .order('phase_number', { ascending: true }),
    supabase
      .from('project_comments')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_client_visible', true)
      .order('created_at', { ascending: true }),
    supabase
      .from('project_deliverables')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_client_visible', true)
      .order('created_at', { ascending: false }),
  ]);

  return {
    ...project,
    phases: phasesRes.data || [],
    comments: commentsRes.data || [],
    deliverables: deliverablesRes.data || [],
  };
}

export async function getDeliverableDownloadUrl(deliverableId: string): Promise<ActionResult<string>> {
  try {
    const { supabase, clientId } = await getAuthClient();

    // Verify deliverable belongs to client's project and is visible
    const { data: deliverable } = await supabase
      .from('project_deliverables')
      .select('file_url, is_client_visible, project_id')
      .eq('id', deliverableId)
      .eq('is_client_visible', true)
      .single();

    if (!deliverable) return { success: false, error: 'Deliverable not found' };

    // Verify project belongs to client
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', deliverable.project_id)
      .eq('client_id', clientId)
      .single();

    if (!project) return { success: false, error: 'Access denied' };

    // Generate signed URL (1 hour expiry)
    const { data: signedUrl, error } = await supabase.storage
      .from('deliverables')
      .createSignedUrl(deliverable.file_url, 3600);

    if (error || !signedUrl) return { success: false, error: 'Failed to generate download URL' };

    return { success: true, data: signedUrl.signedUrl };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to get download URL' };
  }
}
