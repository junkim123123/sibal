/**
 * Supabase Admin Client
 * 
 * 서버 사이드에서 RLS를 우회하여 모든 데이터에 접근할 수 있는 관리자 클라이언트입니다.
 * API Routes에서 사용합니다.
 */

import { createClient } from '@supabase/supabase-js';

let adminClient: ReturnType<typeof createClient> | null = null;

/**
 * Supabase 관리자 클라이언트를 생성합니다.
 * Service Role Key를 사용하여 RLS를 우회합니다.
 */
export function getAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  if (!supabaseServiceKey) {
    // Service Role Key가 없으면 Anon Key로 폴백 (RLS 적용됨)
    console.warn('[Supabase Admin] SUPABASE_SERVICE_ROLE_KEY is not set. Using ANON_KEY with RLS.');
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey) {
      throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    }
    adminClient = createClient(supabaseUrl, anonKey);
    return adminClient;
  }

  adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}

