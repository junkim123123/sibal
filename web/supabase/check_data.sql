-- ============================================================================
-- 데이터 확인 쿼리
-- ============================================================================
-- 
-- Supabase SQL Editor에서 실행하여 현재 데이터 상태를 확인합니다.
-- ============================================================================

-- 1. 프로젝트 목록 확인
SELECT 
    id,
    name,
    status,
    user_id,
    created_at,
    CASE 
        WHEN analysis_data IS NULL THEN 'No data'
        WHEN analysis_data->>'answers' IS NULL THEN 'No answers'
        WHEN analysis_data->>'ai_analysis' IS NULL THEN 'No ai_analysis'
        ELSE 'Has both'
    END as data_status,
    jsonb_object_keys(analysis_data) as data_keys
FROM projects
ORDER BY created_at DESC;

-- 2. 프로젝트별 메시지 개수 확인
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.status,
    COUNT(m.id) as message_count,
    CASE 
        WHEN p.analysis_data IS NULL THEN 'No analysis_data'
        WHEN p.analysis_data->>'answers' IS NOT NULL THEN 'Has answers'
        ELSE 'No answers'
    END as has_answers,
    CASE 
        WHEN p.analysis_data->>'ai_analysis' IS NOT NULL THEN 'Has ai_analysis'
        ELSE 'No ai_analysis'
    END as has_ai_analysis
FROM projects p
LEFT JOIN messages m ON m.project_id = p.id
GROUP BY p.id, p.name, p.status, p.analysis_data
ORDER BY p.created_at DESC;

-- 3. 메시지 상세 확인 (최근 10개)
SELECT 
    m.id,
    m.project_id,
    p.name as project_name,
    m.role,
    LEFT(m.content, 100) as content_preview,
    m.timestamp
FROM messages m
JOIN projects p ON p.id = m.project_id
ORDER BY m.timestamp DESC
LIMIT 10;

-- 4. analysis_data 구조 확인 (샘플)
SELECT 
    id,
    name,
    status,
    analysis_data
FROM projects
WHERE analysis_data IS NOT NULL
ORDER BY created_at DESC
LIMIT 1;

-- 5. 프로젝트별 전체 데이터 상태 요약
SELECT 
    COUNT(*) as total_projects,
    COUNT(CASE WHEN status = 'saved' THEN 1 END) as saved_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
    COUNT(CASE WHEN analysis_data IS NOT NULL THEN 1 END) as has_analysis_data,
    COUNT(CASE WHEN analysis_data->>'answers' IS NOT NULL THEN 1 END) as has_answers,
    COUNT(CASE WHEN analysis_data->>'ai_analysis' IS NOT NULL THEN 1 END) as has_ai_analysis
FROM projects;
