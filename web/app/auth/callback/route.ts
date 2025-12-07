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
  const { searchParams, origin } = requestUrl
  const token_hash = searchParams.get('token_hash')
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  // next 파라미터가 있으면 그곳으로, 없으면 기본값 사용
  const next = searchParams.get('next')

  console.log('[Auth Callback] Received request:', {
    hasCode: !!code,
    hasTokenHash: !!token_hash,
    type,
    next,
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
        const errorUrl = new URL('/auth/auth-code-error', origin)
        return NextResponse.redirect(errorUrl)
      }
      
      if (user) {
        console.log('[Auth Callback] User found, email confirmed:', {
          email: user.email,
          emailConfirmed: !!user.email_confirmed_at,
        })
        
        // next 파라미터가 있으면 우선 사용
        if (next) {
          console.log('[Auth Callback] Redirecting to next parameter:', next)
          return NextResponse.redirect(new URL(next, origin))
        }
        
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
        return NextResponse.redirect(new URL(redirectPath, origin))
      }
      
      // 사용자 정보를 가져올 수 없는 경우
      console.error('[Auth Callback] User not found after code exchange')
      const errorUrl = new URL('/auth/auth-code-error', origin)
      return NextResponse.redirect(errorUrl)
    } else {
      console.error('[Auth Callback] Code exchange error:', error)
      const errorUrl = new URL('/auth/auth-code-error', origin)
      return NextResponse.redirect(errorUrl)
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
        const errorUrl = new URL('/auth/auth-code-error', origin)
        return NextResponse.redirect(errorUrl)
      }
      
      if (user) {
        console.log('[Auth Callback] User found, email confirmed:', {
          email: user.email,
          emailConfirmed: !!user.email_confirmed_at,
        })
        
        // next 파라미터가 있으면 우선 사용
        if (next) {
          console.log('[Auth Callback] Redirecting to next parameter:', next)
          return NextResponse.redirect(new URL(next, origin))
        }
        
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
        return NextResponse.redirect(new URL(redirectPath, origin))
      }
      
      // 사용자 정보를 가져올 수 없는 경우
      console.error('[Auth Callback] User not found after OTP verification')
      const errorUrl = new URL('/auth/auth-code-error', origin)
      return NextResponse.redirect(errorUrl)
    } else {
      console.error('[Auth Callback] OTP verification error:', error)
      const errorUrl = new URL('/auth/auth-code-error', origin)
      return NextResponse.redirect(errorUrl)
    }
  }

  // 토큰이 없는 경우 - 에러 페이지로 리다이렉트
  console.log('[Auth Callback] No code or token_hash found, redirecting to error page')
  const errorUrl = new URL('/auth/auth-code-error', origin)
  return NextResponse.redirect(errorUrl)
}
