# Quote Comparison 기능 구현 완료

## 개요

Visual Quote Comparison 기능이 성공적으로 구현되었습니다. 이 기능을 통해 매니저는 여러 공장의 견적을 한 번에 생성하고, 클라이언트는 이를 비교하여 최적의 공장을 선택할 수 있습니다.

## 구현된 파일 목록

### 1. 데이터베이스 스키마
- **파일**: `supabase/factory_quotes_schema.sql`
- **내용**: 
  - `factory_quotes` 테이블 (공장 견적)
  - RLS 정책 설정
  - 인덱스 생성

### 2. TypeScript 타입 정의
- **파일**: `lib/types/quote.ts`
- **내용**: 
  - `FactoryQuote` 인터페이스
  - Input 타입들 (Create, Select)

### 3. Server Actions
- **파일**: `actions/quote-actions.ts`
- **함수들**:
  - `createQuotes`: 여러 견적을 한 번에 생성 (매니저 전용)
  - `getQuotes`: 프로젝트별 견적 조회
  - `selectQuote`: 견적 선택 (클라이언트 전용, 선택된 견적은 'selected', 나머지는 'rejected')

### 4. UI 컴포넌트
- **파일들**:
  - `components/quotes/ComparisonCard.tsx`: 모바일용 카드 컴포넌트
  - `components/quotes/ComparisonTable.tsx`: 데스크탑용 테이블 컴포넌트

### 5. 메인 페이지
- **파일**: `app/(dashboard)/projects/[id]/quotes/page.tsx`
- **기능**:
  - 반응형 디자인 (모바일: 카드, 데스크탑: 테이블)
  - 견적 비교 및 선택
  - 확인 다이얼로그

## 사용 방법

### 1. 데이터베이스 설정

Supabase 대시보드에서 다음 SQL을 실행하세요:

```sql
-- supabase/factory_quotes_schema.sql 파일의 내용을 실행
```

### 2. 페이지 접근

견적 비교 페이지는 다음 경로로 접근할 수 있습니다:

```
/projects/[projectId]/quotes
```

예: `/projects/123e4567-e89b-12d3-a456-426614174000/quotes`

## 주요 기능

### 매니저 기능

1. **견적 생성**: `createQuotes` 액션으로 여러 견적을 한 번에 생성
   ```typescript
   await createQuotes({
     project_id: '...',
     quotes: [
       {
         factory_name: 'Factory A',
         unit_price: 10.50,
         moq: 1000,
         lead_time_days: 30,
         is_recommended: true,
         pros: ['품질 우수', '빠른 납기'],
         cons: ['가격 높음'],
         risk_level: 'Low',
       },
       // ...
     ],
   });
   ```

### 클라이언트 기능

1. **견적 조회**: 발행된 견적 목록 확인
2. **견적 비교**: 카드/테이블 형태로 비교
3. **견적 선택**: `selectQuote` 액션으로 특정 견적 선택
   - 선택된 견적: `status = 'selected'`
   - 나머지 견적: `status = 'rejected'`

## UI 특징

### 반응형 디자인

- **모바일 (< 768px)**: 카드 형태의 스택 레이아웃
- **데스크탑 (≥ 768px)**: 비교 테이블 형태

### Comparison Card

- `is_recommended`가 true인 경우:
  - 파란색 테두리 강조
  - "🏆 NexSupply Choice" 배지 표시
- `risk_level`에 따른 색상 코딩:
  - Low: 초록색
  - Medium: 노란색
  - High: 빨간색
- 선택된 견적은 초록색 테두리로 표시

### Selection Logic

- "이 공장 선택하기" 버튼 클릭
- 확인 다이얼로그 표시: "정말 이 공장으로 진행하시겠습니까?"
- 확인 시 선택 처리 및 다른 견적 자동 거절

## 데이터 구조

### FactoryQuote 필드

- `factory_name`: 공장명
- `is_recommended`: AI 추천 여부
- `unit_price`: 단가 (USD)
- `moq`: 최소 주문 수량
- `lead_time_days`: 생산 소요 일수
- `sample_cost`: 샘플 비용 (선택사항)
- `pros`: 장점 키워드 배열
- `cons`: 단점 키워드 배열
- `risk_level`: 리스크 레벨 ('Low', 'Medium', 'High')
- `status`: 상태 ('pending', 'selected', 'rejected')

## 권한 관리

### RLS 정책

- **사용자**: 자신의 프로젝트에 속한 견적만 조회 가능, 선택 가능
- **매니저**: 할당된 프로젝트의 견적 생성/수정 가능, 선택 불가 (읽기 전용)

### 권한 확인 로직

- `@nexsupply.net` 도메인 사용자는 자동으로 매니저로 인식 (super admin 제외)
- `profiles.is_manager` 필드로도 확인 가능

## 다음 단계 (선택사항)

1. **견적 생성 페이지**: 매니저용 견적 생성 폼
2. **견적 수정 기능**: 매니저가 견적 수정 가능
3. **견적 삭제 기능**: 매니저가 견적 삭제 가능
4. **견적 내보내기**: PDF/Excel 형태로 내보내기
5. **견적 히스토리**: 선택 전 이전 상태 확인
6. **이메일 알림**: 견적 선택 시 매니저에게 알림 발송

## 참고사항

- 모든 가격은 USD로 표시됩니다
- MOQ는 최소 주문 수량을 의미합니다
- 리스크 레벨은 AI 분석 결과를 기반으로 설정됩니다
- 추천 견적은 NexSupply AI가 분석하여 추천한 공장입니다
- 선택된 견적은 되돌릴 수 없으므로 신중하게 선택해야 합니다
