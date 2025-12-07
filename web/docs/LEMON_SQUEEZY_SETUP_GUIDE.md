# Lemon Squeezy 결제 연동 설정 가이드

## ✅ 구현 완료

Streamlit 앱에 Lemon Squeezy 결제 페이지가 성공적으로 통합되었습니다.

---

## 📁 파일 구조

```
web/
├── pages/
│   └── payment.py          # Lemon Squeezy 결제 페이지 (신규 생성)
├── utils/
│   └── config.py           # Config 클래스에 Lemon Squeezy URL 메서드 추가
└── streamlit_app.py        # 메인 앱 (변경 없음)
```

---

## 🔧 설정 방법

### 1. 환경 변수 설정

Lemon Squeezy 상점 URL을 환경 변수 또는 Streamlit secrets에 추가:

#### 로컬 개발 (`.env` 파일)

`.env` 파일에 추가:

```env
LEMON_SQUEEZY_STORE_URL=https://nexsupply.lemonsqueezy.com/buy/12345-nexsupply-pro
```

#### Streamlit Cloud (Secrets)

`.streamlit/secrets.toml` 또는 Streamlit Cloud Secrets에 추가:

```toml
LEMON_SQUEEZY_STORE_URL = "https://nexsupply.lemonsqueezy.com/buy/12345-nexsupply-pro"
```

---

## 🔗 Lemon Squeezy 상점 URL 찾는 방법

1. **Lemon Squeezy 대시보드 로그인**
   - https://app.lemonsqueezy.com 접속

2. **상품 선택**
   - Products 메뉴에서 NexSupply Pro 상품 선택

3. **Buy Link 생성**
   - "Get buy link" 또는 "Checkout URL" 복사
   - 예시: `https://nexsupply.lemonsqueezy.com/buy/12345-nexsupply-pro`

4. **환경 변수에 추가**
   - 위 URL을 `LEMON_SQUEEZY_STORE_URL`에 설정

---

## 🎯 사용 방법

### 1. 결제 페이지 접근

Streamlit 앱에서:
- 사이드바에 자동으로 **"Payment"** 페이지가 표시됩니다
- 또는 직접 URL로 접근: `/payment`

### 2. 결제 프로세스

```
1. 사용자가 결제 페이지 접근
   ↓
2. 로그인 상태 확인 (필수)
   ↓
3. Free Plan vs Pro Plan 비교 확인
   ↓
4. "Pro 플랜 구독하기" 버튼 클릭
   ↓
5. Lemon Squeezy 결제 페이지로 이동 (새 탭)
   - 이메일 자동 채워짐
   - user_id가 custom 필드로 전달됨
   ↓
6. 결제 완료
   ↓
7. 웹훅 수신 → 사용자 플랜 업데이트 (다음 단계)
```

---

## 📝 결제 링크 생성 로직

```python
# Lemon Squeezy URL에 쿼리 파라미터 추가
checkout_url = f"{LEMON_SQUEEZY_STORE_URL}?"
params = {
    "checkout[email]": user_email,          # 고객 이메일 자동 채우기
    "checkout[custom][user_id]": user_id    # 우리 DB의 사용자 ID (웹훅에서 사용)
}
final_url = checkout_url + urllib.parse.urlencode(params)
```

**중요 파라미터**:
- `checkout[email]`: 사용자 이메일 (결제 페이지에 자동 입력)
- `checkout[custom][user_id]`: Supabase user_id (웹훅에서 받아서 플랜 업데이트용)

---

## 🔄 데이터 흐름

```
┌─────────────────────────────────────────────────────────┐
│ 1. 사용자 결제 페이지 접근                              │
│    - user_id, email 확인                                │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Lemon Squeezy 결제 링크 생성                         │
│    - checkout[email]: 사용자 이메일                     │
│    - checkout[custom][user_id]: Supabase user_id        │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 3. 사용자가 Lemon Squeezy에서 결제                      │
│    - 신용카드 또는 PayPal                                │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Lemon Squeezy 웹훅 전송 (결제 완료 시)              │
│    - event: subscription_created                        │
│    - custom_data.user_id: Supabase user_id              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 5. 웹훅 핸들러가 user_id로 Supabase 업데이트            │
│    - profiles.role: 'free' → 'pro'                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 다음 단계: 웹훅 핸들러 구현

결제 완료 후 자동으로 사용자 플랜을 업데이트하려면 웹훅 핸들러가 필요합니다.

### 웹훅 엔드포인트 구조

**Next.js API Route 예시**: `/api/webhooks/lemon-squeezy`

```typescript
export async function POST(req: Request) {
  // 1. 웹훅 서명 검증
  // 2. 이벤트 타입 확인
  // 3. custom_data.user_id 추출
  // 4. Supabase에서 profiles 테이블 업데이트
  //    - role: 'free' → 'pro'
}
```

### 웹훅 설정 (Lemon Squeezy)

1. Lemon Squeezy 대시보드 → Settings → Webhooks
2. Webhook URL 설정: `https://your-domain.com/api/webhooks/lemon-squeezy`
3. 이벤트 선택:
   - `subscription_created` (구독 시작)
   - `subscription_cancelled` (구독 취소)
   - `subscription_resumed` (구독 재개)

---

## 🔐 보안 고려사항

1. **웹훅 서명 검증**: Lemon Squeezy 웹훅 서명을 반드시 검증해야 합니다
2. **환경 변수 사용**: Lemon Squeezy URL은 환경 변수로 관리
3. **로그인 확인**: 결제는 로그인된 사용자만 가능

---

## ✅ 검증 체크리스트

- [x] 결제 페이지 파일 생성 (`pages/payment.py`)
- [x] Config 클래스에 Lemon Squeezy URL 메서드 추가
- [x] 사용자 정보 확인 로직
- [x] 결제 링크 생성 로직 (user_id, email 포함)
- [x] 플랜 비교 UI
- [x] 현재 플랜 표시
- [ ] 웹훅 핸들러 구현 (다음 단계)
- [ ] 플랜 제한 로직 구현 (다음 단계)

---

## 💡 테스트 방법

### 1. 로컬 테스트

```bash
# 환경 변수 설정
export LEMON_SQUEEZY_STORE_URL="https://nexsupply.lemonsqueezy.com/buy/..."

# Streamlit 앱 실행
streamlit run streamlit_app.py
```

### 2. 결제 페이지 확인

1. Streamlit 앱 접속
2. 사이드바에서 "Payment" 페이지 클릭
3. 로그인 (필수)
4. 결제 버튼 확인
5. 버튼 클릭 시 Lemon Squeezy 페이지로 이동하는지 확인

---

**구현 완료일**: 2024년 12월  
**작성자**: Cursor AI Assistant

