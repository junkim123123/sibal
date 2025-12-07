# Settings 페이지 구현 완료

## 개요

사용자 설정 페이지가 성공적으로 구현되었습니다. 이 페이지를 통해 사용자는 프로필 정보, 비밀번호, 구독 상태를 관리할 수 있습니다.

## 구현된 파일 목록

### 1. Server Actions
- **파일**: `actions/settings-actions.ts`
- **함수들**:
  - `getProfile`: 프로필 정보 조회
  - `updateProfile`: 프로필 정보 업데이트 (이름, 회사명)
  - `updatePassword`: 비밀번호 변경

### 2. UI 컴포넌트
- **파일들**:
  - `components/ui/input.tsx`: Input 컴포넌트
  - `components/ui/label.tsx`: Label 컴포넌트
  - `components/ui/card.tsx`: CardDescription 추가

### 3. 메인 페이지
- **파일**: `app/(dashboard)/settings/page.tsx`
- **기능**:
  - Profile 섹션: 이름, 회사명 수정
  - Security 섹션: 비밀번호 변경
  - Billing 섹션: 구독 상태 표시 및 Lemon Squeezy 링크

## 사용 방법

### 페이지 접근

설정 페이지는 다음 경로로 접근할 수 있습니다:

```
/settings
```

### 주요 기능

#### 1. Profile 섹션

- **이메일**: 읽기 전용 (변경 불가)
- **이름**: 수정 가능
- **회사명**: 수정 가능
- **저장 버튼**: 변경사항 저장

#### 2. Security 섹션

- **현재 비밀번호**: 현재 비밀번호 입력
- **새 비밀번호**: 새 비밀번호 입력 (최소 6자)
- **새 비밀번호 확인**: 새 비밀번호 재입력
- **비밀번호 변경 버튼**: 비밀번호 업데이트

**비밀번호 변경 로직**:
1. 현재 비밀번호로 로그인 시도하여 검증
2. 검증 성공 시 새 비밀번호로 업데이트
3. Supabase Auth API 사용

#### 3. Billing 섹션

- **현재 구독 상태**: Free / Pro 표시
- **구독 가격**: Pro인 경우 $49.00/월 표시
- **Manage Subscription 버튼**: Lemon Squeezy Customer Portal로 새 창 열기

**Lemon Squeezy 링크**:
- URL: `https://nexsupply.lemonsqueezy.com/buy/54fac477-2cf4-467f-b995-a2e760e5a02b`
- 새 창에서 열림 (`_blank`)

## 데이터 구조

### Profile 데이터

- `id`: 사용자 UUID
- `email`: 이메일 (읽기 전용)
- `name`: 이름 (수정 가능)
- `company`: 회사명 (수정 가능)
- `role`: 구독 상태 ('free' 또는 'pro')

## 보안

### 비밀번호 변경

- 현재 비밀번호 검증 후에만 변경 가능
- Supabase Auth API를 사용하여 안전하게 처리
- 최소 6자 이상의 비밀번호 요구

### 권한 관리

- 사용자는 자신의 프로필만 조회/수정 가능
- RLS 정책으로 데이터베이스 레벨에서 보호

## UI 특징

- **반응형 디자인**: 모바일과 데스크탑 모두 지원
- **로딩 상태**: Skeleton UI로 로딩 표시
- **에러/성공 알림**: Alert 컴포넌트로 피드백 제공
- **카드 레이아웃**: 각 섹션을 Card로 구분

## 다음 단계 (선택사항)

1. **이메일 변경 기능**: 관리자 승인을 통한 이메일 변경
2. **2FA 설정**: 2단계 인증 설정
3. **알림 설정**: 이메일 알림 설정
4. **API 키 관리**: API 키 생성/관리
5. **계정 삭제**: 계정 삭제 기능

## 참고사항

- 이메일은 변경할 수 없습니다
- 비밀번호는 최소 6자 이상이어야 합니다
- 구독 관리는 Lemon Squeezy 고객 포털에서 진행됩니다
- 모든 변경사항은 즉시 반영됩니다
