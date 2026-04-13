'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServer } from '@/lib/supabase/server';
import { updateProfileSchema } from '@/lib/validations';
import type { ActionResult } from '@/lib/types/actions';
import type { Profile } from '@/lib/types';

async function getAuthUser() {
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return { supabase, user };
}

export async function getProfile(): Promise<Profile> {
  const { supabase, user } = await getAuthUser();

  const { data, error } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();

  if (error || !data) throw new Error('Profile not found');
  return data;
}

export async function updateProfile(input: unknown): Promise<ActionResult<Profile>> {
  try {
    const { supabase, user } = await getAuthUser();
    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) updateData[key] = value === '' ? null : value;
    }

    const { data: profile, error } = await supabase
      .from('profiles').update(updateData).eq('id', user.id).select().single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/settings');
    return { success: true, data: profile };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to update profile' };
  }
}

export async function uploadLogo(formData: FormData): Promise<ActionResult<string>> {
  try {
    const { supabase, user } = await getAuthUser();

    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'No file provided' };

    if (file.size > 2 * 1024 * 1024) return { success: false, error: 'File must be under 2MB' };

    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Only PNG, JPG, and SVG files are allowed' };
    }

    const ext = file.name.split('.').pop();
    const path = `${user.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);

    await supabase
      .from('profiles')
      .update({ logo_url: urlData.publicUrl })
      .eq('id', user.id);

    revalidatePath('/settings');
    return { success: true, data: urlData.publicUrl };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to upload logo' };
  }
}
