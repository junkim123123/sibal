-- ============================================================================
-- Post-Schema Migration: 누락된 필드 및 제약조건 추가
-- ============================================================================
-- 
-- 새로 생성한 스키마에 누락된 필드와 제약조건을 추가합니다.
-- 
-- 실행 방법:
-- 1. Supabase 대시보드 > SQL Editor로 이동
-- 2. 이 파일의 전체 내용을 복사하여 실행
-- ============================================================================

-- ============================================================================
-- 1. projects 테이블에 analysis_data 필드 추가
-- ============================================================================
-- 저장된 프로젝트의 answers와 ai_analysis를 불러오기 위해 필요

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS analysis_data JSONB DEFAULT NULL;

-- analysis_data 인덱스 추가 (JSONB 쿼리 성능 향상)
CREATE INDEX IF NOT EXISTS idx_projects_analysis_data 
ON projects USING GIN (analysis_data) 
WHERE analysis_data IS NOT NULL;

-- ============================================================================
-- 2. projects 테이블에 status CHECK 제약조건 추가
-- ============================================================================
-- 'saved' 상태를 포함한 모든 상태 값 허용

DO $$
BEGIN
    -- 기존 제약조건이 없으면 추가
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'projects_status_check'
    ) THEN
        ALTER TABLE projects 
        ADD CONSTRAINT projects_status_check 
        CHECK (status IN ('active', 'completed', 'archived', 'saved', 'in_progress'));
    END IF;
END $$;

-- ============================================================================
-- 3. projects 테이블에 기타 CHECK 제약조건 추가
-- ============================================================================

-- current_milestone_index 제약조건
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'projects_current_milestone_index_check'
    ) THEN
        ALTER TABLE projects 
        ADD CONSTRAINT projects_current_milestone_index_check 
        CHECK (current_milestone_index >= 0 AND current_milestone_index <= 5);
    END IF;
END $$;

-- final_quote_status 제약조건
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'projects_final_quote_status_check'
    ) THEN
        ALTER TABLE projects 
        ADD CONSTRAINT projects_final_quote_status_check 
        CHECK (final_quote_status IN ('pending', 'accepted', 'rejected', 'finalized'));
    END IF;
END $$;

-- payment_status 제약조건
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'projects_payment_status_check'
    ) THEN
        ALTER TABLE projects 
        ADD CONSTRAINT projects_payment_status_check 
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
    END IF;
END $$;

-- ============================================================================
-- 4. profiles 테이블에 availability_status CHECK 제약조건 추가
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_availability_status_check'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT profiles_availability_status_check 
        CHECK (availability_status IN ('available', 'busy', 'offline'));
    END IF;
END $$;

-- ============================================================================
-- 5. 기타 테이블 CHECK 제약조건 추가
-- ============================================================================

-- chat_sessions.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chat_sessions_status_check'
    ) THEN
        ALTER TABLE chat_sessions 
        ADD CONSTRAINT chat_sessions_status_check 
        CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'));
    END IF;
END $$;

-- factory_quotes.risk_level
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'factory_quotes_risk_level_check'
    ) THEN
        ALTER TABLE factory_quotes 
        ADD CONSTRAINT factory_quotes_risk_level_check 
        CHECK (risk_level IN ('Low', 'Medium', 'High'));
    END IF;
END $$;

-- factory_quotes.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'factory_quotes_status_check'
    ) THEN
        ALTER TABLE factory_quotes 
        ADD CONSTRAINT factory_quotes_status_check 
        CHECK (status IN ('pending', 'selected', 'rejected'));
    END IF;
END $$;

-- qc_reports.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'qc_reports_status_check'
    ) THEN
        ALTER TABLE qc_reports 
        ADD CONSTRAINT qc_reports_status_check 
        CHECK (status IN ('draft', 'published', 'approved', 'rejected'));
    END IF;
END $$;

-- qc_report_items.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'qc_report_items_status_check'
    ) THEN
        ALTER TABLE qc_report_items 
        ADD CONSTRAINT qc_report_items_status_check 
        CHECK (status IN ('pass', 'fail', 'warning'));
    END IF;
END $$;

-- sample_feedbacks.overall_status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'sample_feedbacks_overall_status_check'
    ) THEN
        ALTER TABLE sample_feedbacks 
        ADD CONSTRAINT sample_feedbacks_overall_status_check 
        CHECK (overall_status IN ('pending', 'approved', 'changes_requested'));
    END IF;
END $$;

-- sample_annotations position 제약조건
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'sample_annotations_position_x_check'
    ) THEN
        ALTER TABLE sample_annotations 
        ADD CONSTRAINT sample_annotations_position_x_check 
        CHECK (position_x >= 0 AND position_x <= 100);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'sample_annotations_position_y_check'
    ) THEN
        ALTER TABLE sample_annotations 
        ADD CONSTRAINT sample_annotations_position_y_check 
        CHECK (position_y >= 0 AND position_y <= 100);
    END IF;
END $$;

-- ============================================================================
-- 6. 인덱스 추가 (성능 최적화)
-- ============================================================================

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

-- messages 인덱스
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_project_timestamp ON messages(project_id, timestamp);

-- chat_sessions 인덱스
CREATE INDEX IF NOT EXISTS idx_chat_sessions_project_id ON chat_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_manager_id ON chat_sessions(manager_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);

-- chat_messages 인덱스
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created ON chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_file_url ON chat_messages(file_url) WHERE file_url IS NOT NULL;

-- factory_quotes 인덱스
CREATE INDEX IF NOT EXISTS idx_factory_quotes_project_id ON factory_quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_factory_quotes_status ON factory_quotes(status);
CREATE INDEX IF NOT EXISTS idx_factory_quotes_is_recommended ON factory_quotes(is_recommended) WHERE is_recommended = TRUE;
CREATE INDEX IF NOT EXISTS idx_factory_quotes_project_status ON factory_quotes(project_id, status);
CREATE INDEX IF NOT EXISTS idx_factory_quotes_created_at ON factory_quotes(created_at DESC);

-- qc_reports 인덱스
CREATE INDEX IF NOT EXISTS idx_qc_reports_project_id ON qc_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_qc_reports_status ON qc_reports(status);
CREATE INDEX IF NOT EXISTS idx_qc_reports_created_at ON qc_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qc_reports_project_status ON qc_reports(project_id, status);

-- qc_report_items 인덱스
CREATE INDEX IF NOT EXISTS idx_qc_report_items_report_id ON qc_report_items(report_id);
CREATE INDEX IF NOT EXISTS idx_qc_report_items_status ON qc_report_items(status);
CREATE INDEX IF NOT EXISTS idx_qc_report_items_category ON qc_report_items(category);
CREATE INDEX IF NOT EXISTS idx_qc_report_items_created_at ON qc_report_items(created_at DESC);

-- sample_feedbacks 인덱스
CREATE INDEX IF NOT EXISTS idx_sample_feedbacks_project_id ON sample_feedbacks(project_id);
CREATE INDEX IF NOT EXISTS idx_sample_feedbacks_round_number ON sample_feedbacks(project_id, round_number);
CREATE INDEX IF NOT EXISTS idx_sample_feedbacks_status ON sample_feedbacks(overall_status);
CREATE INDEX IF NOT EXISTS idx_sample_feedbacks_created_at ON sample_feedbacks(created_at DESC);

-- sample_annotations 인덱스
CREATE INDEX IF NOT EXISTS idx_sample_annotations_feedback_id ON sample_annotations(feedback_id);
CREATE INDEX IF NOT EXISTS idx_sample_annotations_image_url ON sample_annotations(image_url);
CREATE INDEX IF NOT EXISTS idx_sample_annotations_is_resolved ON sample_annotations(is_resolved);
CREATE INDEX IF NOT EXISTS idx_sample_annotations_created_at ON sample_annotations(created_at DESC);

-- ============================================================================
-- 7. 매니저 워크로드 자동 계산 함수 및 트리거
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
-- 8. QC 리포트 defect_rate 자동 계산 함수 및 트리거
-- ============================================================================

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
-- 마이그레이션 완료
-- ============================================================================
-- 
-- 다음이 추가되었습니다:
-- 1. projects.analysis_data 필드 (저장된 분석 데이터)
-- 2. 모든 테이블의 CHECK 제약조건 (데이터 무결성)
-- 3. 성능 최적화 인덱스
-- 4. 자동 계산 함수 및 트리거
-- ============================================================================
