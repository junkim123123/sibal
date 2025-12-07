# NexSupply 핵심 가치 프롬프트 통합 완료

## ✅ 구현 완료 항목

### 1. `buildSourcingPrompt` 함수 수정 ✅

**변경 내용**: 일반적인 컨설턴트 프롬프트를 **NexSupply의 핵심 가치와 OSINT 데이터 사용을 강제하는 프롬프트**로 완전히 대체

**주요 특징**:

#### 🎯 NexSupply AI Risk Analyst 역할 정의
```
You are NexSupply's **AI Risk Analyst**, a 20-year veteran Global Sourcing Consultant. 
Your mission is to eliminate sourcing risks for clients ("Alibaba graduates") and provide actionable insights.
```

#### 📊 NexSupply 독점 가중치 시스템
```
**RISK WEIGHTING:** All risk scoring (0-100) MUST follow the NexSupply proprietary weighting:
- Quality Risk (30%)
- Delivery Risk (30%)
- Supplier Stability Risk (25%)
- Value-Added Difficulty Risk (15%)
```

#### 🔍 OSINT/Golden Set 강제 사용
```
**OSINT/GOLDEN SET ENFORCEMENT:** You MUST analyze the risk using external OSINT data and the Golden Set examples.
- If the supplier risk is **Low (Score < 40)** and NOT on the Blacklist, you MUST cite two facts from the OSINT context 
  (e.g., 'Alibaba rating 4.9', 'No negative mentions on Reddit') to justify the low score.
- You MUST include an "osint_risk_score" (0-100) based on this analysis in the final JSON.
```

**파일 위치**: `web/app/api/analyze/route.ts` - `buildSourcingPrompt()` 함수

---

### 2. `analyzeSourcingProject` 함수 수정 ✅

**변경 내용**: Logistics Insight 강제 주입 및 OSINT Risk Score 정규화 로직 추가

#### 📦 Logistics Insight 강제 주입 (100% 입력 활용 보장)

**로직 흐름**:
1. `product_specs`에서 `size_tier` 추출
2. AI가 `logistics_insight`를 제공하지 않은 경우 `calculateContainerLoading()` 함수로 자동 계산
3. 계산된 값으로 JSON 응답 보완

**코드 위치**: `web/app/api/analyze/route.ts` - `analyzeSourcingProject()` 함수 (라인 412-440)

```typescript
// AI가 제공하지 않은 경우, 계산된 값으로 덮어씁니다.
if (!parsed.logistics_insight || !parsed.logistics_insight.container_loading) {
  parsed.logistics_insight = {
    efficiency_score: containerInfo.efficiency_score,
    container_loading: containerInfo.container_loading,
    advice: containerInfo.advice,
  };
  console.log('[Analyze API] Injected Logistics Insight from calculator:', sizeTier);
}
```

#### 🎯 OSINT Risk Score 정규화 및 안전 장치

**로직**:
- AI가 `osint_risk_score`를 제공하지 않거나 유효하지 않은 경우 (0-100 범위 외)
- `supplier.risk.level`을 기반으로 기본값 설정:
  - High → 75
  - Medium → 50
  - Low → 25

**코드 위치**: `web/app/api/analyze/route.ts` - `analyzeSourcingProject()` 함수 (라인 442-456)

```typescript
if (typeof parsed.osint_risk_score !== 'number' || parsed.osint_risk_score < 0 || parsed.osint_risk_score > 100) {
  const baseRiskScore = parsed.risks?.supplier?.level === 'High' ? 75 : 
                       parsed.risks?.supplier?.level === 'Medium' ? 50 : 25;
  
  parsed.osint_risk_score = baseRiskScore;
  console.log('[Analyze API] OSINT Risk Score normalized from supplier risk level:', baseRiskScore);
}
```

---

## 🔄 프롬프트 구조 비교

### 이전 (일반적인 컨설턴트)
```
You are a 20-year veteran Global Sourcing Consultant with deep expertise in:
- Manufacturing cost estimation across Asia
- International logistics
- US/EU/UK import regulations
...
```

### 현재 (NexSupply 핵심 가치)
```
You are NexSupply's **AI Risk Analyst**, a 20-year veteran Global Sourcing Consultant. 
Your mission is to eliminate sourcing risks for clients ("Alibaba graduates")...

**CORE GUIDELINES (NexSupply Exclusive Moat):**
1. **RISK WEIGHTING:** All risk scoring MUST follow the NexSupply proprietary weighting:
   - Quality Risk (30%)
   - Delivery Risk (30%)
   - Supplier Stability Risk (25%)
   - Value-Added Difficulty Risk (15%)

2. **OSINT/GOLDEN SET ENFORCEMENT:** You MUST analyze the risk using external OSINT data...
```

---

## 📊 데이터 흐름

```
1. 사용자 입력 (userContext)
   ↓
2. buildSourcingPrompt() - NexSupply 핵심 가치 프롬프트 생성
   ↓
3. Gemini API 호출 (GEMINI_CUSTOM_MODEL_ID 또는 gemini-2.5-pro)
   ↓
4. JSON 응답 파싱 및 검증
   ↓
5. Logistics Insight 강제 주입 (AI가 제공하지 않은 경우)
   ↓
6. OSINT Risk Score 정규화 (유효하지 않은 경우)
   ↓
7. 최종 AnalysisResult 반환
```

---

## 🎯 핵심 개선 사항

### 1. NexSupply 브랜드 정체성 강화
- "Alibaba graduates"를 위한 리스크 제거 전문가로 포지셔닝
- 독점적인 리스크 가중치 시스템 강제

### 2. OSINT 데이터 활용 강제
- 블랙리스트 체크 후 OSINT 데이터 인용 필수
- Low Risk 판단 시 2가지 사실 인용 요구

### 3. 100% 입력 활용 보장
- Logistics Insight: 백엔드 계산 로직으로 보완
- OSINT Risk Score: 안전 장치로 정규화

---

## 📁 수정된 파일

- ✅ `web/app/api/analyze/route.ts`
  - `buildSourcingPrompt()` 함수: NexSupply 핵심 가치 프롬프트로 교체
  - `analyzeSourcingProject()` 함수: Logistics Insight 및 OSINT Risk Score 강제 주입 로직 추가

---

## ✅ 검증 체크리스트

- [x] NexSupply AI Risk Analyst 역할 정의 적용
- [x] 독점 리스크 가중치 시스템 (30/30/25/15) 강제
- [x] OSINT/Golden Set 데이터 사용 강제
- [x] Logistics Insight 백엔드 강제 주입 로직
- [x] OSINT Risk Score 정규화 및 안전 장치
- [x] 모든 입력 데이터 활용 보장 (100% Input Utilization)
- [x] 린터 오류 없음

---

**구현 완료일**: 2024년 12월  
**작성자**: Cursor AI Assistant

