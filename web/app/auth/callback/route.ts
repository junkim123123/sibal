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

  console.log('[Auth Callback] Received request:', {
    hasCode: !!code,
    hasTokenHash: !!token_hash,
    type,
    url: requestUrl.toString(),
  })

  const supabase = await createClient()

  // code 파라미터가 있는 경우 (최신 Supabase 형식)
  if (code) {
    console.log('[Auth Callback] Processing code exchange...')
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('[Auth Callback] Code exchange successful')
      // 인증 성공
      revalidatePath('/', 'layout')
      
      // 사용자 정보 가져오기
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('[Auth Callback] Failed to get user after code exchange:', userError)
        const verifyUrl = new URL('/auth/verify-email', requestUrl.origin)
        return NextResponse.redirect(verifyUrl)
      }
      
      if (user) {
        console.log('[Auth Callback] User found, email confirmed:', {
          email: user.email,
          emailConfirmed: !!user.email_confirmed_at,
        })
        
        // 이메일 도메인 기반 자동 리다이렉트
        const email = user.email?.toLowerCase() || ''
        let redirectPath = '/dashboard'
        
        if (email === 'k.myungjun@nexsupply.net') {
          redirectPath = '/admin'
        } else if (email === 'junkimfrom82@gmail.com' || 
                   (email.endsWith('@nexsupply.net') && email !== 'k.myungjun@nexsupply.net')) {
          redirectPath = '/manager/dashboard'
        }
        
        console.log('[Auth Callback] Redirecting to:', redirectPath)
        // 이메일 확인 완료 후 바로 대시보드로 리다이렉트
        return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
      }
      
      // 사용자 정보를 가져올 수 없는 경우
      console.error('[Auth Callback] User not found after code exchange')
      const verifyUrl = new URL('/auth/verify-email', requestUrl.origin)
      return NextResponse.redirect(verifyUrl)
    } else {
      console.error('[Auth Callback] Code exchange error:', error)
      const verifyUrl = new URL('/auth/verify-email', requestUrl.origin)
      verifyUrl.searchParams.set('error', 'verification_failed')
      return NextResponse.redirect(verifyUrl)
    }
  }

  // token_hash 파라미터가 있는 경우 (구형 Supabase 형식)
  if (token_hash && type) {
    console.log('[Auth Callback] Processing OTP verification...')
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      console.log('[Auth Callback] OTP verification successful')
      // 인증 성공
      revalidatePath('/', 'layout')
      
      // 사용자 정보 가져오기
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('[Auth Callback] Failed to get user after OTP verification:', userError)
        const verifyUrl = new URL('/auth/verify-email', requestUrl.origin)
        return NextResponse.redirect(verifyUrl)
      }
      
      if (user) {
        console.log('[Auth Callback] User found, email confirmed:', {
          email: user.email,
          emailConfirmed: !!user.email_confirmed_at,
        })
        
        // 이메일 도메인 기반 자동 리다이렉트
        const email = user.email?.toLowerCase() || ''
        let redirectPath = '/dashboard'
        
        if (email === 'k.myungjun@nexsupply.net') {
          redirectPath = '/admin'
        } else if (email === 'junkimfrom82@gmail.com' || 
                   (email.endsWith('@nexsupply.net') && email !== 'k.myungjun@nexsupply.net')) {
          redirectPath = '/manager/dashboard'
        }
        
        console.log('[Auth Callback] Redirecting to:', redirectPath)
        // 이메일 확인 완료 후 바로 대시보드로 리다이렉트
        return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
      }
      
      // 사용자 정보를 가져올 수 없는 경우
      console.error('[Auth Callback] User not found after OTP verification')
      const verifyUrl = new URL('/auth/verify-email', requestUrl.origin)
      return NextResponse.redirect(verifyUrl)
    } else {
      console.error('[Auth Callback] OTP verification error:', error)
      const verifyUrl = new URL('/auth/verify-email', requestUrl.origin)
      verifyUrl.searchParams.set('error', 'verification_failed')
      return NextResponse.redirect(verifyUrl)
    }
  }

  // 토큰이 없는 경우 - 이메일 확인 페이지로 리다이렉트
  console.log('[Auth Callback] No code or token_hash found, redirecting to verify-email page')
  const verifyUrl = new URL('/auth/verify-email', requestUrl.origin)
  verifyUrl.searchParams.set('error', 'invalid_link')
  return NextResponse.redirect(verifyUrl)
}
