# 🚀 NexSupply 로컬 개발 환경 설정 가이드

## 빠른 시작

### 1. 의존성 설치

```bash
cd web
npm install
```

### 2. 환경 변수 설정

프로젝트 루트(`web` 디렉토리)에 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
# 필수: Gemini AI API 키
GEMINI_API_KEY=your-gemini-api-key-here

# NextAuth 설정 (인증 사용 시)
NEXTAUTH_SECRET=your-secret-key-here
# 생성 방법: openssl rand -base64 32

NEXTAUTH_URL=http://localhost:3000

# 선택사항: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 선택사항: 이메일 설정
RESEND_API_KEY=your-resend-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SYSTEM_EMAIL_FROM=your-email@gmail.com
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 주요 명령어

- **개발 서버 실행**: `npm run dev`
- **프로덕션 빌드**: `npm run build`
- **프로덕션 서버 실행**: `npm run start`
- **린트 검사**: `npm run lint`

## 환경 변수 설명

### 필수 변수

- **GEMINI_API_KEY**: Google Gemini API 키 (필수)
  - [Google AI Studio](https://makersuite.google.com/app/apikey)에서 발급 가능

### 선택사항

- **NEXTAUTH_SECRET**: NextAuth 세션 암호화 키
- **NEXTAUTH_URL**: 앱의 공개 URL (로컬: `http://localhost:3000`)
- **GOOGLE_CLIENT_ID/SECRET**: Google 로그인 사용 시
- **이메일 관련**: 이메일 발송 기능 사용 시

## 문제 해결

### 포트가 이미 사용 중인 경우

```bash
# 다른 포트로 실행
PORT=3001 npm run dev
```

### Prisma 관련 오류

```bash
# Prisma 클라이언트 재생성
npx prisma generate
```

### 의존성 문제

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

## 다음 단계

1. 온보딩 채팅 테스트: `http://localhost:3000/chat`
2. Chat 페이지 테스트: `http://localhost:3000/chat`
3. Copilot 테스트: `http://localhost:3000/copilot`

