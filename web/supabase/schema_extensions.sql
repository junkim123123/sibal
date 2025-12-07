-- ============================================================================
-- NexSupply Database Schema Extensions
-- ============================================================================
-- 
-- 실시간 채팅, 파일 첨부, 환불 불가 비즈니스 로직을 위한 스키마 확장
-- 기존 스키마(schema.sql, chat_sessions_schema.sql) 실행 후 이 파일을 실행
-- ============================================================================

-- ============================================================================
-- 1. profiles 테이블 확장 (사용자/매니저 정보 보강)
-- ============================================================================

-- name 필드 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN name TEXT;
    END IF;
END $$;

-- company 필드 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'company'
    ) THEN
        ALTER TABLE profiles ADD COLUMN company TEXT;
    END IF;
END $$;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company);

-- ============================================================================
-- 2. projects 테이블 확장 (환불 불가 상태 추적)
-- ============================================================================

-- final_quote_status 필드 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'final_quote_status'
    ) THEN
        ALTER TABLE projects ADD COLUMN final_quote_status TEXT DEFAULT 'pending' 
            CHECK (final_quote_status IN ('pending', 'accepted', 'rejected', 'finalized'));
    END IF;
END $$;

-- quote_acceptance_date 필드 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'quote_acceptance_date'
    ) THEN
        ALTER TABLE projects ADD COLUMN quote_acceptance_date TIMESTAMPTZ;
    END IF;
END $$;

-- manager_id 필드 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'manager_id'
    ) THEN
        ALTER TABLE projects ADD COLUMN manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_projects_final_quote_status ON projects(final_quote_status);
CREATE INDEX IF NOT EXISTS idx_projects_manager_id ON projects(manager_id);

-- ============================================================================
-- 3. chat_messages 테이블 확장 (파일 첨부 지원)
-- ============================================================================

-- file_url 필드 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'file_url'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN file_url TEXT;
    END IF;
END $$;

-- file_type 필드 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'file_type'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN file_type TEXT;
    END IF;
END $$;

-- file_name 필드 추가 (선택사항, 사용자 친화적)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'file_name'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN file_name TEXT;
    END IF;
END $$;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_chat_messages_file_url ON chat_messages(file_url) WHERE file_url IS NOT NULL;

-- ============================================================================
-- 4. Supabase Storage 버킷 생성 (파일 저장용)
-- ============================================================================
-- 
-- 다음은 SQL로 직접 실행할 수 없습니다. Supabase 대시보드에서 수동으로 설정:
-- 
-- 1. Storage → Create Bucket
-- 2. Bucket Name: "chat-files"
-- 3. Public: false (비공개)
-- 4. File size limit: 50 MB (또는 적절한 크기)
-- 
-- Storage 정책 설정 (SQL로 실행 가능):
-- ============================================================================

-- Storage 버킷 정책: 사용자는 자신의 프로젝트 파일만 업로드/조회 가능
-- 이 정책은 Supabase 대시보드 > Storage > Policies에서 설정하거나
-- 다음 SQL을 실행하여 설정할 수 있습니다:

-- 예시 정책 (프로젝트 소유자만 업로드):
-- CREATE POLICY "Users can upload to own project folder"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--     bucket_id = 'chat-files' 
--     AND (storage.foldername(name))[1] = auth.uid()::text
-- );

-- 예시 정책 (프로젝트 소유자만 조회):
-- CREATE POLICY "Users can view own project files"
-- ON storage.objects FOR SELECT
-- USING (
--     bucket_id = 'chat-files'
--     AND (storage.foldername(name))[1] = auth.uid()::text
-- );

-- ============================================================================
-- 스키마 확장 완료
-- ============================================================================
-- 
-- 다음 단계:
-- 1. Supabase 대시보드에서 Storage 버킷 "chat-files" 생성
-- 2. Storage 정책 설정 (위 참조)
-- 3. Realtime 활성화 (chat_messages 테이블)
-- ============================================================================

