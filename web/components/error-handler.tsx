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

    // 외부 스크립트 오류 완전 차단 (ErrorEvent만 처리, 클릭 이벤트는 자동으로 무시됨)
    const handleError = (e: ErrorEvent) => {
      // ErrorEvent는 클릭 이벤트와 별개이므로 자동으로 구분됨
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

    // MutationObserver로 외부 스크립트/iframe 감지 및 제거
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement
            
            // itemscout.io 관련 스크립트 태그 제거
            if (element.tagName === 'SCRIPT') {
              const script = element as HTMLScriptElement
              if (
                script.src?.includes('itemscout.io') ||
                script.src?.includes('4bd1b696-182b6b13bdad92e3.js')
              ) {
                // console.log('[ErrorHandler] Blocked itemscout.io script:', script.src)
                script.remove()
                return
              }
            }
            
            // itemscout.io 관련 iframe 제거
            if (element.tagName === 'IFRAME') {
              const iframe = element as HTMLIFrameElement
              if (
                iframe.src?.includes('itemscout.io') ||
                iframe.src?.includes('pixel.itemscout.io')
              ) {
                // console.log('[ErrorHandler] Blocked itemscout.io iframe:', iframe.src)
                iframe.remove()
                return
              }
            }
            
            // 내부에 itemscout.io 관련 요소가 있는지 확인
            const itemscoutElements = element.querySelectorAll?.(
              'script[src*="itemscout.io"], iframe[src*="itemscout.io"]'
            )
            itemscoutElements?.forEach((el) => {
              // console.log('[ErrorHandler] Blocked nested itemscout.io element')
              el.remove()
            })
          }
        })
      })
    })

    // DOM 전체 감시 시작
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })

    // 기존 itemscout.io 요소 제거
    const removeExistingItemscoutElements = () => {
      const scripts = document.querySelectorAll('script[src*="itemscout.io"]')
      scripts.forEach((script) => {
        // console.log('[ErrorHandler] Removed existing itemscout.io script')
        script.remove()
      })

      const iframes = document.querySelectorAll('iframe[src*="itemscout.io"]')
      iframes.forEach((iframe) => {
        // console.log('[ErrorHandler] Removed existing itemscout.io iframe')
        iframe.remove()
      })
    }

    // 즉시 실행 및 주기적 체크 (빈도 감소로 성능 개선)
    removeExistingItemscoutElements()
    const checkInterval = setInterval(removeExistingItemscoutElements, 2000) // 1초 -> 2초로 변경

    return () => {
      // 정리
      window.removeEventListener('error', handleError, true)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true)
      console.error = originalError
      console.warn = originalWarn
      Node.prototype.removeChild = originalRemoveChild
      observer.disconnect()
      clearInterval(checkInterval)
    }
  }, [])

  return null
}

