-- ============================================================================
-- NexSupply Manager Dashboard Schema Extensions
-- ============================================================================
-- 
-- 매니저 대시보드 및 마일스톤 관리를 위한 스키마 확장
-- 기존 스키마 실행 후 이 파일을 실행
-- ============================================================================

-- ============================================================================
-- 1. profiles 테이블 확장 (매니저 정보)
-- ============================================================================

-- bio 필드 추가 (매니저 소개글)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bio'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;
END $$;

-- expertise 필드 추가 (전문 분야 배열)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'expertise'
    ) THEN
        ALTER TABLE profiles ADD COLUMN expertise TEXT[];
    END IF;
END $$;

-- availability_status 필드 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'availability_status'
    ) THEN
        ALTER TABLE profiles ADD COLUMN availability_status TEXT DEFAULT 'available' 
            CHECK (availability_status IN ('available', 'busy', 'offline'));
    END IF;
END $$;

-- is_manager 필드 추가 (매니저 여부)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_manager'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_manager BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_is_manager ON profiles(is_manager) WHERE is_manager = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_availability_status ON profiles(availability_status);

-- ============================================================================
-- 2. projects 테이블 확장 (마일스톤 관리)
-- ============================================================================

-- current_milestone_index 필드 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'current_milestone_index'
    ) THEN
        ALTER TABLE projects ADD COLUMN current_milestone_index INTEGER DEFAULT 0 
            CHECK (current_milestone_index >= 0 AND current_milestone_index <= 5);
    END IF;
END $$;

-- milestones 필드 추가 (JSONB 타입)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'milestones'
    ) THEN
        ALTER TABLE projects ADD COLUMN milestones JSONB DEFAULT '[
            {"title": "Sourcing Started", "status": "completed", "date": null, "index": 0},
            {"title": "Supplier Verified", "status": "pending", "date": null, "index": 1},
            {"title": "Samples Ordered", "status": "pending", "date": null, "index": 2},
            {"title": "QC Inspection", "status": "pending", "date": null, "index": 3},
            {"title": "Shipping Arranged", "status": "pending", "date": null, "index": 4},
            {"title": "Final Delivery", "status": "pending", "date": null, "index": 5}
        ]';
    END IF;
END $$;

-- 인덱스 생성 (JSONB 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_projects_current_milestone ON projects(current_milestone_index);

-- ============================================================================
-- 3. RLS 정책 확장 (매니저 권한)
-- ============================================================================

-- 매니저는 할당된 프로젝트 조회/수정 가능
DROP POLICY IF EXISTS "Managers can view assigned projects" ON projects;
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

DROP POLICY IF EXISTS "Managers can update assigned projects" ON projects;
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

-- 매니저는 할당된 프로젝트의 채팅 세션 조회/수정 가능
-- (chat_sessions 테이블이 있는 경우)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_sessions') THEN
        -- 이미 chat_sessions_schema.sql에서 정책이 설정되어 있을 수 있음
        -- 중복 방지를 위해 IF NOT EXISTS 체크는 SQL 단계에서 처리
        NULL;
    END IF;
END $$;

-- ============================================================================
-- 스키마 확장 완료
-- ============================================================================
-- 
-- 다음 단계:
-- 1. 매니저 계정 생성 및 is_manager = TRUE 설정
-- 2. 프로젝트에 manager_id 할당
-- 3. 매니저 대시보드 UI 구현
-- ============================================================================

-- 예시: 매니저 계정 활성화
-- UPDATE profiles SET is_manager = TRUE, role = 'pro' WHERE email = 'manager@nexsupply.com';

