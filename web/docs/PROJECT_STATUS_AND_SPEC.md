# NexSupply 프로젝트 현황 및 스펙 문서

## 📊 프로젝트 현황 요약

**프로젝트명**: NexSupply  
**타입**: B2B 소싱 플랫폼 (AI-Powered Sourcing Intelligence)  
**개발 상태**: 프로덕션 준비 단계  
**최종 업데이트**: 2024년 12월

---

## 🎯 핵심 기능 완료 현황

### ✅ 완료된 주요 기능

#### 1. 사용자 인증 및 권한 관리 (100%)
- [x] Supabase Auth 통합
- [x] 역할 기반 접근 제어 (free, pro, manager, admin, super_admin)
- [x] 자동 리다이렉트 (이메일 도메인 기반)
- [x] 미들웨어 보호

#### 2. AI 분석 시스템 (100%)
- [x] Google Gemini 2.5 Flash 통합
- [x] Landed Cost 계산
- [x] 리스크 평가 (Quality, Delivery, Stability, Difficulty)
- [x] 블랙리스트 체크 (Kill Switch)
- [x] OSINT 데이터 활용
- [x] Logistics Insight 계산

#### 3. 실시간 채팅 시스템 (100%)
- [x] Supabase Realtime 통합
- [x] 매니저-클라이언트 실시간 채팅
- [x] 파일 업로드 지원 (Supabase Storage)
- [x] 읽지 않은 메시지 표시
- [x] Quick Replies (매니저용)
- [x] 클라이언트용 채팅 접근 UI

#### 4. 매니저 시스템 (100%)
- [x] 매니저 대시보드 (KPI 카드)
- [x] 작업 공간 (Workstation)
- [x] 클라이언트 리스트
- [x] 마일스톤 관리
- [x] 프로젝트 파일 관리

#### 5. Super Admin 시스템 (100%)
- [x] Super Admin 대시보드
- [x] 프로젝트 배정 시스템 (Dispatch Center)
- [x] 사용자 관리 (차단/해제)
- [x] 매출 대시보드 (Lemon Squeezy API 통합)
- [x] Lemon Squeezy 통계 조회

#### 6. 결제 시스템 (100%)
- [x] Lemon Squeezy 통합
- [x] Checkout URL 생성
- [x] 웹훅 처리 (HMAC 검증)
- [x] 자동 역할 업데이트 (free → pro)

#### 7. 이메일 알림 시스템 (100%)
- [x] 분석 완료 알림
- [x] 새 메시지 알림 (Throttling 적용)
- [x] 마일스톤 업데이트 알림
- [x] Google SMTP 통합

#### 8. 파일 관리 시스템 (100%)
- [x] 파일 라이브러리 (Asset Library)
- [x] 카테고리별 필터링
- [x] 6개월 자동 정리 시스템 (Cron Job)
- [x] 텍스트 메시지 유지, 파일만 삭제

#### 9. 법적 페이지 (100%)
- [x] Terms of Service (AI 분석 면책 조항 포함)
- [x] Privacy Policy
- [x] Refund Policy (매니저 채팅 시작 후 환불 불가)

#### 10. 프로젝트 관리 (100%)
- [x] 프로젝트 생성 및 조회
- [x] 프로젝트 상태 관리
- [x] 분석 결과 저장
- [x] 프로젝트 히스토리

---

## 🏗️ 기술 스펙

### Frontend Architecture
- **Framework**: Next.js 15.1.0 (App Router)
- **언어**: TypeScript
- **UI 라이브러리**: 
  - Tailwind CSS
  - Radix UI
  - Lucide React
  - Framer Motion

### Backend Architecture
- **런타임**: Node.js
- **API**: Next.js API Routes
- **Server Actions**: Next.js Server Actions
- **인증**: Supabase Auth

### Database
- **플랫폼**: Supabase (PostgreSQL)
- **주요 테이블**:
  - `profiles` (사용자 프로필)
  - `projects` (프로젝트)
  - `chat_sessions` (채팅 세션)
  - `chat_messages` (채팅 메시지)
  - `messages` (AI 분석 메시지)

### 외부 서비스
- **AI**: Google Gemini 2.5 Flash
- **결제**: Lemon Squeezy
- **이메일**: Google SMTP (Nodemailer)
- **Storage**: Supabase Storage
- **Analytics**: Vercel Analytics

### 배포
- **플랫폼**: Vercel
- **CI/CD**: GitHub + Vercel 자동 배포
- **Cron Jobs**: Vercel Cron

---

## 📈 데이터베이스 스키마

### 주요 테이블 구조

#### profiles
```sql
- id (UUID, PK)
- email (TEXT, Unique)
- name (TEXT)
- company (TEXT)
- role (TEXT): 'free', 'pro', 'manager', 'admin', 'super_admin'
- is_manager (BOOLEAN)
- workload_score (INTEGER)
- is_banned (BOOLEAN)
- total_spend (NUMERIC)
- created_at (TIMESTAMPTZ)
```

#### projects
```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles.id)
- manager_id (UUID, FK → profiles.id, nullable)
- name (TEXT)
- status (TEXT): 'active', 'completed', 'archived', 'in_progress'
- initial_risk_score (NUMERIC)
- total_landed_cost (NUMERIC)
- current_milestone_index (INTEGER)
- milestones (JSONB)
- dispatched_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
```

#### chat_sessions
```sql
- id (UUID, PK)
- project_id (UUID, FK → projects.id)
- user_id (UUID, FK → profiles.id)
- manager_id (UUID, FK → profiles.id, nullable)
- status (TEXT): 'open', 'in_progress', 'resolved', 'closed'
- created_at (TIMESTAMPTZ)
```

#### chat_messages
```sql
- id (UUID, PK)
- session_id (UUID, FK → chat_sessions.id)
- sender_id (UUID, FK → profiles.id)
- role (TEXT): 'user', 'manager'
- content (TEXT)
- file_url (TEXT, nullable)
- file_name (TEXT, nullable)
- file_type (TEXT, nullable)
- read_at (TIMESTAMPTZ, nullable)
- created_at (TIMESTAMPTZ)
```

---

## 🔄 주요 사용자 플로우

### 클라이언트 플로우
1. 회원가입/로그인
2. AI 분석 시작 (`/chat`)
3. 분석 결과 확인 (`/results`)
4. 프로 결제 ($199)
5. 매니저 배정 대기
6. 매니저와 실시간 채팅 (`/dashboard/chat`)
7. 프로젝트 진행 추적

### 매니저 플로우
1. @nexsupply.net 이메일로 로그인
2. 자동 리다이렉트 → `/manager/dashboard`
3. 할당된 프로젝트 확인
4. 작업 공간 접속 (`/manager/workstation`)
5. 클라이언트와 실시간 채팅
6. 마일스톤 업데이트
7. 파일 공유 및 관리

### Super Admin 플로우
1. k.myungjun@nexsupply.net으로 로그인
2. 자동 리다이렉트 → `/admin`
3. 대시보드에서 전체 현황 확인
4. 프로젝트 배정 (`/admin/dispatch`)
5. 사용자 관리 (`/admin/users`)
6. 매출 통계 확인 (`/admin/revenue`)

---

## 🔐 보안 및 권한

### 역할 구조
- **free**: 무료 사용자 (기본)
- **pro**: 유료 사용자 ($199/월)
- **manager**: 매니저 (@nexsupply.net)
- **admin**: 관리자
- **super_admin**: Super Admin

### 접근 제어
- `/admin/*`: super_admin만 접근
- `/manager/*`: manager 또는 admin만 접근
- `/dashboard/*`: 로그인 필요

### 데이터 보안
- Row Level Security (RLS) 활성화
- Service Role Key로 관리 작업 수행
- API 키 기반 보안 검증

---

## 📊 성능 최적화

### 완료된 최적화
- [x] 이미지 최적화 (Next.js Image 컴포넌트)
- [x] 코드 스플리팅 (자동)
- [x] API 응답 캐싱 (60초)
- [x] 파일 자동 정리 (6개월)

### 추가 최적화 필요
- [ ] 데이터베이스 쿼리 최적화
- [ ] 이미지 CDN 통합
- [ ] 서버 사이드 캐싱 강화

---

## 🐛 알려진 이슈

### 현재 버전에서 해결된 이슈
- ✅ Vercel 배포 설정 문제 (Root Directory)
- ✅ 파일 삭제 API Storage 클라이언트 문제
- ✅ 로그인 리다이렉트 문제

### 미해결 이슈
- 없음 (모든 주요 기능 완료)

---

## 📝 코드 품질

### 코드 스타일
- TypeScript 100% 사용
- ESLint 설정 준수
- 컴포넌트 구조화

### 테스트
- 현재 테스트 없음 (추가 필요)

### 문서화
- 주요 기능 문서화 완료
- API 문서 포함
- 인수인계 문서 작성 완료

---

## 🚀 배포 정보

### 배포 플랫폼
- **프로덕션**: Vercel
- **도메인**: (설정 필요)

### 환경 변수
- Supabase 설정 완료
- Lemon Squeezy 설정 완료
- Google SMTP 설정 완료

### Cron Jobs
- 파일 정리: 매일 오전 2시 (`/api/cron/cleanup-old-files`)

---

## 📚 문서 구조

### 완성된 문서
1. **COMPLETE_HANDOVER_DOCUMENT.md** - 완전 인수인계 문서
2. **PROJECT_STATUS_AND_SPEC.md** - 이 문서 (현황 및 스펙)
3. **SUPER_ADMIN_COMPLETE.md** - Super Admin 가이드
4. **MANAGER_WORKSTATION_COMPLETE.md** - 매니저 워크스테이션 가이드
5. **CHAT_FILE_CLEANUP_COMPLETE.md** - 파일 정리 시스템 가이드
6. **CLIENT_CHAT_ACCESS_COMPLETE.md** - 클라이언트 채팅 접근 가이드

### 추가 문서 위치
- `web/docs/` 디렉토리

---

## 🎯 다음 단계 (로드맵)

### 단기 (1-2주)
- [ ] UI 텍스트 영어화 완료
- [ ] 에러 핸들링 강화
- [ ] 로딩 상태 개선

### 중기 (1-2개월)
- [ ] 모바일 반응형 개선
- [ ] 실시간 브라우저 알림
- [ ] 파일 미리보기 기능

### 장기 (3-6개월)
- [ ] 다국어 지원
- [ ] 고급 분석 기능
- [ ] 모바일 앱

---

## ✅ 신입 개발자 온보딩 체크리스트

신입 개발자가 완료해야 할 항목:

### 환경 설정
- [ ] 프로젝트 클론
- [ ] 환경 변수 설정
- [ ] 로컬 개발 서버 실행
- [ ] Supabase 접근 권한 획득

### 학습
- [ ] 프로젝트 구조 이해
- [ ] 데이터베이스 스키마 이해
- [ ] 주요 API 엔드포인트 파악
- [ ] 컴포넌트 구조 이해

### 실습
- [ ] 작은 버그 수정
- [ ] 작은 기능 추가
- [ ] 코드 리뷰 참여

---

## 📞 지원 및 리소스

### 개발 리소스
- GitHub Repository
- Vercel Dashboard
- Supabase Dashboard

### 문서
- `web/docs/` 디렉토리의 모든 문서
- Next.js 공식 문서
- Supabase 공식 문서

---

**문서 작성일**: 2024년 12월  
**문서 버전**: 1.0.0  
**최종 업데이트**: 2024년 12월

---

이 문서는 NexSupply 프로젝트의 현재 상태를 정확하게 반영합니다. 업데이트가 필요하면 즉시 반영하세요.

