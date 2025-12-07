/**
 * Old Chat Files Cleanup API
 * 
 * 6개월 이상 지난 채팅창의 이미지/파일을 자동으로 삭제합니다.
 * 텍스트 메시지는 유지하고, 파일만 삭제합니다.
 */

import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';

// 6개월 (대략 180일)
const RETENTION_DAYS = 180;

export async function POST(req: Request) {
  try {
    // 보안: API 키 확인 (환경 변수에 CLEANUP_API_KEY 설정)
    const authHeader = req.headers.get('authorization');
    const expectedKey = process.env.CLEANUP_API_KEY || 'cleanup-secret-key';
    
    if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminClient = getAdminClient();
    
    // Storage 접근을 위한 Supabase 클라이언트 생성
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { ok: false, error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 6개월 이전 날짜 계산
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - RETENTION_DAYS);
    const cutoffDate = sixMonthsAgo.toISOString();

    // 6개월 이전의 파일이 포함된 메시지 조회
    const { data: oldFileMessages, error: queryError } = await adminClient
      .from('chat_messages')
      .select('id, file_url, file_name, created_at')
      .not('file_url', 'is', null)
      .lt('created_at', cutoffDate)
      .order('created_at', { ascending: true });

    if (queryError) {
      console.error('[Cleanup] Failed to query old file messages:', queryError);
      return NextResponse.json(
        { ok: false, error: 'Failed to query old files' },
        { status: 500 }
      );
    }

    if (!oldFileMessages || oldFileMessages.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No old files to delete',
        deletedCount: 0,
      });
    }

    let deletedFromStorage = 0;
    let deletedFromDB = 0;
    const errors: string[] = [];

    // 각 파일 처리
    for (const message of oldFileMessages) {
      try {
        // Storage에서 파일 경로 추출
        if (message.file_url) {
          const filePath = extractFilePathFromUrl(message.file_url);
          
          if (filePath) {
            // Supabase Storage에서 파일 삭제
            const { error: storageError } = await supabase.storage
              .from('chat-files')
              .remove([filePath]);

            if (storageError) {
              console.error(`[Cleanup] Failed to delete file ${filePath}:`, storageError);
              errors.push(`Storage deletion failed for ${filePath}`);
            } else {
              deletedFromStorage++;
            }
          }
        }

        // DB에서 file_url, file_name, file_type만 null로 업데이트 (메시지는 유지)
        const { error: updateError } = await adminClient
          .from('chat_messages')
          .update({
            file_url: null,
            file_name: null,
            file_type: null,
          })
          .eq('id', message.id);

        if (updateError) {
          console.error(`[Cleanup] Failed to update message ${message.id}:`, updateError);
          errors.push(`DB update failed for message ${message.id}`);
        } else {
          deletedFromDB++;
        }
      } catch (error) {
        console.error(`[Cleanup] Error processing message ${message.id}:`, error);
        errors.push(`Error processing message ${message.id}`);
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'Cleanup completed',
      deletedFromStorage,
      deletedFromDB,
      totalProcessed: oldFileMessages.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[Cleanup] Unexpected error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      },
      { status: 500 }
    );
  }
}

/**
 * Supabase Storage URL에서 파일 경로 추출
 * 예: https://xxx.supabase.co/storage/v1/object/public/chat-files/user-id/session-id/timestamp-filename
 * -> user-id/session-id/timestamp-filename
 */
function extractFilePathFromUrl(url: string): string | null {
  try {
    // Supabase Storage 공개 URL 형식에서 경로 추출
    const match = url.match(/chat-files\/(.+)$/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    
    // 직접 경로인 경우 (예: user-id/session-id/file.jpg)
    if (url.includes('/') && !url.startsWith('http')) {
      return url;
    }
    
    return null;
  } catch (error) {
    console.error('[Cleanup] Failed to extract file path from URL:', url, error);
    return null;
  }
}

// GET 요청도 허용 (테스트용)
export async function GET(req: Request) {
  try {
    const adminClient = getAdminClient();
    
    // 6개월 이전 날짜 계산
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - RETENTION_DAYS);
    const cutoffDate = sixMonthsAgo.toISOString();

    // 통계만 조회 (실제 삭제는 하지 않음)
    const { count, error } = await adminClient
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .not('file_url', 'is', null)
      .lt('created_at', cutoffDate);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Statistics (no deletion performed)',
      oldFilesCount: count || 0,
      cutoffDate,
      retentionDays: RETENTION_DAYS,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      },
      { status: 500 }
    );
  }
}

