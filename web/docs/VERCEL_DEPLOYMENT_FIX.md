# Vercel 배포 설정 수정

## 🔧 문제 해결

### 문제
```
The `vercel.json` schema validation failed with the following message: 
should NOT have additional property `rootDirectory`
```

### 원인
`rootDirectory` 속성은 Vercel의 `vercel.json` 스키마에서 더 이상 지원되지 않습니다.

### 해결 방법

#### 1. `vercel.json` 파일 수정 ✅

`rootDirectory` 속성을 제거하고, 빌드 명령에서 디렉토리를 명시적으로 지정:

```json
{
  "buildCommand": "cd web && npm install --legacy-peer-deps && npm run build",
  "outputDirectory": "web/.next"
}
```

#### 2. Vercel 프로젝트 설정 (중요)

Vercel 대시보드에서 **Root Directory**를 설정해야 합니다:

1. Vercel 대시보드 로그인
2. 프로젝트 선택
3. **Settings** 탭으로 이동
4. **General** 섹션에서 **Root Directory** 찾기
5. `web` 입력
6. **Save** 클릭

또는 배포 시 Vercel CLI를 사용하는 경우:

```bash
vercel --cwd web
```

---

## 📋 최종 설정

### `vercel.json` (프로젝트 루트)

```json
{
  "buildCommand": "cd web && npm install --legacy-peer-deps && npm run build",
  "outputDirectory": "web/.next"
}
```

### Vercel 프로젝트 설정

- **Root Directory**: `web`
- **Framework Preset**: Next.js (자동 감지)
- **Build Command**: (자동 또는 vercel.json 참조)
- **Output Directory**: (자동 또는 vercel.json 참조)

---

## ✅ 체크리스트

- [x] `vercel.json`에서 `rootDirectory` 속성 제거
- [ ] Vercel 대시보드에서 Root Directory를 `web`으로 설정
- [ ] 변경사항 커밋 및 푸시
- [ ] 새 배포 트리거
- [ ] 배포 성공 확인

---

## 🚀 배포 후 확인

배포가 성공하면:

1. Vercel 대시보드에서 배포 상태 확인
2. 배포된 URL 접속 테스트
3. Analytics 데이터 확인 (Vercel Analytics 통합 후)

---

## 참고

- Vercel은 Next.js 프로젝트를 자동으로 감지하므로 많은 설정이 선택 사항입니다.
- `rootDirectory`는 Vercel 대시보드에서만 설정 가능합니다.
- Monorepo 구조의 경우 각 앱을 별도 Vercel 프로젝트로 관리하는 것이 권장됩니다.

---

**수정 완료일**: 2024년 12월

