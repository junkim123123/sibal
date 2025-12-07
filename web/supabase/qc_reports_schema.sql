-- ============================================================================
-- NexSupply QC Reports Schema
-- ============================================================================
-- 
-- Interactive QC Report 기능을 위한 데이터베이스 스키마
-- 디지털 검수 보고서 생성, 관리, 승인/거절 기능 지원
-- ============================================================================

-- ============================================================================
-- 1. qc_reports 테이블 (검수 보고서)
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_qc_reports_project_id ON qc_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_qc_reports_status ON qc_reports(status);
CREATE INDEX IF NOT EXISTS idx_qc_reports_created_at ON qc_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qc_reports_project_status ON qc_reports(project_id, status);

-- RLS 정책 설정
ALTER TABLE qc_reports ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로젝트에 속한 QC 리포트만 조회 가능
CREATE POLICY "Users can view QC reports in own projects"
    ON qc_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = qc_reports.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- 매니저는 할당된 프로젝트의 QC 리포트 조회/생성/수정 가능
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

-- 사용자는 자신의 프로젝트에 속한 QC 리포트의 상태를 업데이트 가능 (승인/거절)
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

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_qc_reports_updated_at
    BEFORE UPDATE ON qc_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. qc_report_items 테이블 (검수 항목 및 사진)
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_qc_report_items_report_id ON qc_report_items(report_id);
CREATE INDEX IF NOT EXISTS idx_qc_report_items_status ON qc_report_items(status);
CREATE INDEX IF NOT EXISTS idx_qc_report_items_category ON qc_report_items(category);
CREATE INDEX IF NOT EXISTS idx_qc_report_items_created_at ON qc_report_items(created_at DESC);

-- RLS 정책 설정
ALTER TABLE qc_report_items ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로젝트에 속한 QC 리포트의 항목만 조회 가능
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

-- 매니저는 할당된 프로젝트의 QC 리포트 항목 조회/생성/수정/삭제 가능
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

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_qc_report_items_updated_at
    BEFORE UPDATE ON qc_report_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. defect_rate 자동 계산 함수 (선택사항)
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

-- defect_rate 자동 계산 트리거
CREATE TRIGGER calculate_qc_report_defect_rate
    BEFORE INSERT OR UPDATE ON qc_reports
    FOR EACH ROW
    WHEN (NEW.total_quantity IS NOT NULL AND NEW.defect_quantity IS NOT NULL)
    EXECUTE FUNCTION calculate_defect_rate();

-- ============================================================================
-- QC Reports 스키마 생성 완료
-- ============================================================================
-- 
-- 다음 단계:
-- 1. Supabase 대시보드에서 이 스키마를 실행
-- 2. Storage 버킷 생성 (qc-images) - 이미지 업로드용
-- 3. Storage 정책 설정 (매니저만 업로드 가능)
-- ============================================================================

