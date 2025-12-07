# Vercel Root Directory 설정 가이드

## 🚨 문제

```
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies". Also check your Root Directory setting matches the directory of your package.json file.
```

## 원인

Vercel이 프로젝트 루트에서 빌드를 시작하고 있지만, Next.js 앱은 `web/` 디렉토리에 있습니다.

## ✅ 해결 방법

### 방법 1: Vercel 대시보드에서 Root Directory 설정 (권장)

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. **Settings** 탭으로 이동
4. **General** 섹션에서 **Root Directory** 찾기
5. `web` 입력 (또는 `./web`)
6. **Save** 클릭
7. 새 배포 트리거

### 방법 2: vercel.json 제거 및 자동 감지

Vercel이 자동으로 Next.js를 감지하도록 `vercel.json`을 제거하거나 최소화:

**옵션 A: vercel.json 완전 제거**
- `vercel.json` 파일 삭제
- Vercel 대시보드에서 Root Directory를 `web`으로 설정

**옵션 B: vercel.json 최소화**
```json
{}
```
- 빈 JSON 객체로 두고 Vercel 대시보드에서 모든 설정 관리

### 방법 3: Vercel CLI 사용

로컬에서 배포할 때:

```bash
cd web
vercel
```

또는:

```bash
vercel --cwd web
```

---

## 📋 현재 프로젝트 구조

```
nexi.ai/
├── package.json          (루트 - Next.js 없음)
├── vercel.json
└── web/
    ├── package.json      (Next.js 앱)
    ├── next.config.js
    └── ...
```

---

## 🔧 권장 설정

### Vercel 대시보드 설정

- **Root Directory**: `web`
- **Framework Preset**: Next.js (자동 감지)
- **Build Command**: (자동)
- **Output Directory**: (자동)

### vercel.json (선택 사항)

Root Directory를 대시보드에서 설정했다면 `vercel.json`은 필요 없습니다:

1. **방법 1**: `vercel.json` 파일 삭제
2. **방법 2**: 최소 설정 유지:

```json
{}
```

---

## ✅ 체크리스트

- [ ] Vercel 대시보드에서 Root Directory를 `web`으로 설정
- [ ] `vercel.json` 파일 확인/수정
- [ ] 변경사항 커밋 및 푸시
- [ ] 새 배포 트리거
- [ ] 배포 성공 확인

---

## 🚀 배포 후 확인

배포가 성공하면:

1. Vercel 대시보드에서 빌드 로그 확인
2. 배포된 URL 접속 테스트
3. Next.js 앱이 정상 작동하는지 확인

---

**수정 완료일**: 2024년 12월

