# 스마트 이메일 알림 시스템 구현 완료 문서

## 개요

Nodemailer + Google SMTP를 사용한 스마트 이메일 알림 시스템이 완성되었습니다. Notification Fatigue를 방지하기 위해 중요한 비즈니스 이벤트에만 알림을 발송합니다.

## 완료된 작업

### 1. Nodemailer 클라이언트 설정

- **파일**: `web/lib/email/client.ts`
- **기능**:
  - Nodemailer + Google SMTP 설정
  - 이메일 발송 함수 (`sendEmail`)

### 2. 이메일 템플릿 구현

- **파일**: `web/lib/email/templates.tsx`
- **템플릿**:
  - `AnalysisCompletedEmail`: AI 분석 완료 알림
  - `MilestoneUpdatedEmail`: 마일스톤 업데이트 알림
  - `ImportantDocumentEmail`: 중요 문서 업로드 알림

### 3. 이메일 발송 유틸리티

- **파일**: `web/lib/email/sender.ts`
- **기능**:
  - Throttle 로직 (1시간 이내 중복 알림 방지)
  - 알림 타입별 발송 함수
  - 알림 시간 추적

### 4. 이벤트별 알림 연동

#### AI 분석 완료 시
- **파일**: `web/app/api/analyze/route.ts`
- 분석 완료 후 자동으로 이메일 발송

#### 마일스톤 업데이트 시
- **파일**: `web/app/api/manager/update-milestone/route.ts`
- 매니저가 마일스톤 업데이트 시 클라이언트에게 알림

#### 중요 파일 업로드 시
- **파일**: `web/app/api/chat-messages/route.ts`
- PDF, Word, Excel 등 중요 문서 업로드 시 알림

### 5. DB 스키마 확장

- **파일**: `web/supabase/email_notifications_schema.sql`
- **추가 필드**:
  - `projects.last_notification_sent_at`: 마지막 알림 발송 시간
  - `projects.last_notification_type`: 마지막 알림 타입

## 알림 정책

### 발송 조건

| 상황 | 알림 수단 | 발송 시점 | Throttle |
| :--- | :--- | :--- | :--- |
| **분석 완료** | 이메일 | AI 분석 완료 후 | 1시간 |
| **마일스톤 변경** | 이메일 | 매니저가 단계 업데이트 시 | 1시간 |
| **중요 파일 도착** | 이메일 | PDF/Word/Excel 업로드 시 | 1시간 |

### Notification Fatigue 방지

- **Throttle 로직**: 동일 프로젝트에 대해 1시간 이내 같은 타입의 알림은 발송하지 않음
- **중요 이벤트만**: 일반 채팅 메시지에는 알림 발송하지 않음
- **선택적 발송**: 사용자 이메일이 없으면 알림 발송하지 않음

## 환경 변수 설정

`.env.local` 파일에 다음 변수를 추가하세요:

```env
# Google SMTP 설정
GMAIL_USER=본인의_구글_이메일@nexsupply.net
GMAIL_APP_PASSWORD=앱_비밀번호_16자리

# (선택사항) 앱 URL (이메일 링크에 사용)
NEXT_PUBLIC_APP_URL=https://nexsupply.net
```

## Google 앱 비밀번호 발급 가이드

### 1단계: Google 계정 관리 페이지 접속

[Google 계정 관리 페이지](https://myaccount.google.com/) 접속

### 2단계: 2단계 인증 활성화

1. 왼쪽 메뉴에서 **보안 (Security)** 클릭
2. **2단계 인증 (2-Step Verification)**이 켜져 있는지 확인
3. 꺼져 있으면 먼저 활성화해야 합니다

### 3단계: 앱 비밀번호 생성

1. 2단계 인증 메뉴 안으로 들어가기
2. 맨 아래로 스크롤
3. **앱 비밀번호 (App passwords)** 클릭
4. **앱 선택**: `기타 (기타 이름 입력)` 선택
5. **이름**: `NexSupply` 입력
6. **만들기** 클릭
7. **16자리 비밀번호** 복사 (예: `abcd efgh ijkl mnop`)
   - 띄어쓰기 없이 `.env.local`에 저장

### 4단계: 환경 변수 설정

`.env.local` 파일에 추가:

```env
GMAIL_USER=ceo@nexsupply.net  # 또는 사용할 구글 이메일
GMAIL_APP_PASSWORD=abcdefghijklmnop  # 띄어쓰기 없이
```

## 사용 방법

### 1. DB 스키마 업데이트

Supabase SQL Editor에서 실행:

```sql
-- web/supabase/email_notifications_schema.sql 파일 내용 실행
```

### 2. 환경 변수 설정

위 가이드를 따라 Google 앱 비밀번호를 발급받고 `.env.local`에 설정

### 3. 테스트

#### 분석 완료 알림 테스트

1. `/chat`에서 프로젝트 생성 및 분석 완료
2. 사용자 이메일로 알림 확인

#### 마일스톤 업데이트 알림 테스트

1. 매니저로 로그인
2. `/manager/workstation`에서 마일스톤 업데이트
3. 클라이언트 이메일로 알림 확인

#### 중요 파일 업로드 알림 테스트

1. 매니저가 PDF/Word/Excel 파일 업로드
2. 클라이언트 이메일로 알림 확인

## 생성된 파일

- `web/lib/email/client.ts` ✅ (Nodemailer + Google SMTP)
- `web/lib/email/templates.tsx` ✅
- `web/lib/email/sender.ts` ✅
- `web/app/api/manager/update-milestone/route.ts` ✅
- `web/app/api/chat-messages/route.ts` ✅
- `web/supabase/email_notifications_schema.sql` ✅

## 참고

- 모든 이메일 발송은 비동기로 처리되며, 실패해도 메인 기능은 정상 작동
- Throttle 로직은 DB에 저장되어 서버 재시작 후에도 유지
- 이메일 템플릿은 간단한 HTML로 구성되어 모든 이메일 클라이언트에서 호환
- **Wix DNS 설정 불필요**: Google SMTP를 사용하므로 도메인 설정이 필요 없습니다

## 문제 해결

### "Invalid login" 오류

- 앱 비밀번호가 올바른지 확인 (일반 비밀번호가 아님)
- 2단계 인증이 활성화되어 있는지 확인
- `.env.local`에서 띄어쓰기 없이 입력했는지 확인

### 이메일이 스팸함으로 이동

- Google 계정에서 "보안 수준이 낮은 앱 액세스" 허용 (비권장)
- 또는 본인 도메인을 사용한 Gmail 계정 사용 권장

### 이메일이 발송되지 않음

- `.env.local` 파일이 제대로 로드되었는지 확인
- 서버 재시작 후 다시 시도
- 콘솔 로그에서 에러 메시지 확인
