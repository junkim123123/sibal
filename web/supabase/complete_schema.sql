-- ============================================================================
-- NexSupply Complete Database Schema
-- ============================================================================
-- 
-- 통합 및 최적화된 단일 스키마 파일
-- 모든 테이블, 인덱스, RLS 정책, 트리거를 포함합니다.
-- 
-- 실행 방법:
-- 1. Supabase 대시보드 > SQL Editor로 이동
-- 2. 이 파일의 전체 내용을 복사하여 실행
-- 3. 기존 데이터베이스가 있다면 모든 테이블을 삭제한 후 실행
-- ============================================================================

-- ============================================================================
-- 0. 기존 객체 정리 (선택사항 - 새로 시작할 때만)
-- ============================================================================
-- 주의: 이 섹션은 기존 데이터를 모두 삭제합니다!
-- 기존 데이터를 보존하려면 이 섹션을 주석 처리하세요.

-- DROP TABLE IF EXISTS qc_report_items CASCADE;
-- DROP TABLE IF EXISTS qc_reports CASCADE;
-- DROP TABLE IF EXISTS factory_quotes CASCADE;
-- DROP TABLE IF EXISTS chat_messages CASCADE;
-- DROP TABLE IF EXISTS chat_sessions CASCADE;
-- DROP TABLE IF EXISTS messages CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP FUNCTION IF EXISTS update_manager_workload() CASCADE;
-- DROP FUNCTION IF EXISTS calculate_defect_rate() CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
-- DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- ============================================================================
-- 1. 유틸리티 함수 정의
-- ============================================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. profiles 테이블 (사용자 프로필)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    company TEXT,
    role TEXT DEFAULT 'free' CHECK (role IN ('free', 'pro', 'manager', 'admin', 'super_admin')),
    is_manager BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    workload_score INTEGER DEFAULT 0,
    total_spend NUMERIC DEFAULT 0,
    bio TEXT,
    expertise TEXT[],
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
    -- 분석 사용량 추적
    analysis_count INTEGER DEFAULT 0 NOT NULL,
    last_analysis_date TIMESTAMPTZ,
    has_active_subscription BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- profiles 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned) WHERE is_banned = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_workload_score ON profiles(workload_score) WHERE is_manager = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_is_manager ON profiles(is_manager) WHERE is_manager = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_availability_status ON profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_profiles_has_active_subscription ON profiles(has_active_subscription);
CREATE INDEX IF NOT EXISTS idx_profiles_last_analysis_date ON profiles(last_analysis_date);

-- profiles RLS 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can update all profiles"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- profiles 트리거
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. projects 테이블 (프로젝트)
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'saved', 'in_progress')),
    initial_risk_score NUMERIC,
    total_landed_cost NUMERIC,
    -- 마일스톤 관리
    current_milestone_index INTEGER DEFAULT 0 CHECK (current_milestone_index >= 0 AND current_milestone_index <= 5),
    milestones JSONB DEFAULT '[
        {"title": "Sourcing Started", "status": "completed", "date": null, "index": 0},
        {"title": "Supplier Verified", "status": "pending", "date": null, "index": 1},
        {"title": "Samples Ordered", "status": "pending", "date": null, "index": 2},
        {"title": "QC Inspection", "status": "pending", "date": null, "index": 3},
        {"title": "Shipping Arranged", "status": "pending", "date": null, "index": 4},
        {"title": "Final Delivery", "status": "pending", "date": null, "index": 5}
    ]',
    -- 견적 및 결제 상태
    final_quote_status TEXT DEFAULT 'pending' CHECK (final_quote_status IN ('pending', 'accepted', 'rejected', 'finalized')),
    quote_acceptance_date TIMESTAMPTZ,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_date TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    -- 구독 정보
    is_paid_subscription BOOLEAN DEFAULT FALSE NOT NULL,
    lemon_squeezy_subscription_id TEXT,
    -- 이메일 알림 제어
    last_notification_sent_at TIMESTAMPTZ,
    last_notification_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- projects 인덱스
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_manager_id ON projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_final_quote_status ON projects(final_quote_status);
CREATE INDEX IF NOT EXISTS idx_projects_payment_status ON projects(payment_status);
CREATE INDEX IF NOT EXISTS idx_projects_manager_id_status ON projects(manager_id, status) WHERE manager_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_dispatched_at ON projects(dispatched_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_current_milestone ON projects(current_milestone_index);
CREATE INDEX IF NOT EXISTS idx_projects_is_paid_subscription ON projects(is_paid_subscription);
CREATE INDEX IF NOT EXISTS idx_projects_lemon_squeezy_subscription_id ON projects(lemon_squeezy_subscription_id);
CREATE INDEX IF NOT EXISTS idx_projects_last_notification ON projects(last_notification_sent_at) WHERE last_notification_sent_at IS NOT NULL;

-- projects RLS 정책
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all projects"
    ON projects FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can update all projects"
    ON projects FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

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

-- projects 트리거
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. messages 테이블 (AI 분석 메시지)
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- messages 인덱스
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_project_timestamp ON messages(project_id, timestamp);

-- messages RLS 정책
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

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

-- ============================================================================
-- 5. chat_sessions 테이블 (채팅 세션)
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

-- chat_sessions 인덱스
CREATE INDEX IF NOT EXISTS idx_chat_sessions_project_id ON chat_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_manager_id ON chat_sessions(manager_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);

-- chat_sessions RLS 정책
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat sessions"
    ON chat_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat sessions"
    ON chat_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can view assigned chat sessions"
    ON chat_sessions FOR SELECT
    USING (auth.uid() = manager_id);

CREATE POLICY "Managers can update assigned chat sessions"
    ON chat_sessions FOR UPDATE
    USING (auth.uid() = manager_id);

-- chat_sessions 트리거
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. chat_messages 테이블 (실시간 채팅 메시지)
-- ============================================================================

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'manager', 'system')),
    content TEXT NOT NULL,
    file_url TEXT,
    file_name TEXT,
    file_type TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- chat_messages 인덱스
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created ON chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_file_url ON chat_messages(file_url) WHERE file_url IS NOT NULL;

-- chat_messages RLS 정책
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

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
-- 7. factory_quotes 테이블 (공장 견적)
-- ============================================================================

CREATE TABLE IF NOT EXISTS factory_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    factory_name TEXT NOT NULL,
    is_recommended BOOLEAN DEFAULT FALSE,
    unit_price NUMERIC(12, 2) NOT NULL,
    moq INTEGER NOT NULL DEFAULT 1,
    lead_time_days INTEGER NOT NULL,
    sample_cost NUMERIC(12, 2),
    pros TEXT[] DEFAULT '{}',
    cons TEXT[] DEFAULT '{}',
    risk_level TEXT DEFAULT 'Medium' CHECK (risk_level IN ('Low', 'Medium', 'High')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- factory_quotes 인덱스
CREATE INDEX IF NOT EXISTS idx_factory_quotes_project_id ON factory_quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_factory_quotes_status ON factory_quotes(status);
CREATE INDEX IF NOT EXISTS idx_factory_quotes_is_recommended ON factory_quotes(is_recommended) WHERE is_recommended = TRUE;
CREATE INDEX IF NOT EXISTS idx_factory_quotes_project_status ON factory_quotes(project_id, status);
CREATE INDEX IF NOT EXISTS idx_factory_quotes_created_at ON factory_quotes(created_at DESC);

-- factory_quotes RLS 정책
ALTER TABLE factory_quotes ENABLE ROW LEVEL SECURITY;

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

-- factory_quotes 트리거
CREATE TRIGGER update_factory_quotes_updated_at
    BEFORE UPDATE ON factory_quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. qc_reports 테이블 (QC 검수 보고서)
-- ============================================================================

CREATE TABLE IF NOT EXISTS qc_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'approved', 'rejected')),
    total_quantity INTEGER NOT NULL DEFAULT 0,
    passed_quantity INTEGER NOT NULL DEFAULT 0,
    defect_quantity INTEGER NOT NULL DEFAULT 0,
    defect_rate NUMERIC(5, 2) DEFAULT 0,
    manager_note TEXT,
    client_feedback TEXT,
    inspection_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- qc_reports 인덱스
CREATE INDEX IF NOT EXISTS idx_qc_reports_project_id ON qc_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_qc_reports_status ON qc_reports(status);
CREATE INDEX IF NOT EXISTS idx_qc_reports_created_at ON qc_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qc_reports_project_status ON qc_reports(project_id, status);

-- qc_reports RLS 정책
ALTER TABLE qc_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view QC reports in own projects"
    ON qc_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = qc_reports.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update QC report status in own projects"
    ON qc_reports FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = qc_reports.project_id
            AND projects.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = qc_reports.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Managers can view QC reports in assigned projects"
    ON qc_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = qc_reports.project_id
            AND projects.manager_id = auth.uid()
        )
    );

CREATE POLICY "Managers can create QC reports in assigned projects"
    ON qc_reports FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = qc_reports.project_id
            AND projects.manager_id = auth.uid()
        )
    );

CREATE POLICY "Managers can update QC reports in assigned projects"
    ON qc_reports FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = qc_reports.project_id
            AND projects.manager_id = auth.uid()
        )
    );

-- qc_reports 트리거
CREATE TRIGGER update_qc_reports_updated_at
    BEFORE UPDATE ON qc_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- defect_rate 자동 계산 함수
CREATE OR REPLACE FUNCTION calculate_defect_rate()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.total_quantity > 0 THEN
        NEW.defect_rate := ROUND((NEW.defect_quantity::NUMERIC / NEW.total_quantity::NUMERIC) * 100, 2);
    ELSE
        NEW.defect_rate := 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_qc_report_defect_rate
    BEFORE INSERT OR UPDATE ON qc_reports
    FOR EACH ROW
    WHEN (NEW.total_quantity IS NOT NULL AND NEW.defect_quantity IS NOT NULL)
    EXECUTE FUNCTION calculate_defect_rate();

-- ============================================================================
-- 9. qc_report_items 테이블 (QC 검수 항목)
-- ============================================================================

CREATE TABLE IF NOT EXISTS qc_report_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES qc_reports(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pass', 'fail', 'warning')),
    image_urls TEXT[] DEFAULT '{}',
    manager_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- qc_report_items 인덱스
CREATE INDEX IF NOT EXISTS idx_qc_report_items_report_id ON qc_report_items(report_id);
CREATE INDEX IF NOT EXISTS idx_qc_report_items_status ON qc_report_items(status);
CREATE INDEX IF NOT EXISTS idx_qc_report_items_category ON qc_report_items(category);
CREATE INDEX IF NOT EXISTS idx_qc_report_items_created_at ON qc_report_items(created_at DESC);

-- qc_report_items RLS 정책
ALTER TABLE qc_report_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view QC report items in own projects"
    ON qc_report_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM qc_reports
            INNER JOIN projects ON projects.id = qc_reports.project_id
            WHERE qc_reports.id = qc_report_items.report_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Managers can view QC report items in assigned projects"
    ON qc_report_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM qc_reports
            INNER JOIN projects ON projects.id = qc_reports.project_id
            WHERE qc_reports.id = qc_report_items.report_id
            AND projects.manager_id = auth.uid()
        )
    );

CREATE POLICY "Managers can create QC report items in assigned projects"
    ON qc_report_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM qc_reports
            INNER JOIN projects ON projects.id = qc_reports.project_id
            WHERE qc_reports.id = qc_report_items.report_id
            AND projects.manager_id = auth.uid()
        )
    );

CREATE POLICY "Managers can update QC report items in assigned projects"
    ON qc_report_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM qc_reports
            INNER JOIN projects ON projects.id = qc_reports.project_id
            WHERE qc_reports.id = qc_report_items.report_id
            AND projects.manager_id = auth.uid()
        )
    );

CREATE POLICY "Managers can delete QC report items in assigned projects"
    ON qc_report_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM qc_reports
            INNER JOIN projects ON projects.id = qc_reports.project_id
            WHERE qc_reports.id = qc_report_items.report_id
            AND projects.manager_id = auth.uid()
        )
    );

-- qc_report_items 트리거
CREATE TRIGGER update_qc_report_items_updated_at
    BEFORE UPDATE ON qc_report_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. sample_feedbacks 테이블 (샘플 피드백)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sample_feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    overall_status TEXT DEFAULT 'pending' CHECK (overall_status IN ('pending', 'approved', 'changes_requested')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, round_number)
);

-- sample_feedbacks 인덱스
CREATE INDEX IF NOT EXISTS idx_sample_feedbacks_project_id ON sample_feedbacks(project_id);
CREATE INDEX IF NOT EXISTS idx_sample_feedbacks_round_number ON sample_feedbacks(project_id, round_number);
CREATE INDEX IF NOT EXISTS idx_sample_feedbacks_status ON sample_feedbacks(overall_status);
CREATE INDEX IF NOT EXISTS idx_sample_feedbacks_created_at ON sample_feedbacks(created_at DESC);

-- sample_feedbacks RLS 정책
ALTER TABLE sample_feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sample feedbacks in own projects"
    ON sample_feedbacks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = sample_feedbacks.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update sample feedback status in own projects"
    ON sample_feedbacks FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = sample_feedbacks.project_id
            AND projects.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = sample_feedbacks.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Managers can view sample feedbacks in assigned projects"
    ON sample_feedbacks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = sample_feedbacks.project_id
            AND projects.manager_id = auth.uid()
        )
    );

CREATE POLICY "Managers can create sample feedbacks in assigned projects"
    ON sample_feedbacks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = sample_feedbacks.project_id
            AND projects.manager_id = auth.uid()
        )
    );

CREATE POLICY "Managers can update sample feedbacks in assigned projects"
    ON sample_feedbacks FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = sample_feedbacks.project_id
            AND projects.manager_id = auth.uid()
        )
    );

-- sample_feedbacks 트리거
CREATE TRIGGER update_sample_feedbacks_updated_at
    BEFORE UPDATE ON sample_feedbacks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 11. sample_annotations 테이블 (샘플 이미지 주석)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sample_annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID NOT NULL REFERENCES sample_feedbacks(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    position_x NUMERIC(5, 2) NOT NULL CHECK (position_x >= 0 AND position_x <= 100),
    position_y NUMERIC(5, 2) NOT NULL CHECK (position_y >= 0 AND position_y <= 100),
    comment TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- sample_annotations 인덱스
CREATE INDEX IF NOT EXISTS idx_sample_annotations_feedback_id ON sample_annotations(feedback_id);
CREATE INDEX IF NOT EXISTS idx_sample_annotations_image_url ON sample_annotations(image_url);
CREATE INDEX IF NOT EXISTS idx_sample_annotations_is_resolved ON sample_annotations(is_resolved);
CREATE INDEX IF NOT EXISTS idx_sample_annotations_created_at ON sample_annotations(created_at DESC);

-- sample_annotations RLS 정책
ALTER TABLE sample_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view annotations in own projects"
    ON sample_annotations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sample_feedbacks
            INNER JOIN projects ON projects.id = sample_feedbacks.project_id
            WHERE sample_feedbacks.id = sample_annotations.feedback_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create annotations in own projects"
    ON sample_annotations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sample_feedbacks
            INNER JOIN projects ON projects.id = sample_feedbacks.project_id
            WHERE sample_feedbacks.id = sample_annotations.feedback_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update annotations in own projects"
    ON sample_annotations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM sample_feedbacks
            INNER JOIN projects ON projects.id = sample_feedbacks.project_id
            WHERE sample_feedbacks.id = sample_annotations.feedback_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Managers can view annotations in assigned projects"
    ON sample_annotations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sample_feedbacks
            INNER JOIN projects ON projects.id = sample_feedbacks.project_id
            WHERE sample_feedbacks.id = sample_annotations.feedback_id
            AND projects.manager_id = auth.uid()
        )
    );

CREATE POLICY "Managers can update annotations in assigned projects"
    ON sample_annotations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM sample_feedbacks
            INNER JOIN projects ON projects.id = sample_feedbacks.project_id
            WHERE sample_feedbacks.id = sample_annotations.feedback_id
            AND projects.manager_id = auth.uid()
        )
    );

-- sample_annotations 트리거
CREATE TRIGGER update_sample_annotations_updated_at
    BEFORE UPDATE ON sample_annotations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 12. 매니저 워크로드 자동 계산 함수
-- ============================================================================

CREATE OR REPLACE FUNCTION update_manager_workload()
RETURNS TRIGGER AS $$
BEGIN
    -- 매니저 워크로드 업데이트
    IF NEW.manager_id IS NOT NULL THEN
        UPDATE profiles
        SET workload_score = (
            SELECT COUNT(*)::INTEGER
            FROM projects
            WHERE manager_id = NEW.manager_id
            AND status IN ('active', 'in_progress')
        )
        WHERE id = NEW.manager_id;
    END IF;
    
    -- 이전 매니저의 워크로드도 업데이트 (매니저 변경 시)
    IF OLD.manager_id IS NOT NULL AND OLD.manager_id != NEW.manager_id THEN
        UPDATE profiles
        SET workload_score = (
            SELECT COUNT(*)::INTEGER
            FROM projects
            WHERE manager_id = OLD.manager_id
            AND status IN ('active', 'in_progress')
        )
        WHERE id = OLD.manager_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 매니저 워크로드 자동 계산 트리거
DROP TRIGGER IF EXISTS trigger_update_manager_workload ON projects;
CREATE TRIGGER trigger_update_manager_workload
    AFTER INSERT OR UPDATE OF manager_id, status ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_manager_workload();

-- ============================================================================
-- 13. 프로필 자동 생성 함수 (사용자 가입 시)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        'free'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users에 새 사용자가 생성될 때 프로필 자동 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 14. Realtime 활성화 (선택사항 - Supabase 대시보드에서도 가능)
-- ============================================================================

-- chat_messages와 chat_sessions 테이블에 Realtime 활성화
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;

-- ============================================================================
-- 스키마 생성 완료
-- ============================================================================
-- 
-- 다음 단계:
-- 1. Supabase 대시보드에서 이 스키마를 실행
-- 2. Storage 버킷 생성 (chat-files, qc-images)
-- 3. Realtime 활성화 (Database → Replication)
-- 4. 환경 변수 확인 (SUPABASE_SERVICE_ROLE_KEY)
-- ============================================================================
