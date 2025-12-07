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

    // 🔍 디버깅: 환경 변수 검증 및 로깅
    const apiKeyPrefix = lemonSqueezyApiKey ? lemonSqueezyApiKey.substring(0, 10) + '...' : 'NOT SET';
    const isTestMode = lemonSqueezyApiKey?.startsWith('ls_test_');
    const isLiveMode = lemonSqueezyApiKey?.startsWith('ls_live_');
    
    console.log('[Subscribe] 🍋 Lemon Squeezy Configuration Check:', {
      hasApiKey: !!lemonSqueezyApiKey,
      apiKeyPrefix: apiKeyPrefix,
      isTestMode: isTestMode,
      isLiveMode: isLiveMode,
      hasStoreId: !!storeId,
      storeId: storeId ? String(storeId) : 'NOT SET',
      hasVariantId: !!variantId,
      variantId: variantId ? String(variantId) : 'NOT SET',
      nodeEnv: process.env.NODE_ENV,
    });

    if (!lemonSqueezyApiKey || !storeId || !variantId) {
      console.error('[Subscribe] ❌ Missing Lemon Squeezy configuration:', {
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

    // ⚠️ Test Mode 경고
    if (process.env.NODE_ENV !== 'production' && !isTestMode) {
      console.warn('[Subscribe] ⚠️ WARNING: Test mode environment but API key does not start with "ls_test_"');
    }

    // ID를 문자열로 명시적 변환 (Lemon Squeezy API는 문자열을 요구함)
    const storeIdString = String(storeId).trim();
    const variantIdString = String(variantId).trim();

    console.log('[Subscribe] 📤 Sending request to Lemon Squeezy with:', {
      storeId: storeIdString,
      variantId: variantIdString,
      testMode: process.env.NODE_ENV !== 'production',
    });

    // 결제 성공 후 리다이렉트 URL
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=success`;

    // Lemon Squeezy Checkout 생성 (try/catch로 감싸서 상세한 에러 캡처)
    let checkoutResponse: Response;
    let requestBody: any;
    
    try {
      requestBody = {
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
            redirect_url: successUrl,
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: storeIdString, // 문자열로 명시적 변환
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: variantIdString, // 문자열로 명시적 변환
              },
            },
          },
        },
      };

      console.log('[Subscribe] 📋 Request body (sanitized):', JSON.stringify({
        ...requestBody,
        data: {
          ...requestBody.data,
          relationships: requestBody.data.relationships,
        },
      }, null, 2));

      checkoutResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lemonSqueezyApiKey}`,
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
        },
        body: JSON.stringify(requestBody),
      });
    } catch (fetchError) {
      console.error('[Subscribe] ❌ Network error when calling Lemon Squeezy API:', fetchError);
      return NextResponse.json(
        {
          ok: false,
          error: 'Network error',
          details: fetchError instanceof Error ? fetchError.message : 'Failed to connect to Lemon Squeezy API',
        },
        { status: 500 }
      );
    }

    // 응답 상태 확인 및 상세한 에러 로깅
    if (!checkoutResponse.ok) {
      let errorData: any;
      let errorText: string = '';
      
      try {
        errorText = await checkoutResponse.text();
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        // JSON 파싱 실패 시 원본 텍스트 사용
        errorData = { raw_response: errorText };
      }

      // 🍋 상세한 에러 로깅 (터미널에서 확인 가능)
      console.error('[Subscribe] 🍋 Lemon Squeezy Error:', JSON.stringify({
        status: checkoutResponse.status,
        statusText: checkoutResponse.statusText,
        headers: Object.fromEntries(checkoutResponse.headers.entries()),
        error: errorData,
        request: {
          storeId: storeIdString,
          variantId: variantIdString,
          testMode: process.env.NODE_ENV !== 'production',
        },
      }, null, 2));

      // 에러 메시지 추출
      const errorMessage = 
        errorData?.errors?.[0]?.detail || 
        errorData?.errors?.[0]?.title ||
        errorData?.error?.message ||
        errorData?.error ||
        errorData?.raw_response ||
        'Unknown error from Lemon Squeezy API';

      // 에러 코드 추출
      const errorCode = 
        errorData?.errors?.[0]?.code ||
        errorData?.error?.code ||
        null;

      return NextResponse.json(
        { 
          ok: false, 
          error: 'Failed to create checkout',
          details: errorMessage,
          errorCode: errorCode,
          lemonSqueezyError: errorData, // 전체 에러 객체 반환 (디버깅용)
        },
        { status: checkoutResponse.status || 500 }
      );
    }

    let checkoutData: any;
    try {
      checkoutData = await checkoutResponse.json();
    } catch (parseError) {
      const responseText = await checkoutResponse.text();
      console.error('[Subscribe] ❌ Failed to parse successful response:', {
        status: checkoutResponse.status,
        responseText: responseText,
      });
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid response from Lemon Squeezy',
          details: 'Failed to parse response data',
        },
        { status: 500 }
      );
    }

    const checkoutUrl = checkoutData.data?.attributes?.url;

    if (!checkoutUrl) {
      console.error('[Subscribe] ❌ No checkout URL in response:', JSON.stringify(checkoutData, null, 2));
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Failed to get checkout URL',
          details: 'Checkout was created but no URL was returned',
          response: checkoutData,
        },
        { status: 500 }
      );
    }

    console.log('[Subscribe] ✅ Checkout created successfully:', {
      checkoutUrl,
      variantId: variantIdString,
      storeId: storeIdString,
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
