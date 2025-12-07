-- ============================================================================
-- Migration: Add 'saved' status to projects table
-- ============================================================================
-- 
-- 이 마이그레이션은 projects 테이블의 status 컬럼에 'saved' 값을 허용하도록 수정합니다.
-- 
-- 실행 방법:
-- 1. Supabase 대시보드 > SQL Editor로 이동
-- 2. 이 파일의 내용을 복사하여 실행
-- ============================================================================

-- 기존 CHECK 제약조건 제거
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- 새로운 CHECK 제약조건 추가 ('saved' 포함)
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('active', 'completed', 'archived', 'saved'));

-- ============================================================================
-- 마이그레이션 완료
-- ============================================================================
