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

    // 처리할 이벤트: order_created, subscription_created, subscription_updated, subscription_expired, subscription_cancelled
    const handledEvents = [
      'order_created',
      'subscription_created',
      'subscription_updated',
      'subscription_expired',
      'subscription_cancelled',
    ];

    if (!handledEvents.includes(eventType)) {
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
    
    // 구독 취소/만료 이벤트는 상태와 관계없이 처리
    const isCancellationEvent = 
      eventType === 'subscription_expired' || 
      eventType === 'subscription_cancelled';
    
    // order_created: 'paid' 체크
    // subscription_created/updated: 'active' 체크
    const isValidStatus = 
      isCancellationEvent ||
      (eventType === 'order_created' && status === 'paid') ||
      ((eventType === 'subscription_created' || eventType === 'subscription_updated') && status === 'active');

    if (!isValidStatus) {
      console.log('[Webhook] Order/Subscription not in valid status:', status);
      return NextResponse.json(
        { ok: true, message: 'Order not paid or subscription not active' },
        { status: 200 }
      );
    }

    // ============================================================================
    // [5. 사용자 ID 및 프로젝트 ID 추출 (custom_data에서)]
    // ============================================================================
    
    let userId: string | null = null;
    let projectId: string | null = null;
    let subscriptionId: string | null = null;

    // subscription_id 추출
    if (data?.id) {
      subscriptionId = String(data.id);
    }

    // custom_data는 여러 위치에 있을 수 있음
    // 1. checkout URL에서 전달한 custom_data 확인
    if (data?.attributes?.custom_data) {
      userId = data.attributes.custom_data.user_id || null;
      projectId = data.attributes.custom_data.project_id || null;
    }

    // 2. meta.custom_data 확인 (Lemon Squeezy 문서 참조)
    if (!userId && eventData.meta?.custom_data?.user_id) {
      userId = eventData.meta.custom_data.user_id;
    }
    if (!projectId && eventData.meta?.custom_data?.project_id) {
      projectId = eventData.meta.custom_data.project_id;
    }

    // 3. checkout_data.custom 확인 (checkout 생성 시 전달한 데이터)
    if (data?.attributes?.checkout_data?.custom) {
      if (!userId && data.attributes.checkout_data.custom.user_id) {
        userId = data.attributes.checkout_data.custom.user_id;
      }
      if (!projectId && data.attributes.checkout_data.custom.project_id) {
        projectId = data.attributes.checkout_data.custom.project_id;
      }
    }

    // 4. custom_price_variables 형식 (대체 방법)
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

    console.log('[Webhook] Processing subscription event for user:', userId, 'project:', projectId);

    // ============================================================================
    // [6. Supabase DB 업데이트: has_active_subscription 관리]
    // ============================================================================
    
    const adminClient = getAdminClient();

    // 구독 취소/만료 이벤트 처리
    if (isCancellationEvent) {
      // 해당 사용자의 다른 활성 구독이 있는지 확인
      // (실제로는 Lemon Squeezy API를 호출해야 하지만, 여기서는 간단히 처리)
      // 웹훅에서 subscription_id를 받을 수 있다면, 해당 구독만 비활성화하고
      // 다른 활성 구독이 있는지 확인해야 합니다.
      
      // 현재는 단순화하여: 구독 취소 시 has_active_subscription을 false로 설정
      // 실제 운영 환경에서는 Lemon Squeezy API로 사용자의 모든 구독을 조회하여
      // 활성 구독이 하나도 없을 때만 false로 설정해야 합니다.
      
      const { error: updateError } = await adminClient
        .from('profiles')
        .update({ 
          has_active_subscription: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('[Webhook] Failed to update subscription status:', updateError);
        return NextResponse.json(
          { ok: false, error: 'Failed to update subscription status' },
          { status: 500 }
        );
      }

      console.log('[Webhook] Subscription cancelled/expired - has_active_subscription set to false');
      
      return NextResponse.json(
        { 
          ok: true, 
          message: 'Subscription status updated',
          user_id: userId,
          event_type: eventType,
        },
        { status: 200 }
      );
    }

    // 구독 생성/업데이트 이벤트 처리
    // 1. 유저 레벨: has_active_subscription을 true로 설정
    const { data: profile, error: updateError } = await adminClient
      .from('profiles')
      .update({ 
        has_active_subscription: true,
        role: 'pro', // 기존 로직 유지
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
            has_active_subscription: true,
          });

        if (createError) {
          console.error('[Webhook] Failed to create user profile:', createError);
          return NextResponse.json(
            { ok: false, error: 'Failed to create user profile' },
            { status: 500 }
          );
        }
        
        console.log('[Webhook] Created new profile with active subscription');
      } else {
        return NextResponse.json(
          { ok: false, error: 'Failed to update user profile' },
          { status: 500 }
        );
      }
    } else {
      console.log('[Webhook] Successfully updated user subscription status to active');
    }

    // 2. 프로젝트 레벨: 결제 완료 후 프로젝트 상태 업데이트 (project_id가 있는 경우)
    if (projectId) {
      // 프로젝트 현재 상태 확인
      const { data: currentProject } = await adminClient
        .from('projects')
        .select('id, status, manager_id')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (currentProject) {
        // 프로젝트 상태 업데이트: 'saved' 또는 'completed' → 'in_progress'
        // manager_id가 없으면 자동 할당을 위해 'in_progress'로만 변경 (관리자가 나중에 할당)
        const updateData: any = {
          is_paid_subscription: true,
          lemon_squeezy_subscription_id: subscriptionId,
          payment_status: 'paid',
          payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // 상태가 'saved' 또는 'completed'이고 manager_id가 없으면 'in_progress'로 변경
        if ((currentProject.status === 'saved' || currentProject.status === 'completed') && !currentProject.manager_id) {
          updateData.status = 'in_progress';
          updateData.dispatched_at = new Date().toISOString();
        }

        const { error: projectUpdateError } = await adminClient
          .from('projects')
          .update(updateData)
          .eq('id', projectId)
          .eq('user_id', userId); // 보안: 사용자 소유 프로젝트만 업데이트

        if (projectUpdateError) {
          console.error('[Webhook] Failed to update project subscription status:', projectUpdateError);
          // 프로젝트 업데이트 실패는 치명적이지 않으므로 계속 진행
        } else {
          console.log('[Webhook] Successfully updated project subscription status:', projectId, {
            newStatus: updateData.status,
            paymentStatus: 'paid',
          });

          // 3. 자동 메시지 전송: 결제 확인 메시지를 채팅방에 삽입
          try {
            // 채팅 세션 찾기 또는 생성
            let chatSessionId: string | null = null;

            // 기존 세션 확인
            const { data: existingSession } = await adminClient
              .from('chat_sessions')
              .select('id')
              .eq('project_id', projectId)
              .eq('user_id', userId)
              .maybeSingle();

            if (existingSession) {
              chatSessionId = existingSession.id;
            } else {
              // 세션이 없으면 생성
              const { data: newSession, error: sessionError } = await adminClient
                .from('chat_sessions')
                .insert({
                  project_id: projectId,
                  user_id: userId,
                  status: 'in_progress',
                })
                .select('id')
                .single();

              if (sessionError || !newSession) {
                console.error('[Webhook] Failed to create chat session:', sessionError);
              } else {
                chatSessionId = newSession.id;
              }
            }

            // 자동 메시지 삽입 (chat_messages 테이블 사용)
            // Note: chat_messages는 sender_id가 NOT NULL이므로, 시스템 메시지는 role='manager'로 설정
            if (chatSessionId) {
              // 시스템 메시지를 위해 사용자 ID를 sender_id로 사용 (RLS 우회를 위해 adminClient 사용)
              const { error: messageError } = await adminClient
                .from('chat_messages')
                .insert({
                  session_id: chatSessionId,
                  sender_id: userId, // 시스템 메시지이지만 sender_id는 필수이므로 사용자 ID 사용
                  role: 'manager', // 시스템 메시지는 manager 역할로 표시
                  content: 'System: Payment confirmed! ✅ We are assigning your expert manager. Please upload your product details/files here. Expect a response within 24 hours.',
                });

              if (messageError) {
                console.error('[Webhook] Failed to insert auto message:', messageError);
              } else {
                console.log('[Webhook] Successfully inserted auto confirmation message');
              }
            }
          } catch (messageError) {
            console.error('[Webhook] Error in auto message insertion:', messageError);
            // 메시지 삽입 실패는 치명적이지 않으므로 계속 진행
          }
        }
      }
    } else {
      console.warn('[Webhook] No project_id found in webhook payload - skipping project-level update');
    }

    return NextResponse.json(
      { 
        ok: true, 
        message: 'User subscription status updated',
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
