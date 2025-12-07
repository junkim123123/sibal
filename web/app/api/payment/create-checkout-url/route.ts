/**
 * Lemon Squeezy Checkout URL 생성 API
 * 
 * 사용자 정보를 받아 Lemon Squeezy 결제 페이지로 리다이렉트할 URL을 생성합니다.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/payment/create-checkout-url
 * 
 * 쿼리 파라미터:
 * - user_id: 사용자 ID (선택적, 인증된 사용자는 자동 추출)
 * - user_email: 사용자 이메일 (선택적, 인증된 사용자는 자동 추출)
 * 
 * 반환: Lemon Squeezy Checkout URL
 */
export async function GET(req: Request) {
  try {
    // 사용자 인증 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized. Please log in to proceed with payment.' },
        { status: 401 }
      );
    }

    // Lemon Squeezy Store URL 확인
    const lemonSqueezyUrl = process.env.LEMON_SQUEEZY_STORE_URL;
    
    if (!lemonSqueezyUrl) {
      console.error('[Payment API] LEMON_SQUEEZY_STORE_URL is not configured');
      return NextResponse.json(
        { ok: false, error: 'Payment system is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // 사용자 정보 추출
    const user_id = user.id;
    const user_email = user.email;

    if (!user_email) {
      return NextResponse.json(
        { ok: false, error: 'User email is required for payment' },
        { status: 400 }
      );
    }

    // Lemon Squeezy Checkout URL 생성
    // checkout[custom][user_id]를 통해 웹훅에서 사용자 식별 가능
    const checkoutUrl = new URL(lemonSqueezyUrl);
    checkoutUrl.searchParams.set('checkout[email]', user_email);
    checkoutUrl.searchParams.set('checkout[custom][user_id]', user_id);

    return NextResponse.json(
      {
        ok: true,
        checkout_url: checkoutUrl.toString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Payment API] Failed to create checkout URL:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to create checkout URL',
      },
      { status: 500 }
    );
  }
}

