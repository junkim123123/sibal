-- ============================================================================
-- Migration: Add Subscription Fields to projects table
-- ============================================================================
-- 
-- 이 마이그레이션은 프로젝트별 구독 정보를 추적하기 위한 컬럼을 추가합니다.
-- 
-- 실행 방법:
-- 1. Supabase 대시보드 > SQL Editor로 이동
-- 2. 이 파일의 내용을 복사하여 실행
-- ============================================================================

-- projects 테이블에 구독 관련 컬럼 추가
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS is_paid_subscription BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id TEXT;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_projects_is_paid_subscription 
  ON projects(is_paid_subscription);

CREATE INDEX IF NOT EXISTS idx_projects_lemon_squeezy_subscription_id 
  ON projects(lemon_squeezy_subscription_id);

-- 기존 프로젝트들의 기본값 설정
UPDATE projects
SET is_paid_subscription = false
WHERE is_paid_subscription IS NULL;

-- ============================================================================
-- 마이그레이션 완료
-- ============================================================================
