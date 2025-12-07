-- ============================================================================
-- RLS 정책 업데이트 스크립트
-- ============================================================================
-- 
-- 이 스크립트는 모든 주요 테이블의 RLS 정책을 최적화하고
-- 무한 재귀 문제를 방지합니다.
-- 
-- 실행 방법:
-- 1. Supabase 대시보드 > SQL Editor로 이동
-- 2. 이 파일의 내용을 복사하여 실행
-- ============================================================================

-- ============================================================================
-- 1. profiles 테이블 RLS 정책 (무한 재귀 방지)
-- ============================================================================

-- 기존 정책 삭제 (모든 가능한 정책명 변형 포함)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile." ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- 기존 정책이 남아있을 수 있으므로 한 번 더 확인 후 삭제
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

-- 최적화된 정책 생성 (무한 재귀 방지)
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
-- 2. projects 테이블 RLS 정책 (최적화)
-- ============================================================================

-- 기존 정책 삭제 (모든 변형 포함)
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Super admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Super admins can update all projects" ON projects;
DROP POLICY IF EXISTS "Managers can view assigned projects" ON projects;
DROP POLICY IF EXISTS "Managers can update assigned projects" ON projects;

-- 기존 정책이 남아있을 수 있으므로 한 번 더 확인 후 삭제
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

-- 사용자 정책 (직접 비교로 최적화)
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id);

-- 매니저 정책 (profiles 테이블 조회 제거, 직접 manager_id 비교)
CREATE POLICY "Managers can view assigned projects"
    ON projects FOR SELECT
    USING (manager_id = auth.uid());

CREATE POLICY "Managers can update assigned projects"
    ON projects FOR UPDATE
    USING (manager_id = auth.uid());

-- ============================================================================
-- 3. messages 테이블 RLS 정책 (최적화)
-- ============================================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view messages in own projects" ON messages;
DROP POLICY IF EXISTS "Users can create messages in own projects" ON messages;
DROP POLICY IF EXISTS "Managers can view messages in assigned projects" ON messages;
DROP POLICY IF EXISTS "Managers can create messages in assigned projects" ON messages;

-- 기존 정책이 남아있을 수 있으므로 한 번 더 확인 후 삭제
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

-- 사용자 정책 (projects 테이블 직접 조회)
CREATE POLICY "Users can view messages in own projects"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = messages.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in own projects"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = messages.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- 매니저 정책 (manager_id 직접 비교)
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
-- 4. factory_quotes 테이블 RLS 정책 (무한 재귀 방지)
-- ============================================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view quotes in own projects" ON factory_quotes;
DROP POLICY IF EXISTS "Users can update quote status in own projects" ON factory_quotes;
DROP POLICY IF EXISTS "Managers can view quotes in assigned projects" ON factory_quotes;
DROP POLICY IF EXISTS "Managers can create quotes in assigned projects" ON factory_quotes;
DROP POLICY IF EXISTS "Managers can update quotes in assigned projects" ON factory_quotes;

-- 기존 정책이 남아있을 수 있으므로 한 번 더 확인 후 삭제
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'factory_quotes'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON factory_quotes', r.policyname);
    END LOOP;
END $$;

-- 사용자 정책 (projects.user_id 직접 비교)
CREATE POLICY "Users can view quotes in own projects"
    ON factory_quotes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = factory_quotes.project_id
            AND projects.user_id = auth.uid()
        )
    );

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

-- 매니저 정책 (projects.manager_id 직접 비교)
CREATE POLICY "Managers can view quotes in assigned projects"
    ON factory_quotes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = factory_quotes.project_id
            AND projects.manager_id = auth.uid()
        )
    );

CREATE POLICY "Managers can create quotes in assigned projects"
    ON factory_quotes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = factory_quotes.project_id
            AND projects.manager_id = auth.uid()
        )
    );

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
-- 5. chat_sessions 테이블 RLS 정책 (최적화)
-- ============================================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can create own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Managers can view assigned chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Managers can update assigned chat sessions" ON chat_sessions;

-- 기존 정책이 남아있을 수 있으므로 한 번 더 확인 후 삭제
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'chat_sessions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON chat_sessions', r.policyname);
    END LOOP;
END $$;

-- 사용자 정책
CREATE POLICY "Users can view own chat sessions"
    ON chat_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = chat_sessions.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own chat sessions"
    ON chat_sessions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = chat_sessions.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- 매니저 정책
CREATE POLICY "Managers can view assigned chat sessions"
    ON chat_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = chat_sessions.project_id
            AND projects.manager_id = auth.uid()
        )
    );

CREATE POLICY "Managers can update assigned chat sessions"
    ON chat_sessions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = chat_sessions.project_id
            AND projects.manager_id = auth.uid()
        )
    );

-- ============================================================================
-- 6. chat_messages 테이블 RLS 정책 (최적화)
-- ============================================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view messages in own sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can create messages in own sessions" ON chat_messages;
DROP POLICY IF EXISTS "Managers can view messages in assigned sessions" ON chat_messages;
DROP POLICY IF EXISTS "Managers can create messages in assigned sessions" ON chat_messages;

-- 기존 정책이 남아있을 수 있으므로 한 번 더 확인 후 삭제
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'chat_messages'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON chat_messages', r.policyname);
    END LOOP;
END $$;

-- 사용자 정책 (chat_sessions -> projects 경로)
CREATE POLICY "Users can view messages in own sessions"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_sessions
            JOIN projects ON projects.id = chat_sessions.project_id
            WHERE chat_sessions.id = chat_messages.session_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in own sessions"
    ON chat_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_sessions
            JOIN projects ON projects.id = chat_sessions.project_id
            WHERE chat_sessions.id = chat_messages.session_id
            AND projects.user_id = auth.uid()
        )
    );

-- 매니저 정책
CREATE POLICY "Managers can view messages in assigned sessions"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_sessions
            JOIN projects ON projects.id = chat_sessions.project_id
            WHERE chat_sessions.id = chat_messages.session_id
            AND projects.manager_id = auth.uid()
        )
    );

CREATE POLICY "Managers can create messages in assigned sessions"
    ON chat_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_sessions
            JOIN projects ON projects.id = chat_sessions.project_id
            WHERE chat_sessions.id = chat_messages.session_id
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
-- WHERE tablename IN ('profiles', 'projects', 'messages', 'factory_quotes', 'chat_sessions', 'chat_messages')
-- ORDER BY tablename, policyname;
-- ============================================================================
