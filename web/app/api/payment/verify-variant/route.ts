/**
 * Verify Variant ID API Route
 * 
 * Lemon Squeezy variant ID가 올바른지 확인하는 헬퍼 엔드포인트
 * 개발/디버깅용
 */

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
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
      return NextResponse.json({
        ok: false,
        error: 'Missing configuration',
        config: {
          hasApiKey: !!lemonSqueezyApiKey,
          hasStoreId: !!storeId,
          hasVariantId: !!variantId,
        },
      }, { status: 400 });
    }

    // Variant 정보 조회
    const variantResponse = await fetch(`https://api.lemonsqueezy.com/v1/variants/${variantId}`, {
      headers: {
        'Authorization': `Bearer ${lemonSqueezyApiKey}`,
        'Accept': 'application/vnd.api+json',
      },
    });

    if (!variantResponse.ok) {
      const errorData = await variantResponse.json();
      return NextResponse.json({
        ok: false,
        error: 'Failed to fetch variant',
        details: errorData,
        variantId: variantId,
      }, { status: variantResponse.status });
    }

    const variantData = await variantResponse.json();
    
    return NextResponse.json({
      ok: true,
      variant: {
        id: variantData.data?.id,
        name: variantData.data?.attributes?.name,
        price: variantData.data?.attributes?.price,
        status: variantData.data?.attributes?.status,
        product_id: variantData.data?.relationships?.product?.data?.id,
      },
      config: {
        storeId: storeId,
        variantId: variantId,
      },
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}
