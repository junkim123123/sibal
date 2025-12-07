/**
 * Subscribe API Route
 * 
 * Lemon Squeezy 구독 체크아웃 URL을 생성합니다.
 * 결제 성공 후 /dashboard?payment=success로 리다이렉트됩니다.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY || process.env.LEMON_SQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID || process.env.LEMON_SQUEEZY_STORE_ID;
    const variantId = process.env.LEMON_SQUEEZY_SUBSCRIPTION_VARIANT_ID || 
                      process.env.LEMONSQUEEZY_SUBSCRIPTION_VARIANT_ID || 
                      process.env.NEXT_PUBLIC_LEMONSQUEEZY_SUBSCRIPTION_VARIANT_ID ||
                      process.env.NEXT_PUBLIC_LEMON_SQUEEZY_SUBSCRIPTION_VARIANT_ID;

    if (!apiKey || !storeId || !variantId) {
      return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
    }

    const body = await request.json();
    const { projectId, project_id } = body;
    const finalProjectId = projectId || project_id;

    // 결제 성공 후 리다이렉트 URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   process.env.NEXT_PUBLIC_SITE_URL || 
                   'http://localhost:3000';
    const successUrl = `${appUrl}/dashboard?payment=success`;

    // 🔥 여기가 문제였습니다. type은 반드시 복수형(stores, variants)이어야 합니다.
    const payload = {
      data: {
        type: "checkouts",
        attributes: {
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
              project_id: finalProjectId || null,
            },
          },
          preview: false,
          test_mode: process.env.NODE_ENV !== 'production',
          redirect_url: successUrl,
        },
        relationships: {
          store: {
            data: {
              type: "stores", // "store" (X) -> "stores" (O)
              id: storeId.toString()
            }
          },
          variant: {
            data: {
              type: "variants", // "variant" (X) -> "variants" (O)
              id: variantId.toString()
            }
          }
        }
      }
    };

    console.log("🍋 Sending Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("🍋 Error:", JSON.stringify(result, null, 2));
      // 에러 메시지를 그대로 반환해서 확인
      return NextResponse.json({ 
        ok: false,
        error: result.errors?.[0]?.detail || "Failed to create checkout",
        details: result.errors?.[0]?.detail || result.errors?.[0]?.title,
        lemonSqueezyError: result
      }, { status: response.status });
    }

    const checkoutUrl = result.data?.attributes?.url;

    if (!checkoutUrl) {
      console.error("🍋 No checkout URL in response:", JSON.stringify(result, null, 2));
      return NextResponse.json({ 
        ok: false,
        error: "Failed to get checkout URL",
        details: "Checkout was created but no URL was returned"
      }, { status: 500 });
    }

    console.log("🍋 ✅ Checkout created successfully:", checkoutUrl);

    return NextResponse.json({ 
      ok: true,
      checkout_url: checkoutUrl 
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ 
      ok: false,
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
