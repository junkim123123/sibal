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

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
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
