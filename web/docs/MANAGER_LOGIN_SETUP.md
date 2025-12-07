# 매니저 로그인 설정 가이드

## 개요

별도의 매니저 전용 로그인 페이지(`/manager/login`)가 생성되었습니다. 일반 로그인 페이지에서 링크를 통해 접근할 수 있으며, 매니저만 접근 가능하도록 권한 검증이 포함되어 있습니다.

## 구현 내용

### 1. 매니저 로그인 페이지

- 별도의 페이지: `/manager/login`
- Shield 아이콘으로 매니저 전용임을 명시
- 깔끔한 단일 페이지 디자인

### 2. 일반 로그인 페이지 연동

- 일반 로그인 페이지 하단에 "매니저 로그인" 링크 추가
- 클릭 시 `/manager/login`으로 이동

### 3. 권한 검증

- 로그인 후 `profiles.is_manager = TRUE` 또는 `profiles.role = 'admin'` 확인
- 권한이 없으면 접근 차단 및 에러 메시지 표시
- 권한이 있으면 `/manager/dashboard`로 리다이렉트

## 관리자 계정 설정

제공된 관리자 계정 정보:

- **이메일**: `k.myungjun@nexsupply.net`
- **비밀번호**: `Klm73598910@`

### Supabase에서 매니저 권한 부여

Supabase SQL Editor에서 다음 SQL을 실행하세요:

```sql
-- 1. 먼저 프로필이 존재하는지 확인
SELECT id, email, is_manager, role 
FROM profiles 
WHERE email = 'k.myungjun@nexsupply.net';

-- 2. 매니저 권한 부여
UPDATE profiles 
SET is_manager = TRUE, role = 'pro'
WHERE email = 'k.myungjun@nexsupply.net';

-- 3. 확인
SELECT id, email, is_manager, role 
FROM profiles 
WHERE email = 'k.myungjun@nexsupply.net';
```

### 계정이 없는 경우

만약 해당 이메일로 계정이 없다면:

1. **일반 회원가입**: `/login` 페이지에서 일반 회원가입 진행
2. **매니저 권한 부여**: 위 SQL로 `is_manager = TRUE` 설정

## 사용 방법

1. `/login` 페이지 접속
2. 페이지 하단의 "매니저 로그인" 링크 클릭
3. `/manager/login` 페이지로 이동
4. 관리자 이메일과 비밀번호 입력
5. "Manager Sign In" 버튼 클릭
6. 성공 시 `/manager/dashboard`로 자동 리다이렉트

## 보안

- 매니저가 아닌 계정으로 로그인 시도 시 자동 로그아웃 처리
- 에러 메시지: "Access denied. This account does not have manager privileges."
- 미들웨어와 레이아웃에서 이중 권한 검증

## 파일 구조

```
web/app/
├── login/
│   ├── page.tsx          # 일반 로그인 페이지 (매니저 로그인 링크 포함)
│   └── actions.ts        # 로그인 액션 (login, signup, managerLogin)
└── manager/
    └── login/
        └── page.tsx      # 매니저 전용 로그인 페이지
```

## 다음 단계

나중에 추가 매니저 계정을 생성하려면:

1. Supabase Auth에서 계정 생성 또는 일반 회원가입
2. SQL Editor에서 `is_manager = TRUE` 설정
3. `/manager/login` 페이지에서 로그인 가능

모든 설정이 완료되었습니다! 🎉

