'use client'

import { useEffect } from 'react'

/**
 * 전역 에러 핸들러
 * 외부 스크립트(브라우저 확장 프로그램 등)의 오류를 무시합니다.
 */
export function ErrorHandler() {
  useEffect(() => {
    // 외부 스크립트 오류 무시 (브라우저 확장 프로그램 등)
    const handleError = (e: ErrorEvent) => {
      // itemscout.io 같은 외부 스크립트 오류 무시
      if (e.filename && (
        e.filename.includes('itemscout.io') ||
        e.filename.includes('extension://') ||
        e.filename.includes('chrome-extension://')
      )) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    // Uncaught TypeError 무시 (removeChild 등)
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      if (e.reason && (
        (typeof e.reason === 'string' && e.reason.includes('removeChild')) ||
        (e.reason instanceof Error && e.reason.message.includes('removeChild'))
      )) {
        e.preventDefault()
        return false
      }
    }

    window.addEventListener('error', handleError, true)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError, true)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}

