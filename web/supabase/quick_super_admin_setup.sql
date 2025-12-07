-- ============================================================================
-- Quick Super Admin Setup
-- ============================================================================
-- 
-- 슈퍼 어드민 계정을 빠르게 생성하기 위한 SQL 스크립트
-- 
-- 사용 방법:
-- 1. Supabase 대시보드 > SQL Editor로 이동
-- 2. 이 파일의 내용을 복사하여 실행
-- 3. 아래 이메일 주소를 본인의 이메일로 변경
-- ============================================================================

-- Step 1: role CHECK 제약 조건 업데이트 (super_admin 추가)
DO $$ 
BEGIN
    -- 기존 CHECK 제약 조건 제거
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_role_check'
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
    END IF;
    
    -- 새로운 CHECK 제약 조건 추가 (super_admin 포함)
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('free', 'pro', 'manager', 'admin', 'super_admin'));
END $$;

-- Step 2: 슈퍼 어드민 계정 생성/업데이트
-- ⚠️ 아래 이메일 주소를 본인의 이메일로 변경하세요!
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'k.myungjun@nexsupply.net';  -- 👈 여기를 본인 이메일로 변경

-- Step 3: 확인
SELECT 
    id,
    email,
    role,
    name,
    is_manager,
    created_at
FROM profiles 
WHERE role = 'super_admin';

-- ============================================================================
-- 완료!
-- ============================================================================
-- 
-- 이제 /admin 경로로 접속할 수 있습니다.
-- 
-- 만약 프로필이 없다면 (새 계정인 경우):
-- 1. 먼저 일반 회원가입을 진행하세요 (/login)
-- 2. 그 다음 이 SQL을 다시 실행하세요
-- ============================================================================

