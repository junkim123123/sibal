# NexSupply - B2B Sourcing Platform

**nexi.ai** 레포지토리 - NexSupply 서비스의 기술 구현체

> **용어 정의**: 
> - **nexi.ai**: 레포지토리 및 코드베이스 이름
> - **NexSupply**: 서비스 및 브랜드 이름

AI-powered B2B sourcing intelligence platform that provides cost analysis, supplier verification, and market insights for global sourcing decisions.

## 📚 문서

**신입 개발자는 반드시 다음 문서를 먼저 읽어주세요:**

👉 **[인수인계 문서 (HANDOVER.md)](docs/HANDOVER.md)** - 완전한 가이드 및 30분 내 로컬 실행 방법

## 🚀 Quick Start

### 사전 요구사항

- Node.js 18+
- npm 또는 yarn

### 로컬 실행

```bash
# 의존성 설치
npm install --legacy-peer-deps

# 환경 변수 설정 (.env.local 파일 생성)
cp .env.example .env.local
# .env.local 파일에 필요한 환경 변수 입력

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

**자세한 설정 방법은 [HANDOVER.md](docs/HANDOVER.md)를 참고하세요.**

## 🏗️ Tech Stack

- **Framework**: Next.js 15.1.0 (App Router)
- **언어**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI Model**: Google Gemini 2.5 Flash
- **배포**: Vercel
- **CMS**: Sanity

## 📁 프로젝트 구조

```
web/
├── app/              # Next.js App Router
│   ├── chat/        # ⭐ 메인 플로우
│   ├── results/     # 분석 결과 페이지
│   ├── dashboard/   # 클라이언트 대시보드
│   ├── manager/     # 매니저 페이지
│   └── admin/       # Admin 페이지
├── components/       # 재사용 가능한 컴포넌트
├── lib/             # 유틸리티 및 헬퍼
├── supabase/        # 데이터베이스 스키마
└── docs/            # 문서
    └── HANDOVER.md  # ⭐ 인수인계 문서
```

## 🔍 주요 기능

- **메인 플로우**: `/chat` - Dr.B 스타일 온보딩 채팅
- **결과 페이지**: `/results` - 분석 결과 표시
- **프로젝트 관리**: `/dashboard` - 클라이언트 대시보드
- **매니저 도구**: `/manager/workstation` - 매니저 작업 공간

## 🧪 문서 검증

문서에 언급된 파일 경로가 유효한지 검사:

```bash
npm run docs:check
```

## 📝 추가 자료

- **[HANDOVER.md](docs/HANDOVER.md)** - ⭐ 완전한 인수인계 가이드 (신입 개발자 필수)
- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Vercel 문서](https://vercel.com/docs)

## License

© 2017 NexSupply. All rights reserved.

