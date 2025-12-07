# Next.js Supabase 통합 완료 가이드

## 📋 구현 완료 사항

Next.js 앱의 `/chat` 라우트를 Supabase DB에 연결하고, 블랙리스트 및 OSINT 데이터를 활용하는 핵심 비즈니스 로직을 구현했습니다.

---

## ✅ 완료된 작업

### 1. Supabase DB 영속성 구현 ✅
- `/api/projects` API 엔드포인트 생성
- `/api/messages` API 엔드포인트 생성
- `/api/analyze`에 분석 결과 DB 저장 로직 추가

### 2. 블랙리스트 Kill Switch ✅
- 블랙리스트 로더 구현 (`web/lib/blacklist/loader.ts`)
- `/api/analyze`에 블랙리스트 체크 추가
- `CRITICAL_RISK` 에러 코드 반환

### 3. 서버용 Supabase 클라이언트 ✅
- 관리자 클라이언트 생성 (`web/lib/supabase/admin.ts`)
- RLS 우회 지원 (API Routes에서 사용)

---

## 🔄 다음 단계: 프론트엔드 통합

### `/chat` 페이지 수정 필요

현재 `/chat` 페이지는 localStorage를 사용하고 있습니다. 다음 변경이 필요합니다:

#### 1. 프로젝트 생성 (앱 로드 시)

```typescript
const [projectId, setProjectId] = useState<string | null>(null);

useEffect(() => {
  const createProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: selectedOptions.product_info || 'New Analysis Project' 
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
  
  // 첫 번째 질문에 답변한 후 프로젝트 생성
  if (selectedOptions.product_info && !projectId) {
    createProject();
  }
}, [selectedOptions.product_info]);
```

#### 2. ref_link 유효성 검사 강화

```typescript
const handleTextSubmit = () => {
  // ... 기존 로직 ...
  
  // ref_link 단계 처리
  if (currentStep.id === 'ref_link') {
    const normalizedInput = textInput.trim().toLowerCase();
    const skipPatterns = ['skip', '없음', '몰라', 'none', ''];
    
    if (skipPatterns.includes(normalizedInput) || 
        normalizedInput.includes('skip') ||
        normalizedInput.includes('없음') ||
        normalizedInput.includes('몰라')) {
      displayValue = 'skip';
    }
  }
  
  // ... 나머지 로직 ...
  
  // 메시지 저장
  if (projectId) {
    saveMessage('user', displayValue);
  }
};
```

#### 3. 메시지 저장 함수

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
```

#### 4. localStorage 제거 및 project_id 전달

```typescript
// localStorage 제거
// localStorage.setItem('nexsupply_onboarding_data', ...); 삭제

// 결과 페이지로 이동 시 project_id 전달
router.push(`/results?project_id=${projectId}`);
```

### `/results` 페이지 수정 필요

#### 1. project_id 사용

```typescript
const searchParams = useSearchParams();
const projectId = searchParams.get('project_id');

// 분석 요청 시 project_id 포함
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    userContext: answers,
    project_id: projectId, // 추가
  }),
});
```

#### 2. CRITICAL_RISK 처리

```typescript
const [criticalRisk, setCriticalRisk] = useState(false);
const [blacklistDetails, setBlacklistDetails] = useState<any>(null);

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

// CRITICAL_RISK UI
if (criticalRisk) {
  return <CriticalRiskWarning blacklistDetails={blacklistDetails} />;
}
```

---

## 📝 추가 구현 필요 사항

### 1. AI 프롬프트에 OSINT 데이터 강제 주입

`/api/analyze`의 `buildSourcingPrompt` 함수에 다음 문구 추가:

```typescript
const osintPrompt = `
You MUST use the NexSupply OSINT Blacklist (provided externally) to check the supplier risk. 
If the analysis is Low Risk, calculate the score based on the weighted average (Quality 30%, Delivery 30%, Stability 25%, Difficulty 15%). 
If the supplier is NOT on the Blacklist, and the risk score is below 40, you MUST cite two facts from the Golden Set/OSINT data 
(e.g., 'Alibaba rating 4.9', 'No negative mentions on Reddit') to justify the Low Risk rating.
`;

// 프롬프트에 추가
return `${basePrompt}\n\n${osintPrompt}`;
```

### 2. Logistics Insight 로직

`/api/analyze`에 추가:

```typescript
function calculateContainerLoading(sizeTier: string): string {
  const mapping: Record<string, string> = {
    'xs': 'Est. 5,000 units per 20ft container',
    's': 'Est. 3,500 units per 20ft container',
    'm': 'Est. 2,000 units per 20ft container',
    'l': 'Est. 800 units per 20ft container',
    'xl': 'Est. 200 units per 20ft container',
    'shoe box size': 'Est. 3,500 units per 20ft container',
    'large appliance size': 'Est. 200 units per 20ft container',
  };
  
  const normalized = sizeTier.toLowerCase();
  return mapping[normalized] || 'Est. 2,000 units per 20ft container';
}
```

### 3. OSINT Risk Score UI 추가

`AIAnalysisResult` 인터페이스에 추가:

```typescript
interface AIAnalysisResult {
  // ... 기존 필드들 ...
  osint_risk_score?: number;
}
```

`RiskAssessment` 컴포넌트에 추가:

```typescript
{aiAnalysis.osint_risk_score !== undefined && (
  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <p className="text-sm font-semibold text-blue-900">
      OSINT Risk Score: {aiAnalysis.osint_risk_score}/100 (from 500 supplier database)
    </p>
  </div>
)}
```

---

## 🔐 환경 변수

`.env.local`에 추가:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # 선택사항
```

---

## 📊 데이터 흐름

1. 사용자가 `/chat` 접속
2. 프로젝트 생성 (첫 답변 후)
3. 모든 메시지 DB 저장
4. 채팅 완료 → `/results?project_id=xxx`로 이동
5. `/results`에서 분석 요청 (project_id 포함)
6. 블랙리스트 체크
7. 분석 수행 및 결과 DB 저장
8. 결과 표시 (또는 CRITICAL_RISK 경고)

---

**구현 완료일**: 2024년  
**작성자**: Cursor AI Assistant

