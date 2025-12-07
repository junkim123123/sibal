-- ============================================================================
-- NexSupply Chat Sessions Schema
-- ============================================================================
-- 
-- 관리자와 사용자 간의 실시간 채팅을 위한 테이블 구조
-- Supabase Realtime을 활용하여 실시간 채팅 구현
-- ============================================================================

-- ============================================================================
-- 4. chat_sessions 테이블 (실제 요청 채팅 세션)
-- ============================================================================

CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_chat_sessions_project_id ON chat_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_manager_id ON chat_sessions(manager_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);

-- RLS 정책 설정
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 채팅 세션만 조회/생성 가능
CREATE POLICY "Users can view own chat sessions"
    ON chat_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat sessions"
    ON chat_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 관리자는 자신이 할당된 채팅 세션 조회/수정 가능
CREATE POLICY "Managers can view assigned chat sessions"
    ON chat_sessions FOR SELECT
    USING (auth.uid() = manager_id);

CREATE POLICY "Managers can update assigned chat sessions"
    ON chat_sessions FOR UPDATE
    USING (auth.uid() = manager_id);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. chat_messages 테이블 (실시간 채팅 메시지)
-- ============================================================================
-- 기존 messages 테이블과는 별도로 관리자-사용자 간 실시간 채팅 전용

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'manager')),
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created ON chat_messages(session_id, created_at);

-- RLS 정책 설정
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 채팅 세션에 속한 메시지만 조회/생성 가능
CREATE POLICY "Users can view messages in own sessions"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in own sessions"
    ON chat_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
        AND sender_id = auth.uid()
    );

-- 관리자는 자신이 할당된 채팅 세션의 메시지 조회/생성 가능
CREATE POLICY "Managers can view messages in assigned sessions"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
            AND chat_sessions.manager_id = auth.uid()
        )
    );

CREATE POLICY "Managers can create messages in assigned sessions"
    ON chat_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
            AND chat_sessions.manager_id = auth.uid()
        )
        AND sender_id = auth.uid()
    );

-- ============================================================================
-- Realtime 활성화 (Supabase Realtime 기능 사용)
-- ============================================================================
-- Supabase 대시보드에서 수동으로 활성화:
-- 1. Database → Replication
-- 2. chat_messages 테이블 선택
-- 3. Enable Realtime 토글 활성화

-- 또는 SQL로 직접 활성화:
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;

-- ============================================================================
-- 채팅 세션 스키마 생성 완료
-- ============================================================================

