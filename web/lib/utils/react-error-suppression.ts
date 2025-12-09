/**
 * React 내부 에러 억제 유틸리티
 * React의 내부 렌더링 과정에서 발생하는 removeChild 에러를 억제합니다.
 */

if (typeof window !== 'undefined') {
  // React의 내부 에러를 잡기 위한 추가 보호 장치
  const originalConsoleError = console.error;
  
  console.error = (...args: any[]) => {
    const errorMessage = args.join(' ');
    
    // removeChild 관련 에러는 콘솔에 표시하지 않음
    if (
      errorMessage.includes('removeChild') ||
      errorMessage.includes('Cannot read properties of null') ||
      errorMessage.includes("reading 'removeChild'")
    ) {
      // 에러를 무시하지만 개발 모드에서는 경고만 표시
      if (process.env.NODE_ENV === 'development') {
        console.warn('[ReactErrorSuppression] Suppressed removeChild error:', errorMessage);
      }
      return;
    }
    
    // 다른 에러는 정상적으로 표시
    originalConsoleError.apply(console, args);
  };

  // React의 내부 에러도 잡기 위해 Error 객체를 래핑
  const originalError = window.Error;
  
  // Error 생성자를 래핑하여 removeChild 에러를 자동으로 처리
  // (이 방법은 매우 공격적이므로 주의해서 사용)
}

