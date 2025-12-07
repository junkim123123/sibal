'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, Mail, ArrowLeft } from 'lucide-react'

function AuthCodeErrorContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            인증 코드 오류
          </h1>
          <p className="text-gray-600">
            이메일 확인 링크를 처리하는 중 문제가 발생했습니다.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            가능한 원인:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-red-700 list-disc list-inside">
            <li>링크가 만료되었거나 이미 사용되었습니다</li>
            <li>링크가 손상되었거나 잘못되었습니다</li>
            <li>서버 연결 문제가 발생했습니다</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white"
          >
            <Link href="/login">
              <Mail className="mr-2 h-4 w-4" />
              새 인증 이메일 요청
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              로그인 페이지로 돌아가기
            </Link>
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            문제가 계속되면{' '}
            <Link href="/contact" className="text-zinc-900 hover:underline">
              고객 지원팀
            </Link>
            에 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    }>
      <AuthCodeErrorContent />
    </Suspense>
  )
}
