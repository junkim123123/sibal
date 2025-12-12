'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Chrome, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

function LoginPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // URL에서 에러 메시지 및 signup 파라미터 확인
  useEffect(() => {
    if (!searchParams) return
    
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(errorParam)
      // URL에서 에러 파라미터 제거
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('error')
      router.replace(newUrl.pathname + newUrl.search, { scroll: false })
    }
    
    // signup 파라미터 확인
    const signupParam = searchParams.get('signup')
    if (signupParam === 'true') {
      setIsSignUp(true)
    }
  }, [searchParams, router])
  
  // Sign up additional fields
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    // Validation for sign up
    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your name.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
    }
    
    setIsLoading(true)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    
    if (isSignUp) {
      formData.append('name', name)
      if (company.trim()) {
        formData.append('company', company)
      }
    }

    try {
      const result = isSignUp
        ? await signup(formData)
        : await login(formData)

      // redirect()가 호출되면 이 코드는 실행되지 않음 (예외를 던지므로)
      // result가 있으면 에러 메시지 표시
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
    } catch (err: any) {
      // redirect()는 NEXT_REDIRECT 에러를 던지는데, 이것은 정상적인 리다이렉트입니다
      // Next.js가 자동으로 리다이렉트를 처리하므로 클라이언트에서는 아무것도 하지 않습니다
      const isRedirect = err?.digest?.startsWith('NEXT_REDIRECT') || 
                         err?.message?.includes('NEXT_REDIRECT') ||
                         err?.name === 'NEXT_REDIRECT'
      
      if (isRedirect) {
        // 정상적인 리다이렉트 - 아무것도 하지 않음
        // Next.js가 자동으로 리다이렉트 처리
        // 브라우저 콘솔에 에러가 표시되지 않도록 조용히 처리
        return
      }
      
      // 실제 에러인 경우에만 처리
      console.error('[Login] Error:', err)
      setError(err?.message || '예기치 않은 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'kakao') => {
    try {
      setError(null)
      setIsLoading(true)
      
      const supabase = createClient()
      const redirectUrl = `${window.location.origin}/auth/callback`
      
      // Determine redirect path based on user type (will be handled in callback)
      const redirectPath = '/dashboard'
      
      // Configure OAuth options based on provider
      const oauthOptions: any = {
        redirectTo: `${redirectUrl}?next=${encodeURIComponent(redirectPath)}`,
      }
      
      if (provider === 'google') {
        oauthOptions.queryParams = {
          access_type: 'offline',
          prompt: 'consent',
        }
      } else if (provider === 'kakao') {
        // Kakao: Request only basic scopes that are typically enabled by default
        // If account_email and profile_image are not configured in Kakao Developer Console,
        // we'll only request the nickname scope
        // Note: Supabase may still request email by default, but we can try to limit it
        oauthOptions.scopes = 'profile_nickname'
        // Alternative: If you want to request email, make sure it's enabled in Kakao Developer Console
        // oauthOptions.scopes = 'profile_nickname,account_email'
      }
      
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: oauthOptions,
      })

      if (oauthError) {
        setError(`Failed to sign in with ${provider}. ${oauthError.message || 'Please try again.'}`)
        setIsLoading(false)
        console.error(`[OAuth ${provider}] Error:`, oauthError)
      } else if (data?.url) {
        // OAuth provider will redirect the user
        // The redirect happens automatically, so we don't need to do anything here
        // The loading state will remain until the redirect completes
      }
    } catch (err: any) {
      console.error(`[OAuth ${provider}] Unexpected error:`, err)
      setError(`An unexpected error occurred. Please try again.`)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col bg-white lg:w-1/2">
        {/* Logo */}
        <div className="p-6 lg:p-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-extrabold text-neutral-900">NexSupply</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                {isSignUp ? 'Create Account' : 'Welcome back'}
              </h1>
              <p className="text-sm text-neutral-600">
                {isSignUp
                  ? 'Create your free account to get started'
                  : 'Sign in to your account to continue'}
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-medium mb-2">{error}</p>
                    {error.toLowerCase().includes('email not confirmed') || error.toLowerCase().includes('email_not_confirmed') ? (
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <p className="text-xs text-red-700">
                          Please check your email inbox and click the confirmation link to verify your account.
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          If you didn't receive the email, check your spam folder or try signing up again.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="hidden sm:inline">Google</span>
              </button>

              {/* Kakao Sign In Button */}
              <button
                type="button"
                onClick={() => handleOAuthSignIn('kakao')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="#FEE500"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 3C6.48 3 2 6.13 2 10c0 2.38 1.91 4.5 4.84 5.82l-.84 3.18 3.5-2.1c.46.06.93.1 1.4.1 5.52 0 10-3.13 10-7s-4.48-7-10-7z" />
                </svg>
                <span className="hidden sm:inline">Kakao</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-neutral-500">
                  Or {isSignUp ? 'sign up' : 'sign in'} with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input (Sign Up only) */}
              {isSignUp && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-neutral-900 mb-2"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all text-sm"
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-900 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all text-sm"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>

              {/* Company Input (Sign Up only) */}
              {isSignUp && (
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-neutral-900 mb-2"
                  >
                    Company / Store Name
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all text-sm"
                    placeholder="ex. Amazon Store, Brand Name"
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-900 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all text-sm"
                    placeholder="••••••••"
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {isSignUp && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Password must be at least 6 characters.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-[#008080] hover:bg-teal-700 text-white font-bold"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </form>

            {/* Toggle Sign Up/Login */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                  // Reset fields
                  setName('')
                  setCompany('')
                  setShowPassword(false)
                }}
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                disabled={isLoading}
              >
                {isSignUp ? (
                  <>
                    Already have an account?{' '}
                    <span className="font-medium text-neutral-900">Sign In</span>
                  </>
                ) : (
                  <>
                    Don't have an account?{' '}
                    <span className="font-medium text-neutral-900">Sign Up</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Right Side - Strategic Image Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900">
        {/* Abstract Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Dark Overlay (45% opacity) */}
        <div className="absolute inset-0 bg-neutral-900/45"></div>

        {/* Quote Content */}
        <div className="relative z-10 flex items-center justify-center h-full px-12">
          <div className="text-center max-w-md" style={{ transform: 'translateY(-5%)' }}>
            <blockquote className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              Predictable Sourcing for Modern Brands.
            </blockquote>
            <p className="text-lg text-neutral-300 mt-6">
              Manage your margin, compliance, and logistics in one command center.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-neutral-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
