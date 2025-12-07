# Lemon Squeezy 결제 시스템 Next.js 통합 완료 보고서

## ✅ 구현 완료 사항

Next.js 앱에 Lemon Squeezy 결제 시스템을 성공적으로 통합했습니다. Validator $199 플랜 결제 및 웹훅 기반 자동 역할 업데이트가 구현되었습니다.

---

## 📁 생성된 파일

### 1. 결제 API 엔드포인트

- **`web/app/api/payment/create-checkout-url/route.ts`**
  - Checkout URL 생성 API
  - 사용자 인증 확인
  - Lemon Squeezy 결제 페이지 URL 생성 (user_id, email 포함)

- **`web/app/api/payment/webhook/route.ts`**
  - Lemon Squeezy 웹훅 핸들러
  - HMAC 서명 검증 (최우선 보안 체크)
  - `order_created` 및 `subscription_created` 이벤트 처리
  - Supabase `profiles.role` 자동 업데이트 ('pro')

### 2. 프론트엔드 통합

- **`web/app/results/page.tsx` (PricingCTA 컴포넌트)**
  - Validator 버튼에 Lemon Squeezy 결제 연동
  - 사용자 인증 상태 확인
  - Checkout URL API 호출 후 리다이렉트

---

## 🔧 구현된 기능

### 1. Checkout URL 생성

**API 엔드포인트**: `GET /api/payment/create-checkout-url`

**로직**:
1. 사용자 인증 확인 (Supabase Auth)
2. Lemon Squeezy Store URL 환경 변수 확인
3. Checkout URL 생성:
   - `checkout[email]`: 사용자 이메일 자동 채우기
   - `checkout[custom][user_id]`: Supabase user_id (웹훅에서 사용)

**사용 예시**:
```typescript
const response = await fetch('/api/payment/create-checkout-url');
const data = await response.json();
if (data.ok) {
  window.location.href = data.checkout_url;
}
```

### 2. 웹훅 핸들러 (보안 최우선)

**API 엔드포인트**: `POST /api/payment/webhook`

**보안 검증 절차 (최우선)**:
1. Raw request body 읽기 (JSON 파싱 전)
2. `X-Signature` 헤더 확인
3. `LEMON_SQUEEZY_WEBHOOK_SECRET` 환경 변수 확인
4. HMAC-SHA256 서명 검증
5. **검증 실패 시 즉시 401 Unauthorized 반환**

**이벤트 처리**:
- `order_created` (status: 'paid')
- `subscription_created` (status: 'active')

**DB 업데이트**:
- `custom_data.user_id` 추출
- Supabase `profiles` 테이블 업데이트:
  - `role`: 'free' → 'pro'
  - `updated_at`: 현재 시간

**프로필이 없는 경우**:
- 자동으로 새 프로필 생성 ('pro' 역할로)

### 3. 프론트엔드 결제 버튼

**위치**: `/results` 페이지의 `PricingCTA` 컴포넌트

**동작**:
1. Validator 버튼 클릭 시
2. 로그인 상태 확인
3. 미로그인 시: `/login`으로 리다이렉트
4. 로그인 시: Checkout URL 생성 API 호출
5. Lemon Squeezy 결제 페이지로 리다이렉트

---

## 🔐 보안 고려사항

### 1. 웹훅 서명 검증 (필수)

**구현 방식**:
```typescript
// HMAC-SHA256으로 서명 생성
const hmac = crypto.createHmac('sha256', webhookSecret);
hmac.update(rawBody);
const expectedSignature = hmac.digest('hex');

// 타이밍 공격 방지 비교
const isValid = crypto.timingSafeEqual(
  Buffer.from(expectedSignature, 'hex'),
  Buffer.from(signatureValue, 'hex')
);
```

**서명 형식**:
- Lemon Squeezy는 `sha256=<hex_signature>` 형식 또는 단순 hex 문자열 사용
- 두 형식 모두 지원하도록 파싱 로직 구현

### 2. 환경 변수

**필수 환경 변수**:
```env
LEMON_SQUEEZY_STORE_URL=https://nexsupply.lemonsqueezy.com/buy/12345
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret_from_lemon_squeezy
```

**보안 체크리스트**:
- [x] HMAC 서명 검증 (최우선)
- [x] X-Signature 헤더 확인
- [x] 검증 실패 시 즉시 401 반환
- [x] 환경 변수 기반 Secret 관리
- [x] 로그인 확인 (Checkout URL 생성 시)

---

## 📋 Lemon Squeezy 설정

### 1. 웹훅 구성

1. Lemon Squeezy 대시보드 → Settings → Webhooks
2. 새 웹훅 생성
3. **Callback URL**: `https://your-domain.com/api/payment/webhook`
4. **Signing Secret**: 환경 변수에 설정한 `LEMON_SQUEEZY_WEBHOOK_SECRET` 값
5. **이벤트 선택**:
   - `order_created`
   - `subscription_created`

### 2. 상품 설정

1. Store → Products → Validator 플랜
2. Product URL 복사
3. 환경 변수 `LEMON_SQUEEZY_STORE_URL`에 설정

---

## 🧪 테스트 방법

### 1. 로컬 테스트

```bash
# 환경 변수 설정
export LEMON_SQUEEZY_STORE_URL="https://nexsupply.lemonsqueezy.com/buy/..."
export LEMON_SQUEEZY_WEBHOOK_SECRET="your_secret"

# Next.js 앱 실행
npm run dev
```

### 2. 결제 플로우 테스트

1. `/results` 페이지 접속
2. Validator 버튼 클릭
3. 로그인 확인 (미로그인 시 로그인 페이지로 이동)
4. Lemon Squeezy 결제 페이지로 리다이렉트 확인
5. 테스트 카드로 결제 진행
6. 웹훅 수신 확인 (서버 로그)
7. 사용자 역할 업데이트 확인 (Supabase `profiles` 테이블)

### 3. 웹훅 테스트

**Lemon Squeezy 테스트 웹훅 도구 사용**:
1. Lemon Squeezy 대시보드 → Webhooks → Test Webhook
2. 테스트 이벤트 전송
3. 서버 로그에서 검증 및 처리 확인

---

## ✅ 검증 체크리스트

- [x] Checkout URL 생성 API 구현
- [x] 웹훅 핸들러 구현
- [x] HMAC 서명 검증 (최우선 보안)
- [x] X-Signature 헤더 확인
- [x] 검증 실패 시 401 반환
- [x] `order_created` 이벤트 처리
- [x] `subscription_created` 이벤트 처리
- [x] `custom_data.user_id` 추출
- [x] Supabase `profiles.role` 업데이트
- [x] 프론트엔드 결제 버튼 연동
- [x] 사용자 인증 확인
- [x] 로그인 리다이렉트

---

## 🚀 다음 단계

### 1. 구독 취소 처리 (선택)

`subscription_cancelled` 이벤트 처리하여 사용자 역할을 'free'로 되돌리는 로직 추가:

```typescript
if (eventType === 'subscription_cancelled') {
  // role을 'free'로 업데이트
  await adminClient
    .from('profiles')
    .update({ role: 'free' })
    .eq('id', userId);
}
```

### 2. 결제 실패 처리

`order_refunded` 이벤트 처리하여 역할 되돌리기

### 3. 관리자 대시보드

결제 내역 및 사용자 플랜 상태 조회 기능 추가

---

## 📚 참고 자료

- [Lemon Squeezy Webhook 문서](https://docs.lemonsqueezy.com/help/webhooks)
- [Lemon Squeezy API 문서](https://docs.lemonsqueezy.com/api)
- [Supabase Admin Client 문서](https://supabase.com/docs/reference/javascript/admin-api)

---

**구현 완료일**: 2024년 12월

