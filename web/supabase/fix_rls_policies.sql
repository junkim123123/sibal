-- ============================================================================
-- RLS 정책 확인 및 수정 스크립트
-- ============================================================================
-- 
-- 이 스크립트는 projects 테이블의 RLS 정책을 확인하고 필요시 재생성합니다.
-- Supabase SQL Editor에서 실행하세요.
-- ============================================================================

-- 1. 기존 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY policyname;

-- 2. 기존 정책 삭제 (필요시)
-- 주의: 이 명령은 기존 정책을 모두 삭제합니다. 신중하게 사용하세요.
-- DROP POLICY IF EXISTS "Users can view own projects" ON projects;
-- DROP POLICY IF EXISTS "Users can create own projects" ON projects;
-- DROP POLICY IF EXISTS "Users can update own projects" ON projects;
-- DROP POLICY IF EXISTS "Super admins can view all projects" ON projects;
-- DROP POLICY IF EXISTS "Super admins can update all projects" ON projects;
-- DROP POLICY IF EXISTS "Managers can view assigned projects" ON projects;
-- DROP POLICY IF EXISTS "Managers can update assigned projects" ON projects;

-- 3. RLS 활성화 확인
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 4. 사용자 자신의 프로젝트 조회 정책 (SELECT)
-- 이미 존재하는 경우 무시하고 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'projects' 
        AND policyname = 'Users can view own projects'
    ) THEN
        CREATE POLICY "Users can view own projects"
            ON projects FOR SELECT
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. 사용자 자신의 프로젝트 생성 정책 (INSERT)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'projects' 
        AND policyname = 'Users can create own projects'
    ) THEN
        CREATE POLICY "Users can create own projects"
            ON projects FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 6. 사용자 자신의 프로젝트 업데이트 정책 (UPDATE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'projects' 
        AND policyname = 'Users can update own projects'
    ) THEN
        CREATE POLICY "Users can update own projects"
            ON projects FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- 7. Super Admin 조회 정책 (SELECT)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'projects' 
        AND policyname = 'Super admins can view all projects'
    ) THEN
        CREATE POLICY "Super admins can view all projects"
            ON projects FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = 'super_admin'
                )
            );
    END IF;
END $$;

-- 8. Super Admin 업데이트 정책 (UPDATE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'projects' 
        AND policyname = 'Super admins can update all projects'
    ) THEN
        CREATE POLICY "Super admins can update all projects"
            ON projects FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = 'super_admin'
                )
            );
    END IF;
END $$;

-- 9. Manager 조회 정책 (SELECT)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'projects' 
        AND policyname = 'Managers can view assigned projects'
    ) THEN
        CREATE POLICY "Managers can view assigned projects"
            ON projects FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.is_manager = TRUE
                )
                AND manager_id = auth.uid()
            );
    END IF;
END $$;

-- 10. Manager 업데이트 정책 (UPDATE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'projects' 
        AND policyname = 'Managers can update assigned projects'
    ) THEN
        CREATE POLICY "Managers can update assigned projects"
            ON projects FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.is_manager = TRUE
                )
                AND manager_id = auth.uid()
            );
    END IF;
END $$;

-- 11. 정책 확인 (최종)
SELECT 
    policyname,
    cmd as operation,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual::text
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check::text
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY policyname;

-- 12. 테스트 쿼리 (현재 사용자가 자신의 프로젝트를 조회할 수 있는지 확인)
-- 주의: 이 쿼리는 인증된 사용자 컨텍스트에서 실행해야 합니다.
-- SELECT 
--     id,
--     name,
--     status,
--     user_id,
--     created_at
-- FROM projects
-- WHERE status = 'saved'
-- ORDER BY created_at DESC;

-- ============================================================================
-- 문제 해결 체크리스트
-- ============================================================================
-- 
-- 1. RLS가 활성화되어 있는지 확인:
--    SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'projects';
--    결과: rowsecurity = true 여야 함
--
-- 2. 정책이 올바르게 생성되었는지 확인:
--    위의 11번 쿼리 실행 결과 확인
--
-- 3. 사용자 ID가 올바른지 확인:
--    SELECT auth.uid() as current_user_id;
--
-- 4. 프로젝트의 user_id와 현재 사용자 ID가 일치하는지 확인:
--    SELECT id, name, status, user_id, auth.uid() as current_user_id
--    FROM projects
--    WHERE status = 'saved';
--
-- 5. API가 adminClient를 사용하는 경우 RLS를 우회하므로,
--    API 응답을 확인하여 실제로 데이터가 반환되는지 확인
-- ============================================================================
