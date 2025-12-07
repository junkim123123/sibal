# 🍋 Lemon Squeezy 환경 변수 체크리스트

## ✅ 현재 설정된 변수 (확인됨)

- ✅ `LEMONSQUEEZY_STORE_ID` - Store ID 설정됨
- ✅ `LEMON_SQUEEZY_WEBHOOK_SECRET` - 웹훅 시크릿 설정됨
- ✅ `NEXT_PUBLIC_SITE_URL` - 사이트 URL 설정됨

## ❌ 누락된 필수 변수

### 1. **LEMONSQUEEZY_API_KEY** 또는 **LEMON_SQUEEZY_API_KEY** (필수)
- **상태**: ❌ 누락됨
- **설명**: Lemon Squeezy API 인증 키
- **형식**: 
  - Test Mode: `ls_test_...`로 시작
  - Live Mode: `ls_live_...`로 시작
- **설정 위치**: Vercel > Settings > Environment Variables
- **확인 방법**: Lemon Squeezy 대시보드 > Settings > API

### 2. **LEMON_SQUEEZY_SUBSCRIPTION_VARIANT_ID** (필수)
- **상태**: ❌ 누락됨
- **설명**: 구독 상품의 Variant ID (Product ID가 아님!)
- **형식**: 숫자 문자열 (예: "123456")
- **설정 위치**: Vercel > Settings > Environment Variables
- **확인 방법**: 
  1. Lemon Squeezy 대시보드 > Products
  2. 구독 상품 클릭
  3. Variants 섹션에서 ID 확인 (Product ID가 아님!)

### 3. **NEXT_PUBLIC_APP_URL** (선택, 권장)
- **상태**: ⚠️ 누락됨 (NEXT_PUBLIC_SITE_URL은 있음)
- **설명**: 결제 성공 후 리다이렉트할 앱 URL
- **형식**: `https://your-domain.com` (슬래시 없이)
- **대체**: `NEXT_PUBLIC_SITE_URL`이 있으면 사용 가능하지만, 명시적으로 설정 권장

## 📋 환경 변수 설정 가이드

### Vercel에 환경 변수 추가하기

1. **Vercel 대시보드** 접속
2. 프로젝트 선택 > **Settings** > **Environment Variables**
3. 다음 변수들을 추가:

```
변수명: LEMONSQUEEZY_API_KEY
값: ls_test_xxxxxxxxxxxxx (Test Mode) 또는 ls_live_xxxxxxxxxxxxx (Live Mode)
환경: Production, Preview, Development (모두 선택)

변수명: LEMON_SQUEEZY_SUBSCRIPTION_VARIANT_ID
값: 123456 (Variant ID 숫자)
환경: Production, Preview, Development (모두 선택)

변수명: NEXT_PUBLIC_APP_URL
값: https://your-domain.vercel.app (또는 실제 도메인)
환경: Production, Preview, Development (모두 선택)
```

### Lemon Squeezy에서 값 확인하기

#### API Key 확인:
1. Lemon Squeezy 대시보드 > **Settings** > **API**
2. **Test Mode** 또는 **Live Mode** API Key 복사
3. `ls_test_...` 또는 `ls_live_...`로 시작하는지 확인

#### Variant ID 확인:
1. Lemon Squeezy 대시보드 > **Products**
2. 구독 상품 클릭 (상세 페이지로 이동)
3. **Variants** 섹션에서 ID 확인
   - ⚠️ 주의: Product ID가 아니라 **Variant ID**를 사용해야 함
   - Variant ID는 숫자로만 구성됨

#### Store ID 확인:
1. Lemon Squeezy 대시보드 > **Settings** > **Store**
2. Store ID 확인 (이미 설정되어 있음)

## 🔍 환경 변수 검증 방법

### 1. Vercel 로그 확인
결제 버튼을 클릭한 후 Vercel 로그에서 다음 메시지 확인:
```
[Subscribe] 🍋 Lemon Squeezy Configuration Check: {
  hasApiKey: true/false,
  hasStoreId: true/false,
  hasVariantId: true/false,
  ...
}
```

### 2. API 엔드포인트로 검증
브라우저에서 다음 URL 접속 (인증 필요):
```
https://your-domain.vercel.app/api/payment/verify-variant
```

응답 예시:
```json
{
  "ok": true,
  "variant": {
    "id": "123456",
    "name": "Monthly Subscription",
    ...
  }
}
```

## ⚠️ 주의사항

1. **Test Mode vs Live Mode**
   - 개발 중: `ls_test_...` API Key 사용
   - 프로덕션: `ls_live_...` API Key 사용
   - 환경 변수에 올바른 모드의 키가 설정되어 있는지 확인

2. **Variant ID vs Product ID**
   - ❌ Product ID 사용 시 에러 발생
   - ✅ Variant ID만 사용 가능
   - Variant ID는 숫자로만 구성됨

3. **환경 변수 적용 시간**
   - Vercel에 환경 변수를 추가한 후
   - **새로운 배포**가 필요할 수 있음
   - 또는 **Redeploy** 실행

## 🚀 빠른 수정 체크리스트

- [ ] `LEMONSQUEEZY_API_KEY` 또는 `LEMON_SQUEEZY_API_KEY` 추가
- [ ] `LEMON_SQUEEZY_SUBSCRIPTION_VARIANT_ID` 추가
- [ ] `NEXT_PUBLIC_APP_URL` 추가 (선택)
- [ ] Vercel에서 새 배포 실행
- [ ] 결제 버튼 다시 테스트
