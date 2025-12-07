# NexSupply Supabase 데이터베이스 스키마

## 📋 개요

이 디렉토리에는 NexSupply 플랫폼의 통합 및 최적화된 데이터베이스 스키마가 포함되어 있습니다.

## 🚀 빠른 시작

### 1. 기존 데이터베이스 초기화 (선택사항)

기존 데이터를 모두 삭제하고 새로 시작하려면:

1. Supabase 대시보드 > SQL Editor로 이동
2. 다음 SQL 실행:

```sql
-- 모든 테이블 삭제 (주의: 모든 데이터가 삭제됩니다!)
DROP TABLE IF EXISTS sample_annotations CASCADE;
DROP TABLE IF EXISTS sample_feedbacks CASCADE;
DROP TABLE IF EXISTS qc_report_items CASCADE;
DROP TABLE IF EXISTS qc_reports CASCADE;
DROP TABLE IF EXISTS factory_quotes CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```

### 2. 통합 스키마 실행

1. Supabase 대시보드 > SQL Editor로 이동
2. `complete_schema.sql` 파일의 전체 내용을 복사하여 실행
3. 실행 완료 확인

## 📁 파일 구조

- **`complete_schema.sql`** ⭐ - 통합 및 최적화된 단일 스키마 파일 (이것만 실행하면 됩니다!)
- `schema.sql` - 기본 스키마 (레거시, 사용 안 함)
- `schema_extensions.sql` - 스키마 확장 (레거시, 사용 안 함)
- 기타 확장 파일들 (레거시, `complete_schema.sql`에 통합됨)

## 🗄️ 포함된 테이블

### 핵심 테이블
1. **profiles** - 사용자 프로필 (역할, 구독 상태, 분석 사용량 등)
2. **projects** - 프로젝트 (상태, 마일스톤, 구독 정보 등)
3. **messages** - AI 분석 메시지

### 채팅 시스템
4. **chat_sessions** - 채팅 세션
5. **chat_messages** - 실시간 채팅 메시지

### 견적 및 QC
6. **factory_quotes** - 공장 견적
7. **qc_reports** - QC 검수 보고서
8. **qc_report_items** - QC 검수 항목

### 샘플 피드백
9. **sample_feedbacks** - 샘플 피드백
10. **sample_annotations** - 샘플 이미지 주석

## 🔐 보안 기능

- **Row Level Security (RLS)** - 모든 테이블에 적용
- **사용자 격리** - 사용자는 자신의 데이터만 접근 가능
- **매니저 권한** - 할당된 프로젝트만 접근 가능
- **슈퍼 어드민 권한** - 모든 데이터 접근 가능

## ⚙️ 자동화 기능

- **프로필 자동 생성** - 사용자 가입 시 자동 생성
- **updated_at 자동 업데이트** - 모든 테이블에 적용
- **매니저 워크로드 자동 계산** - 프로젝트 할당 시 자동 업데이트
- **defect_rate 자동 계산** - QC 리포트에 자동 계산

## 📝 다음 단계

스키마 실행 후:

1. **Storage 버킷 생성**
   - `chat-files` - 채팅 파일 업로드용
   - `qc-images` - QC 이미지 업로드용
   - `sample-images` - 샘플 이미지 업로드용

2. **Realtime 활성화**
   - Database → Replication
   - `chat_messages` 테이블 활성화
   - `chat_sessions` 테이블 활성화

3. **환경 변수 확인**
   - `SUPABASE_SERVICE_ROLE_KEY` - 반드시 설정 필요!
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ⚠️ 중요 사항

- **SUPABASE_SERVICE_ROLE_KEY**가 설정되지 않으면 저장 기능이 작동하지 않습니다!
- Vercel 환경 변수에 `SUPABASE_SERVICE_ROLE_KEY`를 추가하세요.
