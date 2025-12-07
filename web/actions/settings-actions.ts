/**
 * Settings Server Actions
 * 
 * 사용자 설정 페이지를 위한 서버 액션
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * 프로필 정보 조회
 */
export async function getProfile(): Promise<{
  success: boolean;
  data?: {
    id: string;
    email: string;
    name: string | null;
    company: string | null;
    role: string;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 프로필 조회
    const adminClient = getAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, email, name, company, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[Get Profile] Failed:', profileError);
      return { success: false, error: profileError.message };
    }

    return {
      success: true,
      data: {
        id: profile.id,
        email: profile.email,
        name: profile.name || null,
        company: profile.company || null,
        role: profile.role || 'free',
      },
    };
  } catch (error) {
    console.error('[Get Profile] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 프로필 정보 업데이트
 */
export async function updateProfile(input: {
  name?: string;
  company?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 업데이트할 데이터 준비
    const updateData: { name?: string; company?: string } = {};
    if (input.name !== undefined) {
      updateData.name = input.name.trim() || null;
    }
    if (input.company !== undefined) {
      updateData.company = input.company.trim() || null;
    }

    // 프로필 업데이트
    const adminClient = getAdminClient();
    const { error: updateError } = await adminClient
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      console.error('[Update Profile] Failed:', updateError);
      return { success: false, error: updateError.message };
    }

    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('[Update Profile] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 비밀번호 변경
 */
export async function updatePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 현재 비밀번호 확인 (이메일과 현재 비밀번호로 로그인 시도)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: input.currentPassword,
    });

    if (signInError) {
      return { success: false, error: '현재 비밀번호가 올바르지 않습니다.' };
    }

    // 새 비밀번호로 업데이트
    const { error: updateError } = await supabase.auth.updateUser({
      password: input.newPassword,
    });

    if (updateError) {
      console.error('[Update Password] Failed:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[Update Password] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
