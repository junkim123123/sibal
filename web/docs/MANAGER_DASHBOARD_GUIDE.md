# Manager Command Center 구현 가이드

## 개요

매니저(공급망 전문가)를 위한 "Manager Command Center" 구현 가이드입니다. 클라이언트와의 실행(Execution)에 집중할 수 있는 프로페셔널한 대시보드를 제공합니다.

## 완료된 작업

### 1. DB 스키마 확장

- **파일**: `web/supabase/manager_schema_extensions.sql`
- **추가된 필드**:
  - `profiles.bio`: 매니저 소개글
  - `profiles.expertise`: 전문 분야 배열
  - `profiles.availability_status`: 가용 상태
  - `profiles.is_manager`: 매니저 여부
  - `projects.current_milestone_index`: 현재 마일스톤 인덱스
  - `projects.milestones`: 마일스톤 JSONB 데이터

### 2. 매니저 레이아웃

- **파일**: `web/app/manager/layout.tsx`
- **기능**:
  - 사이드바 네비게이션 (Dashboard, Workstation, Settings)
  - 매니저 권한 확인
  - 모바일 반응형 디자인

### 3. 대시보드 페이지

- **파일**: `web/app/manager/dashboard/page.tsx`
- **기능**:
  - KPI 카드 (Active Clients, Est. Revenue, Pending Messages, Pending Quotes)
  - 최근 활동 리스트

## 남은 작업

### 1. 워크스테이션 페이지 (`/manager/workstation`)

분할 뷰 레이아웃:
- **좌측 (30%)**: 클라이언트 리스트
- **중앙 (40%)**: 실시간 채팅 (Quick Replies 포함)
- **우측 (30%)**: 프로젝트 관리 패널 (마일스톤 타임라인)

**구현 예시**:

```typescript
// web/app/manager/workstation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ManagerChat } from '@/components/ManagerChat';
import { MilestoneTracker } from '@/components/MilestoneTracker';

export default function WorkstationPage() {
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get('project_id');
  
  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
      {/* 좌측: 클라이언트 리스트 */}
      <div className="col-span-12 lg:col-span-3">
        <ClientList />
      </div>
      
      {/* 중앙: 채팅 */}
      <div className="col-span-12 lg:col-span-5">
        {selectedProjectId && (
          <ManagerChat 
            projectId={selectedProjectId}
            showQuickReplies={true}
          />
        )}
      </div>
      
      {/* 우측: 프로젝트 관리 */}
      <div className="col-span-12 lg:col-span-4">
        {selectedProjectId && (
          <ProjectManagementPanel projectId={selectedProjectId} />
        )}
      </div>
    </div>
  );
}
```

### 2. 마일스톤 관리 컴포넌트

**구현 예시**:

```typescript
// web/components/MilestoneTracker.tsx
'use client';

interface Milestone {
  title: string;
  status: 'completed' | 'pending' | 'in_progress';
  date: string | null;
  index: number;
}

export function MilestoneTracker({ projectId }: { projectId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  
  // 마일스톤 업데이트
  const updateMilestone = async (index: number) => {
    // DB 업데이트
    // 자동 시스템 메시지 전송
  };
  
  return (
    <div className="space-y-4">
      {milestones.map((milestone, idx) => (
        <MilestoneItem
          key={idx}
          milestone={milestone}
          onUpdate={() => updateMilestone(idx)}
        />
      ))}
    </div>
  );
}
```

### 3. Quick Replies 기능

채팅 입력창 위에 자주 쓰는 문구 버튼 추가:

```typescript
const quickReplies = [
  "견적 확인 중입니다. 곧 답변드리겠습니다.",
  "샘플이 발송되었습니다. 추적번호를 확인해주세요.",
  "QC 검사가 완료되었습니다. 최종 승인을 기다리고 있습니다.",
];
```

### 4. 자동 시스템 메시지

마일스톤 업데이트 시 자동으로 시스템 메시지 전송:

```typescript
// 마일스톤 업데이트 후
await supabase.from('chat_messages').insert({
  session_id: sessionId,
  sender_id: managerId,
  role: 'manager',
  content: `System: Project status updated to '${milestoneTitle}'.`,
  is_system_message: true,
});
```

### 5. 매니저 설정 페이지

**구현 예시**:

```typescript
// web/app/manager/settings/page.tsx
export default function ManagerSettingsPage() {
  return (
    <div>
      <h1>Profile & Settings</h1>
      <ProfileForm />
      <ExpertiseTags />
      <AvailabilityStatus />
    </div>
  );
}
```

## API 엔드포인트

### 1. 마일스톤 업데이트 API

```typescript
// web/app/api/projects/[id]/milestones/route.ts
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  // 마일스톤 업데이트
  // 자동 시스템 메시지 전송
}
```

### 2. 매니저 프로젝트 조회 API

```typescript
// web/app/api/manager/projects/route.ts
export async function GET(req: Request) {
  // 매니저가 할당된 프로젝트 목록 반환
}
```

## 설정 가이드

### 1. 매니저 계정 생성

```sql
-- Supabase SQL Editor에서 실행
UPDATE profiles 
SET is_manager = TRUE, role = 'pro'
WHERE email = 'manager@nexsupply.com';
```

### 2. 프로젝트에 매니저 할당

```sql
UPDATE projects
SET manager_id = '매니저의 UUID'
WHERE id = '프로젝트 UUID';
```

## 다음 단계

1. 워크스테이션 페이지 구현 (분할 뷰)
2. 마일스톤 트래커 컴포넌트 생성
3. Quick Replies UI 추가
4. 자동 시스템 메시지 로직 구현
5. 매니저 설정 페이지 완성
6. 파일 서랍 (Shared Files) 구현

## 참고 파일

- `web/supabase/manager_schema_extensions.sql`: DB 스키마 확장
- `web/app/manager/layout.tsx`: 매니저 레이아웃
- `web/app/manager/dashboard/page.tsx`: 대시보드 페이지
- `web/components/ManagerChat.tsx`: 실시간 채팅 컴포넌트 (이미 구현됨)

