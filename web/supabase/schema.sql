-- ============================================================================
-- NexSupply AI Analyzer - Supabase Database Schema
-- ============================================================================
-- 
-- 이 스키마는 NexSupply AI Analyzer의 핵심 데이터 모델을 정의합니다.
-- 프로필, 프로젝트, 메시지 데이터를 영구적으로 저장하여 AI 분석 결과를
-- 축적하고 향후 모델 고도화에 활용합니다.
--
-- 생성 방법:
-- 1. Supabase 대시보드 > SQL Editor로 이동
-- 2. 이 파일의 내용을 복사하여 실행
-- ============================================================================

-- ============================================================================
-- 1. profiles 테이블 (사용자 정보)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    role TEXT DEFAULT 'free' CHECK (role IN ('free', 'pro')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================================================
-- 2. projects 테이블 (AI 분석 프로젝트)
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    initial_risk_score NUMERIC,
    total_landed_cost NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- RLS 정책 설정
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로젝트만 조회/생성/수정 가능
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- 3. messages 테이블 (채팅 히스토리 및 AI 응답)
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_project_timestamp ON messages(project_id, timestamp);

-- RLS 정책 설정
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로젝트에 속한 메시지만 조회/생성 가능
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
-- 4. 트리거 함수: updated_at 자동 업데이트
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. 프로필 자동 생성 함수 (사용자 가입 시 자동 생성)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        'free'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users에 새 사용자가 생성될 때 프로필 자동 생성
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 스키마 생성 완료
-- ============================================================================
-- 
-- 다음 단계:
-- 1. Supabase 대시보드에서 이 스키마를 실행
-- 2. Streamlit 앱에서 SUPABASE_URL과 SUPABASE_KEY 환경 변수 설정
-- 3. Streamlit 앱 코드에서 Supabase 클라이언트 초기화
-- ============================================================================
