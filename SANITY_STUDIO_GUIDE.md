# Sanity Studio 실행 가이드

## 현재 상태

✅ **완료된 작업:**
- Sanity 프로젝트 ID, Dataset, API Token 설정 완료
- 콘텐츠 모델 정의 완료 (스키마 파일)
- Next.js 연동 완료 (환경 변수 설정)

## Sanity Studio 로컬 실행

### 1. 의존성 설치

```bash
cd sanity
npm install
```

### 2. Sanity Studio 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3333`로 자동으로 열립니다.

### 3. 콘텐츠 입력

Studio가 열리면 다음 문서들을 생성하고 콘텐츠를 입력하세요:

#### 싱글톤 페이지 (각각 하나만 생성)
1. **Site Settings** - 전역 사이트 설정
2. **Home Page** - 홈 페이지 콘텐츠
3. **How It Works Page** - How It Works 페이지
4. **Use Cases Page** - Use Cases 페이지

#### 재사용 가능한 문서 (여러 개 생성 가능)
- **Testimonial** - 고객 후기
- **FAQ** - 자주 묻는 질문
- **Use Case** - 개별 사용 사례

## Next.js에서 확인

1. Next.js 개발 서버 실행:
   ```bash
   cd web
   npm run dev
   ```

2. 브라우저에서 확인:
   - `http://localhost:3000` - 홈 페이지
   - `http://localhost:3000/how-it-works` - How It Works
   - `http://localhost:3000/use-cases` - Use Cases

3. Sanity에서 입력한 콘텐츠가 페이지에 표시되는지 확인

## 환경 변수

### Next.js 앱 (web/.env.local)
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-api-token-here
```

⚠️ **보안**: 실제 API 토큰은 `.env.local` 파일에만 저장하고, 이 파일에는 포함하지 마세요.

### Sanity Studio (sanity/.env.local - 선택사항)
Studio는 `sanity.config.ts`에서 직접 projectId를 읽습니다.

## 문제 해결

### Studio가 열리지 않는 경우
1. `sanity/package.json`이 있는지 확인
2. `npm install`을 실행했는지 확인
3. 포트 3333이 사용 중인지 확인

### 콘텐츠가 표시되지 않는 경우
1. Next.js 앱의 `.env.local`에 환경 변수가 있는지 확인
2. Sanity Studio에서 문서가 "Published" 상태인지 확인
3. Next.js 개발 서버를 재시작

### 타입 에러가 발생하는 경우
1. `sanity/tsconfig.json`이 올바르게 설정되었는지 확인
2. `npm install`을 다시 실행

## 다음 단계

1. ✅ Sanity Studio 실행
2. ✅ 초기 콘텐츠 입력
3. ✅ Next.js 페이지에서 확인
4. 🔄 콘텐츠 반복 수정 및 테스트

