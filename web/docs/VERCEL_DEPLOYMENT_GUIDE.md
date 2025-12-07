# Vercel 배포 설정 가이드

## 🚨 현재 문제

Vercel이 프로젝트 루트에서 Next.js를 찾지 못하고 있습니다:

```
Error: No Next.js version detected. Make sure your package.json has "next" 
in either "dependencies" or "devDependencies". Also check your Root Directory 
setting matches the directory of your package.json file.
```

## 🔍 원인

- 프로젝트 루트: `nexi.ai/` (Next.js 없음)
- Next.js 앱: `nexi.ai/web/` (Next.js 있음)
- Vercel이 루트에서 빌드를 시작하여 Next.js를 찾지 못함

## ✅ 해결 방법 (필수)

### 1. Vercel 대시보드에서 Root Directory 설정

**중요**: 반드시 Vercel 대시보드에서 Root Directory를 설정해야 합니다.

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** 탭 클릭
4. **General** 섹션으로 스크롤
5. **Root Directory** 필드 찾기
6. `web` 입력
7. **Save** 클릭
8. **Deployments** 탭으로 이동
9. 최신 배포의 **Redeploy** 클릭

### 2. vercel.json 설정

`vercel.json` 파일은 이제 빈 객체입니다 (Vercel이 자동 감지하도록):

```json
{}
```

또는 파일을 완전히 제거할 수도 있습니다.

---

## 📋 프로젝트 구조

```
nexi.ai/
├── package.json          # 루트 패키지 (Next.js 없음)
├── vercel.json          # 빈 JSON 또는 제거 가능
└── web/
    ├── package.json      # Next.js 앱 (여기에 Next.js 있음)
    ├── next.config.js
    ├── app/
    └── ...
```

---

## 🔧 Vercel 프로젝트 설정 요약

### 필수 설정 (대시보드)

- **Root Directory**: `web` ⚠️ **반드시 설정 필요**
- **Framework Preset**: Next.js (자동 감지됨)
- **Build Command**: (자동)
- **Output Directory**: (자동)
- **Install Command**: (자동)

### 환경 변수

환경 변수는 Vercel 대시보드에서 설정:

1. **Settings** → **Environment Variables**
2. 필요한 환경 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `LEMON_SQUEEZY_STORE_URL`
   - `LEMON_SQUEEZY_WEBHOOK_SECRET`
   - 기타 필요한 변수들

---

## ✅ 배포 체크리스트

### 사전 준비

- [ ] Vercel 대시보드에서 Root Directory를 `web`으로 설정
- [ ] 환경 변수 모두 설정 완료
- [ ] `vercel.json` 확인 (빈 객체 또는 제거)

### 배포

- [ ] 변경사항 커밋 및 푸시
- [ ] Vercel 자동 배포 대기 또는 수동 트리거
- [ ] 빌드 로그 확인
- [ ] 배포 성공 확인

### 배포 후 확인

- [ ] 배포된 URL 접속 테스트
- [ ] Analytics 데이터 확인 (Vercel Analytics)
- [ ] 주요 기능 테스트

---

## 🚀 배포 후 예상 결과

배포가 성공하면:

1. ✅ 빌드 로그에서 Next.js 버전 확인 가능
2. ✅ Next.js 앱이 정상적으로 빌드됨
3. ✅ 배포된 사이트에서 모든 기능 작동

---

## 🔍 문제 해결

### 여전히 Next.js를 찾지 못하는 경우

1. **Root Directory 확인**: 대시보드에서 정확히 `web`으로 설정되었는지 확인
2. **캐시 삭제**: Vercel 대시보드에서 빌드 캐시 삭제 후 재배포
3. **수동 재배포**: Settings에서 저장 후 새 배포 트리거

### 다른 오류가 발생하는 경우

1. 빌드 로그 전체 확인
2. 환경 변수 누락 확인
3. `web/package.json`의 의존성 확인

---

## 📚 참고 자료

- [Vercel Root Directory 설정](https://vercel.com/docs/projects/project-configuration#root-directory)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)

---

**최종 업데이트**: 2024년 12월

