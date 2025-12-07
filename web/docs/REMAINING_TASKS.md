# 남은 작업 요약

## ✅ 완료된 작업 (4/5)

1. ✅ **파일 보관함 (Asset Library)** - Documents 탭, 파일 분류 및 필터링
2. ✅ **이메일 알림 시스템 개선** - 새 메시지 알림, Chat Digest
3. ✅ **법적 고지 및 신뢰 장치** - Terms, Privacy, Refund Policy, Trust badges
4. ✅ **슈퍼 어드민 페이지** - Dashboard, Dispatch Center, User Management, Revenue

## 📋 남은 작업 (1/5)

### 5. 앱 전체 언어 변경 (한글 → 영어) ⏳

현재 앱에 한글이 남아있는 주요 파일들:

#### Next.js 페이지 및 컴포넌트:
- `web/app/login/page.tsx` - "처리 중...", "회원가입", "로그인", "매니저 로그인"
- `web/app/login/actions.ts` - 한글 주석
- `web/app/manager/login/page.tsx` - "일반 로그인", "매니저 전용 로그인입니다"
- `web/app/manager/workstation/page.tsx` - "클라이언트와 소통하고...", "프로젝트를 선택하여..."
- `web/app/manager/dashboard/page.tsx` - "진행 중인 프로젝트"
- `web/app/results/page.tsx` - 한글 에러 메시지
- `web/app/api/analyze/route.ts` - 한글 주석 및 메시지
- `web/components/ProjectFiles.tsx` - "공유된 파일이 없습니다"
- `web/lib/email/templates.tsx` - 이메일 템플릿 (일부는 이미 영어)

#### 컴포넌트:
- `web/components/ManagerChat.tsx` - Quick Replies (한글)
- `web/components/ClientList.tsx` - 한글 텍스트
- `web/components/MilestoneTracker.tsx` - 한글 텍스트

#### 주석 및 에러 메시지:
- 여러 파일의 한글 주석
- 한글 에러 메시지
- 콘솔 로그 메시지

## 작업 범위

### 1. UI 텍스트 영어로 변경
- 모든 사용자에게 보이는 텍스트
- 버튼, 레이블, 플레이스홀더
- 에러/성공 메시지

### 2. 주석 및 로그 메시지 (선택사항)
- 코드 주석은 영어로 변경 (선택)
- 콘솔 로그는 영어로 변경 (선택)

### 3. 이메일 템플릿 확인
- 이미 대부분 영어로 되어 있는지 확인
- 한글이 남아있으면 영어로 변경

## 예상 작업 시간

- UI 텍스트: 약 20-30개 파일 수정
- 에러 메시지: 약 10-15개 파일 수정
- 주석 및 로그: 선택적 (시간이 되면)

## 진행 방법

1. **우선순위 높음**: 사용자에게 보이는 텍스트만 변경
2. **우선순위 낮음**: 주석과 로그 메시지는 나중에

어떻게 진행하시겠습니까?

