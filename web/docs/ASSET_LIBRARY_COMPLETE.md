# Asset Library (파일 보관함) 구현 완료 문서

## 개요

파일 보관함(Asset Library) 기능이 완성되었습니다. 사용자는 프로젝트에서 주고받은 모든 파일을 분류별로 모아볼 수 있습니다.

## 완료된 작업

### 1. Asset Library 컴포넌트 생성

**파일**: `web/components/AssetLibrary.tsx`

**기능**:
- 파일 자동 분류: Quotes, Invoices, QC Reports, Images, Documents, Other
- 카테고리별 필터링
- 검색 기능 (파일명, 프로젝트명, 발신자명)
- 파일 카드 뷰 (파일명, 프로젝트, 카테고리, 날짜)
- 다운로드 링크

**파일 분류 로직**:
- **Quotes**: 파일명에 "quote", "quotation", "견적" 포함
- **Invoices**: 파일명에 "invoice", "inv-", "송장" 포함
- **QC Reports**: 파일명에 "qc", "quality", "inspection", "검수" 포함
- **Images**: MIME 타입이 `image/*`
- **Documents**: PDF, Word, Excel 파일
- **Other**: 위에 해당하지 않는 모든 파일

### 2. 클라이언트 대시보드 통합

**파일**: `web/app/(marketing)/dashboard/page.tsx`

**변경 사항**:
- "Documents" 탭 추가
- Asset Library 컴포넌트 통합
- 사용자별 파일 자동 로드

### 3. 데이터 로딩

**로직**:
- 사용자 ID 또는 프로젝트 ID 기반 파일 조회
- `chat_sessions` → `chat_messages` 조인
- 파일 URL이 있는 메시지만 표시
- 최신 파일 순으로 정렬

## 사용 방법

### 클라이언트 대시보드에서

1. `/dashboard` 접속
2. "Documents" 탭 클릭
3. 파일 카테고리 선택 (All Files, Quotes, Invoices, QC Reports, Images, Documents, Other)
4. 검색창에서 파일 검색
5. 파일 카드 클릭하여 다운로드

### 컴포넌트 직접 사용

```tsx
import { AssetLibrary } from '@/components/AssetLibrary';

// 사용자별 모든 파일
<AssetLibrary userId={user.id} />

// 특정 프로젝트의 파일만
<AssetLibrary projectId={project.id} />
```

## 향후 개선 사항

- 파일 미리보기 기능
- 대량 다운로드 (ZIP)
- 파일 태그 시스템
- 파일 공유 링크 생성
- 파일 크기 표시
- 더 세밀한 분류 옵션

## 파일 구조

```
web/
├── components/
│   └── AssetLibrary.tsx       # 파일 보관함 컴포넌트
└── app/
    └── (marketing)/
        └── dashboard/
            └── page.tsx        # 대시보드 (Documents 탭 추가)
```

## 완료

✅ 파일 보관함 컴포넌트 생성
✅ 파일 자동 분류 및 필터링
✅ 검색 기능
✅ 클라이언트 대시보드 통합
✅ 사용자별/프로젝트별 파일 조회

모든 작업이 완료되었습니다! 🎉

