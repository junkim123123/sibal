# Supabase 이메일 확인 설정 가이드

## 문제 해결

회원가입 후 이메일 확인 링크를 클릭하면 403 에러가 발생하는 문제를 해결했습니다.

## 구현된 내용

### 1. 인증 콜백 라우트 생성

`app/auth/callback/route.ts` 파일을 생성하여 Supabase 인증 콜백을 처리합니다:
- 이메일 확인 링크 (`code` 파라미터)
- 구형 이메일 확인 링크 (`token_hash` 파라미터)
- OAuth 리다이렉트
- Magic Link

### 2. 회원가입 액션 수정

`app/login/actions.ts`의 `signup` 함수에서 이메일 확인 후 리다이렉트 URL을 지정합니다.

### 3. 미들웨어 업데이트

`middleware.ts`에서 `/auth/callback` 경로를 제외하여 인증 체크를 건너뜁니다.

## Supabase 대시보드 설정

### 필수 설정

1. **Supabase 대시보드 접속**
   - [Supabase Dashboard](https://supabase.com/dashboard)
   - 프로젝트 선택

2. **Authentication → URL Configuration**
   - **Site URL**: 프로덕션 URL 설정
     - 예: `https://your-domain.com`
   - **Redirect URLs**: 다음 URL 추가
     ```
     https://your-domain.com/auth/callback
     http://localhost:3000/auth/callback (개발용)
     ```

3. **Authentication → Email Templates**
   - 이메일 템플릿에서 확인 링크가 올바른 형식인지 확인
   - 기본 템플릿 사용 시 자동으로 처리됨

### 환경 변수 확인

다음 환경 변수가 설정되어 있는지 확인:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

프로덕션에서는 다음도 설정:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

또는 Vercel을 사용하는 경우:

```bash
VERCEL_URL=your-domain.vercel.app
```

## 작동 방식

1. **회원가입**
   - 사용자가 회원가입 폼 제출
   - `signup` 액션이 `supabase.auth.signUp()` 호출
   - `emailRedirectTo` 옵션으로 콜백 URL 지정

2. **이메일 확인**
   - Supabase가 확인 이메일 발송
   - 이메일의 링크는 `/auth/callback?code=...&type=signup` 형식

3. **콜백 처리**
   - 사용자가 링크 클릭
   - `/auth/callback` 라우트가 `code`를 `exchangeCodeForSession()`으로 교환
   - 세션 생성 후 적절한 페이지로 리다이렉트

## 리다이렉트 규칙

이메일 확인 후 자동 리다이렉트:
- `k.myungjun@nexsupply.net` → `/admin`
- `*@nexsupply.net` (super admin 제외) → `/manager/dashboard`
- 기타 → `/dashboard`

## 테스트 방법

1. **로컬 테스트**
   ```bash
   npm run dev
   ```
   - `http://localhost:3000/login` 접속
   - 회원가입 진행
   - 이메일 확인 링크 클릭
   - 정상적으로 리다이렉트되는지 확인

2. **프로덕션 테스트**
   - Vercel에 배포
   - Supabase 대시보드에서 Redirect URLs 확인
   - 실제 이메일로 회원가입 테스트

## 문제 해결

### 여전히 403 에러가 발생하는 경우

1. **Supabase Redirect URLs 확인**
   - 대시보드 → Authentication → URL Configuration
   - 정확한 URL이 추가되어 있는지 확인
   - 프로토콜(`https://`) 포함 확인

2. **환경 변수 확인**
   - `NEXT_PUBLIC_SUPABASE_URL`이 올바른지 확인
   - 프로덕션 URL이 올바른지 확인

3. **브라우저 콘솔 확인**
   - 개발자 도구 → Network 탭
   - `/auth/callback` 요청 확인
   - 에러 메시지 확인

4. **Supabase 로그 확인**
   - Supabase 대시보드 → Logs
   - 인증 관련 에러 확인

## 추가 참고사항

- 이메일 확인은 Supabase의 기본 기능입니다
- 이메일 템플릿은 Supabase 대시보드에서 커스터마이징 가능합니다
- 확인 링크는 기본적으로 24시간 동안 유효합니다
