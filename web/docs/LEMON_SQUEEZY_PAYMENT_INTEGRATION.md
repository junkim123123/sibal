# Lemon Squeezy 결제 연동 가이드

## ✅ 구현 완료

Streamlit 앱에 Lemon Squeezy 결제 페이지를 성공적으로 통합했습니다.

---

## 📁 생성/수정된 파일

### 1. `web/pages/payment.py` (신규 생성)

Lemon Squeezy 결제 페이지를 표시하는 Streamlit 페이지입니다.

**주요 기능**:
- Free Plan vs Pro Plan 비교 표시
- 사용자 현재 플랜 표시
- Lemon Squeezy 결제 링크 생성 (user_id 및 email 포함)
- 결제 안내 및 FAQ

**접근 방법**:
- Streamlit 앱에서 `/payment` 경로로 접근
- 또는 사이드바에서 "Payment" 페이지 클릭

---

### 2. `web/utils/config.py` (수정)

Lemon Squeezy URL을 가져오는 메서드 추가:

```python
@staticmethod
def get_lemon_squeezy_store_url() -> Optional[str]:
    """
    Get Lemon Squeezy store URL from environment or Streamlit secrets.
    """
    # 환경 변수 또는 Streamlit secrets에서 가져옴
```

---

## 🔧 설정 방법

### 1. 환경 변수 설정

`.env` 파일 또는 Streamlit Cloud Secrets에 다음을 추가:

```toml
# .env 파일 또는 .streamlit/secrets.toml
LEMON_SQUEEZY_STORE_URL = "https://nexsupply.lemonsqueezy.com/buy/12345-nexsupply-pro"
```

**Lemon Squeezy 상점 URL 찾는 방법**:
1. Lemon Squeezy 대시보드에 로그인
2. Products → 원하는 상품 선택
3. "Get buy link" 클릭
4. 생성된 URL 복사 (예: `https://nexsupply.lemonsqueezy.com/buy/12345-nexsupply-pro`)

---

## 🎯 사용 방법

### 1. 결제 페이지 접근

Streamlit 앱에서:
- 사이드바에 자동으로 "Payment" 페이지가 표시됩니다
- 또는 직접 `/payment` 경로로 접근

### 2. 결제 프로세스

1. **로그인 필수**: 결제하려면 먼저 로그인해야 합니다
2. **플랜 선택**: Free Plan과 Pro Plan 비교 확인
3. **결제 버튼 클릭**: "Pro 플랜 구독하기 ($49/월)" 버튼 클릭
4. **Lemon Squeezy로 이동**: 새 탭에서 Lemon Squeezy 결제 페이지가 열림
5. **결제 완료**: 결제 완료 후 웹훅을 통해 자동으로 Pro 플랜 활성화

---

## 🔄 데이터 흐름

```
1. 사용자가 결제 페이지 접근
   ↓
2. 사용자 정보 확인 (user_id, email)
   ↓
3. Lemon Squeezy URL 생성
   - checkout[email]: 사용자 이메일
   - checkout[custom][user_id]: Supabase user_id
   ↓
4. 결제 버튼 클릭 → Lemon Squeezy로 리다이렉트
   ↓
5. 사용자가 Lemon Squeezy에서 결제
   ↓
6. Lemon Squeezy 웹훅 전송 (결제 완료 시)
   ↓
7. 웹훅 핸들러가 user_id를 받아서 Supabase profiles 테이블 업데이트
   - role: 'free' → 'pro'
```

---

## 📝 결제 링크 생성 로직

```python
checkout_url = f"{LEMON_SQUEEZY_STORE_URL}?"
params = {
    "checkout[email]": user_email,          # 고객 이메일 자동 채우기
    "checkout[custom][user_id]": user_id    # 우리 DB의 사용자 ID
}
final_url = checkout_url + urllib.parse.urlencode(params)
```

**중요 사항**:
- `checkout[custom][user_id]`는 Lemon Squeezy 웹훅에서 받을 수 있습니다
- 이 user_id를 사용하여 Supabase에서 해당 사용자의 `profiles.role`을 'pro'로 업데이트합니다

---

## 🔐 보안 고려사항

1. **환경 변수 사용**: Lemon Squeezy URL은 민감 정보가 아니지만, 환경 변수로 관리하는 것이 좋습니다
2. **웹훅 서명 검증**: 나중에 웹훅 핸들러를 만들 때 서명을 검증해야 합니다
3. **사용자 인증**: 결제는 로그인된 사용자만 가능합니다

---

## 📋 다음 단계

### 1. 웹훅 핸들러 구현 (필수)

Lemon Squeezy 웹훅을 받아서 사용자 플랜을 업데이트하는 API 엔드포인트가 필요합니다.

**예시**:
- Next.js: `/api/webhooks/lemon-squeezy` 엔드포인트
- Streamlit: 별도 웹훅 서버 필요 (Flask/FastAPI)

**웹훅 처리 로직**:
```python
# 1. 웹훅 서명 검증
# 2. 이벤트 타입 확인 (subscription_created, subscription_cancelled 등)
# 3. checkout[custom][user_id] 추출
# 4. Supabase에서 해당 사용자의 role 업데이트
```

### 2. 플랜 제한 로직 구현

Free Plan 사용자의 분석 횟수를 제한하는 로직을 추가해야 합니다.

---

## ✅ 검증 체크리스트

- [x] 결제 페이지 파일 생성 (`pages/payment.py`)
- [x] Config 클래스에 Lemon Squeezy URL 메서드 추가
- [x] 사용자 정보 확인 로직
- [x] 결제 링크 생성 로직 (user_id, email 포함)
- [ ] 웹훅 핸들러 구현 (다음 단계)
- [ ] 플랜 제한 로직 구현 (다음 단계)

---

**구현 완료일**: 2024년 12월  
**작성자**: Cursor AI Assistant

