# Sample Feedback with Image Annotation 기능 구현 완료

## 개요

Sample Feedback with Image Annotation 기능이 성공적으로 구현되었습니다. 이 기능을 통해 클라이언트는 샘플 사진 위에 직접 Pin을 꽂고 피드백을 남길 수 있으며, 매니저는 이를 확인하고 해결 상태를 관리할 수 있습니다.

## 구현된 파일 목록

### 1. 데이터베이스 스키마
- **파일**: `supabase/sample_feedbacks_schema.sql`
- **내용**: 
  - `sample_feedbacks` 테이블 (샘플 회차 관리)
  - `sample_annotations` 테이블 (이미지 위 마킹 데이터)
  - RLS 정책 설정
  - 인덱스 생성

### 2. TypeScript 타입 정의
- **파일**: `lib/types/sample.ts`
- **내용**: 
  - `SampleFeedback`, `SampleAnnotation` 인터페이스
  - Input 타입들 (Create, Update)

### 3. Server Actions
- **파일**: `actions/sample-actions.ts`
- **함수들**:
  - `createSampleFeedback`: 샘플 피드백 생성 (매니저 전용)
  - `getSampleFeedback`: 샘플 피드백 조회 (주석 포함)
  - `updateSampleFeedback`: 샘플 피드백 수정
  - `createSampleAnnotation`: 주석 생성 (클라이언트 전용)
  - `updateSampleAnnotation`: 주석 수정
  - `deleteSampleAnnotation`: 주석 삭제 (클라이언트 전용)

### 4. UI 컴포넌트
- **파일들**:
  - `components/ui/popover.tsx`: Popover 컴포넌트 (Radix UI)
  - `components/sample/AnnotationCanvas.tsx`: 이미지 마킹 캔버스
  - `components/sample/FeedbackList.tsx`: 피드백 리스트 사이드패널

### 5. 메인 페이지
- **파일**: `app/(dashboard)/projects/[id]/samples/[feedbackId]/page.tsx`
- **기능**:
  - 이미지 위 Pin 추가/삭제
  - 피드백 리스트 표시
  - 반응형 디자인

## 사용 방법

### 1. 데이터베이스 설정

Supabase 대시보드에서 다음 SQL을 실행하세요:

```sql
-- supabase/sample_feedbacks_schema.sql 파일의 내용을 실행
```

### 2. 의존성 설치

Popover 컴포넌트를 사용하기 위해 다음 패키지가 필요합니다:

```bash
npm install @radix-ui/react-popover
```

### 3. 페이지 접근

샘플 피드백 페이지는 다음 경로로 접근할 수 있습니다:

```
/projects/[projectId]/samples/[feedbackId]
```

예: `/projects/123e4567-e89b-12d3-a456-426614174000/samples/789e0123-e89b-12d3-a456-426614174001`

## 주요 기능

### Annotation Canvas

1. **이미지 클릭으로 Pin 추가**
   - 이미지를 클릭하면 해당 위치에 Pin이 생성됩니다
   - 클릭한 위치의 상대 좌표(%)가 자동으로 계산됩니다
   - Popover가 열려 코멘트를 입력할 수 있습니다

2. **Pin 표시**
   - 저장된 주석은 이미지 위에 Pin으로 표시됩니다
   - 해결된 주석은 초록색 체크 아이콘으로 표시됩니다
   - 미해결 주석은 빨간색 Pin 아이콘으로 표시됩니다

3. **Pin 상호작용**
   - Pin에 호버하면 코멘트 내용이 표시됩니다
   - Pin을 클릭하면 Popover가 열려 전체 코멘트를 볼 수 있습니다
   - 클라이언트는 자신이 작성한 주석을 삭제할 수 있습니다

### Feedback List Sidepanel

- **데스크탑**: 화면 우측에 고정 표시
- **모바일**: 화면 하단에 표시
- 피드백 목록을 번호 순서대로 표시
- 리스트 항목 클릭 시 해당 Pin으로 스크롤 이동
- 해결 상태 표시 (해결됨/대기 중)

### 반응형 좌표 시스템

- **퍼센트(%) 단위 저장**: 화면 크기가 바뀌어도 Pin 위치가 정확하게 유지됩니다
- `position_x`, `position_y`는 0-100 사이의 값으로 저장됩니다

### 애니메이션

- **Framer Motion**을 사용하여 부드러운 애니메이션 제공
- Pin 추가/삭제 시 스프링 애니메이션
- 호버 시 스케일 효과

## 데이터 구조

### SampleFeedback 필드

- `round_number`: 샘플 회차 (1차, 2차, ...)
- `overall_status`: 전체 상태 ('pending', 'approved', 'changes_requested')

### SampleAnnotation 필드

- `image_url`: 이미지 URL (Supabase Storage)
- `position_x`: 가로 좌표 (0-100 %)
- `position_y`: 세로 좌표 (0-100 %)
- `comment`: 수정 요청 사항
- `is_resolved`: 해결 여부 (매니저가 설정)

## 권한 관리

### RLS 정책

- **사용자**: 자신의 프로젝트에 속한 피드백만 조회 가능, 주석 생성/삭제 가능
- **매니저**: 할당된 프로젝트의 피드백 생성/수정 가능, 주석 해결 상태 업데이트 가능

### 권한 확인 로직

- `@nexsupply.net` 도메인 사용자는 자동으로 매니저로 인식 (super admin 제외)
- `profiles.is_manager` 필드로도 확인 가능

## 다음 단계 (선택사항)

1. **이미지 업로드 기능**: 매니저가 샘플 이미지를 업로드할 수 있는 기능
2. **Tech Pack Update 생성**: "Generate Tech Pack Update" 버튼 기능 구현
3. **이메일 알림**: 주석 추가 시 매니저에게 알림 발송
4. **주석 수정 기능**: 클라이언트가 주석 내용 수정 가능
5. **이미지 줌/팬**: 큰 이미지의 경우 줌/팬 기능 추가
6. **주석 필터링**: 해결됨/대기 중 필터링 기능

## 참고사항

- 좌표는 반드시 퍼센트(%) 단위로 저장해야 반응형으로 작동합니다
- 이미지 URL은 Supabase Storage를 사용하는 것을 권장합니다
- Framer Motion을 사용하여 부드러운 UX를 제공합니다
- 모바일과 데스크탑에서 모두 최적화된 경험을 제공합니다
