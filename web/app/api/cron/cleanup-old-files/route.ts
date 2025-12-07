/**
 * Vercel Cron Job: Old Chat Files Cleanup
 * 
 * 6개월 이상 지난 채팅창의 이미지/파일을 자동으로 삭제합니다.
 * Vercel Cron Job으로 주기적으로 실행됩니다.
 * 
 * Cron 설정: vercel.json 또는 Vercel 대시보드에서 설정
 */

import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';

// 6개월 (정확히 180일)
const RETENTION_DAYS = 180;

export async function GET(req: Request) {
  try {
    // Vercel Cron Job 보안: Authorization 헤더 확인
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || process.env.CLEANUP_API_KEY;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminClient = getAdminClient();
    
    // Storage 접근을 위한 Supabase 클라이언트 (Service Role Key 사용)
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

    console.log(`[Cleanup Cron] Starting cleanup for files older than ${cutoffDate}`);

    // 6개월 이전의 파일이 포함된 메시지 조회
    const { data: oldFileMessages, error: queryError } = await adminClient
      .from('chat_messages')
      .select('id, file_url, file_name, created_at')
      .not('file_url', 'is', null)
      .lt('created_at', cutoffDate)
      .order('created_at', { ascending: true });

    if (queryError) {
      console.error('[Cleanup Cron] Failed to query old file messages:', queryError);
      return NextResponse.json(
        { ok: false, error: 'Failed to query old files' },
        { status: 500 }
      );
    }

    if (!oldFileMessages || oldFileMessages.length === 0) {
      console.log('[Cleanup Cron] No old files to delete');
      return NextResponse.json({
        ok: true,
        message: 'No old files to delete',
        deletedFromStorage: 0,
        deletedFromDB: 0,
        totalProcessed: 0,
      });
    }

    console.log(`[Cleanup Cron] Found ${oldFileMessages.length} old file messages to process`);

    let deletedFromStorage = 0;
    let deletedFromDB = 0;
    const errors: string[] = [];

    // 각 파일 처리
    for (const message of oldFileMessages) {
      try {
        // Storage에서 파일 경로 추출 및 삭제
        if (message.file_url) {
          const filePath = extractFilePathFromUrl(message.file_url);
          
          if (filePath) {
            // Supabase Storage에서 파일 삭제
            const { error: storageError } = await supabase.storage
              .from('chat-files')
              .remove([filePath]);

            if (storageError) {
              // 파일이 이미 삭제되었거나 존재하지 않는 경우는 정상
              if (!storageError.message?.includes('not found')) {
                console.error(`[Cleanup Cron] Failed to delete file ${filePath}:`, storageError);
                errors.push(`Storage deletion failed for ${filePath}`);
              }
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
          console.error(`[Cleanup Cron] Failed to update message ${message.id}:`, updateError);
          errors.push(`DB update failed for message ${message.id}`);
        } else {
          deletedFromDB++;
        }
      } catch (error) {
        console.error(`[Cleanup Cron] Error processing message ${message.id}:`, error);
        errors.push(`Error processing message ${message.id}`);
      }
    }

    console.log(`[Cleanup Cron] Cleanup completed: ${deletedFromStorage} files from storage, ${deletedFromDB} DB records updated`);

    return NextResponse.json({
      ok: true,
      message: 'Cleanup completed',
      deletedFromStorage,
      deletedFromDB,
      totalProcessed: oldFileMessages.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // 최대 10개만 반환
      errorCount: errors.length,
    });
  } catch (error) {
    console.error('[Cleanup Cron] Unexpected error:', error);
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
 * 
 * 예시 URL 형식:
 * - https://xxx.supabase.co/storage/v1/object/public/chat-files/user-id/session-id/timestamp-filename
 * - https://xxx.supabase.co/storage/v1/object/sign/chat-files/user-id/session-id/timestamp-filename?token=...
 */
function extractFilePathFromUrl(url: string): string | null {
  try {
    // URL에서 쿼리 파라미터 제거
    const urlWithoutQuery = url.split('?')[0];
    
    // Supabase Storage URL 패턴 매칭
    // 형식: .../chat-files/path/to/file
    const patterns = [
      /chat-files\/(.+)$/,  // 공개 URL
      /\/chat-files\/(.+)$/, // 다른 형식
    ];

    for (const pattern of patterns) {
      const match = urlWithoutQuery.match(pattern);
      if (match && match[1]) {
        // URL 디코딩 후 반환
        return decodeURIComponent(match[1]);
      }
    }

    // 직접 경로인 경우 (예: user-id/session-id/file.jpg)
    if (url.includes('/') && !url.startsWith('http')) {
      return url;
    }

    return null;
  } catch (error) {
    console.error('[Cleanup Cron] Failed to extract file path from URL:', url, error);
    return null;
  }
}

