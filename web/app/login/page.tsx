'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Chrome } from 'lucide-react'

function LoginPageContent() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  // URL에서 에러 메시지 확인 (이메일 확인 실패 등)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(errorParam)
      // URL에서 에러 파라미터 제거
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('error')
      router.replace(newUrl.pathname + newUrl.search, { scroll: false })
    }
  }, [searchParams, router])
  
  // Sign up additional fields
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    // Validation for sign up
    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your name.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
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

      // redirect()가 호출되면 result가 undefined가 됨 (예외를 던지므로)
      // 따라서 result가 없으면 정상적인 리다이렉트로 간주
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
      // result가 없으면 redirect()가 호출된 것이므로 클라이언트에서 추가 작업 불필요
      // Next.js가 자동으로 리다이렉트 처리
    } catch (err: any) {
      // redirect()는 NextRedirect 에러를 던지므로, 이것은 정상적인 리다이렉트
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        // 정상적인 리다이렉트이므로 에러로 처리하지 않음
        // Next.js가 자동으로 리다이렉트 처리
        return
      }
      console.error('[Login] Error:', err)
      setError(err?.message || '예기치 않은 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    // Placeholder for Google OAuth
    alert('Google sign-in coming soon')
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col bg-white lg:w-1/2">
        {/* Logo */}
        <div className="p-6 lg:p-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-neutral-900">NexSupply</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Welcome back
              </h1>
              <p className="text-sm text-neutral-600">
                {isSignUp
                  ? 'Create your account to get started'
                  : 'Sign in to your account to continue'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              <Chrome className="h-5 w-5" />
              Continue with Google
            </button>

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
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all text-sm"
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
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all text-sm"
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
                    Company <span className="text-neutral-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all text-sm"
                    placeholder="Company name (optional)"
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
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all text-sm"
                  placeholder="••••••••"
                  disabled={isLoading}
                  minLength={6}
                />
                {isSignUp && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Password must be at least 6 characters.
                  </p>
                )}
              </div>

              {/* Confirm Password Input (Sign Up only) */}
              {isSignUp && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-neutral-900 mb-2"
                  >
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all text-sm"
                    placeholder="••••••••"
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white"
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
                  setConfirmPassword('')
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

      {/* Right Side - Dark Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Quote Content */}
        <div className="relative z-10 flex items-center justify-center h-full px-12">
          <div className="text-center max-w-md">
            <blockquote className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
              Shipping simplified.
              <br />
              Costs clarified.
            </blockquote>
            <p className="text-lg text-neutral-400 mt-6">
              Your all-in-one platform for intelligent sourcing decisions.
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
          <div className="w-8 h-8 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-neutral-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
