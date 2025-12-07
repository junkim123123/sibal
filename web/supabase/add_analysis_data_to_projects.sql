-- ============================================================================
-- Add analysis_data JSONB field to projects table
-- ============================================================================
-- 
-- 이 마이그레이션은 projects 테이블에 analysis_data JSONB 필드를 추가합니다.
-- 이 필드는 사용자의 answers와 AI 분석 결과(ai_analysis)를 저장합니다.
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

-- 기존 프로젝트의 analysis_data를 NULL로 초기화 (이미 NULL이면 영향 없음)
-- UPDATE projects SET analysis_data = NULL WHERE analysis_data IS NULL;

-- ============================================================================
-- 마이그레이션 완료
-- ============================================================================
-- 
-- 이제 projects 테이블에 analysis_data 필드가 추가되었습니다.
-- 이 필드를 사용하여 사용자의 answers와 AI 분석 결과를 저장하고 불러올 수 있습니다.
-- 
-- 사용 예시:
-- UPDATE projects 
-- SET analysis_data = jsonb_build_object(
--   'answers', '{"product_info": "wireless mouse", ...}'::jsonb,
--   'ai_analysis', '{"financials": {...}, ...}'::jsonb
-- )
-- WHERE id = 'project-id';
-- 
-- 조회 예시:
-- SELECT 
--   id,
--   name,
--   analysis_data->'answers' as answers,
--   analysis_data->'ai_analysis' as ai_analysis
-- FROM projects
-- WHERE id = 'project-id';
-- ============================================================================
