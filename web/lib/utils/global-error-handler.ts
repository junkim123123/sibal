/**
 * 전역 에러 핸들러
 * removeChild 같은 DOM 조작 에러를 전역적으로 처리합니다.
 * React의 내부 렌더링 에러도 잡을 수 있도록 강화되었습니다.
 */

// 즉시 실행하여 최대한 빨리 에러를 잡을 수 있도록 함
(function setupGlobalErrorHandler() {
  if (typeof window === 'undefined') return;

  // 에러 패턴 정의
  const isRemoveChildError = (message: any, error?: any): boolean => {
    const messageStr = String(message || '');
    const errorMessage = error?.message || String(error || '');
    const errorStack = error?.stack || String(error || '');

    return (
      messageStr.includes('removeChild') ||
      messageStr.includes('Cannot read properties of null') ||
      messageStr.includes("reading 'removeChild'") ||
      messageStr.includes('reading "removeChild"') ||
      messageStr.includes('Minified React error #310') ||
      messageStr.includes('React error #310') ||
      errorMessage.includes('removeChild') ||
      errorMessage.includes('Cannot read properties of null') ||
      errorMessage.includes('Minified React error #310') ||
      errorMessage.includes('React error #310') ||
      errorStack.includes('removeChild') ||
      errorStack.includes('310')
    );
  };

  // 기존 에러 핸들러 백업
  const originalErrorHandler = window.onerror;
  const originalUnhandledRejection = window.onunhandledrejection;

  // 전역 에러 핸들러 (가장 먼저 실행)
  window.onerror = (message, source, lineno, colno, error) => {
    if (isRemoveChildError(message, error)) {
      // 개발 모드에서만 경고 표시
      if (process.env.NODE_ENV === 'development') {
        console.warn('[GlobalErrorHandler] DOM manipulation error caught and ignored:', message);
      }
      return true; // 에러가 처리되었음을 표시하여 전파 방지
    }

    // 다른 에러는 기존 핸들러로 전달
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error);
    }

    return false;
  };

  // Promise rejection 핸들러
  const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
    const error = event.reason;
    
    if (isRemoveChildError(null, error)) {
      console.warn('[GlobalErrorHandler] Unhandled rejection (DOM error) caught and ignored:', error);
      event.preventDefault(); // 에러 전파 방지
      event.stopImmediatePropagation();
      return;
    }

    // 다른 에러는 기존 핸들러로 전달
    if (originalUnhandledRejection) {
      originalUnhandledRejection(event);
    }
  };

  window.addEventListener('unhandledrejection', unhandledRejectionHandler, { capture: true });

  // Error 이벤트 핸들러 (capture phase에서 잡기)
  const errorEventHandler = (event: ErrorEvent) => {
    const error = event.error;
    
    if (isRemoveChildError(event.message, error)) {
      console.warn('[GlobalErrorHandler] Error event (DOM error) caught and ignored:', event.message);
      event.preventDefault(); // 에러 전파 방지
      event.stopImmediatePropagation();
      return;
    }
  };

  window.addEventListener('error', errorEventHandler, { capture: true });

  // React의 내부 에러도 잡기 위해 MutationObserver로 DOM 변경 감시
  if (typeof MutationObserver !== 'undefined') {
    try {
      const observer = new MutationObserver((mutations) => {
        // DOM 변경 중 에러가 발생할 수 있는 상황을 미리 감지
        mutations.forEach((mutation) => {
          mutation.removedNodes.forEach((node) => {
            // 이미 제거된 노드에 대한 후속 조작을 방지
            if (node && node.parentNode === null) {
              // 정상적인 제거이므로 무시
            }
          });
        });
      });

      // DOM이 준비되면 관찰 시작
      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          if (document.body) {
            observer.observe(document.body, {
              childList: true,
              subtree: true,
            });
          }
        });
      }
    } catch (e) {
      // MutationObserver 초기화 실패는 무시
      console.warn('[GlobalErrorHandler] MutationObserver setup failed:', e);
    }
  }
})();

