/**
 * 전역 에러 핸들러
 * removeChild 같은 DOM 조작 에러를 전역적으로 처리합니다.
 */

if (typeof window !== 'undefined') {
  // 기존 에러 핸들러 백업
  const originalErrorHandler = window.onerror;
  const originalUnhandledRejection = window.onunhandledrejection;

  // 전역 에러 핸들러
  window.onerror = (message, source, lineno, colno, error) => {
    // removeChild 에러는 무시
    if (
      typeof message === 'string' &&
      (message.includes('removeChild') ||
        message.includes('Cannot read properties of null') ||
        message.includes('reading \'removeChild\''))
    ) {
      console.warn('[GlobalErrorHandler] DOM manipulation error caught and ignored:', message);
      return true; // 에러가 처리되었음을 표시
    }

    // 다른 에러는 기존 핸들러로 전달
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error);
    }

    return false;
  };

  // Promise rejection 핸들러
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    const errorMessage = error?.message || String(error);

    // removeChild 에러는 무시
    if (
      errorMessage.includes('removeChild') ||
      errorMessage.includes('Cannot read properties of null') ||
      errorMessage.includes("reading 'removeChild'")
    ) {
      console.warn('[GlobalErrorHandler] Unhandled rejection (DOM error) caught and ignored:', errorMessage);
      event.preventDefault(); // 에러 전파 방지
      return;
    }

    // 다른 에러는 기존 핸들러로 전달
    if (originalUnhandledRejection) {
      originalUnhandledRejection(event);
    }
  });

  // React 에러 경계에서 잡히지 않는 에러 처리
  window.addEventListener('error', (event) => {
    const error = event.error;
    const errorMessage = error?.message || String(error);

    // removeChild 에러는 무시
    if (
      errorMessage.includes('removeChild') ||
      errorMessage.includes('Cannot read properties of null') ||
      errorMessage.includes("reading 'removeChild'")
    ) {
      console.warn('[GlobalErrorHandler] Error event (DOM error) caught and ignored:', errorMessage);
      event.preventDefault(); // 에러 전파 방지
      event.stopPropagation();
    }
  });
}

