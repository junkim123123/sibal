/**
 * Client Chat Page
 * 
 * 클라이언트가 매니저와 실시간으로 소통하는 채팅 페이지
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ManagerChat } from '@/components/ManagerChat';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';

function ClientChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('project_id');
  const sessionIdParam = searchParams.get('session_id');
  
  const [sessionId, setSessionId] = useState<string | null>(sessionIdParam);
  const [userId, setUserId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      initializeChat();
    }
  }, [projectId, sessionIdParam]);

  // 프로젝트의 manager_id가 변경되었을 때 세션 업데이트
  useEffect(() => {
    if (sessionId && project?.manager_id) {
      updateSessionIfNeeded(sessionId, project.manager_id);
    }
  }, [project?.manager_id, sessionId]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      if (!projectId) {
        router.push('/dashboard');
        return;
      }

      // 프로젝트 정보 가져오기 (클라이언트에서는 createClient 사용)
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('name, manager_id, user_id, status')
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        console.error('[ClientChatPage] Project not found:', projectError);
        router.push('/dashboard');
        return;
      }

      // 프로젝트 소유권 확인
      if (project.user_id !== user.id) {
        router.push('/dashboard');
        return;
      }

      setProjectName(project.name);
      setProject(project); // 프로젝트 정보 저장 (매니저 배당 상태 확인용)

      // 세션이 없으면 생성 또는 찾기
      // 매니저가 없어도 채팅 세션 생성 가능 (매니저 배당 대기 중일 수 있음)
      if (!sessionId) {
        const finalSessionId = await loadOrCreateSession(projectId, user.id, project?.manager_id);
        if (finalSessionId) {
          setSessionId(finalSessionId);
        } else {
          console.error('[ClientChatPage] Failed to create or load session, but continuing anyway');
          // 세션 생성 실패해도 계속 진행 (나중에 재시도 가능)
          // 대신 에러 메시지를 표시하지 않고 빈 세션으로 진행
        }
      } else {
        // 세션이 이미 있으면 manager_id 업데이트 확인
        await updateSessionIfNeeded(sessionId, project?.manager_id);
      }
    } catch (error) {
      console.error('[ClientChatPage] Initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrCreateSession = async (
    projectId: string,
    userId: string,
    managerId: string | null | undefined
  ): Promise<string | null> => {
    try {
      const supabase = createClient();

      console.log('[ClientChatPage] Loading or creating session:', { projectId, userId, managerId });

      // 기존 세션 찾기 (project_id로만 찾기 - manager_id가 업데이트되었을 수 있음)
      const { data: existingSession, error: findError } = await supabase
        .from('chat_sessions')
        .select('id, manager_id, status')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .in('status', ['open', 'in_progress'])
        .maybeSingle();

      if (findError) {
        console.error('[ClientChatPage] Error finding existing session:', findError);
        console.error('[ClientChatPage] Find error details:', JSON.stringify(findError, null, 2));
      }

      if (existingSession) {
        console.log('[ClientChatPage] Found existing session:', {
          id: existingSession.id,
          manager_id: existingSession.manager_id,
          status: existingSession.status,
        });
        
        // manager_id가 업데이트되었으면 세션 상태도 업데이트
        if (managerId && existingSession.manager_id !== managerId) {
          const { error: updateError } = await supabase
            .from('chat_sessions')
            .update({
              manager_id: managerId,
              status: 'in_progress',
            })
            .eq('id', existingSession.id);

          if (updateError) {
            console.warn('[ClientChatPage] Failed to update session manager_id:', updateError);
          } else {
            console.log('[ClientChatPage] Updated session manager_id');
          }
        }
        
        return existingSession.id;
      }

      console.log('[ClientChatPage] No existing session found, creating new one...');

      // 세션이 없으면 생성 (매니저가 없어도 생성 가능 - 매니저 배당 대기 중일 수 있음)
      // 매니저가 있으면 manager_id 할당, 없으면 null로 생성
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          project_id: projectId,
          user_id: userId,
          manager_id: managerId || null, // 매니저가 없어도 세션 생성
          status: managerId ? 'in_progress' : 'open', // 매니저가 없으면 'open' 상태
        })
        .select()
        .single();

      if (sessionError) {
        console.error('[ClientChatPage] Failed to create session:', sessionError);
        console.error('[ClientChatPage] Session error details:', JSON.stringify(sessionError, null, 2));
        console.error('[ClientChatPage] Session error code:', sessionError.code);
        console.error('[ClientChatPage] Session error message:', sessionError.message);
        return null;
      }

      if (!newSession) {
        console.error('[ClientChatPage] Session created but no data returned');
        return null;
      }

      console.log('[ClientChatPage] Successfully created session:', newSession.id);
      return newSession.id;
    } catch (error) {
      console.error('[ClientChatPage] Exception in loadOrCreateSession:', error);
      if (error instanceof Error) {
        console.error('[ClientChatPage] Error message:', error.message);
        console.error('[ClientChatPage] Error stack:', error.stack);
      }
      return null;
    }
  };

  const updateSessionIfNeeded = async (currentSessionId: string, managerId: string | null | undefined) => {
    try {
      const supabase = createClient();
      
      // 현재 세션 정보 확인
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('manager_id, status')
        .eq('id', currentSessionId)
        .single();

      if (sessionError || !session) {
        console.warn('[ClientChatPage] Failed to load session for update:', sessionError);
        return;
      }

      // manager_id가 업데이트되었으면 세션도 업데이트
      if (managerId && session.manager_id !== managerId) {
        const { error: updateError } = await supabase
          .from('chat_sessions')
          .update({
            manager_id: managerId,
            status: 'in_progress',
          })
          .eq('id', currentSessionId);

        if (updateError) {
          console.warn('[ClientChatPage] Failed to update session manager_id:', updateError);
        } else {
          console.log('[ClientChatPage] Updated session manager_id to:', managerId);
        }
      }
    } catch (error) {
      console.error('[ClientChatPage] Error updating session:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  // 세션이 없어도 프로젝트와 사용자가 있으면 채팅 화면 표시 (세션은 나중에 생성 가능)
  if (!userId || !projectId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chat not available
          </h2>
          <p className="text-gray-600 mb-6">
            {!projectId 
              ? 'Project not found. Please select a project from the dashboard.'
              : 'Unable to initialize chat. Please try again or contact support.'
            }
          </p>
          <Link
            href="/dashboard?tab=orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // 세션이 없어도 채팅 화면 표시 (세션은 나중에 생성 가능)
  // 단, 세션 생성 중이면 로딩 표시
  if (!sessionId && isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard?tab=orders"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Active Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{projectName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {project?.manager_id 
              ? 'Chat with your manager' 
              : '⏰ Manager will be assigned within 24 hours. You can send messages now.'
            }
          </p>
        </div>

        {/* Chat Component */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[calc(100vh-12rem)]">
          {sessionId ? (
            <ManagerChat
              sessionId={sessionId}
              projectId={projectId}
              userId={userId}
              isManager={false}
              showQuickReplies={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Setting up chat session...</p>
                <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      }
    >
      <ClientChatContent />
    </Suspense>
  );
}

