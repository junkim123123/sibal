import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

/**
 * Supabase Auth Callback Handler
 * 
 * 이 라우트는 Supabase 인증 콜백을 처리합니다:
 * - 이메일 확인 링크
 * - OAuth 리다이렉트
 * - Magic Link
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  // code 파라미터가 있는 경우 (최신 Supabase 형식)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 인증 성공
      revalidatePath('/', 'layout')
      
      // 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 이메일 도메인 기반 자동 리다이렉트
        const email = user.email?.toLowerCase() || ''
        
        // Super Admin: k.myungjun@nexsupply.net
        if (email === 'k.myungjun@nexsupply.net') {
          return NextResponse.redirect(new URL('/admin', requestUrl.origin))
        }
        
        // Manager: 하드코딩된 이메일
        if (email === 'junkimfrom82@gmail.com') {
          return NextResponse.redirect(new URL('/manager/dashboard', requestUrl.origin))
        }
        
        // Manager: 모든 @nexsupply.net 도메인 (super admin 제외)
        if (email.endsWith('@nexsupply.net') && email !== 'k.myungjun@nexsupply.net') {
          return NextResponse.redirect(new URL('/manager/dashboard', requestUrl.origin))
        }
      }
      
      // 일반 사용자 또는 기본 리다이렉트
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } else {
      console.error('[Auth Callback] Code exchange error:', error)
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', '이메일 확인에 실패했습니다. 링크가 만료되었거나 이미 사용되었을 수 있습니다.')
      return NextResponse.redirect(loginUrl)
    }
  }

  // token_hash 파라미터가 있는 경우 (구형 Supabase 형식)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // 인증 성공
      revalidatePath('/', 'layout')
      
      // 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 이메일 도메인 기반 자동 리다이렉트
        const email = user.email?.toLowerCase() || ''
        
        // Super Admin: k.myungjun@nexsupply.net
        if (email === 'k.myungjun@nexsupply.net') {
          return NextResponse.redirect(new URL('/admin', requestUrl.origin))
        }
        
        // Manager: 하드코딩된 이메일
        if (email === 'junkimfrom82@gmail.com') {
          return NextResponse.redirect(new URL('/manager/dashboard', requestUrl.origin))
        }
        
        // Manager: 모든 @nexsupply.net 도메인 (super admin 제외)
        if (email.endsWith('@nexsupply.net') && email !== 'k.myungjun@nexsupply.net') {
          return NextResponse.redirect(new URL('/manager/dashboard', requestUrl.origin))
        }
      }
      
      // 일반 사용자 또는 기본 리다이렉트
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } else {
      console.error('[Auth Callback] OTP verification error:', error)
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', '이메일 확인에 실패했습니다. 링크가 만료되었거나 이미 사용되었을 수 있습니다.')
      return NextResponse.redirect(loginUrl)
    }
  }

  // 토큰이 없는 경우 - 로그인 페이지로 리다이렉트
  const loginUrl = new URL('/login', requestUrl.origin)
  loginUrl.searchParams.set('error', '유효하지 않은 확인 링크입니다.')
  return NextResponse.redirect(loginUrl)
}
