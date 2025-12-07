/**
 * Lemon Squeezy Webhook Handler
 * 
 * 결제 완료 시 사용자 역할을 자동으로 'pro'로 업데이트합니다.
 * 
 * 보안 우선순위:
 * 1. HMAC 서명 검증 (최우선) - X-Signature 헤더와 LEMON_SQUEEZY_WEBHOOK_SECRET 사용
 * 2. 이벤트 타입 확인 (order_created, subscription_created)
 * 3. 결제 상태 확인 (paid, active)
 * 4. DB 업데이트 (profiles.role → 'pro')
 */

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * Lemon Squeezy 웹훅 HMAC 서명 검증
 * 
 * Lemon Squeezy는 요청 본문 전체를 HMAC-SHA256으로 서명합니다.
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // HMAC-SHA256으로 서명 생성
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    // 서명 비교 (타이밍 공격 방지)
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (error) {
    console.error('[Webhook] Signature verification error:', error);
    return false;
  }
}

/**
 * POST /api/payment/webhook
 * 
 * Lemon Squeezy에서 결제 완료 이벤트를 받아 사용자 역할을 업데이트합니다.
 */
export async function POST(req: Request) {
  try {
    // ============================================================================
    // [1. 최우선 보안 검증: HMAC 서명 검증]
    // ============================================================================
    
    // 1-1. Raw body 가져오기 (서명 검증을 위해 JSON 파싱 전에 필요)
    let rawBody: string;
    try {
      rawBody = await req.text();
    } catch (error) {
      console.error('[Webhook] Failed to read request body:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to read request body' },
        { status: 400 }
      );
    }
    
    // 1-2. X-Signature 헤더 확인 (대소문자 구분 없음)
    const headersList = await headers();
    const signature = headersList.get('x-signature') || headersList.get('X-Signature');
    
    if (!signature) {
      console.warn('[Webhook] Missing X-Signature header - Unauthorized access attempt');
      return NextResponse.json(
        { ok: false, error: 'Missing signature header' },
        { status: 401 }
      );
    }
    
    // 1-3. Webhook Secret 환경 변수 확인
    const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('[Webhook] LEMON_SQUEEZY_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { ok: false, error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // 1-4. 서명 형식 파싱
    // Lemon Squeezy 서명 형식: "sha256=<hex_signature>" 또는 단순히 hex 문자열
    let signatureValue = signature;
    if (signature.includes('=')) {
      const signatureParts = signature.split('=');
      if (signatureParts[0] === 'sha256' && signatureParts[1]) {
        signatureValue = signatureParts[1];
      }
    }

    // 1-5. HMAC 서명 검증 (최우선 보안 체크)
    // 검증 실패 시 즉시 401 Unauthorized 반환
    const isValidSignature = verifyWebhookSignature(rawBody, signatureValue, webhookSecret);
    
    if (!isValidSignature) {
      console.warn('[Webhook] Invalid HMAC signature - Potential security threat');
      return NextResponse.json(
        { ok: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // 보안 검증 통과 후에만 JSON 파싱 진행
    console.log('[Webhook] Security verification passed');
    
    // ============================================================================
    // [2. 이벤트 데이터 파싱 및 검증]
    // ============================================================================
    
    let eventData;
    try {
      eventData = JSON.parse(rawBody);
    } catch (error) {
      console.error('[Webhook] Failed to parse JSON payload:', error);
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // ============================================================================
    // [3. 이벤트 타입 확인 및 처리]
    // ============================================================================
    
    const eventType = eventData.meta?.event_name;
    const data = eventData.data;

    console.log('[Webhook] Received event:', eventType);

    // 처리할 이벤트: order_created, subscription_created
    if (eventType !== 'order_created' && eventType !== 'subscription_created') {
      // 다른 이벤트는 무시하되 성공 응답 반환 (중복 재시도 방지)
      return NextResponse.json(
        { ok: true, message: 'Event ignored' },
        { status: 200 }
      );
    }

    // ============================================================================
    // [4. 결제 상태 확인]
    // ============================================================================
    
    const status = data?.attributes?.status;
    
    // order_created: 'paid' 체크
    // subscription_created: 'active' 체크
    const isValidStatus = 
      (eventType === 'order_created' && status === 'paid') ||
      (eventType === 'subscription_created' && status === 'active');

    if (!isValidStatus) {
      console.log('[Webhook] Order/Subscription not in paid/active status:', status);
      return NextResponse.json(
        { ok: true, message: 'Order not paid or subscription not active' },
        { status: 200 }
      );
    }

    // ============================================================================
    // [5. 사용자 ID 추출 (custom_data에서)]
    // ============================================================================
    
    let userId: string | null = null;

    // custom_data는 여러 위치에 있을 수 있음
    // 1. checkout URL에서 전달한 custom_data 확인
    if (data?.attributes?.custom_data?.user_id) {
      userId = data.attributes.custom_data.user_id;
    }

    // 2. meta.custom_data 확인 (Lemon Squeezy 문서 참조)
    if (!userId && eventData.meta?.custom_data?.user_id) {
      userId = eventData.meta.custom_data.user_id;
    }

    // 3. custom_price_variables 형식 (대체 방법)
    if (!userId && data?.attributes?.custom_price_variables?.user_id) {
      userId = data.attributes.custom_price_variables.user_id;
    }

    if (!userId) {
      console.warn('[Webhook] User ID not found in webhook payload');
      return NextResponse.json(
        { ok: false, error: 'User ID not found in custom_data' },
        { status: 400 }
      );
    }

    console.log('[Webhook] Updating user role to pro:', userId);

    // ============================================================================
    // [6. Supabase DB 업데이트: profiles.role → 'pro']
    // ============================================================================
    
    const adminClient = getAdminClient();
    
    // 프로필 업데이트 시도
    const { data: profile, error: updateError } = await adminClient
      .from('profiles')
      .update({ 
        role: 'pro',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('[Webhook] Failed to update user profile:', updateError);
      
      // 프로필이 없으면 생성 시도
      if (updateError.code === 'PGRST116' || updateError.message?.includes('No rows')) {
        // 프로필이 없는 경우 생성
        const { error: createError } = await adminClient
          .from('profiles')
          .insert({
            id: userId,
            email: data?.attributes?.user_email || eventData.meta?.customer_email || null,
            role: 'pro',
          });

        if (createError) {
          console.error('[Webhook] Failed to create user profile:', createError);
          return NextResponse.json(
            { ok: false, error: 'Failed to create user profile' },
            { status: 500 }
          );
        }
        
        console.log('[Webhook] Created new profile with pro role:', userId);
      } else {
        return NextResponse.json(
          { ok: false, error: 'Failed to update user profile' },
          { status: 500 }
        );
      }
    } else {
      console.log('[Webhook] Successfully updated user role to pro:', userId);
    }

    return NextResponse.json(
      { 
        ok: true, 
        message: 'User role updated to pro',
        user_id: userId,
        event_type: eventType,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Webhook] Unexpected error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      },
      { status: 500 }
    );
  }
}
