# Nexi.ai (NexSupply) 인수인계 문서

## 📋 문서 개요

**프로젝트명**: Nexi.ai (NexSupply)  
**문서 작성일**: 2024년 12월  
**버전**: 2.0.0  
**대상**: 신입 개발자, 새로운 팀원, 프로젝트 인수인계 담당자

---

## 🎯 Nexi.ai란?

### 한 줄 정의

> **Nexi.ai (NexSupply)**는 AI 기반 B2B 글로벌 소싱 인텔리전스 플랫폼으로, 중소 셀러와 리테일러가 안전하고 효율적으로 해외 제품 소싱을 시작할 수 있도록 돕는 매니지드 소싱 서비스입니다.

### 핵심 가치 제안

1. **AI 기반 Landed Cost 분석**
   - Google Gemini 2.5 Flash를 활용한 실시간 비용 분석
   - 관세, 운송비, 포장비 등 모든 숨은 비용 포함
   - 다양한 물량과 운송 방식(Air/Sea)별 비교 분석

2. **리스크 평가 시스템**
   - Quality, Delivery, Stability, Difficulty 4가지 차원의 리스크 평가
   - HS 코드 기반 관세 분석
   - 컴플라이언스 및 인증 요구사항 분석

3. **매니지드 소싱 서비스**
   - 전문 매니저와의 1:1 실시간 채팅
   - 팩토리 검증, 견적 협상, QC, 물류 전 과정 지원
   - 프로젝트 마일스톤 자동 추적

4. **대화형 AI 코파일럿**
   - 자연어 기반 제품 분석
   - 3-5개의 간단한 질문으로 포괄적인 분석 리포트 생성
   - 카테고리별 맞춤 질문 및 조언

### 비즈니스 모델

- **무료 티어 (Free)**: 기본 AI 분석 (월 30회 제한)
- **프로 티어 (Pro)**: $199/월
  - 무제한 AI 분석
  - 전문 매니저 연결
  - 프로젝트 실행 지원
  - 실시간 채팅 지원

---

## 🏗️ 기술 아키텍처

### Frontend 스택

- **Framework**: Next.js 15.1.0 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트 라이브러리**:
  - Radix UI (접근성 높은 컴포넌트)
  - Lucide React (아이콘)
  - Framer Motion (애니메이션)
  - Recharts (데이터 시각화)

### Backend 스택

- **런타임**: Node.js
- **API**: Next.js API Routes
- **서버 액션**: Next.js Server Actions
- **미들웨어**: Next.js Middleware (인증/권한 체크)

### 데이터베이스 & 인증

- **Database**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **실시간 통신**: Supabase Realtime
- **파일 저장소**: Supabase Storage
- **ORM**: Prisma (일부 테이블용)

### AI & 외부 서비스

- **AI 모델**: Google Gemini 2.5 Flash / 2.5 Pro
- **결제 시스템**: Lemon Squeezy
- **이메일 서비스**: Nodemailer + Google SMTP
- **Analytics**: Vercel Analytics

### 배포 & 인프라

- **호스팅**: Vercel
- **CI/CD**: GitHub + Vercel 자동 배포
- **환경 변수**: Vercel 환경 변수 관리
- **Cron Jobs**: Vercel Cron (파일 정리 등)

### CMS

- **Content Management**: Sanity CMS
- **마케팅 콘텐츠**: 홈페이지, FAQ, Use Cases 등 관리

---

## 📁 프로젝트 구조

```
nexi.ai/
├── web/                          # Next.js 메인 애플리케이션
│   ├── app/                      # App Router 구조
│   │   ├── (marketing)/          # 마케팅 페이지 그룹
│   │   │   ├── page.tsx          # 랜딩 페이지
│   │   │   ├── dashboard/        # 클라이언트 대시보드
│   │   │   │   ├── page.tsx      # 프로젝트/주문 목록
│   │   │   │   └── chat/         # 클라이언트-매니저 채팅
│   │   │   ├── pricing/          # 가격 페이지
│   │   │   └── ...
│   │   ├── admin/                # Super Admin 페이지
│   │   │   ├── page.tsx          # Admin 대시보드
│   │   │   ├── dispatch/         # 프로젝트 배정 센터
│   │   │   ├── users/            # 사용자 관리
│   │   │   └── revenue/          # 매출 대시보드
│   │   ├── manager/              # 매니저 전용 페이지
│   │   │   ├── dashboard/        # 매니저 대시보드
│   │   │   └── workstation/      # 작업 공간
│   │   ├── api/                  # API 엔드포인트
│   │   │   ├── analyze/          # AI 분석 API
│   │   │   ├── analyze-product/  # 제품 분석 API
│   │   │   ├── chat-sessions/    # 채팅 세션 관리
│   │   │   ├── chat-messages/    # 채팅 메시지
│   │   │   ├── payment/          # 결제 처리
│   │   │   ├── manager/          # 매니저 API
│   │   │   └── admin/            # Admin API
│   │   ├── chat/                 # AI 채팅 인터페이스 (레거시)
│   │   ├── copilot/              # 대화형 AI 코파일럿 (메인)
│   │   ├── login/                # 로그인/회원가입
│   │   └── results/              # 분석 결과 페이지
│   ├── components/               # 재사용 가능한 컴포넌트
│   │   ├── ManagerChat.tsx       # 매니저-클라이언트 채팅
│   │   ├── ClientMessagesList.tsx # 클라이언트용 메시지 목록
│   │   ├── AssetLibrary.tsx      # 파일 라이브러리
│   │   ├── copilot/              # 코파일럿 관련 컴포넌트
│   │   ├── dashboard/            # 대시보드 컴포넌트
│   │   └── ui/                   # 기본 UI 컴포넌트
│   ├── lib/                      # 유틸리티 및 헬퍼
│   │   ├── supabase/             # Supabase 클라이언트
│   │   │   ├── client.ts         # 클라이언트 사이드
│   │   │   ├── server.ts         # 서버 사이드
│   │   │   └── admin.ts          # Admin 클라이언트
│   │   ├── ai/                   # AI 관련 로직
│   │   │   ├── geminiClient.ts   # Gemini 클라이언트
│   │   │   ├── aiReportV2.ts     # AI 리포트 생성
│   │   │   ├── conversationalCopilot.ts # 대화형 코파일럿
│   │   │   └── productAnalysis.ts # 제품 분석
│   │   ├── email/                # 이메일 유틸리티
│   │   │   ├── sender.ts         # 이메일 발송
│   │   │   └── templates.tsx     # 이메일 템플릿
│   │   ├── sample-request/       # 리드 인텔리전스
│   │   └── ...
│   ├── supabase/                 # 데이터베이스 스키마
│   │   ├── schema.sql            # 기본 스키마
│   │   ├── schema_extensions.sql
│   │   ├── manager_schema_extensions.sql
│   │   ├── super_admin_schema.sql
│   │   └── chat_sessions_schema.sql
│   ├── prisma/                   # Prisma 스키마 (제한적 사용)
│   │   └── schema.prisma
│   └── docs/                     # 프로젝트 문서
├── sanity/                       # Sanity CMS 설정
│   ├── schemas/                  # 콘텐츠 스키마
│   └── sanity.config.ts
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
- company: TEXT
- role: TEXT ('free', 'pro', 'manager', 'admin', 'super_admin')
- is_manager: BOOLEAN
- workload_score: INTEGER (매니저 작업량)
- availability_status: TEXT ('available', 'busy', 'offline')
- is_banned: BOOLEAN
- has_active_subscription: BOOLEAN
- analysis_count: INTEGER (월별 분석 횟수)
- last_analysis_date: TIMESTAMPTZ
- total_spend: NUMERIC
- created_at: TIMESTAMPTZ
```

#### 2. `projects` (프로젝트)
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → profiles.id)
- manager_id: UUID (Foreign Key → profiles.id, nullable)
- name: TEXT
- status: TEXT ('active', 'completed', 'archived', 'in_progress', 'saved')
- initial_risk_score: NUMERIC
- total_landed_cost: NUMERIC
- current_milestone_index: INTEGER
- milestones: JSONB (마일스톤 배열)
- analysis_data: JSONB (AI 분석 결과)
- dispatched_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
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

#### 5. `messages` (AI 분석 메시지 히스토리)
```sql
- id: UUID (Primary Key)
- project_id: UUID (Foreign Key → projects.id)
- role: TEXT ('user', 'ai')
- content: TEXT
- timestamp: TIMESTAMPTZ
```

#### 6. `factory_quotes` (팩토리 견적)
```sql
- id: UUID (Primary Key)
- project_id: UUID (Foreign Key → projects.id)
- factory_name: TEXT
- factory_location: TEXT
- quote_amount: NUMERIC
- status: TEXT ('pending', 'selected', 'rejected')
- created_at: TIMESTAMPTZ
```

#### 7. `qc_reports` (QC 리포트)
```sql
- id: UUID (Primary Key)
- project_id: UUID (Foreign Key → projects.id)
- inspection_date: DATE
- status: TEXT ('pending', 'approved', 'rejected')
- report_url: TEXT
- created_at: TIMESTAMPTZ
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

3. **Storage 버킷 생성**
   - Storage → Create Bucket
   - 이름: `chat-files`
   - Public: false (비공개)
   - RLS 정책 설정 필요

4. **Realtime 활성화**
   - Database → Replication
   - `chat_messages` 테이블 활성화

5. **Row Level Security (RLS) 활성화**
   - 모든 테이블에 RLS 정책 설정 필요
   - 사용자는 자신의 데이터만 접근 가능
   - 매니저는 할당된 프로젝트만 접근 가능

---

## 🔐 환경 변수 설정

### 필수 환경 변수

#### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Google Gemini AI
```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_CUSTOM_MODEL_ID=your-custom-model-id (선택사항)
```

#### Lemon Squeezy (결제)
```env
LEMONSQUEEZY_API_KEY=your-lemonsqueezy-api-key
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret
LEMON_SQUEEZY_STORE_URL=https://your-store.lemonsqueezy.com/checkout/buy/your-product-id
```

#### 이메일 (Google SMTP)
```env
GMAIL_USER=your-email@nexsupply.net
GMAIL_APP_PASSWORD=your-app-password
```

#### 기타
```env
# 파일 정리 (선택사항)
CLEANUP_API_KEY=your-cleanup-secret-key
CRON_SECRET=your-cron-secret

# 외부 링크
NEXT_PUBLIC_BOOKING_URL=https://calendly.com/...
NEXT_PUBLIC_CONTRACT_URL=https://...
```

### Vercel 환경 변수 설정

1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Environment Variables
3. 위의 모든 환경 변수 추가
4. Production, Preview, Development 환경 모두 설정

---

## 🚀 로컬 개발 환경 설정

### 1. 필수 소프트웨어 설치

```bash
# Node.js 18+ 설치 확인
node --version  # v18.0.0 이상

# npm 설치 확인
npm --version

# Git 설치 확인
git --version
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

### 5. Prisma 마이그레이션 (선택사항)

```bash
# Prisma 클라이언트 생성
npx prisma generate

# Prisma 마이그레이션 (필요한 경우)
npx prisma migrate dev
```

---

## 🔄 주요 기능 및 사용자 플로우

### 1. 클라이언트 사용자 플로우

#### 신규 사용자 온보딩
```
1. 랜딩 페이지 접속 (/)
2. "Get Started" 또는 "Try for Free" 클릭
3. 회원가입/로그인 (/login)
4. 대시보드로 자동 리다이렉트 (/dashboard)
```

#### AI 분석 플로우
```
1. /copilot 페이지 접속
2. AI 코파일럿과 대화 시작
   - 제품 설명 입력
   - 카테고리 선택 또는 텍스트 입력
3. AI가 3-5개의 질문을 통해 정보 수집
   - 제품명
   - 판매 채널 (Amazon FBA, Shopify 등)
   - 목표 시장 (미국, 유럽 등)
   - 물량 계획
   - 타임라인
4. AI 분석 실행
5. 분석 결과 확인 (/results)
   - Landed Cost 분석
   - 리스크 평가
   - HS 코드 및 관세 정보
   - 전략적 조언
6. 프로젝트 저장 (선택사항)
```

#### 프로 결제 및 매니저 연결
```
1. 분석 결과에서 "Upgrade to Pro" 클릭
2. Lemon Squeezy 결제 페이지로 이동
3. 결제 완료 후 자동으로 role이 'pro'로 업데이트
4. Super Admin이 프로젝트에 매니저 배정
5. 매니저 배정 후 프로젝트 status가 'in_progress'로 변경
6. 클라이언트는 /dashboard/chat에서 매니저와 실시간 채팅 가능
```

#### 매니저와의 협업
```
1. /dashboard 접속
2. "Active Orders" 탭에서 진행 중인 프로젝트 확인
3. 프로젝트 클릭 또는 "Chat" 버튼 클릭
4. /dashboard/chat?project_id=xxx 접속
5. 매니저와 실시간 채팅
   - 텍스트 메시지
   - 파일 업로드 (견적, QC 리포트 등)
6. 파일 라이브러리에서 모든 문서 확인
7. 마일스톤 진행 상황 확인
```

### 2. 매니저 사용자 플로우

#### 매니저 로그인
```
1. @nexsupply.net 이메일로 로그인
2. 자동으로 /manager/dashboard로 리다이렉트
```

#### 매니저 대시보드
```
1. KPI 카드 확인
   - Active Clients (활성 클라이언트 수)
   - Revenue (수익)
   - 등
2. 할당된 프로젝트 목록 확인
```

#### 작업 공간 (Workstation)
```
1. /manager/workstation 접속
2. 클라이언트 리스트에서 프로젝트 선택
3. 실시간 채팅으로 클라이언트와 소통
4. 마일스톤 업데이트
5. 파일 업로드 및 관리
6. 견적 관리
7. QC 리포트 관리
```

### 3. Super Admin 사용자 플로우

#### Admin 로그인
```
1. k.myungjun@nexsupply.net으로 로그인
2. 자동으로 /admin으로 리다이렉트
```

#### Admin 대시보드
```
1. 전체 현황 확인
   - 미배정 프로젝트 수
   - 활성 프로젝트 수
   - 총 매출
   - 매니저 가동률
```

#### 프로젝트 배정
```
1. /admin/dispatch 접속
2. 미배정 프로젝트 목록 확인
3. 매니저 풀에서 적절한 매니저 선택
4. "Assign" 클릭하여 프로젝트 배정
5. 프로젝트 status가 'active' → 'in_progress'로 변경
```

#### 사용자 관리
```
1. /admin/users 접속
2. 사용자 목록 확인
3. 사용자 차단/해제
4. 강제 환불 처리
```

#### 매출 관리
```
1. /admin/revenue 접속
2. Lemon Squeezy API를 통한 매출 통계 확인
3. 최근 주문 내역 확인
```

---

## 💰 결제 시스템 (Lemon Squeezy)

### 워크플로우

1. **결제 시작**
   - 사용자가 "Upgrade to Pro" 또는 "Validator" 버튼 클릭
   - `/api/payment/create-checkout-url` API 호출
   - Lemon Squeezy Checkout URL 생성
   - 사용자를 Checkout 페이지로 리다이렉트

2. **결제 완료**
   - Lemon Squeezy에서 웹훅 호출
   - `/api/payment/webhook` 엔드포인트에서 처리
   - HMAC 시그니처 검증
   - `profiles` 테이블에서 해당 사용자 찾기
   - `role`을 `'pro'`로 업데이트
   - `has_active_subscription`을 `true`로 설정
   - 사용자에게 확인 이메일 발송

3. **매출 통계**
   - `/api/admin/revenue` 또는 Lemon Squeezy 대시보드에서 조회
   - Lemon Squeezy API를 통한 실시간 매출 데이터

### 웹훅 이벤트 처리

주요 이벤트:
- `order_created`: 주문 생성
- `subscription_created`: 구독 생성
- `subscription_updated`: 구독 업데이트
- `subscription_cancelled`: 구독 취소

---

## 📧 이메일 알림 시스템

### 알림 종류

1. **분석 완료 알림**
   - AI 분석이 완료되면 클라이언트에게 발송
   - 분석 결과 링크 포함

2. **새 메시지 알림**
   - 매니저가 메시지를 보내면 클라이언트에게 발송
   - 1시간 내 중복 알림 방지 (Throttling)

3. **마일스톤 업데이트 알림**
   - 프로젝트 마일스톤이 업데이트되면 알림

4. **결제 완료 알림**
   - 결제 완료 시 확인 이메일

### 이메일 템플릿

위치: `web/lib/email/templates.tsx`

템플릿 종류:
- `AnalysisCompletedTemplate`
- `NewMessageTemplate`
- `MilestoneUpdateTemplate`
- `PaymentConfirmationTemplate`

### 이메일 발송

위치: `web/lib/email/sender.ts`

```typescript
import { sendEmail } from '@/lib/email/sender'

await sendEmail({
  to: user.email,
  subject: 'Analysis Completed',
  template: 'AnalysisCompleted',
  data: { ... }
})
```

---

## 🤖 AI 분석 시스템

### AI 모델

- **주 모델**: Google Gemini 2.5 Flash (빠른 응답, 비용 효율적)
- **고급 분석**: Google Gemini 2.5 Pro (복잡한 분석 필요 시)

### 분석 프로세스

1. **사용자 입력 수집** (`/copilot`)
   - 대화형 코파일럿을 통한 자연어 입력
   - 구조화된 질문-답변 플로우

2. **AI 분석 실행** (`/api/analyze-product`)
   - 제품 정보 추출
   - Landed Cost 계산
   - 리스크 평가
   - HS 코드 추정
   - 전략적 조언 생성

3. **결과 저장 및 표시**
   - `projects` 테이블에 분석 결과 저장
   - `/results` 페이지에서 상세 결과 표시

### 분석 결과 구조

```typescript
interface AnalysisResult {
  financials: {
    estimated_landed_cost: number;
    estimated_margin_pct: number;
    net_profit: number;
  };
  cost_breakdown: {
    factory_exw: number;
    shipping: number;
    duty: number;
    packaging: number;
    customs: number;
    insurance: number;
  };
  scale_analysis: Array<{
    qty: number;
    mode: "Air" | "Sea";
    unit_cost: number;
    margin: number;
  }>;
  risks: {
    duty: { level: string; reason: string };
    supplier: { level: string; reason: string };
    compliance: { level: string; reason: string; cost: number };
  };
  duty_analysis?: {
    hs_code: string;
    rate: string;
    rationale: string;
  };
  logistics_insight?: {
    efficiency_score: string;
    container_loading: string;
    advice: string;
  };
  executive_summary: string;
}
```

### 블랙리스트 체크

- 특정 제품/회사에 대한 Kill Switch
- `web/lib/data/blacklist.json` 파일 참조
- 블랙리스트에 포함된 항목은 분석 차단

---

## 💬 실시간 채팅 시스템

### 기술 스택

- **실시간 통신**: Supabase Realtime
- **메시지 저장**: Supabase Database (`chat_messages` 테이블)
- **파일 업로드**: Supabase Storage

### 채팅 플로우

1. **채팅 세션 생성**
   - 프로젝트 생성 시 자동 생성
   - 또는 `/api/chat-sessions` POST 요청으로 수동 생성

2. **메시지 전송**
   - `/api/chat-messages` POST 요청
   - Supabase Realtime으로 실시간 전송
   - 모든 연결된 클라이언트에 즉시 반영

3. **파일 업로드**
   - `/api/chat/upload` POST 요청
   - Supabase Storage에 업로드
   - Signed URL 생성하여 메시지에 첨부

4. **읽음 표시**
   - 메시지 수신 시 `read_at` 필드 업데이트
   - 읽지 않은 메시지 수 표시

### 컴포넌트

- **ManagerChat**: `web/components/ManagerChat.tsx`
  - 매니저용 채팅 인터페이스
  - Quick Replies 지원
  - 파일 업로드 UI

- **ClientMessagesList**: `web/components/ClientMessagesList.tsx`
  - 클라이언트용 메시지 목록
  - 프로젝트별 그룹화
  - 읽지 않은 메시지 배지

---

## 📊 주요 API 엔드포인트

### 분석 API

- `POST /api/analyze-product` - 제품 분석 실행
- `POST /api/analyze` - 소싱 분석 실행 (레거시)
- `GET /api/ai-report` - AI 리포트 생성

### 채팅 API

- `GET /api/chat-sessions` - 채팅 세션 목록
- `POST /api/chat-sessions` - 새 채팅 세션 생성
- `POST /api/chat-messages` - 메시지 전송
- `GET /api/chat-messages?session_id=xxx` - 메시지 목록 조회
- `POST /api/chat/upload` - 파일 업로드

### 프로젝트 API

- `GET /api/projects` - 프로젝트 목록
- `POST /api/projects` - 새 프로젝트 생성
- `GET /api/projects/[id]` - 프로젝트 상세
- `POST /api/projects/save` - 프로젝트 저장
- `POST /api/projects/submit` - 프로젝트 제출

### 결제 API

- `GET /api/payment/create-checkout-url` - Checkout URL 생성
- `POST /api/payment/webhook` - Lemon Squeezy 웹훅
- `POST /api/payment/subscribe` - 구독 생성

### 매니저 API

- `GET /api/manager/projects` - 할당된 프로젝트 목록
- `GET /api/manager/chat-sessions` - 매니저 채팅 세션
- `POST /api/manager/milestones` - 마일스톤 업데이트
- `POST /api/manager/files/upload` - 파일 업로드

### Admin API

- `GET /api/admin/stats` - 통계 데이터
- `POST /api/admin/dispatch/projects` - 프로젝트 배정
- `GET /api/admin/revenue` - 매출 데이터
- `POST /api/admin/cleanup-old-files` - 파일 정리

---

## 🔒 인증 및 권한 시스템

### 역할 (Role) 구조

1. **free**: 무료 사용자 (기본)
   - 월 30회 AI 분석 제한
   - 기본 기능 접근

2. **pro**: 유료 사용자 ($199/월)
   - 무제한 AI 분석
   - 매니저 연결
   - 프로젝트 실행 지원

3. **manager**: 매니저
   - @nexsupply.net 이메일 도메인
   - 클라이언트 프로젝트 관리
   - 채팅 접근

4. **admin**: 관리자
   - 매니저 기능 + 일부 Admin 기능

5. **super_admin**: Super Admin
   - 모든 기능 접근
   - 프로젝트 배정
   - 사용자 관리
   - 매출 통계

### 자동 리다이렉트

미들웨어에서 이메일 도메인 기반 자동 리다이렉트:

- `@nexsupply.net` → `/manager/dashboard`
- `k.myungjun@nexsupply.net` → `/admin`
- 일반 사용자 → `/dashboard`

### 미들웨어 보호

위치: `web/middleware.ts`

- `/admin/*`: `super_admin`만 접근 가능
- `/manager/*`: `manager` 또는 `admin`만 접근 가능
- `/dashboard/*`: 로그인 필요

---

## 📝 파일 관리 시스템

### 파일 라이브러리 (Asset Library)

위치: `web/components/AssetLibrary.tsx`

기능:
- 프로젝트별 파일 관리
- 카테고리별 필터링
  - Quotes (견적)
  - Invoices (송장)
  - QC Reports (QC 리포트)
  - Samples (샘플)
  - 기타

### 자동 파일 정리

- **목적**: 저장 공간 절약
- **대상**: 6개월 이상 지난 채팅 파일/이미지
- **유지**: 텍스트 메시지는 유지, 파일만 삭제
- **실행**: 매일 오전 2시 (Vercel Cron)
- **API**: `/api/cron/cleanup-old-files`

### 파일 업로드

- **제한**: 파일 크기, 타입 제한 설정 가능
- **저장소**: Supabase Storage (`chat-files` 버킷)
- **접근**: Signed URL을 통한 비공개 접근

---

## 🚨 문제 해결 가이드

### 일반적인 문제

#### 1. Supabase 연결 오류

**증상**: API에서 Supabase 연결 실패

**해결 방법**:
- 환경 변수 확인 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Service Role Key 확인 (`SUPABASE_SERVICE_ROLE_KEY`)
- Supabase 프로젝트 상태 확인

#### 2. 빌드 실패

**증상**: `npm run build` 실패

**해결 방법**:
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Node.js 버전 확인 (18+ 필요)
node --version
```

#### 3. 파일 업로드 실패

**증상**: 채팅에서 파일 업로드 실패

**해결 방법**:
- Supabase Storage 버킷 생성 확인 (`chat-files`)
- Storage RLS 정책 확인
- 파일 크기 제한 확인

#### 4. Vercel 배포 실패

**증상**: Vercel에서 배포 실패

**해결 방법**:
- Root Directory가 `web`으로 설정되었는지 확인
- 모든 환경 변수가 설정되었는지 확인
- 빌드 로그 확인

#### 5. AI 분석 실패

**증상**: `/api/analyze-product` 에러

**해결 방법**:
- `GEMINI_API_KEY` 환경 변수 확인
- API 키 할당량 확인
- 블랙리스트 체크 (의도된 차단일 수 있음)

#### 6. 실시간 채팅이 작동하지 않음

**증상**: 메시지가 실시간으로 전달되지 않음

**해결 방법**:
- Supabase Realtime 활성화 확인
- `chat_messages` 테이블 Replication 활성화 확인
- 브라우저 콘솔 에러 확인

---

## 🧪 테스트 가이드

### 로컬 테스트

1. **개발 서버 실행**
   ```bash
   npm run dev
   ```

2. **주요 플로우 테스트**
   - 회원가입/로그인
   - AI 분석 실행
   - 프로젝트 생성
   - 채팅 전송
   - 파일 업로드

3. **권한 테스트**
   - 일반 사용자: `/dashboard` 접근
   - 매니저: `/manager/dashboard` 접근
   - Admin: `/admin` 접근

### API 테스트

Postman 또는 curl을 사용한 API 테스트:

```bash
# 프로젝트 목록 조회
curl http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"

# AI 분석 실행
curl -X POST http://localhost:3000/api/analyze-product \
  -H "Content-Type: application/json" \
  -d '{"product_idea": "silicone baby teether"}'
```

---

## 📚 주요 문서 위치

### 프로젝트 문서

- `web/docs/COMPLETE_HANDOVER_DOCUMENT.md` - 완전 인수인계 문서
- `web/docs/PROJECT_STATUS_AND_SPEC.md` - 프로젝트 현황 및 스펙
- `web/docs/SUPER_ADMIN_COMPLETE.md` - Super Admin 가이드
- `web/docs/MANAGER_WORKSTATION_COMPLETE.md` - 매니저 워크스테이션 가이드
- `web/docs/CHAT_FILE_CLEANUP_COMPLETE.md` - 파일 정리 시스템
- `web/docs/CLIENT_CHAT_ACCESS_COMPLETE.md` - 클라이언트 채팅 접근

### 외부 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Vercel 문서](https://vercel.com/docs)
- [Google Gemini API 문서](https://ai.google.dev/docs)
- [Lemon Squeezy API 문서](https://docs.lemonsqueezy.com)

---

## 🎯 개발 가이드라인

### 코드 스타일

- **언어**: TypeScript 100% 사용
- **컴포넌트**: 함수형 컴포넌트
- **스타일링**: Tailwind CSS
- **포맷팅**: ESLint 설정 준수

### 브랜치 전략

- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치 (있는 경우)
- 기능별 브랜치: `feature/feature-name`

### 커밋 메시지 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
refactor: 리팩토링
chore: 빌드 업무 수정
style: 코드 포맷팅
test: 테스트 추가/수정
```

### 코드 리뷰 체크리스트

- [ ] TypeScript 타입 오류 없음
- [ ] ESLint 경고 없음
- [ ] 환경 변수 확인
- [ ] 데이터베이스 마이그레이션 필요 시 문서화
- [ ] API 엔드포인트 문서화
- [ ] 에러 핸들링 구현
- [ ] 보안 검토 (RLS, 인증 등)

---

## 🔮 향후 개발 로드맵

### 단기 (1-2주)

- [ ] UI 텍스트 영어화 완료
- [ ] 에러 핸들링 강화
- [ ] 로딩 상태 개선
- [ ] 모바일 반응형 개선

### 중기 (1-2개월)

- [ ] 실시간 브라우저 알림 (Web Push)
- [ ] 파일 미리보기 기능
- [ ] 검색 기능 강화
- [ ] Analytics 대시보드 개선

### 장기 (3-6개월)

- [ ] 다국어 지원 (i18n)
- [ ] 고급 분석 기능 (경쟁사 분석 등)
- [ ] 모바일 앱 (React Native)
- [ ] AI 모델 Fine-tuning
- [ ] 자동화 워크플로우

---

## ✅ 신입 개발자 온보딩 체크리스트

### 1주차: 환경 설정 및 학습

- [ ] 프로젝트 클론 완료
- [ ] 로컬 개발 환경 설정 완료
- [ ] 모든 환경 변수 설정 완료
- [ ] 개발 서버 실행 성공
- [ ] Supabase 접근 권한 획득
- [ ] 프로젝트 구조 이해
- [ ] 데이터베이스 스키마 이해

### 2주차: 코드베이스 탐색

- [ ] 주요 페이지 모두 탐색
- [ ] 주요 API 엔드포인트 테스트
- [ ] 컴포넌트 구조 이해
- [ ] 상태 관리 패턴 이해
- [ ] 인증/권한 시스템 이해

### 3주차: 첫 작업 시작

- [ ] 작은 버그 수정 완료
- [ ] 작은 기능 추가 완료
- [ ] 코드 리뷰 참여
- [ ] 문서 작성 경험

### 4주차: 독립 작업

- [ ] 중간 규모 기능 개발 시작
- [ ] 테스트 작성
- [ ] 배포 프로세스 이해

---

## 📞 지원 및 연락처

### 개발 관련

- **저장소**: GitHub Repository
- **배포**: Vercel Dashboard
- **데이터베이스**: Supabase Dashboard
- **결제**: Lemon Squeezy Dashboard

### 문서가 부족한 경우

1. 기존 개발자에게 문의
2. GitHub Issues에 질문 등록
3. 관련 문서 검색 (`web/docs/` 디렉토리)

---

## 📝 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2024-12 | 2.0.0 | 종합 인수인계 문서 작성 | AI Assistant |

---

**문서 작성자**: AI Assistant  
**최종 업데이트**: 2024년 12월  
**문서 버전**: 2.0.0

---

이 문서는 Nexi.ai (NexSupply) 프로젝트의 완전한 인수인계 가이드입니다. 
프로젝트에 대한 모든 중요한 정보를 포함하고 있으며, 신입 개발자가 즉시 작업을 시작할 수 있도록 구성되어 있습니다.

문의사항이나 개선 사항이 있다면 GitHub Issues에 등록해주세요.
