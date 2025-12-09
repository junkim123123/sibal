/**
 * 안전한 라우팅 유틸리티
 * AnimatePresence의 exit 애니메이션이 완료된 후 라우팅을 수행하여
 * removeChild 에러를 방지합니다.
 */

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * DOM 업데이트가 완료될 때까지 기다립니다
 */
export function waitForDOMUpdate(): Promise<void> {
  return new Promise((resolve) => {
    // requestAnimationFrame을 두 번 사용하여 브라우저 렌더링 사이클 완료 보장
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // 추가로 약간의 지연을 두어 DOM 정리 완료 보장
        setTimeout(resolve, 50);
      });
    });
  });
}

/**
 * 안전한 라우팅 함수
 * DOM 업데이트와 애니메이션 완료를 기다린 후 라우팅을 수행합니다.
 */
export async function safeNavigate(
  router: AppRouterInstance,
  path: string,
  options?: {
    waitTime?: number;
    onBeforeNavigate?: () => void | Promise<void>;
    onError?: (error: Error) => void;
  }
): Promise<void> {
  const { waitTime = 300, onBeforeNavigate, onError } = options || {};

  try {
    // 사전 작업 실행
    if (onBeforeNavigate) {
      await onBeforeNavigate();
    }

    // DOM 업데이트 대기 (더 긴 대기 시간)
    await waitForDOMUpdate();

    // 모든 애니메이션이 완료될 때까지 대기
    // AnimatePresence의 exit 애니메이션은 보통 200-300ms 소요
    await new Promise((resolve) => setTimeout(resolve, Math.max(waitTime, 300)));

    // 추가로 React의 렌더링 사이클이 완료될 때까지 대기
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 50);
          });
        });
      });
    });

    // 라우팅 실행
    await router.push(path);
  } catch (error) {
    console.error('[safeNavigate] Navigation error:', error);
    if (onError) {
      onError(error as Error);
    } else {
      // 기본 에러 처리: 강제로 라우팅 시도
      try {
        window.location.href = path;
      } catch (fallbackError) {
        console.error('[safeNavigate] Fallback navigation also failed:', fallbackError);
      }
    }
  }
}

/**
 * AnimatePresence의 exit 애니메이션이 완료될 때까지 기다립니다
 */
export function waitForAnimationComplete(
  element: HTMLElement | null,
  timeout: number = 500
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!element) {
      resolve();
      return;
    }

    const startTime = Date.now();
    const checkInterval = 16; // ~60fps

    const checkAnimation = () => {
      const elapsed = Date.now() - startTime;
      
      // 타임아웃 체크
      if (elapsed > timeout) {
        resolve();
        return;
      }

      // 요소가 DOM에서 제거되었는지 확인
      if (!document.body.contains(element)) {
        resolve();
        return;
      }

      // 애니메이션이 실행 중인지 확인
      const computedStyle = window.getComputedStyle(element);
      const isAnimating = 
        computedStyle.transition !== 'none' ||
        computedStyle.animationName !== 'none' ||
        computedStyle.opacity === '0';

      if (!isAnimating && elapsed > 100) {
        // 애니메이션이 완료된 것으로 간주
        resolve();
        return;
      }

      // 다음 프레임에서 다시 확인
      setTimeout(checkAnimation, checkInterval);
    };

    checkAnimation();
  });
}

