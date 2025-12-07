-- ============================================================================
-- Migration: Add Analysis Usage Tracking to profiles table
-- ============================================================================
-- 
-- 이 마이그레이션은 사용자의 AI 분석 사용량을 추적하기 위한 컬럼을 추가합니다.
-- 
-- 실행 방법:
-- 1. Supabase 대시보드 > SQL Editor로 이동
-- 2. 이 파일의 내용을 복사하여 실행
-- ============================================================================

-- profiles 테이블에 분석 사용량 추적 컬럼 추가
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS analysis_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS last_analysis_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS has_active_subscription BOOLEAN DEFAULT false NOT NULL;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_profiles_has_active_subscription 
  ON profiles(has_active_subscription);

CREATE INDEX IF NOT EXISTS idx_profiles_last_analysis_date 
  ON profiles(last_analysis_date);

-- 기존 사용자들의 기본값 설정
UPDATE profiles
SET 
  analysis_count = 0,
  has_active_subscription = false
WHERE 
  analysis_count IS NULL 
  OR has_active_subscription IS NULL;

-- ============================================================================
-- 마이그레이션 완료
-- ============================================================================
