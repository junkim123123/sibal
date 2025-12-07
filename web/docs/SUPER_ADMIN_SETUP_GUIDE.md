# 슈퍼 어드민 계정 생성 가이드

## 문제 해결

`UPDATE profiles SET role = 'super_admin'` 명령이 실패하는 이유는 `profiles.role` 필드에 CHECK 제약 조건이 `('free', 'pro')`만 허용하도록 설정되어 있기 때문입니다.

## 해결 방법

### 방법 1: Quick Setup SQL 실행 (권장)

**파일**: `web/supabase/quick_super_admin_setup.sql`

1. Supabase 대시보드 접속
2. SQL Editor로 이동
3. `quick_super_admin_setup.sql` 파일 내용을 복사
4. 이메일 주소를 본인의 이메일로 변경
5. 실행

이 스크립트는:
- CHECK 제약 조건을 자동으로 업데이트
- 슈퍼 어드민 권한 부여
- 결과 확인

### 방법 2: 수동 실행

#### Step 1: CHECK 제약 조건 업데이트

```sql
-- 기존 제약 조건 제거
ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;

-- 새로운 제약 조건 추가 (super_admin 포함)
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('free', 'pro', 'manager', 'admin', 'super_admin'));
```

#### Step 2: 슈퍼 어드민 권한 부여

```sql
-- 이메일 주소를 본인의 이메일로 변경
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'your-email@nexsupply.net';
```

#### Step 3: 확인

```sql
SELECT id, email, role, name 
FROM profiles 
WHERE role = 'super_admin';
```

## 주의사항

### 프로필이 없는 경우

만약 해당 이메일로 프로필이 없다면:

1. **먼저 일반 회원가입 진행**:
   - `/login` 페이지에서 회원가입
   - 이메일: `your-email@nexsupply.net`
   - 비밀번호: 원하는 비밀번호

2. **그 다음 SQL 실행**:
   - 위의 Step 1, Step 2 실행

### 기존 계정이 있는 경우

기존 계정이 있다면 바로 Step 1, Step 2를 실행하면 됩니다.

## 완전한 스키마 확장 (선택사항)

모든 슈퍼 어드민 기능을 사용하려면 전체 스키마 확장도 실행하세요:

**파일**: `web/supabase/super_admin_schema.sql`

이 파일은 다음을 추가합니다:
- `workload_score` 필드
- `is_banned` 필드
- `total_spend` 필드
- `dispatched_at` 필드
- `payment_status` 필드
- 자동 워크로드 계산 트리거

## 접속 확인

1. 로그아웃 (이미 로그인되어 있다면)
2. 슈퍼 어드민 계정으로 로그인
3. `/admin` 경로로 접속
4. Dashboard가 표시되면 성공!

## 문제 해결

### "constraint does not exist" 에러

제약 조건 이름이 다를 수 있습니다. 다음으로 확인:

```sql
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'profiles' 
AND constraint_type = 'CHECK';
```

그 다음 해당 제약 조건을 제거:

```sql
ALTER TABLE profiles DROP CONSTRAINT [제약조건이름];
```

### "no rows updated" 에러

해당 이메일로 프로필이 없습니다. 먼저 회원가입을 진행하세요.

### 여전히 접근이 안 되는 경우

1. 브라우저 캐시 클리어
2. 로그아웃 후 다시 로그인
3. `middleware.ts`가 제대로 배포되었는지 확인

---

모든 설정이 완료되면 `/admin` 경로로 접속할 수 있습니다! 🎉

