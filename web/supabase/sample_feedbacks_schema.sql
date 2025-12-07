-- ============================================================================
-- NexSupply Sample Feedbacks Schema
-- ============================================================================
-- 
-- Sample Feedback with Image Annotation 기능을 위한 데이터베이스 스키마
-- 샘플 사진 위에 클라이언트가 직접 핀을 꽂고 피드백을 남길 수 있는 시스템
-- ============================================================================

-- ============================================================================
-- 1. sample_feedbacks 테이블 (샘플 회차 관리)
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_sample_feedbacks_project_id ON sample_feedbacks(project_id);
CREATE INDEX IF NOT EXISTS idx_sample_feedbacks_round_number ON sample_feedbacks(project_id, round_number);
CREATE INDEX IF NOT EXISTS idx_sample_feedbacks_status ON sample_feedbacks(overall_status);
CREATE INDEX IF NOT EXISTS idx_sample_feedbacks_created_at ON sample_feedbacks(created_at DESC);

-- RLS 정책 설정
ALTER TABLE sample_feedbacks ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로젝트에 속한 샘플 피드백만 조회 가능
CREATE POLICY "Users can view sample feedbacks in own projects"
    ON sample_feedbacks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = sample_feedbacks.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- 매니저는 할당된 프로젝트의 샘플 피드백 조회/생성/수정 가능
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

-- 사용자는 자신의 프로젝트에 속한 샘플 피드백의 상태를 업데이트 가능
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

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_sample_feedbacks_updated_at
    BEFORE UPDATE ON sample_feedbacks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. sample_annotations 테이블 (이미지 위 마킹 데이터)
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_sample_annotations_feedback_id ON sample_annotations(feedback_id);
CREATE INDEX IF NOT EXISTS idx_sample_annotations_image_url ON sample_annotations(image_url);
CREATE INDEX IF NOT EXISTS idx_sample_annotations_is_resolved ON sample_annotations(is_resolved);
CREATE INDEX IF NOT EXISTS idx_sample_annotations_created_at ON sample_annotations(created_at DESC);

-- RLS 정책 설정
ALTER TABLE sample_annotations ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로젝트에 속한 샘플 피드백의 주석만 조회/생성/수정 가능
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

-- 매니저는 할당된 프로젝트의 샘플 피드백 주석 조회/수정 가능 (is_resolved 업데이트)
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

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_sample_annotations_updated_at
    BEFORE UPDATE ON sample_annotations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Sample Feedbacks 스키마 생성 완료
-- ============================================================================
-- 
-- 다음 단계:
-- 1. Supabase 대시보드에서 이 스키마를 실행
-- 2. Storage 버킷 생성 (sample-images) - 이미지 업로드용
-- 3. Storage 정책 설정
-- ============================================================================
