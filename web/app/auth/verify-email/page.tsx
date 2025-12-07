'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Mail, AlertCircle } from 'lucide-react'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkVerification = async () => {
      try {
        // URL 파라미터 확인
        const verified = searchParams.get('verified')
        const emailParam = searchParams.get('email')
        const errorParam = searchParams.get('error')

        if (errorParam === 'verification_failed') {
          setStatus('error')
          setErrorMessage('The verification link may have expired or already been used. Please request a new verification email.')
          if (emailParam) {
            setEmail(emailParam)
          }
          return
        }

        if (errorParam === 'invalid_link') {
          setStatus('error')
          setErrorMessage('Invalid verification link. Please request a new verification email.')
          return
        }

        if (verified === 'true') {
          // 이메일 확인 완료
          if (emailParam) {
            setEmail(emailParam)
          }
          
          const supabase = createClient()
          const { data: { user }, error: userError } = await supabase.auth.getUser()

          if (userError || !user) {
            setStatus('error')
            setErrorMessage('Failed to verify your account. Please try logging in.')
            return
          }

          setStatus('success')
          setEmail(user.email || emailParam)
          
          // 사용자 역할에 따라 적절한 페이지로 리다이렉트
          const userEmail = user.email?.toLowerCase() || ''
          let redirectPath = '/dashboard'
          
          if (userEmail === 'k.myungjun@nexsupply.net') {
            redirectPath = '/admin'
          } else if (userEmail === 'junkimfrom82@gmail.com' || 
                     (userEmail.endsWith('@nexsupply.net') && userEmail !== 'k.myungjun@nexsupply.net')) {
            redirectPath = '/manager/dashboard'
          }
          
          // 2초 후 리다이렉트
          setTimeout(() => {
            router.push(redirectPath)
          }, 2000)
          return
        }

        // URL 파라미터가 없는 경우, 현재 상태 확인
        const supabase = createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) {
          setStatus('pending')
          return
        }

        if (user) {
          // 이메일이 확인되었는지 확인
          if (user.email_confirmed_at) {
            setStatus('success')
            setEmail(user.email || null)
            
            // 사용자 역할에 따라 적절한 페이지로 리다이렉트
            const userEmail = user.email?.toLowerCase() || ''
            let redirectPath = '/dashboard'
            
            if (userEmail === 'k.myungjun@nexsupply.net') {
              redirectPath = '/admin'
            } else if (userEmail === 'junkimfrom82@gmail.com' || 
                       (userEmail.endsWith('@nexsupply.net') && userEmail !== 'k.myungjun@nexsupply.net')) {
              redirectPath = '/manager/dashboard'
            }
            
            // 2초 후 리다이렉트
            setTimeout(() => {
              router.push(redirectPath)
            }, 2000)
          } else {
            setStatus('pending')
            setEmail(user.email || null)
          }
        } else {
          setStatus('pending')
        }
      } catch (error) {
        console.error('[Verify Email] Error:', error)
        setStatus('error')
        setErrorMessage('An unexpected error occurred. Please try again.')
      }
    }

    checkVerification()
  }, [router, searchParams])

  const handleResendEmail = async () => {
    try {
      const supabase = createClient()
      
      // 이메일이 없으면 사용자에게 입력 요청
      if (!email) {
        const emailInput = prompt('Please enter your email address:')
        if (!emailInput) {
          return
        }
        setEmail(emailInput)
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email || undefined,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })

      if (error) {
        console.error('[Resend Email] Error:', error)
        setErrorMessage('Failed to resend verification email. Please try again.')
      } else {
        setErrorMessage(null)
        alert('Verification email has been sent. Please check your inbox (and spam folder).')
      }
    } catch (error) {
      console.error('[Resend Email] Error:', error)
      setErrorMessage('Failed to resend verification email. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          {/* Logo */}
          <Link href="/" className="inline-block mb-8">
            <span className="text-2xl font-bold text-neutral-900">NexSupply</span>
          </Link>

          {/* Status Content */}
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="w-16 h-16 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto"></div>
              <h1 className="text-2xl font-bold text-neutral-900">Verifying your email...</h1>
              <p className="text-neutral-600">Please wait while we verify your email address.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">Email verified!</h1>
              <p className="text-neutral-600">
                Your email has been successfully verified. Redirecting to your dashboard...
              </p>
              <div className="pt-4">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}

          {status === 'pending' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">Verify your email</h1>
              <div className="space-y-2">
                <p className="text-neutral-600">
                  Please check your email inbox and click the confirmation link to verify your account.
                </p>
                {email && (
                  <p className="text-sm text-neutral-500">
                    We sent a verification email to <span className="font-medium text-neutral-900">{email}</span>
                  </p>
                )}
              </div>
              
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                >
                  Resend verification email
                </Button>
                <Link
                  href="/login"
                  className="block text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">Verification failed</h1>
              <p className="text-neutral-600">
                {errorMessage || 'The verification link may have expired or already been used.'}
              </p>
              
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                >
                  Resend verification email
                </Button>
                <Link
                  href="/login"
                  className="block text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-neutral-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
