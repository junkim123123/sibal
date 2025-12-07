# 실시간 채팅 시스템 통합 가이드

## 개요

NexSupply의 "실제 요청" 기능은 결제와 실시간 채팅을 연결하는 핵심 기능입니다. Supabase Realtime과 Storage를 활용하여 구현됩니다.

## 구현 완료 사항

### 1. DB 스키마 확장

- **파일**: `web/supabase/schema_extensions.sql`
- **변경 사항**:
  - `profiles` 테이블: `name`, `company` 필드 추가
  - `projects` 테이블: `final_quote_status`, `quote_acceptance_date`, `manager_id` 필드 추가
  - `chat_messages` 테이블: `file_url`, `file_type`, `file_name` 필드 추가

### 2. 채팅 세션 API

- **파일**: `web/app/api/chat-sessions/route.ts`
- **기능**:
  - POST: 새 채팅 세션 생성
  - GET: 채팅 세션 목록 조회

### 3. 파일 업로드 API

- **파일**: `web/app/api/chat/upload/route.ts`
- **기능**: Supabase Storage에 파일 업로드

### 4. ManagerChat 컴포넌트

- **파일**: `web/components/ManagerChat.tsx`
- **기능**: 실시간 채팅 인터페이스 (Supabase Realtime 사용)

## 남은 작업

### 1. ManagerChat 컴포넌트 개선 (파일 첨부)

`ManagerChat.tsx`에 다음 기능 추가 필요:

```typescript
// 파일 첨부 상태
const [uploadingFile, setUploadingFile] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);

// 파일 업로드 핸들러
const handleFileUpload = async (file: File) => {
  setUploadingFile(true);
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId);

    const response = await fetch('/api/chat/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.ok) {
      // 파일과 함께 메시지 전송
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        sender_id: userId,
        role: 'user',
        content: `[파일 첨부: ${data.file_name}]`,
        file_url: data.file_url,
        file_type: data.file_type,
        file_name: data.file_name,
      });
    }
  } catch (error) {
    console.error('File upload failed:', error);
  } finally {
    setUploadingFile(false);
  }
};
```

### 2. 결과 페이지 "실제 요청" 버튼

`web/app/results/page.tsx`의 `ResultsContent` 컴포넌트에 다음 로직 추가:

```typescript
// 사용자 역할 확인
const [userRole, setUserRole] = useState<'free' | 'pro' | null>(null);
const [showChat, setShowChat] = useState(false);
const [chatSessionId, setChatSessionId] = useState<string | null>(null);

// 역할 확인
useEffect(() => {
  const checkUserRole = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      setUserRole(profile?.role || 'free');
    }
  };
  checkUserRole();
}, []);

// 실제 요청 버튼 핸들러
const handleRequestClick = async () => {
  if (!userRole || !projectId) return;

  if (userRole === 'free') {
    // 결제로 리다이렉트
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const response = await fetch(
        `/api/payment/create-checkout-url?user_id=${user.id}&user_email=${encodeURIComponent(user.email || '')}`
      );
      const data = await response.json();
      if (data.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    }
  } else if (userRole === 'pro') {
    // 채팅 세션 시작
    const response = await fetch('/api/chat-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId }),
    });
    const data = await response.json();
    if (data.ok && data.session) {
      setChatSessionId(data.session.id);
      setShowChat(true);
    }
  }
};
```

### 3. Supabase Storage 버킷 생성

1. Supabase 대시보드 → Storage
2. "Create Bucket" 클릭
3. 버킷 이름: `chat-files`
4. Public: false
5. File size limit: 50 MB

### 4. Realtime 활성화

1. Supabase 대시보드 → Database → Replication
2. `chat_messages` 테이블 선택
3. "Enable Realtime" 토글 활성화

## 사용 가이드

### 관리자 할당

프로젝트에 매니저를 할당하려면:

```sql
UPDATE projects
SET manager_id = '매니저의 UUID'
WHERE id = '프로젝트 UUID';
```

### 최종 견적 발송 (관리자)

```typescript
// 프로젝트 상태 업데이트
await supabase
  .from('projects')
  .update({ final_quote_status: 'accepted' })
  .eq('id', projectId);

// 환불 불가 안내 메시지 전송
await supabase.from('chat_messages').insert({
  session_id: sessionId,
  sender_id: managerId,
  role: 'manager',
  content: '최종 견적이 발송되었습니다. 승인 시 환불이 불가능합니다.',
});
```

## 다음 단계

1. ManagerChat 컴포넌트에 파일 첨부 UI 추가
2. 결과 페이지에 역할 확인 및 버튼 로직 통합
3. 최종 견적 승인 UI 구현
4. 환불 불가 경고 메시지 추가

