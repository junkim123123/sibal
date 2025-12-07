-- ============================================================================
-- Fix Infinite Recursion in RLS Policies (Complete Fix)
-- ============================================================================
-- 
-- 문제: 
-- 1. factory_quotes의 RLS 정책이 projects를 조회할 때,
--    projects의 RLS 정책이 profiles를 조회하고,
--    profiles의 RLS 정책이 다시 profiles를 조회하면서 무한 재귀 발생
-- 2. profiles 테이블 자체의 RLS 정책도 무한 재귀를 일으킬 수 있음
-- 
-- 해결: 
-- 1. factory_quotes의 RLS 정책을 직접적으로 수정하여
--    projects 테이블의 user_id와 manager_id를 직접 비교
-- 2. profiles 테이블의 RLS 정책을 단순화하여 무한 재귀 방지
-- 3. projects 테이블의 Manager 정책도 최적화
-- ============================================================================

-- ============================================================================
-- 1. profiles 테이블 RLS 정책 초기화 및 재생성 (무한 재귀 방지)
-- ============================================================================

-- 기존 정책 삭제 (모든 가능한 정책명 포함)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- 깔끔한 새 정책 생성 (무한 루프 방지)
-- (1) 내 프로필은 내가 볼 수 있다
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

-- (2) 내 프로필은 내가 수정할 수 있다
CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- (3) 새 가입자는 프로필을 만들 수 있다
CREATE POLICY "Users can insert own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- (4) Super Admin은 모든 프로필을 볼 수 있다 (무한 재귀 방지)
-- 주의: 이 정책은 profiles 테이블을 다시 조회하지 않고 auth.users를 직접 사용
-- 또는 더 안전하게: Service Role Key를 사용하는 경우 이 정책이 필요 없을 수 있음
-- 필요시에만 활성화하세요
-- CREATE POLICY "Super admins can view all profiles"
--     ON profiles FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM auth.users
--             WHERE auth.users.id = auth.uid()
--             AND (auth.users.raw_user_meta_data->>'role')::text = 'super_admin'
--         )
--     );

-- ============================================================================
-- 2. factory_quotes 테이블 RLS 정책 수정
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
