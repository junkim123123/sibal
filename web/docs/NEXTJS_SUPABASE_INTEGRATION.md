# Next.js Supabase 통합 완료 보고서

## ✅ 구현 완료 사항

Next.js 환경에서 Supabase JavaScript 클라이언트와 AI 분석 로직을 통합하여 데이터 영속성과 블랙리스트 필터를 구현했습니다.

---

## 📁 생성된 파일

### 1. 블랙리스트 유틸리티
- **`web/lib/blacklist/loader.ts`**
  - 블랙리스트 CSV 파일 로드
  - 공급업체 정보로 블랙리스트 확인
  - URL에서 공급업체 정보 추출 및 확인

### 2. Supabase 관리자 클라이언트
- **`web/lib/supabase/admin.ts`**
  - 서버 사이드에서 RLS를 우회할 수 있는 관리자 클라이언트
  - API Routes에서 사용

### 3. API 엔드포인트
- **`web/app/api/projects/route.ts`**
  - POST: 새 프로젝트 생성
  - GET: 사용자의 모든 프로젝트 조회

- **`web/app/api/messages/route.ts`**
  - POST: 새 메시지 저장
  - GET: 프로젝트의 모든 메시지 조회

### 4. `/api/analyze` 수정
- **`web/app/api/analyze/route.ts`**
  - 블랙리스트 체크 추가 (Kill Switch)
  - 분석 결과 DB 저장 로직 추가

---

## 🔧 구현된 기능

### 1. 블랙리스트 필터 (Kill Switch)

**작동 방식:**
1. `/api/analyze`에서 `userContext.ref_link`를 확인
2. URL에서 공급업체 정보 추출
3. 블랙리스트에 포함된 경우 AI 호출을 건너뛰고 즉시 차단
4. `CRITICAL_RISK` 에러 코드 반환

**에러 응답 형식:**
```json
{
  "ok": false,
  "error_code": "CRITICAL_RISK",
  "error": "해당 공급업체는 NexSupply의 블랙리스트에 포함되어 즉시 거래가 불가합니다. 전문가 연결을 통해 대안을 제시해 드리겠습니다.",
  "blacklist_details": {
    "company_name": "...",
    "risk_score": 52,
    "note": "..."
  }
}
```

### 2. 프로젝트 관리 API

**프로젝트 생성:**
```typescript
POST /api/projects
{
  "name": "프로젝트 이름"
}

Response:
{
  "ok": true,
  "project": {
    "id": "uuid",
    "name": "프로젝트 이름",
    "status": "active",
    "created_at": "..."
  }
}
```

**프로젝트 조회:**
```typescript
GET /api/projects

Response:
{
  "ok": true,
  "projects": [...]
}
```

### 3. 메시지 관리 API

**메시지 저장:**
```typescript
POST /api/messages
{
  "project_id": "uuid",
  "role": "user" | "ai",
  "content": "메시지 내용"
}
```

**메시지 조회:**
```typescript
GET /api/messages?project_id=uuid

Response:
{
  "ok": true,
  "messages": [...]
}
```

### 4. 분석 결과 DB 저장

`/api/analyze`에 `project_id`를 전달하면:
- 분석 완료 후 자동으로 프로젝트 업데이트
- `initial_risk_score`: 리스크 레벨에 따라 계산
- `total_landed_cost`: 분석된 도착 비용
- `status`: 'completed'로 업데이트

---

## 🔄 다음 단계: 프론트엔드 통합

### 1. `/chat` 페이지 수정 필요

**현재 상태:**
- localStorage에 데이터 저장
- 채팅 완료 후 `/results`로 이동

**수정 사항:**

1. **프로젝트 생성 (앱 로드 시)**
```typescript
// useEffect에서 프로젝트 생성
useEffect(() => {
  const createProject = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: 'New Analysis Project' 
        }),
      });
      
      const data = await response.json();
      if (data.ok) {
        setProjectId(data.project.id);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };
  
  createProject();
}, [isAuthenticated]);
```

2. **메시지 저장 (사용자 입력 및 AI 응답)**
```typescript
const saveMessage = async (role: 'user' | 'ai', content: string) => {
  if (!projectId) return;
  
  try {
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        role,
        content,
      }),
    });
  } catch (error) {
    console.error('Failed to save message:', error);
  }
};

// 사용자 입력 시
handleTextSubmit() {
  // ... 기존 로직
  saveMessage('user', textInput);
}

// AI 응답 시
saveMessage('ai', aiResponse);
```

3. **localStorage 제거**
- `localStorage.setItem('nexsupply_onboarding_data', ...)` 제거
- 채팅 완료 시 URL에 `project_id` 전달

### 2. `/results` 페이지 수정 필요

**현재 상태:**
- localStorage에서 데이터 로드
- `/api/analyze` 호출

**수정 사항:**

1. **URL에서 project_id 받기**
```typescript
const searchParams = useSearchParams();
const projectId = searchParams.get('project_id');
```

2. **CRITICAL_RISK 에러 처리**
```typescript
const fetchAnalysis = async () => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userContext: answers,
        project_id: projectId,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      // CRITICAL_RISK 에러 처리
      if (data.error_code === 'CRITICAL_RISK') {
        setCriticalRisk(true);
        setBlacklistDetails(data.blacklist_details);
        return;
      }
      
      throw new Error(data.error || 'Failed to analyze project');
    }

    setAiAnalysis(data.analysis);
  } catch (err) {
    // ...
  }
};
```

3. **CRITICAL_RISK UI 추가**
```typescript
if (criticalRisk) {
  return (
    <CriticalRiskWarning 
      blacklistDetails={blacklistDetails}
      onContactExpert={() => {/* 전문가 연결 */}}
    />
  );
}
```

---

## 🔐 환경 변수 설정

`.env.local` 파일에 다음 환경 변수 추가:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # 선택사항 (RLS 우회 필요시)

# Gemini API
GOOGLE_API_KEY=your-gemini-api-key
GEMINI_API_KEY=your-gemini-api-key  # 또는 GOOGLE_API_KEY 대신 사용
```

**중요:** `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용하고, 클라이언트에 노출되지 않도록 주의하세요.

---

## 📊 데이터 흐름

### 채팅 플로우
```
1. 사용자 로그인
   ↓
2. 앱 로드 → 프로젝트 생성 (POST /api/projects)
   ↓
3. 사용자 입력 → 메시지 저장 (POST /api/messages)
   ↓
4. 채팅 완료 → project_id와 함께 /results로 이동
   ↓
5. /results에서 분석 요청 (POST /api/analyze)
   - project_id 포함
   - 블랙리스트 체크
   - 분석 수행
   - 결과 DB 저장
```

---

## ✅ 테스트 체크리스트

- [ ] 블랙리스트 공급업체 URL 입력 시 차단 확인
- [ ] 프로젝트 생성 및 조회 동작 확인
- [ ] 메시지 저장 및 조회 동작 확인
- [ ] 분석 결과 DB 저장 확인
- [ ] CRITICAL_RISK UI 표시 확인
- [ ] 로그인하지 않은 사용자 처리 확인

---

## 🎯 다음 단계

1. **프론트엔드 통합 완료**
   - `/chat` 페이지 수정
   - `/results` 페이지 수정
   - CRITICAL_RISK UI 컴포넌트 생성

2. **추가 개선 사항**
   - 프로젝트 목록 UI 추가
   - 프로젝트 재로드 기능
   - 분석 결과 히스토리 조회

---

**구현 완료일**: 2024년  
**작성자**: Cursor AI Assistant

