-- ============================================================================
-- Fix Infinite Recursion in factory_quotes RLS Policies
-- ============================================================================
-- 
-- 문제: factory_quotes의 RLS 정책이 projects를 조회할 때,
--      projects의 RLS 정책이 profiles를 조회하고,
--      profiles의 RLS 정책이 다시 profiles를 조회하면서 무한 재귀 발생
-- 
-- 해결: factory_quotes의 RLS 정책을 직접적으로 수정하여
--      projects 테이블의 user_id와 manager_id를 직접 비교
-- ============================================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view quotes in own projects" ON factory_quotes;
DROP POLICY IF EXISTS "Users can update quote status in own projects" ON factory_quotes;
DROP POLICY IF EXISTS "Managers can view quotes in assigned projects" ON factory_quotes;
DROP POLICY IF EXISTS "Managers can create quotes in assigned projects" ON factory_quotes;
DROP POLICY IF EXISTS "Managers can update quotes in assigned projects" ON factory_quotes;

-- 새로운 정책 생성 (무한 재귀 방지)
-- 직접 projects.user_id와 projects.manager_id를 비교하여 profiles 테이블을 거치지 않음

-- 사용자는 자신의 프로젝트에 속한 견적만 조회 가능
CREATE POLICY "Users can view quotes in own projects"
    ON factory_quotes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = factory_quotes.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- 사용자는 자신의 프로젝트에 속한 견적의 상태를 업데이트 가능
CREATE POLICY "Users can update quote status in own projects"
    ON factory_quotes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = factory_quotes.project_id
            AND projects.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = factory_quotes.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- 매니저는 할당된 프로젝트의 견적 조회 가능
-- profiles 테이블을 거치지 않고 직접 manager_id 비교
CREATE POLICY "Managers can view quotes in assigned projects"
    ON factory_quotes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = factory_quotes.project_id
            AND projects.manager_id = auth.uid()
        )
    );

-- 매니저는 할당된 프로젝트의 견적 생성 가능
CREATE POLICY "Managers can create quotes in assigned projects"
    ON factory_quotes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = factory_quotes.project_id
            AND projects.manager_id = auth.uid()
        )
    );

-- 매니저는 할당된 프로젝트의 견적 업데이트 가능
CREATE POLICY "Managers can update quotes in assigned projects"
    ON factory_quotes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = factory_quotes.project_id
            AND projects.manager_id = auth.uid()
        )
    );

-- ============================================================================
-- 추가 최적화: projects 테이블의 Manager 정책도 최적화
-- ============================================================================
-- 
-- projects 테이블의 "Managers can view assigned projects" 정책도
-- profiles를 거치지 않고 직접 manager_id를 비교하도록 수정
-- ============================================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Managers can view assigned projects" ON projects;
DROP POLICY IF EXISTS "Managers can update assigned projects" ON projects;

-- 최적화된 정책 생성 (profiles 테이블 조회 제거)
-- manager_id를 직접 비교하여 무한 재귀 방지
CREATE POLICY "Managers can view assigned projects"
    ON projects FOR SELECT
    USING (manager_id = auth.uid());

CREATE POLICY "Managers can update assigned projects"
    ON projects FOR UPDATE
    USING (manager_id = auth.uid());

-- ============================================================================
-- 정책 확인
-- ============================================================================
-- 
-- 다음 쿼리로 정책이 올바르게 생성되었는지 확인:
-- 
-- SELECT 
--     schemaname,
--     tablename,
--     policyname,
--     cmd,
--     qual
-- FROM pg_policies 
-- WHERE tablename IN ('factory_quotes', 'projects')
-- ORDER BY tablename, policyname;
-- ============================================================================
