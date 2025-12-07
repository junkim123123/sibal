-- ============================================================================
-- Email Notifications Schema Extensions
-- ============================================================================
-- 
-- 이메일 알림 제어를 위한 스키마 확장
-- Notification Fatigue 방지 (Throttle 로직)
-- ============================================================================

-- ============================================================================
-- projects 테이블에 알림 제어 필드 추가
-- ============================================================================

-- last_notification_sent_at 필드 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'last_notification_sent_at'
    ) THEN
        ALTER TABLE projects ADD COLUMN last_notification_sent_at TIMESTAMPTZ;
    END IF;
END $$;

-- last_notification_type 필드 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'last_notification_type'
    ) THEN
        ALTER TABLE projects ADD COLUMN last_notification_type TEXT;
    END IF;
END $$;

-- 인덱스 생성 (알림 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_projects_last_notification ON projects(last_notification_sent_at) 
    WHERE last_notification_sent_at IS NOT NULL;

-- ============================================================================
-- 스키마 확장 완료
-- ============================================================================

