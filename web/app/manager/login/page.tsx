/**
 * Manager Login Page
 * 
 * 매니저 전용 로그인 페이지
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { managerLogin } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Shield, ArrowLeft } from 'lucide-react'

export default function ManagerLoginPage() {
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
      const result = await managerLogin(formData)

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      } else {
        router.push('/manager/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col bg-white lg:w-1/2">
        {/* Logo & Back Button */}
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-neutral-900">NexSupply</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Client Login
            </Link>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-8 w-8 text-neutral-900" />
                <h1 className="text-3xl font-bold text-neutral-900">
                  Manager Login
                </h1>
              </div>
              <p className="text-sm text-neutral-600">
                This is a manager-only login. Only accessible if you have a manager account.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-900 mb-2"
                >
                  Manager Email
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
                  placeholder="manager@nexsupply.net"
                  disabled={isLoading}
                />
              </div>

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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all text-sm"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Manager Sign In'}
              </Button>
            </form>
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
            <Shield className="h-16 w-16 text-white mx-auto mb-6 opacity-80" />
            <blockquote className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
              Manager Portal
              <br />
              Command Center
            </blockquote>
            <p className="text-lg text-neutral-400 mt-6">
              Access your dashboard to manage projects and communicate with clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

