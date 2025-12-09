'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 전역 에러 바운더리
 * removeChild 같은 DOM 조작 에러를 잡아서 앱이 크래시되지 않도록 합니다.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // removeChild 에러는 무시 (이미 처리된 DOM 조작)
    const errorMessage = error.message || String(error);
    const errorStack = error.stack || '';
    
    if (
      errorMessage.includes('removeChild') || 
      errorMessage.includes('Cannot read properties of null') ||
      errorStack.includes('removeChild')
    ) {
      // 에러를 완전히 억제하고 상태를 즉시 리셋
      this.setState({ hasError: false, error: null });
      return;
    }

    // 다른 에러는 로깅
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // removeChild 에러는 무시하고 정상 렌더링 계속
      if (this.state.error?.message?.includes('removeChild') || 
          this.state.error?.message?.includes('Cannot read properties of null')) {
        return this.props.children;
      }

      // 다른 에러는 fallback 표시
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

