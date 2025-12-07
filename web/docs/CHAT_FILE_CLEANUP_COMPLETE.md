# 채팅 파일 자동 삭제 시스템 구현 완료

## 개요
채팅창에서 6개월 이상 지난 이미지/파일을 자동으로 삭제하여 저장 공간을 절약합니다. **텍스트 메시지는 유지**하고, 파일만 삭제합니다.

## 구현된 기능

### 1. 자동 파일 삭제 API ✅
- **위치**: `web/app/api/cron/cleanup-old-files/route.ts`
- **기능**:
  - 6개월(180일) 이전의 파일 메시지 자동 조회
  - Supabase Storage에서 실제 파일 삭제
  - DB에서 `file_url`, `file_name`, `file_type`만 null로 업데이트 (메시지 내용은 유지)

### 2. 수동 실행 API ✅
- **위치**: `web/app/api/admin/cleanup-old-files/route.ts`
- **기능**: Super Admin이 수동으로 실행할 수 있는 API
- **보안**: Authorization Bearer 토큰 필요

### 3. Vercel Cron Job 설정 ✅
- **위치**: `web/vercel.json`
- **스케줄**: 매일 오전 2시 실행 (`0 2 * * *`)

## 동작 방식

### 자동 실행 (Vercel Cron)
1. 매일 오전 2시에 자동 실행
2. 6개월 이전(`created_at < 180일 전`) 파일 메시지 조회
3. 각 파일에 대해:
   - Supabase Storage에서 실제 파일 삭제
   - DB에서 파일 관련 필드만 null로 업데이트 (메시지는 유지)

### 수동 실행 (Super Admin)
```bash
# 통계 확인 (삭제하지 않음)
curl https://your-domain.com/api/admin/cleanup-old-files

# 실제 삭제 실행
curl -X POST https://your-domain.com/api/admin/cleanup-old-files \
  -H "Authorization: Bearer YOUR_CLEANUP_API_KEY"
```

## 설정

### 1. 환경 변수 설정

`.env.local` 또는 Vercel 환경 변수에 추가:

```env
# 파일 삭제 API 보안 키 (선택사항)
CLEANUP_API_KEY=your-secret-key-here

# Vercel Cron 보안 키 (선택사항)
CRON_SECRET=your-cron-secret-here
```

### 2. Vercel Cron 설정 확인

`web/vercel.json` 파일:
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-old-files",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**스케줄 형식**: Cron 표현식
- `0 2 * * *`: 매일 오전 2시
- `0 0 * * 0`: 매주 일요일 자정
- `0 0 1 * *`: 매월 1일 자정

## 파일 삭제 로직

### 삭제 조건
- **파일 메시지**: `file_url`이 null이 아닌 메시지
- **기준 날짜**: `created_at < (현재 날짜 - 180일)`

### 삭제 과정
1. **Supabase Storage 삭제**: 실제 파일 삭제
2. **DB 업데이트**: `file_url`, `file_name`, `file_type`을 null로 업데이트
3. **메시지 유지**: `content` 필드는 그대로 유지 (텍스트 메시지 보존)

## 보안

### Vercel Cron Job
- Vercel이 자동으로 Authorization 헤더 추가
- 환경 변수 `CRON_SECRET`으로 검증 (선택사항)

### 수동 실행 API
- `Authorization: Bearer {CLEANUP_API_KEY}` 헤더 필요
- 환경 변수에 `CLEANUP_API_KEY` 설정 (기본값: 'cleanup-secret-key')

## 파일 경로 추출

Supabase Storage URL에서 파일 경로를 자동 추출:
- **공개 URL**: `https://xxx.supabase.co/storage/v1/object/public/chat-files/user-id/session-id/timestamp-filename`
- **서명된 URL**: `https://xxx.supabase.co/storage/v1/object/sign/chat-files/...?token=...`
- **추출 결과**: `user-id/session-id/timestamp-filename`

## 모니터링

### 로그 확인
- Vercel 대시보드 → Functions → `/api/cron/cleanup-old-files`
- 삭제된 파일 수 및 에러 로그 확인

### 통계 확인
```bash
GET /api/admin/cleanup-old-files
```

응답 예시:
```json
{
  "ok": true,
  "message": "Statistics (no deletion performed)",
  "oldFilesCount": 15,
  "cutoffDate": "2024-06-01T00:00:00.000Z",
  "retentionDays": 180
}
```

## 생성된 파일

1. ✅ `web/app/api/cron/cleanup-old-files/route.ts` - Vercel Cron Job 엔드포인트
2. ✅ `web/app/api/admin/cleanup-old-files/route.ts` - 수동 실행 API
3. ✅ `web/vercel.json` - Vercel Cron 설정

## 다음 단계

1. **환경 변수 설정**: Vercel 대시보드에서 `CLEANUP_API_KEY` 설정 (선택사항)
2. **배포**: 변경사항 커밋 및 푸시 후 Vercel에 배포
3. **테스트**: 첫 실행 시 통계만 확인 (`GET /api/admin/cleanup-old-files`)
4. **모니터링**: Vercel Functions 로그에서 실행 결과 확인

## 주의사항

- ⚠️ **되돌릴 수 없음**: 파일이 삭제되면 복구할 수 없습니다
- ⚠️ **테스트 권장**: 프로덕션 배포 전 테스트 환경에서 먼저 실행
- ✅ **안전한 설계**: 텍스트 메시지는 항상 유지됨

---

**완료일**: 2024년 12월  
**보존 기간**: 6개월 (180일)

