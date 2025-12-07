-- ============================================================================
-- NexSupply Super Admin Schema Extensions
-- ============================================================================
-- 
-- 슈퍼 어드민 페이지 및 프로젝트 배정(Dispatch) 시스템을 위한 스키마 확장
-- 기존 스키마 실행 후 이 파일을 실행
-- ============================================================================

-- ============================================================================
-- 1. profiles 테이블 확장 (Role 및 유저 관리)
-- ============================================================================

-- role 필드를 확장하여 'super_admin' 추가
DO $$ 
BEGIN
    -- 기존 CHECK 제약 조건 제거 (role 필드가 이미 있을 경우)
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_role_check'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
    END IF;
    
    -- 새로운 CHECK 제약 조건 추가 (super_admin 포함)
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('free', 'pro', 'manager', 'admin', 'super_admin'));
END $$;

-- workload_score 필드 추가 (매니저의 현재 프로젝트 수)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'workload_score'
    ) THEN
        ALTER TABLE profiles ADD COLUMN workload_score INTEGER DEFAULT 0;
    END IF;
END $$;

-- is_banned 필드 추가 (유저 밴 처리)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_banned'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_banned BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- total_spend 필드 추가 (총 지출액 추적)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'total_spend'
    ) THEN
        ALTER TABLE profiles ADD COLUMN total_spend NUMERIC DEFAULT 0;
    END IF;
END $$;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned) WHERE is_banned = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_workload_score ON profiles(workload_score) WHERE is_manager = TRUE;

-- ============================================================================
-- 2. projects 테이블 확장 (Dispatch 연결)
-- ============================================================================

-- dispatched_at 필드 추가 (매니저 배정 시간)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'dispatched_at'
    ) THEN
        ALTER TABLE projects ADD COLUMN dispatched_at TIMESTAMPTZ;
    END IF;
END $$;

-- payment_status 필드 추가 (결제 상태 추적)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE projects ADD COLUMN payment_status TEXT DEFAULT 'pending' 
            CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
    END IF;
END $$;

-- payment_date 필드 추가 (결제 날짜)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'payment_date'
    ) THEN
        ALTER TABLE projects ADD COLUMN payment_date TIMESTAMPTZ;
    END IF;
END $$;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_projects_payment_status ON projects(payment_status);
CREATE INDEX IF NOT EXISTS idx_projects_manager_id_status ON projects(manager_id, status) WHERE manager_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_dispatched_at ON projects(dispatched_at DESC);

-- ============================================================================
-- 3. RLS 정책 확장 (슈퍼 어드민 권한)
-- ============================================================================

-- 슈퍼 어드민은 모든 프로필 조회 가능
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Super admins can view all profiles'
    ) THEN
        CREATE POLICY "Super admins can view all profiles"
            ON profiles FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = 'super_admin'
                )
            );
    END IF;
END $$;

-- 슈퍼 어드민은 모든 프로젝트 조회 가능
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'projects' 
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

-- 슈퍼 어드민은 프로젝트 업데이트 가능 (매니저 배정 등)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'projects' 
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

-- 슈퍼 어드민은 프로필 업데이트 가능 (밴, 역할 변경 등)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Super admins can update all profiles'
    ) THEN
        CREATE POLICY "Super admins can update all profiles"
            ON profiles FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND role = 'super_admin'
                )
            );
    END IF;
END $$;

-- ============================================================================
-- 4. 함수: 매니저 워크로드 자동 계산 (선택적)
-- ============================================================================

-- 매니저의 현재 프로젝트 수를 계산하는 함수
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

-- 트리거 생성 (프로젝트 업데이트 시 워크로드 자동 계산)
DROP TRIGGER IF EXISTS trigger_update_manager_workload ON projects;
CREATE TRIGGER trigger_update_manager_workload
    AFTER INSERT OR UPDATE OF manager_id, status ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_manager_workload();

-- ============================================================================
-- 완료 메시지
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Super Admin schema extensions applied successfully!';
END $$;

