'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  // 프로필 추가 정보 저장 (name, company)
  // 트리거로 프로필이 자동 생성되므로, 약간의 지연 후 업데이트
  if (authData.user) {
    const adminClient = getAdminClient()
    const name = formData.get('name') as string
    const company = formData.get('company') as string

    const profileUpdate: { name?: string; company?: string } = {}
    if (name && name.trim()) {
      profileUpdate.name = name.trim()
    }
    if (company && company.trim()) {
      profileUpdate.company = company.trim()
    }

    // 프로필이 자동 생성된 후 업데이트 (재시도 로직 포함)
    if (Object.keys(profileUpdate).length > 0) {
      // 트리거 실행을 위한 짧은 지연
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 재시도 로직 (최대 3회)
      let retries = 3
      while (retries > 0) {
        const { error: updateError } = await adminClient
          .from('profiles')
          .update(profileUpdate)
          .eq('id', authData.user.id)

        if (!updateError) {
          break // 성공
        }

        // 프로필이 아직 생성되지 않은 경우, 재시도
        if (updateError.code === 'PGRST116' || updateError.message?.includes('No rows')) {
          retries--
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        } else {
          break // 다른 에러는 재시도하지 않음
        }
      }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function managerLogin(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // 먼저 로그인 시도
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword(data)

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Login failed' }
  }

  // 매니저 권한 확인
  const adminClient = getAdminClient()
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('is_manager, role')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profile) {
    // 프로필이 없으면 일반 로그인으로 처리
    await supabase.auth.signOut()
    return { error: 'Manager account not found. Please use regular login.' }
  }

  if (!profile.is_manager && profile.role !== 'admin') {
    // 매니저가 아니면 로그아웃하고 에러 반환
    await supabase.auth.signOut()
    return { error: 'Access denied. This account does not have manager privileges.' }
  }

  revalidatePath('/', 'layout')
  redirect('/manager/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
