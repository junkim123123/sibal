# 🚨 Vercel 배포 설정 - 긴급 해결 가이드

## 현재 문제

Vercel이 프로젝트 루트에서 Next.js를 찾지 못하고 있습니다. **Vercel 대시보드에서 Root Directory 설정이 반드시 필요합니다.**

---

## ⚠️ 필수 작업: Vercel 대시보드 설정

### 1단계: Vercel 대시보드 접속

1. https://vercel.com/dashboard 접속
2. 로그인
3. 프로젝트 선택 (`sibal` 프로젝트)

### 2단계: Root Directory 설정

1. 프로젝트 페이지에서 **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **General** 클릭
3. 아래로 스크롤하여 **Root Directory** 섹션 찾기
4. **Root Directory** 입력 필드에 다음을 입력:
   ```
   web
   ```
   (또는 `./web`)
5. **Save** 버튼 클릭

### 3단계: 배포 다시 시작

1. 상단 메뉴에서 **Deployments** 탭 클릭
2. 최신 배포를 찾아 **...** (점 3개) 메뉴 클릭
3. **Redeploy** 선택
4. 또는 GitHub에 새 커밋을 푸시하면 자동으로 재배포됨

---

## 📸 확인 방법

Root Directory 설정 후 빌드 로그에서 다음을 확인:

**성공 시:**
```
Detected Next.js version: 15.x.x
Installing dependencies...
```

**실패 시 (현재 상태):**
```
Warning: Could not identify Next.js version
Error: No Next.js version detected
```

---

## 🔄 대안: 프로젝트 재연결

Root Directory 설정이 작동하지 않으면:

### 방법 1: 프로젝트 삭제 후 재연결

1. Vercel 대시보드에서 프로젝트 삭제
2. GitHub 리포지토리에서 **Import Project** 클릭
3. **Root Directory**를 `web`으로 설정
4. 환경 변수 다시 설정
5. 배포

### 방법 2: 새 프로젝트로 연결

1. Vercel 대시보드에서 **Add New Project**
2. GitHub 리포지토리 선택
3. **Configure Project** 화면에서:
   - **Root Directory**: `web` 설정
   - **Framework Preset**: Next.js (자동 감지)
4. 환경 변수 설정
5. 배포

---

## ✅ 체크리스트

- [ ] Vercel 대시보드 접속
- [ ] Settings → General 이동
- [ ] Root Directory를 `web`으로 설정
- [ ] Save 클릭
- [ ] Deployments에서 새 배포 트리거
- [ ] 빌드 로그 확인
- [ ] Next.js 버전이 감지되는지 확인

---

## 🎯 예상 결과

Root Directory를 올바르게 설정하면:

1. ✅ 빌드가 `web/` 디렉토리에서 시작됨
2. ✅ Next.js 버전이 자동으로 감지됨
3. ✅ `web/package.json`의 의존성이 설치됨
4. ✅ Next.js 앱이 정상적으로 빌드됨

---

## 📞 문제가 계속되면

1. Vercel 대시보드의 **Settings** → **General**에서 Root Directory 값 확인
2. 프로젝트를 삭제하고 새로 연결
3. Vercel 지원팀에 문의

---

**이 작업을 완료하지 않으면 배포가 계속 실패합니다!**

