# NexSupply 플랫폼 완전 인수인계 문서

## 📋 문서 개요

이 문서는 NexSupply 플랫폼의 **완전한 인수인계 가이드**입니다. 신입 개발자가 프로젝트를 이해하고 즉시 작업을 시작할 수 있도록 모든 필요한 정보를 포함하고 있습니다.

**작성일**: 2024년 12월  
**버전**: 1.0.0  
**대상**: 신입 개발자, 새로운 팀원

---

## 🎯 프로젝트 개요

### 한 줄 정의
> **NexSupply**는 AI 기반 B2B 소싱 인텔리전스 플랫폼으로, 중소 셀러/리테일러가 안전하게 해외 소싱을 시작할 수 있게 해주는 매니지드 소싱 플랫폼입니다.

### 핵심 가치
1. **AI 분석 엔진**: Gemini 2.5 Flash를 활용한 Landed Cost 계산 및 리스크 평가
2. **실시간 채팅**: 매니저와 클라이언트 간 실시간 소통 시스템
3. **프로젝트 관리**: 소싱 프로젝트 전체 생명주기 관리
4. **결제 시스템**: Lemon Squeezy 통합 유료 구독 모델

### 비즈니스 모델
- **무료 티어 (Free)**: 기본 AI 분석 제공
- **프로 티어 (Pro)**: $199/월 - 전문 매니저 연결 및 실행 지원

---

## 🏗️ 기술 스택

### Frontend
- **Framework**: Next.js 15.1.0 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: 
  - Radix UI
  - Lucide React (아이콘)
  - Framer Motion (애니메이션)

### Backend
- **런타임**: Node.js
- **API**: Next.js API Routes
- **서버 액션**: Next.js Server Actions

### 데이터베이스 & 인증
- **Database**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **실시간**: Supabase Realtime
- **Storage**: Supabase Storage

### AI & 외부 서비스
- **AI 모델**: Google Gemini 2.5 Flash
- **결제**: Lemon Squeezy
- **이메일**: Nodemailer + Google SMTP
- **Analytics**: Vercel Analytics

### 배포 & 인프라
- **호스팅**: Vercel
- **CI/CD**: GitHub + Vercel 자동 배포
- **환경 변수**: Vercel 환경 변수 관리

---

## 📁 프로젝트 구조

```
nexi.ai/
├── web/                          # Next.js 앱 (메인 애플리케이션)
│   ├── app/                      # App Router 페이지 및 API
│   │   ├── (marketing)/          # 마케팅 페이지
│   │   │   ├── dashboard/        # 클라이언트 대시보드
│   │   │   ├── pricing/          # 가격 페이지
│   │   │   └── ...
│   │   ├── admin/                # Super Admin 페이지
│   │   │   ├── dispatch/         # 프로젝트 배정
│   │   │   ├── users/            # 사용자 관리
│   │   │   └── revenue/          # 매출 대시보드
│   │   ├── manager/              # 매니저 페이지
│   │   │   ├── dashboard/        # 매니저 대시보드
│   │   │   └── workstation/      # 작업 공간
│   │   ├── api/                  # API 엔드포인트
│   │   │   ├── analyze/          # AI 분석
│   │   │   ├── chat-sessions/    # 채팅 세션
│   │   │   ├── payment/          # 결제 처리
│   │   │   └── ...
│   │   ├── chat/                 # AI 채팅 인터페이스
│   │   ├── login/                # 로그인/회원가입
│   │   └── results/              # 분석 결과 페이지
│   ├── components/               # 재사용 가능한 컴포넌트
│   │   ├── ManagerChat.tsx       # 채팅 컴포넌트
│   │   ├── ClientMessagesList.tsx
│   │   ├── AssetLibrary.tsx      # 파일 라이브러리
│   │   └── ...
│   ├── lib/                      # 유틸리티 및 헬퍼
│   │   ├── supabase/             # Supabase 클라이언트
│   │   ├── email/                # 이메일 유틸리티
│   │   └── ...
│   ├── supabase/                 # 데이터베이스 스키마
│   │   ├── schema.sql            # 기본 스키마
│   │   ├── schema_extensions.sql
│   │   ├── super_admin_schema.sql
│   │   └── ...
│   └── docs/                     # 문서
├── vercel.json                   # Vercel 설정
└── README.md
```

---

## 🗄️ 데이터베이스 스키마

### 핵심 테이블

#### 1. `profiles` (사용자 프로필)
```sql
- id: UUID (Primary Key, auth.users 참조)
- email: TEXT (Unique)
- name: TEXT
- full_name: TEXT (매니저 표시용 이름)
- company: TEXT
- role: TEXT ('free', 'pro', 'manager', 'admin', 'super_admin')
- is_manager: BOOLEAN
- workload_score: INTEGER (매니저 작업량)
- is_banned: BOOLEAN
- total_spend: NUMERIC
- phone: TEXT (전화번호, WhatsApp 연결용)
- telegram_id: TEXT (Telegram ID)
- created_at: TIMESTAMPTZ
```

#### 2. `projects` (프로젝트)
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → profiles.id)
- manager_id: UUID (Foreign Key → profiles.id, nullable)
- name: TEXT
- status: TEXT ('active', 'completed', 'archived', 'in_progress')
- initial_risk_score: NUMERIC
- total_landed_cost: NUMERIC
- current_milestone_index: INTEGER
- milestones: JSONB
- dispatched_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
```

#### 3. `chat_sessions` (채팅 세션)
```sql
- id: UUID (Primary Key)
- project_id: UUID (Foreign Key → projects.id)
- user_id: UUID (Foreign Key → profiles.id)
- manager_id: UUID (Foreign Key → profiles.id, nullable)
- status: TEXT ('open', 'in_progress', 'resolved', 'closed')
- created_at: TIMESTAMPTZ
```

#### 4. `chat_messages` (채팅 메시지)
```sql
- id: UUID (Primary Key)
- session_id: UUID (Foreign Key → chat_sessions.id)
- sender_id: UUID (Foreign Key → profiles.id)
- role: TEXT ('user', 'manager')
- content: TEXT
- file_url: TEXT (nullable)
- file_name: TEXT (nullable)
- file_type: TEXT (nullable)
- read_at: TIMESTAMPTZ (nullable)
- created_at: TIMESTAMPTZ
```

#### 5. `messages` (AI 분석 메시지)
```sql
- id: UUID (Primary Key)
- project_id: UUID (Foreign Key → projects.id)
- role: TEXT ('user', 'ai')
- content: TEXT
- timestamp: TIMESTAMPTZ
```

### 데이터베이스 설정 방법

1. **Supabase 프로젝트 생성**
   - [supabase.com](https://supabase.com)에서 새 프로젝트 생성

2. **스키마 실행**
   - Supabase 대시보드 → SQL Editor
   - 다음 순서로 SQL 파일 실행:
     1. `web/supabase/schema.sql`
     2. `web/supabase/schema_extensions.sql`
     3. `web/supabase/manager_schema_extensions.sql`
     4. `web/supabase/super_admin_schema.sql`
     5. `web/supabase/chat_sessions_schema.sql`
     6. `web/supabase/email_notifications_schema.sql`
     7. `web/supabase/migrations/add_manager_phone_telegram.sql` (매니저 연락처 정보용)

3. **Storage 버킷 생성**
   - Storage → Create Bucket
   - 이름: `chat-files`
   - Public: false (비공개)

4. **Realtime 활성화**
   - Database → Replication
   - `chat_messages` 테이블 활성화

---

## 🔐 환경 변수 설정

### 필수 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key
GEMINI_CUSTOM_MODEL_ID=your-custom-model-id (선택사항)

# Lemon Squeezy (결제)
LEMONSQUEEZY_API_KEY=your-lemonsqueezy-api-key
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret
LEMON_SQUEEZY_STORE_URL=https://your-store.lemonsqueezy.com/checkout/buy/your-product-id

# Email (Google SMTP)
GMAIL_USER=your-email@nexsupply.net
GMAIL_APP_PASSWORD=your-app-password

# 파일 정리 (선택사항)
CLEANUP_API_KEY=your-cleanup-secret-key
CRON_SECRET=your-cron-secret

# NextAuth (선택사항)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### Vercel 환경 변수 설정

1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Environment Variables
3. 위의 모든 환경 변수 추가 (Production, Preview, Development)

---

## 🚀 로컬 개발 환경 설정

### 1. 필수 소프트웨어 설치

```bash
# Node.js 18+ 설치 확인
node --version

# npm 또는 yarn 설치 확인
npm --version
```

### 2. 프로젝트 클론 및 설정

```bash
# 저장소 클론
git clone <repository-url>
cd nexi.ai

# web 디렉토리로 이동
cd web

# 의존성 설치
npm install --legacy-peer-deps

# 환경 변수 파일 생성
cp .env.example .env.local
# .env.local 파일에 모든 환경 변수 설정
```

### 3. 개발 서버 실행

```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

### 4. 데이터베이스 마이그레이션

Supabase 대시보드에서 SQL 파일들을 순서대로 실행 (위 "데이터베이스 설정 방법" 참조)

---

## 🌐 주요 기능 및 페이지

### 1. 클라이언트 기능

#### 대시보드 (`/dashboard`)
- 프로젝트 목록
- 메시지 목록 (매니저와의 채팅)
- 파일 라이브러리
- 분석 결과

#### AI 분석 플로우
1. `/chat` - AI와 대화하여 프로젝트 정보 수집
2. `/results` - AI 분석 결과 확인
3. `/dashboard/chat` - 매니저와 실시간 채팅

### 2. 매니저 기능

#### 매니저 대시보드 (`/manager/dashboard`)
- 할당된 프로젝트 목록
- KPI 카드 (Active Clients, Revenue, 등)

#### 작업 공간 (`/manager/workstation`)
- 클라이언트 리스트
- 실시간 채팅
- 마일스톤 관리
- 파일 관리

### 3. Super Admin 기능

#### Admin 대시보드 (`/admin`)
- 미배정 프로젝트 수
- 활성 프로젝트 수
- 총 매출
- 매니저 가동률

#### 프로젝트 배정 (`/admin/dispatch`)
- 미배정 프로젝트 목록
- 매니저 풀
- 프로젝트 배정 기능

#### 사용자 관리 (`/admin/users`)
- 사용자 목록
- 사용자 차단/해제
- 강제 환불

---

## 🔄 사용자 플로우

### 1. 신규 사용자 플로우

```
1. 랜딩 페이지 접속
2. 가격 페이지 확인
3. 무료로 시작 (회원가입)
4. AI 분석 시작 (/chat)
5. 분석 결과 확인 (/results)
6. 프로 결제 ($199)
7. 매니저 배정 대기
8. 매니저와 채팅 시작
```

### 2. 매니저 플로우

```
1. @nexsupply.net 이메일로 로그인
2. 자동으로 /manager/dashboard로 리다이렉트
3. 할당된 프로젝트 확인
4. /manager/workstation에서 클라이언트 선택
5. 실시간 채팅 및 프로젝트 관리
```

### 3. Super Admin 플로우

```
1. k.myungjun@nexsupply.net으로 로그인
2. 자동으로 /admin으로 리다이렉트
3. 대시보드에서 전체 현황 확인
4. /admin/dispatch에서 프로젝트 배정
5. /admin/users에서 사용자 관리
```

---

## 🔑 인증 및 권한 시스템

### 역할 (Role) 구조

1. **free**: 무료 사용자 (기본)
2. **pro**: 유료 사용자 ($199/월)
3. **manager**: 매니저 (@nexsupply.net 이메일)
4. **admin**: 관리자
5. **super_admin**: Super Admin (k.myungjun@nexsupply.net)

### 자동 리다이렉트

- `@nexsupply.net` 이메일 → `/manager/dashboard`
- `k.myungjun@nexsupply.net` → `/admin`
- 일반 사용자 → `/dashboard`

### 미들웨어 보호

- `/admin/*`: `super_admin`만 접근 가능
- `/manager/*`: `manager` 또는 `admin`만 접근 가능
- `/dashboard/*`: 로그인 필요

---

## 💰 결제 시스템 (Lemon Squeezy)

### 워크플로우

1. **결제 시작**
   - 사용자가 "Validator" 버튼 클릭
   - `/api/payment/create-checkout-url` 호출
   - Lemon Squeezy Checkout URL 생성
   - 사용자 리다이렉트

2. **결제 완료**
   - Lemon Squeezy에서 웹훅 호출
   - `/api/payment/webhook`에서 처리
   - HMAC 시그니처 검증
   - `profiles.role`을 `'pro'`로 업데이트

3. **매출 통계**
   - `/api/admin/revenue`에서 Lemon Squeezy API 호출
   - 총 주문 수 및 최근 주문 조회

---

## 📧 이메일 알림 시스템

### 알림 종류

1. **분석 완료 알림** (`Analysis Completed`)
   - AI 분석이 완료되면 클라이언트에게 발송

2. **새 메시지 알림** (`New Message from Manager`)
   - 매니저가 메시지를 보내면 클라이언트에게 발송
   - 1시간 내 중복 알림 방지 (Throttling)

3. **마일스톤 업데이트 알림** (`Milestone Updates`)
   - 프로젝트 마일스톤이 업데이트되면 알림

## 📱 WhatsApp/Telegram 연결 시스템

### WhatsAppConnectCard 컴포넌트

**위치**: `web/components/WhatsAppConnectCard.tsx`

**주요 기능**:
1. **매니저 연락처 정보 표시**
   - 매니저 이름 (`profiles.full_name`)
   - 전화번호 (`profiles.phone`)
   - Telegram ID (`profiles.telegram_id`)

2. **사용자 전화번호 관리**
   - 사용자 전화번호 입력 필드
   - 입력한 전화번호를 `profiles.phone`에 저장
   - 저장된 전화번호 자동 불러오기

3. **WhatsApp 연결**
   - WhatsApp 링크 생성 (`https://wa.me/{phone}?text={message}`)
   - 프로젝트 정보 자동 포함 (이메일, 제품명, 프로젝트 ID)
   - QR 코드 표시 (qrserver.com API 사용)
   - 기본 전화번호: +1 (314) 657-7892 (매니저 전화번호가 없을 경우)

4. **콜백 요청**
   - WhatsApp이 없는 사용자를 위한 콜백 요청 기능
   - 활동 로그에 `callback_requested` 이벤트 기록

5. **활동 로그**
   - WhatsApp 연결 클릭 시 `whatsapp_connect_clicked` 이벤트 기록
   - 콜백 요청 시 `callback_requested` 이벤트 기록
   - `/api/manager/activity-log` API를 통해 `consultation_notes` 테이블에 시스템 메시지로 저장

**사용 위치**:
- `/dashboard/chat?project_id=xxx` - 클라이언트 채팅 페이지
- `/manager/workstation` - 매니저 워크스테이션 (프로젝트 선택 시 표시)

### 데이터베이스 스키마 확장

매니저 연락처 정보를 위해 `profiles` 테이블에 다음 필드가 추가되었습니다:
- `phone` (TEXT): 전화번호
- `telegram_id` (TEXT): Telegram ID
- `full_name` (TEXT): 표시용 이름

마이그레이션 파일: `web/supabase/migrations/add_manager_phone_telegram.sql`

### 설정

- **SMTP**: Google SMTP 사용
- **템플릿**: `web/lib/email/templates.tsx`
- **발송 유틸**: `web/lib/email/sender.ts`

---

## 📊 API 엔드포인트

### 분석 API
- `POST /api/analyze` - AI 분석 실행
- `GET /api/analyze-product` - 제품 분석

### 채팅 API
- `GET /api/chat-sessions` - 채팅 세션 목록
- `POST /api/chat-sessions` - 새 채팅 세션 생성
- `POST /api/chat-messages` - 메시지 전송
- `POST /api/chat/upload` - 파일 업로드

### 매니저 API
- `GET /api/manager/projects` - 할당된 프로젝트 목록
- `GET /api/manager/chat-sessions` - 매니저 채팅 세션
- `POST /api/manager/milestones` - 마일스톤 업데이트
- `POST /api/manager/files/upload` - 파일 업로드
- `POST /api/manager/activity-log` - 활동 로그 기록 (WhatsApp 연결, 콜백 요청 등)
- `GET /api/manager/consultation-notes` - 상담 일지 조회
- `POST /api/manager/consultation-notes` - 상담 일지 저장

### 결제 API
- `GET /api/payment/create-checkout-url` - Checkout URL 생성
- `POST /api/payment/webhook` - Lemon Squeezy 웹훅

### 관리자 API
- `POST /api/admin/cleanup-old-files` - 오래된 파일 삭제
- `GET /api/cron/cleanup-old-files` - Cron Job (매일 오전 2시)

### 프로젝트 API
- `GET /api/projects` - 프로젝트 목록
- `POST /api/projects` - 새 프로젝트 생성

---

## 🔧 주요 컴포넌트

### 1. ManagerChat
**위치**: `web/components/ManagerChat.tsx`
- 실시간 채팅 인터페이스
- Supabase Realtime 사용
- 파일 업로드 지원
- Quick Replies (매니저용)

### 2. ClientMessagesList
**위치**: `web/components/ClientMessagesList.tsx`
- 클라이언트용 메시지 목록
- 프로젝트별 채팅 세션 표시
- 읽지 않은 메시지 배지

### 3. AssetLibrary
**위치**: `web/components/AssetLibrary.tsx`
- 파일 라이브러리
- 카테고리별 필터링
- Quotes, Invoices, QC Reports 등

### 4. MilestoneTracker
**위치**: `web/components/MilestoneTracker.tsx`
- 프로젝트 마일스톤 타임라인
- 마일스톤 업데이트 기능

### 5. WhatsAppConnectCard
**위치**: `web/components/WhatsAppConnectCard.tsx`
- WhatsApp/Telegram 연결 카드 컴포넌트
- 매니저 연락처 정보 표시 (전화번호, Telegram ID)
- 사용자 전화번호 입력 및 프로필 저장
- WhatsApp 링크 생성 및 QR 코드 표시 (qrserver.com API 사용)
- 콜백 요청 기능
- 활동 로그 기록 (`/api/manager/activity-log`)
- 사용 위치:
  - `/dashboard/chat` (클라이언트 채팅 페이지)
  - `/manager/workstation` (매니저 워크스테이션)

---

## 🗂️ 파일 정리 시스템

### 6개월 자동 삭제

- **목적**: 저장 공간 절약
- **대상**: 6개월 이상 지난 채팅 파일/이미지
- **유지**: 텍스트 메시지는 유지, 파일만 삭제
- **실행**: 매일 오전 2시 (Vercel Cron)
- **API**: `/api/cron/cleanup-old-files`

---

## 📝 완료된 주요 기능

### ✅ 완료된 기능 목록

1. **인증 시스템**
   - Supabase Auth 통합
   - 역할 기반 접근 제어
   - 자동 리다이렉트

2. **AI 분석 시스템**
   - Gemini 2.5 Flash 통합
   - Landed Cost 계산
   - 리스크 평가
   - 블랙리스트 체크

3. **실시간 채팅**
   - Supabase Realtime
   - 파일 업로드
   - 읽음 표시
   - Quick Replies

4. **매니저 시스템**
   - 매니저 대시보드
   - 작업 공간
   - 마일스톤 관리
   - 클라이언트 관리

5. **Super Admin**
   - 프로젝트 배정
   - 사용자 관리
   - 매출 대시보드
   - Lemon Squeezy 통합

6. **결제 시스템**
   - Lemon Squeezy 통합
   - 웹훅 처리
   - 역할 자동 업데이트

7. **이메일 알림**
   - 분석 완료 알림
   - 새 메시지 알림
   - Throttling 로직

8. **파일 관리**
   - 파일 라이브러리
   - 자동 정리 시스템

9. **법적 페이지**
   - Terms of Service
   - Privacy Policy
   - Refund Policy

---

## 🔨 개발 가이드

### 코드 스타일
- TypeScript 사용
- ESLint 설정 따름
- 컴포넌트는 함수형 컴포넌트
- Server Components 우선 사용

### 브랜치 전략
- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- 기능별 브랜치: `feature/feature-name`

### 커밋 메시지
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
refactor: 리팩토링
chore: 빌드 업무 수정
```

---

## 🚨 문제 해결

### 일반적인 문제

1. **Supabase 연결 오류**
   - 환경 변수 확인
   - Service Role Key 확인

2. **빌드 실패**
   - `npm install --legacy-peer-deps` 실행
   - Node.js 버전 확인 (18+)

3. **파일 업로드 실패**
   - Storage 버킷 생성 확인
   - Storage 정책 확인

4. **Vercel 배포 실패**
   - Root Directory가 `web`으로 설정되었는지 확인
   - 환경 변수 모두 설정되었는지 확인

---

## 📚 추가 자료

### 문서 목록

- `web/docs/` 디렉토리의 모든 문서
- 주요 문서:
  - `SUPER_ADMIN_COMPLETE.md`
  - `MANAGER_WORKSTATION_COMPLETE.md`
  - `CHAT_FILE_CLEANUP_COMPLETE.md`
  - `CLIENT_CHAT_ACCESS_COMPLETE.md`

### 외부 리소스
- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Vercel 문서](https://vercel.com/docs)

---

## 🎯 다음 단계 (개선 사항)

### 우선순위 높음
1. UI 텍스트 영어화 완료
2. 에러 핸들링 강화
3. 로딩 상태 개선
4. 모바일 반응형 개선

### 우선순위 중간
1. 실시간 알림 (브라우저 알림)
2. 파일 미리보기 기능
3. 검색 기능 강화
4. 다국어 지원

### 우선순위 낮음
1. 다크 모드
2. 테마 커스터마이징
3. 고급 분석 기능

---

## 👥 연락처 및 리소스

### 개발 관련
- **저장소**: GitHub Repository
- **배포**: Vercel Dashboard
- **데이터베이스**: Supabase Dashboard

### 지원
- 문서가 부족한 경우 기존 개발자에게 문의
- 이슈는 GitHub Issues에 등록

---

## ✅ 체크리스트 (신입 온보딩)

신입 개발자가 해야 할 일:

- [ ] 프로젝트 클론 및 로컬 환경 설정
- [ ] Supabase 프로젝트 접근 권한 획득
- [ ] 환경 변수 모두 설정
- [ ] 로컬 개발 서버 실행 성공
- [ ] 모든 주요 페이지 탐색
- [ ] 주요 API 엔드포인트 테스트
- [ ] 데이터베이스 스키마 이해
- [ ] 코드베이스 구조 파악
- [ ] 첫 번째 작은 작업 완료

---

**문서 작성자**: AI Assistant  
**최종 업데이트**: 2024년 12월  
**버전**: 1.1.0 (WhatsAppConnectCard 정보 추가)  
**다음 리뷰 예정일**: 필요시 업데이트

---

이 문서가 도움이 되었나요? 개선 사항이 있다면 GitHub Issues에 제안해주세요!

