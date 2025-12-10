'use client'

import { useEffect } from 'react'

/**
 * 전역 에러 핸들러
 * 외부 스크립트(브라우저 확장 프로그램 등)의 오류를 완전히 차단합니다.
 */
export function ErrorHandler() {
  useEffect(() => {
    // 원본 콘솔 메서드 저장
    const originalError = console.error
    const originalWarn = console.warn

    // 콘솔 오류 필터링
    console.error = (...args: any[]) => {
      const message = args.join(' ')
      // itemscout.io 관련 오류 무시
      if (
        message.includes('itemscout.io') ||
        message.includes('4bd1b696-182b6b13bdad92e3.js') ||
        message.includes('removeChild') ||
        message.includes('Quirks Mode')
      ) {
        return // 오류 무시
      }
      originalError.apply(console, args)
    }

    console.warn = (...args: any[]) => {
      const message = args.join(' ')
      // Quirks Mode 경고 무시
      if (
        message.includes('Quirks Mode') ||
        message.includes('itemscout.io') ||
        message.includes('4bd1b696-182b6b13bdad92e3.js')
      ) {
        return // 경고 무시
      }
      originalWarn.apply(console, args)
    }

    // 외부 스크립트 오류 완전 차단
    const handleError = (e: ErrorEvent) => {
      const filename = e.filename || ''
      const message = e.message || ''
      
      // itemscout.io 및 관련 스크립트 오류 완전 차단
      if (
        filename.includes('itemscout.io') ||
        filename.includes('4bd1b696-182b6b13bdad92e3.js') ||
        filename.includes('extension://') ||
        filename.includes('chrome-extension://') ||
        message.includes('removeChild') ||
        message.includes('itemscout')
      ) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        return false
      }
    }

    // Unhandled Promise Rejection 차단
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason
      const reasonStr = typeof reason === 'string' 
        ? reason 
        : reason instanceof Error 
        ? reason.message 
        : String(reason)
      
      if (
        reasonStr.includes('removeChild') ||
        reasonStr.includes('itemscout') ||
        reasonStr.includes('4bd1b696')
      ) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    // 이벤트 리스너 등록 (capture phase에서 먼저 처리)
    window.addEventListener('error', handleError, true)
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true)

    // 추가: DOM 조작 오류 차단
    const originalRemoveChild = Node.prototype.removeChild
    Node.prototype.removeChild = function(child: Node) {
      try {
        return originalRemoveChild.call(this, child)
      } catch (e: any) {
        // itemscout.io 관련 오류 무시
        if (e && e.message && e.message.includes('removeChild')) {
          return child
        }
        throw e
      }
    }

    return () => {
      // 정리
      window.removeEventListener('error', handleError, true)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true)
      console.error = originalError
      console.warn = originalWarn
      Node.prototype.removeChild = originalRemoveChild
    }
  }, [])

  return null
}

