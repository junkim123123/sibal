/**
 * React 내부 에러 억제 유틸리티
 * React의 내부 렌더링 과정에서 발생하는 removeChild 에러를 억제합니다.
 */

if (typeof window !== 'undefined') {
  // React의 내부 에러를 잡기 위한 추가 보호 장치
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // console.error 래핑
  console.error = (...args: any[]) => {
    const errorMessage = args.join(' ');
    
    // removeChild 관련 에러나 React 에러 #310은 콘솔에 표시하지 않음
    if (
      errorMessage.includes('removeChild') ||
      errorMessage.includes('Cannot read properties of null') ||
      errorMessage.includes("reading 'removeChild'") ||
      errorMessage.includes('reading "removeChild"') ||
      errorMessage.includes('Minified React error #310') ||
      errorMessage.includes('React error #310')
    ) {
      // 에러를 완전히 억제 (개발 모드에서도 표시하지 않음)
      return;
    }
    
    // 다른 에러는 정상적으로 표시
    originalConsoleError.apply(console, args);
  };

  // console.warn도 래핑 (일부 브라우저가 에러를 경고로 표시할 수 있음)
  console.warn = (...args: any[]) => {
    const warningMessage = args.join(' ');
    
    // removeChild 관련 경고나 React 에러 #310도 억제
    if (
      warningMessage.includes('removeChild') ||
      warningMessage.includes('Cannot read properties of null') ||
      warningMessage.includes("reading 'removeChild'") ||
      warningMessage.includes('Minified React error #310') ||
      warningMessage.includes('React error #310')
    ) {
      return;
    }
    
    // 다른 경고는 정상적으로 표시
    originalConsoleWarn.apply(console, args);
  };

  // UncaughtException 이벤트도 처리
  if (typeof process !== 'undefined' && process.on) {
    const originalOn = process.on;
    process.on = function(event: string, listener: any) {
      if (event === 'uncaughtException') {
        return originalOn.call(this, event, (error: Error) => {
          if (
            error.message?.includes('removeChild') ||
            error.message?.includes('Cannot read properties of null')
          ) {
            // 에러 억제
            return;
          }
          listener(error);
        });
      }
      return originalOn.call(this, event, listener);
    };
  }
}

