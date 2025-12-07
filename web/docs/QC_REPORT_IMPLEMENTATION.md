# QC Report 기능 구현 완료

## 개요

Interactive QC Report 기능이 성공적으로 구현되었습니다. 이 기능을 통해 매니저는 구조화된 검수 보고서를 생성하고, 클라이언트는 이를 검토하여 승인/거절할 수 있습니다.

## 구현된 파일 목록

### 1. 데이터베이스 스키마
- **파일**: `supabase/qc_reports_schema.sql`
- **내용**: 
  - `qc_reports` 테이블 (검수 보고서)
  - `qc_report_items` 테이블 (검수 항목 및 사진)
  - RLS 정책 설정
  - 자동 계산 트리거 (defect_rate)

### 2. TypeScript 타입 정의
- **파일**: `lib/types/qc.ts`
- **내용**: 
  - `QCReport`, `QCReportItem`, `QCReportWithItems` 인터페이스
  - Input 타입들 (Create, Update, Review)

### 3. Server Actions
- **파일**: `actions/qc-actions.ts`
- **함수들**:
  - `createQCReport`: 리포트 초안 생성
  - `getQCReport`: 리포트 조회 (항목 포함)
  - `updateQCReport`: 리포트 수정
  - `publishQCReport`: 리포트 발행 (published 상태로 변경)
  - `reviewQCReport`: 클라이언트 승인/거절
  - `createQCReportItem`: 검수 항목 추가
  - `updateQCReportItem`: 검수 항목 수정
  - `deleteQCReportItem`: 검수 항목 삭제

### 4. UI 컴포넌트
- **파일들**:
  - `components/ui/badge.tsx`: 상태 배지 컴포넌트
  - `components/ui/alert.tsx`: 알림 컴포넌트
  - `components/ui/skeleton.tsx`: 로딩 스켈레톤 컴포넌트

### 5. QC 전용 컴포넌트
- **파일들**:
  - `components/qc/QCStatsCard.tsx`: 통계 카드 (총 수량, 합격, 불량, 불량률)
  - `components/qc/QCItemCard.tsx`: 검수 항목 카드 (이미지 갤러리 포함)

### 6. 메인 페이지
- **파일**: `app/(dashboard)/projects/[id]/qc/[reportId]/page.tsx`
- **기능**:
  - 권한별 뷰 분기 (매니저/클라이언트)
  - 리포트 상세 정보 표시
  - 매니저: 수정 및 발행 기능
  - 클라이언트: 승인/거절 기능

## 사용 방법

### 1. 데이터베이스 설정

Supabase 대시보드에서 다음 SQL을 실행하세요:

```sql
-- supabase/qc_reports_schema.sql 파일의 내용을 실행
```

### 2. Storage 버킷 생성 (선택사항)

이미지 업로드를 위해 Supabase Storage에 버킷을 생성할 수 있습니다:

1. Supabase 대시보드 → Storage
2. 새 버킷 생성: `qc-images`
3. 정책 설정 (매니저만 업로드 가능)

### 3. 페이지 접근

리포트 페이지는 다음 경로로 접근할 수 있습니다:

```
/projects/[projectId]/qc/[reportId]
```

예: `/projects/123e4567-e89b-12d3-a456-426614174000/qc/789e0123-e89b-12d3-a456-426614174001`

## 주요 기능

### 매니저 기능

1. **리포트 생성**: `createQCReport` 액션 사용
2. **항목 추가/수정/삭제**: 각각의 액션 사용
3. **리포트 발행**: `publishQCReport` 액션으로 클라이언트에게 공개
4. **수정 모드**: 리포트가 `draft` 상태일 때만 수정 가능

### 클라이언트 기능

1. **리포트 조회**: 발행된 리포트만 조회 가능
2. **승인**: `reviewQCReport` 액션으로 `approved` 상태로 변경
3. **거절**: 피드백과 함께 `rejected` 상태로 변경

## 상태 흐름

```
draft → published → approved
                    ↓
                  rejected
```

- **draft**: 매니저가 작성 중인 초안
- **published**: 클라이언트에게 공개된 상태
- **approved**: 클라이언트가 승인한 상태
- **rejected**: 클라이언트가 거절한 상태 (수정 필요)

## 권한 관리

### RLS 정책

- **사용자**: 자신의 프로젝트에 속한 리포트만 조회 가능
- **매니저**: 할당된 프로젝트의 리포트 생성/수정/발행 가능
- **클라이언트**: 자신의 프로젝트 리포트 승인/거절 가능

### 권한 확인 로직

- `@nexsupply.net` 도메인 사용자는 자동으로 매니저로 인식 (super admin 제외)
- `profiles.is_manager` 필드로도 확인 가능

## 다음 단계 (선택사항)

1. **이미지 업로드 기능**: Supabase Storage 연동
2. **리포트 목록 페이지**: 프로젝트별 리포트 목록 표시
3. **리포트 생성 페이지**: 매니저용 리포트 생성 폼
4. **리포트 수정 페이지**: 매니저용 리포트 수정 폼
5. **이메일 알림**: 리포트 발행/승인/거절 시 알림 발송

## 참고사항

- 모든 이미지는 `next/image`를 사용하여 최적화됩니다
- 로딩 상태에는 `skeleton` UI가 적용됩니다
- 리포트 상태에 따라 상단에 알림 배너가 표시됩니다
- 모바일 반응형 디자인이 적용되어 있습니다
