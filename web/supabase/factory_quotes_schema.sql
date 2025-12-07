-- ============================================================================
-- NexSupply Factory Quotes Schema
-- ============================================================================
-- 
-- Visual Quote Comparison 기능을 위한 데이터베이스 스키마
-- 공장 견적 정보를 저장하고 비교할 수 있도록 지원
-- ============================================================================

-- ============================================================================
-- 1. factory_quotes 테이블 (공장 견적)
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_factory_quotes_project_id ON factory_quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_factory_quotes_status ON factory_quotes(status);
CREATE INDEX IF NOT EXISTS idx_factory_quotes_is_recommended ON factory_quotes(is_recommended) WHERE is_recommended = TRUE;
CREATE INDEX IF NOT EXISTS idx_factory_quotes_project_status ON factory_quotes(project_id, status);
CREATE INDEX IF NOT EXISTS idx_factory_quotes_created_at ON factory_quotes(created_at DESC);

-- RLS 정책 설정
ALTER TABLE factory_quotes ENABLE ROW LEVEL SECURITY;

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

-- 매니저는 할당된 프로젝트의 견적 조회/생성/수정 가능
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

-- 사용자는 자신의 프로젝트에 속한 견적의 상태를 업데이트 가능 (선택/거절)
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

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_factory_quotes_updated_at
    BEFORE UPDATE ON factory_quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Factory Quotes 스키마 생성 완료
-- ============================================================================
-- 
-- 다음 단계:
-- 1. Supabase 대시보드에서 이 스키마를 실행
-- 2. 프로젝트 상태 업데이트 트리거 (선택사항)
-- ============================================================================
