-- ============================================================================
-- RLS 정책 단순화 스크립트 (무한 재귀 완전 해결)
-- ============================================================================
-- 
-- 이 스크립트는 무한 재귀 문제를 완전히 해결하기 위해
-- 가장 단순하고 안전한 RLS 정책으로 교체합니다.
-- 
-- 실행 방법:
-- 1. Supabase 대시보드 > SQL Editor로 이동
-- 2. 이 파일의 내용을 복사하여 실행
-- ============================================================================

-- ============================================================================
-- 1. Profiles 테이블 정책 초기화 (가장 중요)
-- ============================================================================

-- 기존에 꼬인 정책들 삭제
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile." ON profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- 모든 기존 정책 동적 삭제
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', r.policyname);
    END LOOP;
END $$;

-- 심플 정책 적용 (무한 루프 방지)
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. Projects 테이블 정책 초기화
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Managers can view assigned projects" ON projects;
DROP POLICY IF EXISTS "Managers can update assigned projects" ON projects;
DROP POLICY IF EXISTS "Super admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Super admins can update all projects" ON projects;

-- 모든 기존 정책 동적 삭제
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'projects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON projects', r.policyname);
    END LOOP;
END $$;

-- 심플 정책 적용
CREATE POLICY "Users can view own projects" 
    ON projects FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" 
    ON projects FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" 
    ON projects FOR UPDATE 
    USING (auth.uid() = user_id);

-- 매니저 정책 (manager_id 직접 비교, profiles 테이블 조회 없음)
CREATE POLICY "Managers can view assigned projects" 
    ON projects FOR SELECT 
    USING (manager_id = auth.uid());

CREATE POLICY "Managers can update assigned projects" 
    ON projects FOR UPDATE 
    USING (manager_id = auth.uid());

-- ============================================================================
-- 3. Messages 테이블 정책 초기화
-- ============================================================================

DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can create messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages in own projects" ON messages;
DROP POLICY IF EXISTS "Users can create messages in own projects" ON messages;
DROP POLICY IF EXISTS "Managers can view messages in assigned projects" ON messages;
DROP POLICY IF EXISTS "Managers can create messages in assigned projects" ON messages;

-- 모든 기존 정책 동적 삭제
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'messages'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON messages', r.policyname);
    END LOOP;
END $$;

-- 심플 정책 적용 (서브쿼리 최소화)
CREATE POLICY "Users can view messages" 
    ON messages FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = messages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages" 
    ON messages FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = messages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- 매니저 정책
CREATE POLICY "Managers can view messages in assigned projects" 
    ON messages FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = messages.project_id 
            AND projects.manager_id = auth.uid()
        )
    );

CREATE POLICY "Managers can create messages in assigned projects" 
    ON messages FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = messages.project_id 
            AND projects.manager_id = auth.uid()
        )
    );

-- ============================================================================
-- 정책 확인 쿼리
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
-- WHERE tablename IN ('profiles', 'projects', 'messages')
-- ORDER BY tablename, policyname;
-- ============================================================================
