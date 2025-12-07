# 법적 고지 및 신뢰 장치 구현 완료 문서

## 완료된 작업

### 1. Terms of Service 페이지 ✅

**파일**: `web/app/terms/page.tsx`

**주요 내용**:
- AI 분석 결과에 대한 면책 조항 (중요!)
- 서비스 설명 및 사용 조건
- 지적재산권 보호
- 책임 제한
- 결제 및 환불 정책 링크

**면책 조항 강조**:
- AI 분석 결과는 추정치일 뿐이며 보장되지 않음
- NexSupply는 AI 분석 기반의 비즈니스 결정에 대해 책임지지 않음
- 사용자는 전문가와 상담 후 최종 결정을 내려야 함

### 2. Privacy Policy 페이지 ✅

**파일**: `web/app/privacy/page.tsx`

**주요 내용**:
- 수집하는 정보 (제품 정보, 연락처, 사용 데이터, 결제 정보)
- 정보 사용 방법
- 데이터 공유 및 제3자 제공 동의
- 데이터 보안 (암호화, 접근 제어)
- 사용자 권리 (접근, 수정, 삭제, 옵트아웃)
- 데이터 보관 정책
- 쿠키 및 추적
- 국제 데이터 전송

**제3자 공유**:
- Supabase (호스팅 및 데이터 저장)
- Lemon Squeezy, Stripe (결제 처리)
- Google SMTP (이메일 발송)
- Vercel Analytics (분석)
- Google Gemini API (AI 모델 처리)

### 3. Refund Policy 페이지 ✅

**파일**: `web/app/refund/page.tsx`

**주요 내용**:
- **매니저 채팅 시작 후 환불 불가** (명시)
- 환불 자격 조건
- 환불 프로세스
- 서비스별 환불 정책
- 부분 환불 조건
- 구독 취소 정책

**중요 조항**:
- 매니저 채팅을 시작하면 환불 불가
- 최종 견적이 발송되면 환불 불가
- 7일 이내에만 환불 가능
- 서비스가 실질적으로 제공되면 환불 불가

### 4. Footer 업데이트 ✅

**파일**: `web/app/(sections)/footer.tsx`

**변경 사항**:
- Refund Policy 링크 추가
- Trust badges 추가:
  - "Secured by Stripe & Lemon Squeezy" (결제 보안)
  - "100% Data Privacy" (데이터 보안)

## 페이지 경로

- `/terms` - Terms of Service
- `/privacy` - Privacy Policy
- `/refund` - Refund Policy

## Footer 링크

Footer의 Legal 섹션에 모든 법적 페이지 링크가 포함되어 있습니다:
- Terms of Service
- Privacy Policy
- Refund Policy (새로 추가)

## Trust Badges

Footer 하단에 신뢰 장치가 표시됩니다:
- ✅ Secured by Stripe & Lemon Squeezy
- ✅ 100% Data Privacy

## 다음 단계

법적 페이지가 모두 완성되었습니다. Lemon Squeezy 승인 절차를 진행할 수 있습니다.

---

완료된 작업: 법적 고지 및 신뢰 장치 추가 ✅

