-- ============================================================================
-- analysis_data 컬럼 추가 (프로젝트가 없으면 추가)
-- ============================================================================
-- 
-- 이 스크립트는 projects 테이블에 analysis_data JSONB 컬럼이 없으면 추가합니다.
-- Supabase SQL Editor에서 실행하세요.
-- ============================================================================

-- 1. analysis_data 컬럼 추가 (없는 경우에만)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'analysis_data'
    ) THEN
        ALTER TABLE projects ADD COLUMN analysis_data JSONB DEFAULT NULL;
        RAISE NOTICE 'analysis_data 컬럼이 추가되었습니다.';
    ELSE
        RAISE NOTICE 'analysis_data 컬럼이 이미 존재합니다.';
    END IF;
END $$;

-- 2. GIN 인덱스 생성 (JSONB 검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_projects_analysis_data 
    ON projects USING GIN (analysis_data);

-- 3. 현재 상태 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'projects'
AND column_name = 'analysis_data';

-- 4. 기존 프로젝트 확인 (analysis_data가 있는지)
SELECT 
    id,
    name,
    status,
    CASE 
        WHEN analysis_data IS NULL THEN 'No analysis_data'
        WHEN analysis_data->>'answers' IS NULL THEN 'No answers'
        WHEN analysis_data->>'ai_analysis' IS NULL THEN 'No ai_analysis'
        ELSE 'Has both'
    END as data_status
FROM projects
ORDER BY created_at DESC;
