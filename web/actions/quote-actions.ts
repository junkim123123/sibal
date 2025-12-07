/**
 * Factory Quote Server Actions
 * 
 * Visual Quote Comparison 기능을 위한 서버 액션
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import type {
  FactoryQuote,
  CreateQuotesInput,
  SelectQuoteInput,
} from '@/lib/types/quote';

/**
 * 현재 사용자가 매니저인지 확인
 */
async function checkIsManager(userId: string): Promise<boolean> {
  const adminClient = getAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('is_manager, email')
    .eq('id', userId)
    .single();

  if (!profile) return false;

  // @nexsupply.net 도메인 사용자는 자동으로 매니저로 인식 (super admin 제외)
  const userEmail = profile.email?.toLowerCase() || '';
  const isNexsupplyDomain = userEmail.endsWith('@nexsupply.net') && userEmail !== 'k.myungjun@nexsupply.net';

  return profile.is_manager === true || isNexsupplyDomain;
}

/**
 * 프로젝트에 대한 권한 확인
 */
async function checkProjectAccess(
  projectId: string,
  userId: string,
  requireManager: boolean = false
): Promise<{ hasAccess: boolean; isManager: boolean }> {
  const adminClient = getAdminClient();
  const { data: project } = await adminClient
    .from('projects')
    .select('user_id, manager_id')
    .eq('id', projectId)
    .single();

  if (!project) {
    return { hasAccess: false, isManager: false };
  }

  const isManager = await checkIsManager(userId);
  const isOwner = project.user_id === userId;
  const isAssignedManager = project.manager_id === userId;

  if (requireManager) {
    return {
      hasAccess: isManager && isAssignedManager,
      isManager: isManager && isAssignedManager,
    };
  }

  return {
    hasAccess: isOwner || (isManager && isAssignedManager),
    isManager: isManager && isAssignedManager,
  };
}

/**
 * 여러 견적을 한 번에 생성 (매니저 전용)
 */
export async function createQuotes(
  input: CreateQuotesInput
): Promise<{ success: boolean; data?: FactoryQuote[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 매니저 권한 확인
    const isManager = await checkIsManager(user.id);
    if (!isManager) {
      return { success: false, error: 'Forbidden: Manager access required' };
    }

    // 프로젝트 접근 권한 확인
    const { hasAccess } = await checkProjectAccess(input.project_id, user.id, true);
    if (!hasAccess) {
      return { success: false, error: 'Forbidden: No access to this project' };
    }

    // 견적 데이터 준비
    const quotesToInsert = input.quotes.map((quote) => ({
      project_id: input.project_id,
      factory_name: quote.factory_name,
      is_recommended: quote.is_recommended || false,
      unit_price: quote.unit_price,
      moq: quote.moq,
      lead_time_days: quote.lead_time_days,
      sample_cost: quote.sample_cost || null,
      pros: quote.pros || [],
      cons: quote.cons || [],
      risk_level: quote.risk_level || 'Medium',
      status: 'pending' as const,
    }));

    // 견적 일괄 생성
    const adminClient = getAdminClient();
    const { data: quotes, error: insertError } = await adminClient
      .from('factory_quotes')
      .insert(quotesToInsert)
      .select();

    if (insertError) {
      console.error('[Create Quotes] Failed:', insertError);
      return { success: false, error: insertError.message };
    }

    revalidatePath(`/projects/${input.project_id}/quotes`);
    return { success: true, data: quotes as FactoryQuote[] };
  } catch (error) {
    console.error('[Create Quotes] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 견적 조회 (프로젝트별)
 */
export async function getQuotes(
  projectId: string
): Promise<{ success: boolean; data?: FactoryQuote[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 프로젝트 접근 권한 확인
    const { hasAccess } = await checkProjectAccess(projectId, user.id);
    if (!hasAccess) {
      return { success: false, error: 'Forbidden: No access to this project' };
    }

    // 견적 조회
    const adminClient = getAdminClient();
    const { data: quotes, error: quotesError } = await adminClient
      .from('factory_quotes')
      .select('*')
      .eq('project_id', projectId)
      .order('is_recommended', { ascending: false })
      .order('unit_price', { ascending: true });

    if (quotesError) {
      console.error('[Get Quotes] Failed:', quotesError);
      return { success: false, error: quotesError.message };
    }

    return { success: true, data: (quotes || []) as FactoryQuote[] };
  } catch (error) {
    console.error('[Get Quotes] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 견적 선택 (클라이언트 전용)
 * 선택된 견적은 'selected', 나머지는 'rejected'로 변경
 */
export async function selectQuote(
  input: SelectQuoteInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 프로젝트 소유자 확인 (클라이언트만 선택 가능)
    const { hasAccess, isManager } = await checkProjectAccess(input.project_id, user.id);
    if (!hasAccess || isManager) {
      return { success: false, error: 'Forbidden: Only project owner can select quotes' };
    }

    // 선택할 견적 확인
    const adminClient = getAdminClient();
    const { data: selectedQuote, error: quoteError } = await adminClient
      .from('factory_quotes')
      .select('project_id')
      .eq('id', input.quote_id)
      .eq('project_id', input.project_id)
      .single();

    if (quoteError || !selectedQuote) {
      return { success: false, error: 'Quote not found' };
    }

    // 트랜잭션: 선택된 견적은 'selected', 나머지는 'rejected'로 변경
    // 1. 모든 견적을 'rejected'로 변경
    const { error: rejectError } = await adminClient
      .from('factory_quotes')
      .update({ status: 'rejected' })
      .eq('project_id', input.project_id);

    if (rejectError) {
      console.error('[Select Quote] Failed to reject other quotes:', rejectError);
      return { success: false, error: rejectError.message };
    }

    // 2. 선택된 견적을 'selected'로 변경
    const { error: selectError } = await adminClient
      .from('factory_quotes')
      .update({ status: 'selected' })
      .eq('id', input.quote_id);

    if (selectError) {
      console.error('[Select Quote] Failed to select quote:', selectError);
      return { success: false, error: selectError.message };
    }

    // 3. 프로젝트 상태 업데이트 (선택사항)
    // 프로젝트에 quote_selected_at 같은 필드가 있다면 업데이트
    // 여기서는 기본적으로 프로젝트 상태를 업데이트하지 않지만,
    // 필요하다면 추가할 수 있습니다.

    revalidatePath(`/projects/${input.project_id}/quotes`);
    return { success: true };
  } catch (error) {
    console.error('[Select Quote] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
