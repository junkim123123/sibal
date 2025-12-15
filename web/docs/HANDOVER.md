# NexSupply 인수인계 문서

## 📋 문서 개요

이 문서는 **nexi.ai** 코드베이스의 완전한 인수인계 가이드입니다. 신입 개발자가 30분 내 로컬 실행 및 핵심 플로우 확인을 할 수 있도록 구성되어 있습니다.

**작성일**: 2024년 12월  
**버전**: 3.0.0  
**대상**: 신입 개발자, 새로운 팀원

---

## 🎯 용어 정의

이 문서에서 사용하는 용어는 다음과 같이 명확히 정의됩니다:

| 용어 | 의미 | 사용 예시 |
|------|------|-----------|
| **nexi.ai** | 레포지토리 및 코드베이스 이름 | "nexi.ai 레포를 클론하세요" |
| **NexSupply** | 서비스 및 브랜드 이름 | "NexSupply 플랫폼", "NexSupply 서비스" |

---

## ✅ 진실 테이블 (Truth Table)

**⚠️ 이 섹션은 프로젝트의 절대적 사실을 정의합니다. 모든 문서, 코드, 주석은 이 테이블을 기준으로 작성되어야 합니다.**

**이 테이블은 절대 변경할 수 없으며, 모든 개발자는 이 테이블을 준수해야 합니다.**

| 항목 | 진실 (Truth) | 반드시 피해야 할 표현 |
|------|-------------|-------------------|
| **가격 모델** | Free, $49 디파짓 (환불 가능), 5% 실행 수수료 | ❌ "$199/월", "Pro 구독", "월간 구독", "Pro 플랜", "alpha flat fee", "no subscription" |
| **배포** | Vercel (단일 배포 플랫폼) | ❌ "Render", "다중 배포", 다른 호스팅 플랫폼 언급 |
| **메인 플로우** | `/chat` - Dr.B 스타일 온보딩 채팅 | ❌ `/copilot`을 메인으로 언급 |
| **레거시 기능** | `/copilot` - 대화형 AI 코파일럿 (신규 개발 대상 아님) | ❌ `/copilot`을 신규 개발 기준으로 사용 |
| **결과 페이지** | `/results` - 분석 결과 표시 (chat 플로우 완료 후 이동) | - |
| **데이터베이스** | Supabase (PostgreSQL) 전용 | ❌ "Prisma 사용", "Prisma ORM", "@prisma/client", "PrismaClient" |
| **결제 플로우** | $49 디파짓 → 프로젝트 진행 → 5% 실행 수수료 (주문 시 $49 차감) | ❌ "구독 결제", "월간 결제" |
| **레포 이름** | nexi.ai | ❌ "NexSupply 레포", "nexsupply" |
| **서비스 이름** | NexSupply | ❌ "Nexi.ai" (서비스명으로 사용) |
| **평점** | 4.6 / 5 (from internal pilot users) | ❌ "4.8 / 5", "verified sourcing projects" |
| **시간 약속** | within 1 business day | ❌ "24 hours", "one day", "within 24 hours" |

---

## 🚀 30분 내 로컬 실행 가이드

### 사전 요구사항

```bash
# Node.js 18+ 설치 확인
node --version  # v18.0.0 이상

# npm 설치 확인
npm --version
```

### 1단계: 저장소 클론 및 의존성 설치 (5분)

```bash
# 저장소 클론
git clone <repository-url>
cd nexi.ai/web

# 의존성 설치
npm install --legacy-peer-deps
```

### 2단계: 환경 변수 설정 (5분)

`.env.local` 파일을 생성하고 다음 변수들을 설정합니다:

```env
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini AI (필수)
GEMINI_API_KEY=your-gemini-api-key

# 이메일 (선택사항)
GMAIL_USER=your-email@nexsupply.net
GMAIL_APP_PASSWORD=your-app-password

# Lemon Squeezy (선택사항)
LEMONSQUEEZY_API_KEY=your-lemonsqueezy-api-key
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret
```

### 3단계: 개발 서버 실행 (1분)

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 4단계: 핵심 플로우 확인 (19분)

#### 플로우 1: 메인 채팅 플로우 (10분)

1. 브라우저에서 `http://localhost:3000/chat` 접속
2. Dr.B 스타일 온보딩 채팅 경험 확인
3. 질문에 답변하면서 프로젝트 정보 입력
4. 분석 완료 후 `/results` 페이지로 이동 확인

#### 플로우 2: 분석 결과 확인 (5분)

1. `/results` 페이지에서 분석 결과 확인
2. Landed Cost, 리스크 평가, HS 코드 등 확인
3. 프로젝트 저장 기능 확인

#### 플로우 3: 대시보드 확인 (4분)

1. 로그인 후 `/dashboard` 접속
2. 프로젝트 목록 확인
3. 매니저 채팅 기능 확인 (프로젝트가 할당된 경우)

---

## 🎯 프로젝트 개요

### 한 줄 정의

> **NexSupply**는 AI 기반 B2B 글로벌 소싱 인텔리전스 플랫폼으로, 중소 셀러와 리테일러가 안전하고 효율적으로 해외 제품 소싱을 시작할 수 있도록 돕는 매니지드 소싱 서비스입니다.

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

### 가격 모델

**진실 테이블 참조**: 모든 가격 관련 문구는 다음만 사용해야 합니다.

1. **Free**: 무료 AI 분석 (일일 제한 있음)
2. **$49 디파짓**: 프로젝트 시작 시 필요 (환불 가능, 주문 시 5% 수수료에서 차감)
3. **5% 실행 수수료**: 프로젝트 완료 시 최종 주문 금액의 5%

> ⚠️ **중요**: 진실 테이블을 반드시 확인하세요. 문서 전체에서 "$199/월", "Pro 구독", "월간 구독", "Pro 플랜" 등의 문구는 절대 사용하지 않습니다.

---

## 🏗️ 기술 스택

### Frontend

- **Framework**: Next.js 15.1.0 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**:
  - Radix UI (접근성 높은 컴포넌트)
  - Lucide React (아이콘)
  - Framer Motion (애니메이션)
  - Recharts (데이터 시각화)

### Backend

- **런타임**: Node.js
- **API**: Next.js API Routes
- **서버 액션**: Next.js Server Actions
- **미들웨어**: Next.js Middleware (인증/권한 체크)

### 데이터베이스 & 인증

- **Database**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **실시간 통신**: Supabase Realtime
- **파일 저장소**: Supabase Storage

> ⚠️ **중요**: Prisma는 사용하지 않습니다. 모든 데이터베이스 접근은 Supabase 클라이언트를 사용합니다.

### AI & 외부 서비스

- **AI 모델**: Google Gemini 2.5 Flash / 2.5 Pro
- **결제 시스템**: Lemon Squeezy ($49 디파짓 및 수수료 처리)
- **이메일 서비스**: Nodemailer + Google SMTP
- **Analytics**: Vercel Analytics

### 배포 & 인프라

- **호스팅**: Vercel (단일 배포 플랫폼)
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
│   │   │   └── ...               # 기타 마케팅 페이지
│   │   ├── admin/                # Super Admin 페이지
│   │   │   ├── page.tsx          # Admin 대시보드
│   │   │   ├── dispatch/         # 프로젝트 배정 센터
│   │   │   ├── users/            # 사용자 관리
│   │   │   └── revenue/          # 매출 대시보드
│   │   ├── manager/              # 매니저 전용 페이지
│   │   │   ├── dashboard/        # 매니저 대시보드
│   │   │   └── workstation/      # 작업 공간
│   │   ├── api/                  # API 엔드포인트
│   │   │   ├── analyze-product/  # 제품 분석 API
│   │   │   ├── chat-sessions/    # 채팅 세션 관리
│   │   │   ├── chat-messages/    # 채팅 메시지
│   │   │   ├── payment/          # 결제 처리
│   │   │   ├── manager/          # 매니저 API
│   │   │   └── admin/            # Admin API
│   │   ├── chat/                 # ⭐ 메인 플로우: Dr.B 스타일 온보딩 채팅
│   │   │   └── page.tsx          # 채팅 인터페이스
│   │   ├── results/              # 분석 결과 페이지
│   │   │   └── page.tsx          # 결과 표시
│   │   ├── copilot/              # ⚠️ 레거시: 대화형 AI 코파일럿 (제거됨 또는 사용 안 함)
│   │   ├── login/                # 로그인/회원가입
│   │   └── ...
│   ├── components/               # 재사용 가능한 컴포넌트
│   │   ├── ManagerChat.tsx       # 매니저-클라이언트 채팅
│   │   ├── ClientMessagesList.tsx # 클라이언트용 메시지 목록
│   │   ├── AssetLibrary.tsx      # 파일 라이브러리
│   │   ├── WhatsAppConnectCard.tsx # WhatsApp 연결 카드
│   │   └── ui/                   # 기본 UI 컴포넌트
│   ├── lib/                      # 유틸리티 및 헬퍼
│   │   ├── supabase/             # Supabase 클라이언트
│   │   │   ├── client.ts         # 클라이언트 사이드
│   │   │   ├── server.ts         # 서버 사이드
│   │   │   └── admin.ts          # Admin 클라이언트
│   │   ├── ai/                   # AI 관련 로직
│   │   │   ├── geminiClient.ts   # Gemini 클라이언트
│   │   │   ├── productAnalysis.ts # 제품 분석
│   │   │   └── ...
│   │   ├── email/                # 이메일 유틸리티
│   │   └── ...
│   ├── supabase/                 # 데이터베이스 스키마
│   │   ├── schema.sql            # 기본 스키마
│   │   ├── schema_extensions.sql
│   │   ├── manager_schema_extensions.sql
│   │   ├── super_admin_schema.sql
│   │   ├── chat_sessions_schema.sql
│   │   └── migrations/           # 마이그레이션 파일
│   └── docs/                     # 프로젝트 문서
│       ├── HANDOVER.md           # ⭐ 이 문서 (정본)
│       └── archive/              # 기존 문서 보관
├── sanity/                       # Sanity CMS 설정
│   ├── schemas/                  # 콘텐츠 스키마
│   └── sanity.config.ts
└── README.md
```

---

## 🔄 주요 사용자 플로우

### 메인 플로우: 채팅 기반 온보딩

**경로**: `/chat`

1. 사용자가 `/chat` 접속
2. Dr.B 스타일 온보딩 채팅 시작
3. 시스템이 순차적으로 질문:
   - 제품 정보
   - 판매 채널
   - 목표 시장
   - 물량 계획
   - 타임라인
   등
4. 사용자가 답변 입력
5. 분석 실행 (`/api/analyze-product` 호출)
6. `/results` 페이지로 이동하여 결과 확인
7. 프로젝트 저장 (선택사항)

### 결과 페이지

**경로**: `/results`

- Landed Cost 분석
- 리스크 평가
- HS 코드 및 관세 정보
- 전략적 조언
- 프로젝트 저장 기능

### 프로젝트 관리 플로우

1. `/dashboard` 접속
2. 프로젝트 목록 확인
3. $49 디파짓 결제 (프로젝트 진행 시)
4. 매니저 배정 대기
5. 매니저와 실시간 채팅 (`/dashboard/chat`)
6. 프로젝트 진행 및 마일스톤 확인
7. 주문 완료 시 5% 수수료 결제 ($49 디파짓은 차감됨)

---

## ⚠️ 레거시 기능

### `/copilot` - 대화형 AI 코파일럿

**상태**: 레거시 (제거됨 또는 신규 개발 대상 아님)

**설명**: 
- 이전에 존재했던 자연어 기반 제품 분석 인터페이스
- `/chat` 플로우가 메인으로 대체됨
- 현재 코드베이스에서 제거되었거나 더 이상 사용되지 않음

**주의사항**:
- 새로운 기능 개발 시 `/copilot`을 기준으로 하지 않음
- 모든 신규 개발은 `/chat` 플로우에 집중

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
- role: TEXT ('free', 'manager', 'admin', 'super_admin')
- is_manager: BOOLEAN
- workload_score: INTEGER (매니저 작업량)
- availability_status: TEXT ('available', 'busy', 'offline')
- is_banned: BOOLEAN
- analysis_count: INTEGER (월별 분석 횟수)
- last_analysis_date: TIMESTAMPTZ
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
     7. `web/supabase/migrations/add_manager_phone_telegram.sql`

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

---

## 💰 결제 시스템

### 가격 모델 (진실 테이블 참조)

1. **Free**: 무료 AI 분석 (일일 제한)
2. **$49 디파짓**: 프로젝트 시작 시 필요
   - 환불 가능
   - 주문 진행 시 5% 수수료에서 차감됨
3. **5% 실행 수수료**: 프로젝트 완료 시 최종 주문 금액의 5%

### 결제 플로우

1. 사용자가 프로젝트를 제출
2. $49 디파짓 결제 페이지로 이동
3. Lemon Squeezy를 통한 결제 완료
4. 프로젝트 status가 `in_progress`로 변경
5. 매니저 배정
6. 프로젝트 진행
7. 주문 완료 시:
   - 최종 주문 금액의 5% 수수료 결제
   - $49 디파짓은 수수료에서 차감됨

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

### 이메일 템플릿

위치: `web/lib/email/templates.tsx`

---

## 📊 주요 API 엔드포인트

### 분석 API

- `POST /api/analyze-product` - 제품 분석 실행 (메인)
- `POST /api/analyze` - 소싱 분석 실행 (레거시)

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

- `GET /api/payment/create-checkout-url` - Checkout URL 생성 ($49 디파짓)
- `POST /api/payment/webhook` - Lemon Squeezy 웹훅

### 매니저 API

- `GET /api/manager/projects` - 할당된 프로젝트 목록
- `GET /api/manager/chat-sessions` - 매니저 채팅 세션
- `POST /api/manager/milestones` - 마일스톤 업데이트
- `POST /api/manager/files/upload` - 파일 업로드
- `POST /api/manager/activity-log` - 활동 로그 기록

### Admin API

- `GET /api/admin/stats` - 통계 데이터
- `POST /api/admin/dispatch/projects` - 프로젝트 배정
- `GET /api/admin/revenue` - 매출 데이터
- `POST /api/admin/cleanup-old-files` - 파일 정리

---

## 🔒 인증 및 권한 시스템

### 역할 (Role) 구조

> ⚠️ **중요**: `pro` 역할은 더 이상 사용하지 않습니다. 가격 모델이 Free + $49 디파짓 (환불 가능) + 5% 실행 수수료로 변경되었습니다.

1. **free**: 무료 사용자 (기본)
   - 일일 AI 분석 제한
   - 프로젝트 저장 가능
   - $49 디파짓 결제 시 프로젝트 진행 가능

2. **manager**: 매니저
   - @nexsupply.net 이메일 도메인
   - 클라이언트 프로젝트 관리
   - 채팅 접근
   - 마일스톤 관리

3. **admin**: 관리자
   - 매니저 기능 + 일부 Admin 기능

4. **super_admin**: Super Admin
   - 모든 기능 접근
   - 프로젝트 배정
   - 사용자 관리
   - 매출 통계

### 자동 리다이렉트

미들웨어에서 이메일 도메인 기반 자동 리다이렉트:

- `@nexsupply.net` → `/manager/dashboard`
- `k.myungjun@nexsupply.net` → `/admin`
- 일반 사용자 → `/dashboard`

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

---

## 📝 개발 가이드라인

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

---

## 📚 추가 자료

### 문서 위치

- `web/docs/HANDOVER.md` - ⭐ **이 문서 (정본)** - 모든 개발자는 이 문서만 참조하세요
- `web/docs/archive/` - 기존 문서 보관 (참고용, 정본 아님)

### 외부 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Vercel 문서](https://vercel.com/docs)
- [Google Gemini API 문서](https://ai.google.dev/docs)

---

**문서 작성일**: 2024년 12월  
**최종 업데이트**: 2024년 12월  
**문서 버전**: 3.0.0

---

이 문서는 nexi.ai 코드베이스의 완전한 인수인계 가이드입니다.  
문의사항이나 개선 사항이 있다면 GitHub Issues에 등록해주세요.

