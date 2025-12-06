'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, signup } from './actions'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)

    try {
      const result = isSignUp
        ? await signup(formData)
        : await login(formData)

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('알 수 없는 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card border border-subtle-border rounded-lg p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isSignUp ? '회원가입' : '로그인'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSignUp
                ? '새 계정을 만들어 시작하세요'
                : '계정에 로그인하세요'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-subtle-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-subtle-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={isLoading}
                minLength={6}
              />
              {isSignUp && (
                <p className="mt-2 text-xs text-muted-foreground">
                  비밀번호는 최소 6자 이상이어야 합니다
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading
                ? '처리 중...'
                : isSignUp
                ? '회원가입'
                : '로그인'}
            </Button>
          </form>

          {/* Toggle Sign Up/Login */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {isSignUp ? (
                <>
                  이미 계정이 있으신가요?{' '}
                  <span className="font-medium text-primary">로그인</span>
                </>
              ) : (
                <>
                  계정이 없으신가요?{' '}
                  <span className="font-medium text-primary">회원가입</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
