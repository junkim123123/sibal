# Sanity 설정 완료

## ✅ 완료된 작업

1. ✅ Contentful 코드 제거
   - `web/lib/contentful/` 폴더 삭제
   - `contentful` 패키지 제거

2. ✅ 마케팅 페이지를 Sanity로 되돌리기
   - `web/app/(marketing)/page.tsx` - Sanity 사용
   - `web/app/(marketing)/how-it-works/page.tsx` - Sanity 사용
   - `web/app/(marketing)/use-cases/page.tsx` - Sanity 사용

3. ✅ Sanity 환경 변수 설정
   - 프로젝트 ID: `m4g1dr67`
   - Dataset: `production`
   - `.env.local` 파일에 설정 완료

4. ✅ Sanity 설정 파일 업데이트
   - `sanity/sanity.config.ts` - 프로젝트 ID 업데이트
   - `web/lib/sanity/client.ts` - 프로젝트 ID 업데이트

## 📋 Sanity 프로젝트 정보

- **프로젝트 ID**: `m4g1dr67`
- **조직 ID**: `oK6EZvT6e`
- **Dataset**: `production`


## 🔧 환경 변수

`web/.env.local` 파일에 다음 변수가 설정되어 있습니다:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID="m4g1dr67"
NEXT_PUBLIC_SANITY_DATASET="production"
```

## 🚀 사용 방법

### 1. Sanity Studio 접근

**방법 A: Sanity 웹사이트에서 접근**
1. https://www.sanity.io/manage 접속
2. 프로젝트 `m4g1dr67` 선택
3. Studio 열기

**방법 B: 로컬에서 실행 (선택사항)**
```bash
cd sanity
npm run dev
```

### 2. 콘텐츠 입력

Sanity Studio에서 다음 Content Type을 생성하고 콘텐츠를 입력하세요:

- **Site Settings** (`siteSettings`) - Single Entry
- **Home Page** (`homePage`) - Single Entry
- **How It Works Page** (`howItWorksPage`) - Single Entry
- **Use Cases Page** (`useCasesPage`) - Single Entry

### 3. Next.js에서 확인

```bash
cd web
npm run dev
```

브라우저에서 `http://localhost:3000` 접속하여 Sanity 데이터가 표시되는지 확인하세요.

## 📝 참고사항

- Sanity Studio는 웹사이트에서 직접 접근하는 것이 가장 안정적입니다
- 콘텐츠는 즉시 반영됩니다 (개발 서버 재시작 불필요)
- 환경 변수가 변경되면 개발 서버를 재시작해야 합니다

## ⚠️ 문제 해결

### 데이터가 표시되지 않는 경우
1. Sanity Studio에서 Entry가 **Published** 상태인지 확인
2. 환경 변수가 올바른지 확인
3. 개발 서버 재시작 (`Ctrl+C` 후 `npm run dev`)

### 타입 오류가 발생하는 경우
1. `web/lib/sanity/client.ts` 파일 확인
2. Sanity의 필드 이름이 코드와 일치하는지 확인

