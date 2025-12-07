# Lemon Squeezy Sales Stats Integration

## 개요
Super Admin 대시보드에서 Lemon Squeezy API를 통해 실제 매출 통계를 조회하는 Server Action 함수입니다.

## 함수: `getSalesStats`

### 위치
`web/app/admin/actions.ts`

### 기능
- Lemon Squeezy API를 호출하여 결제 완료된 주문 목록을 가져옵니다
- 슈퍼 어드민 권한을 확인합니다
- 60초 동안 응답을 캐싱합니다 (Next.js fetch 옵션)

### 반환값
```typescript
{
  totalOrderCount: number;  // 총 주문 수 (meta.page.total)
  recentOrders: Array<{     // 최근 주문 목록
    id: string;
    email: string;
    amount: string;         // 포맷된 금액 (예: "$199.00")
    date: string;           // ISO 8601 형식 날짜
    status: string;         // 주문 상태 (항상 'paid')
  }>;
}
```

### 환경 변수
다음 환경 변수가 필요합니다:

```env
LEMONSQUEEZY_API_KEY=your_api_key_here
LEMONSQUEEZY_STORE_ID=your_store_id_here
```

### API 엔드포인트
- **URL**: `https://api.lemonsqueezy.com/v1/orders`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer {API_KEY}`
  - `Accept: application/vnd.api+json`
- **Query Parameters**:
  - `filter[store_id]={STORE_ID}`: 내 스토어의 주문만 조회
  - `filter[status]=paid`: 결제 완료된 주문만 조회

### 사용 예시

```typescript
import { getSalesStats } from '@/app/admin/actions';

// Server Component에서
const stats = await getSalesStats();
console.log(`Total Orders: ${stats.totalOrderCount}`);
console.log(`Recent Orders:`, stats.recentOrders);

// Client Component에서
'use client';
import { getSalesStats } from '@/app/admin/actions';

const [stats, setStats] = useState({ totalOrderCount: 0, recentOrders: [] });

useEffect(() => {
  getSalesStats().then(setStats);
}, []);
```

### 에러 처리
- API 호출 실패 시: 에러를 콘솔에 기록하고 `{ totalOrderCount: 0, recentOrders: [] }` 반환
- 권한 없음: 안전하게 빈 데이터 반환
- 환경 변수 누락: 에러 로그 후 빈 데이터 반환

### 캐싱
Next.js의 `fetch` 옵션을 사용하여 60초 동안 응답을 캐싱합니다:
```typescript
next: {
  revalidate: 60, // 60초
}
```

### 보안
- 슈퍼 어드민 권한 확인 후 API 호출
- 환경 변수를 통한 API 키 관리
- 에러 정보는 서버 로그에만 기록 (클라이언트에 노출되지 않음)

## 다음 단계
Revenue Dashboard (`web/app/admin/revenue/page.tsx`)에서 이 함수를 호출하여 실제 매출 데이터를 표시할 수 있습니다.

