# 로그인 문제 해결 가이드

## 문제 진단

로그인이 작동하지 않는 경우 다음을 확인하세요:

### 1. 환경 변수 확인

Vercel 대시보드 또는 로컬 `.env.local` 파일에서 다음 환경 변수가 설정되어 있는지 확인:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**확인 방법:**
1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. 위 3개의 변수가 모두 설정되어 있는지 확인

### 2. Supabase 프로젝트 확인

1. Supabase 대시보드 접속
2. 프로젝트가 활성화되어 있는지 확인
3. API 키가 올바른지 확인 (Settings → API)

### 3. 브라우저 콘솔 확인

1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭 확인
3. Network 탭에서 로그인 요청 확인
4. 에러 메시지 확인

### 4. 일반적인 에러 메시지

#### "Invalid login credentials"
- 이메일 또는 비밀번호가 잘못되었습니다
- Supabase Auth에서 사용자가 생성되었는지 확인

#### "Missing Supabase environment variables"
- 환경 변수가 설정되지 않았습니다
- Vercel 환경 변수 또는 `.env.local` 파일 확인

#### "Network error" 또는 "Failed to fetch"
- Supabase URL이 잘못되었거나 네트워크 문제
- `NEXT_PUBLIC_SUPABASE_URL` 확인

## 해결 방법

### 1. 환경 변수 재설정

Vercel에서:
1. Settings → Environment Variables
2. 각 변수 삭제 후 다시 추가
3. 재배포

로컬에서:
1. `.env.local` 파일 확인
2. 변수 값이 올바른지 확인
3. 서버 재시작

### 2. Supabase 사용자 확인

Supabase 대시보드에서:
1. Authentication → Users
2. 테스트 계정이 존재하는지 확인
3. 없으면 수동으로 생성하거나 회원가입 사용

### 3. 로그인 액션 디버깅

브라우저 콘솔에서:
```javascript
// 로그인 시도 시 네트워크 요청 확인
// Network 탭에서 /api/auth/v1/token 요청 확인
```

## 수정된 코드

다음 개선사항이 적용되었습니다:

1. **환경 변수 검증**: Supabase 클라이언트 생성 시 환경 변수 확인
2. **에러 처리 개선**: 더 명확한 에러 메시지
3. **redirect() 처리**: Next.js redirect 예외 처리 개선

## 테스트 방법

1. **환경 변수 확인**:
   ```bash
   # 로컬에서
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Supabase 연결 테스트**:
   - Supabase 대시보드 → SQL Editor
   - 간단한 쿼리 실행하여 연결 확인

3. **로그인 테스트**:
   - 올바른 이메일/비밀번호로 로그인 시도
   - 브라우저 콘솔에서 에러 확인

## 추가 도움말

문제가 지속되면:
1. Vercel 로그 확인 (Deployments → 해당 배포 → Functions Logs)
2. Supabase 로그 확인 (Supabase 대시보드 → Logs)
3. 브라우저 네트워크 탭에서 요청/응답 확인
