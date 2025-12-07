/**
 * Subscribe API Route
 * 
 * Lemon Squeezy 구독 체크아웃 URL을 생성합니다.
 * 결제 성공 후 /dashboard?payment=success로 리다이렉트됩니다.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    // 사용자 인증 확인
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { project_id } = body;

    // Lemon Squeezy API 키 확인 (두 가지 변수명 모두 지원)
    const lemonSqueezyApiKey = process.env.LEMONSQUEEZY_API_KEY || 
                                process.env.LEMON_SQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID || 
                    process.env.LEMON_SQUEEZY_STORE_ID;
    const variantId = process.env.LEMON_SQUEEZY_SUBSCRIPTION_VARIANT_ID || 
                      process.env.LEMONSQUEEZY_SUBSCRIPTION_VARIANT_ID || 
                      process.env.NEXT_PUBLIC_LEMONSQUEEZY_SUBSCRIPTION_VARIANT_ID ||
                      process.env.NEXT_PUBLIC_LEMON_SQUEEZY_SUBSCRIPTION_VARIANT_ID;

    if (!lemonSqueezyApiKey || !storeId || !variantId) {
      console.error('[Subscribe] Missing Lemon Squeezy configuration:', {
        hasApiKey: !!lemonSqueezyApiKey,
        hasStoreId: !!storeId,
        hasVariantId: !!variantId,
      });
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Payment system configuration error',
          details: 'Missing required Lemon Squeezy configuration. Please check LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID, and LEMON_SQUEEZY_SUBSCRIPTION_VARIANT_ID environment variables.'
        },
        { status: 500 }
      );
    }

    // 결제 성공 후 리다이렉트 URL
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=success`;

    // Lemon Squeezy Checkout 생성
    const checkoutResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lemonSqueezyApiKey}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            custom_price: null,
            product_options: {
              name: 'NexSupply Sourcing Expert Subscription',
              description: 'Monthly subscription for dedicated sourcing manager',
            },
            checkout_options: {
              embed: false,
              media: false,
              logo: true,
            },
            checkout_data: {
              email: user.email || '',
              custom: {
                user_id: user.id,
                project_id: project_id || null,
              },
            },
            expires_at: null,
            preview: false,
            test_mode: process.env.NODE_ENV !== 'production',
            // 리다이렉트 URL 설정
            redirect_url: successUrl,
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: storeId,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId,
              },
            },
          },
        },
      }),
    });

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json();
      console.error('[Subscribe] Lemon Squeezy API error:', {
        status: checkoutResponse.status,
        statusText: checkoutResponse.statusText,
        error: errorData,
        variantId: variantId,
      });
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Failed to create checkout',
          details: errorData?.errors?.[0]?.detail || errorData?.error || 'Unknown error',
        },
        { status: 500 }
      );
    }

    const checkoutData = await checkoutResponse.json();
    const checkoutUrl = checkoutData.data?.attributes?.url;

    if (!checkoutUrl) {
      console.error('[Subscribe] No checkout URL in response:', checkoutData);
      return NextResponse.json(
        { ok: false, error: 'Failed to get checkout URL' },
        { status: 500 }
      );
    }

    console.log('[Subscribe] Checkout created successfully:', {
      checkoutUrl,
      variantId,
      userId: user.id,
      projectId: project_id,
    });

    return NextResponse.json({
      ok: true,
      checkout_url: checkoutUrl,
    });
  } catch (error) {
    console.error('[Subscribe] Server error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
