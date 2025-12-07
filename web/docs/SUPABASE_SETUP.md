# Supabase 데이터베이스 연동 가이드

이 문서는 NexSupply AI Analyzer에서 Supabase PostgreSQL 데이터베이스를 설정하고 사용하는 방법을 설명합니다.

## 📋 목차

1. [Supabase 설정](#supabase-설정)
2. [데이터베이스 스키마 생성](#데이터베이스-스키마-생성)
3. [환경 변수 설정](#환경-변수-설정)
4. [사용 방법](#사용-방법)
5. [문제 해결](#문제-해결)

---

## Supabase 설정

### 1. Supabase 프로젝트 생성

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전 설정
4. 프로젝트 생성 완료까지 대기 (약 2분)

### 2. API 키 확인

1. Supabase 대시보드에서 프로젝트 선택
2. Settings > API 메뉴로 이동
3. 다음 정보 확인:
   - **Project URL** (SUPABASE_URL)
   - **anon public key** (SUPABASE_ANON_KEY)

---

## 데이터베이스 스키마 생성

### 1. SQL Editor에서 스키마 실행

1. Supabase 대시보드에서 SQL Editor 열기
2. `web/supabase/schema.sql` 파일의 내용을 복사
3. SQL Editor에 붙여넣기
4. "Run" 버튼 클릭하여 실행

### 2. 생성된 테이블 확인

다음 3개의 테이블이 생성되었는지 확인:

- ✅ `profiles` - 사용자 정보
- ✅ `projects` - AI 분석 프로젝트
- ✅ `messages` - 채팅 히스토리

### 3. Row Level Security (RLS) 확인

모든 테이블에 RLS 정책이 자동으로 설정됩니다:
- 사용자는 자신의 데이터만 조회/수정 가능
- Foreign Key 제약조건으로 데이터 무결성 보장

---

## 환경 변수 설정

### Streamlit 앱 설정

`.env` 파일 또는 Streamlit secrets에 다음 변수를 추가:

```bash
# Supabase 설정
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key-here

# 또는 Next.js와 공유하는 경우
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### Streamlit Secrets 설정 (선택)

`.streamlit/secrets.toml` 파일 생성:

```toml
SUPABASE_URL = "https://your-project-id.supabase.co"
SUPABASE_KEY = "your-anon-public-key-here"
```

---

## 사용 방법

### 1. 프로젝트 생성

새 분석을 시작할 때 자동으로 프로젝트가 생성됩니다:

```python
from utils.project_manager import ensure_project_exists

# 사용자 ID가 있는 경우
user_id = st.session_state.user.get("id")
project_id = ensure_project_exists(user_id)
```

### 2. 메시지 저장

채팅 메시지를 데이터베이스에 저장:

```python
from utils.project_manager import save_message_to_db

project_id = st.session_state.current_project_id
save_message_to_db(project_id, "user", "사용자 메시지")
save_message_to_db(project_id, "ai", "AI 응답")
```

### 3. 분석 결과 저장

AI 분석 완료 후 프로젝트 업데이트:

```python
from utils.project_manager import (
    update_project_with_analysis,
    extract_analysis_results
)

# 분석 결과에서 데이터 추출
risk_score, landed_cost = extract_analysis_results(analysis_data)

# 프로젝트 업데이트
update_project_with_analysis(
    project_id=project_id,
    risk_score=risk_score,
    landed_cost=landed_cost,
    status="completed"
)
```

### 4. 프로젝트 목록 조회

사용자의 모든 프로젝트 조회:

```python
from utils.project_manager import load_user_projects

user_id = st.session_state.user.get("id")
projects = load_user_projects(user_id, refresh=True)

for project in projects:
    st.write(f"프로젝트: {project['name']}")
    st.write(f"상태: {project['status']}")
```

---

## 문제 해결

### 1. Supabase 연결 실패

**증상**: "Supabase가 연결되지 않았습니다" 경고 메시지

**해결 방법**:
- 환경 변수가 올바르게 설정되었는지 확인
- Supabase URL과 Key가 정확한지 확인
- 인터넷 연결 확인

### 2. RLS 정책 오류

**증상**: "permission denied" 오류

**해결 방법**:
- Supabase Auth를 통해 로그인된 사용자인지 확인
- `st.session_state.user`에 사용자 정보가 있는지 확인
- RLS 정책이 올바르게 설정되었는지 SQL Editor에서 확인

### 3. 프로필 자동 생성 실패

**증상**: 프로필이 자동으로 생성되지 않음

**해결 방법**:
- `handle_new_user()` 트리거 함수가 생성되었는지 확인
- Supabase Auth에서 사용자가 생성되었는지 확인
- 수동으로 프로필 생성:

```python
from services.supabase_service import get_supabase_service

service = get_supabase_service()
service.create_or_update_profile(user_id, email, "free")
```

---

## 다음 단계

1. ✅ Supabase 데이터베이스 스키마 생성
2. ✅ 환경 변수 설정
3. ✅ 프로젝트 생성 및 메시지 저장 구현
4. 🔄 사용자 인증 통합 (향후 작업)
5. 🔄 프로젝트 목록 UI 구현 (향후 작업)

---

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Python 클라이언트](https://github.com/supabase/supabase-py)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

