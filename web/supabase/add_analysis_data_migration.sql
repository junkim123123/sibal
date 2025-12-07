-- ============================================================================
-- Add analysis_data field to projects table
-- ============================================================================
-- 
-- 이 마이그레이션은 새로 생성한 스키마에 analysis_data 필드를 추가합니다.
-- 저장된 프로젝트의 answers와 ai_analysis를 불러오기 위해 필요합니다.
-- 
-- 실행 방법:
-- 1. Supabase 대시보드 > SQL Editor로 이동
-- 2. 이 파일의 전체 내용을 복사하여 실행
-- ============================================================================

-- analysis_data JSONB 필드 추가
-- 구조: { "answers": {...}, "ai_analysis": {...} }
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS analysis_data JSONB DEFAULT NULL;

-- analysis_data 인덱스 추가 (선택적 - JSONB 쿼리 성능 향상)
CREATE INDEX IF NOT EXISTS idx_projects_analysis_data 
ON projects USING GIN (analysis_data) 
WHERE analysis_data IS NOT NULL;

-- ============================================================================
-- 마이그레이션 완료
-- ============================================================================
-- 
-- 이제 projects 테이블에 analysis_data 필드가 추가되었습니다.
-- 이 필드를 사용하여 사용자의 answers와 AI 분석 결과를 저장하고 불러올 수 있습니다.
-- ============================================================================
