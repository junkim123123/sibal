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
import { getAdminClient } from '@/lib/supabase/admin';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeChat();
  }, [projectId, sessionIdParam]);

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

      // 프로젝트 정보 가져오기 및 구독 확인
      const adminClient = getAdminClient();
      const { data: project, error: projectError } = await adminClient
        .from('projects')
        .select('name, manager_id, is_paid_subscription, user_id')
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

      // 구독 확인: is_paid_subscription이 false이면 결제 안내
      // Note: 컬럼이 없을 수 있으므로 null 체크 포함
      if (project.is_paid_subscription === false) {
        // 결제 안내 모달 또는 리다이렉트
        const shouldProceed = window.confirm(
          '이 프로젝트는 매니저 고용이 필요합니다. 결제 페이지로 이동하시겠습니까?'
        );
        
        if (shouldProceed) {
          // 결과 페이지로 이동하여 결제 모달 표시
          router.push(`/results?project_id=${projectId}`);
        } else {
          router.push('/dashboard');
        }
        return;
      }

      setProjectName(project.name);

      // 세션이 없으면 생성 또는 찾기
      if (!sessionId) {
        const finalSessionId = await loadOrCreateSession(projectId, user.id, project?.manager_id);
        setSessionId(finalSessionId);
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
      const adminClient = getAdminClient();

      // 기존 세션 찾기
      const { data: existingSession } = await adminClient
        .from('chat_sessions')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingSession) {
        return existingSession.id;
      }

      // 세션이 없고 매니저가 할당되어 있으면 세션 생성
      if (managerId) {
        const { data: newSession, error: sessionError } = await adminClient
          .from('chat_sessions')
          .insert({
            project_id: projectId,
            user_id: userId,
            manager_id: managerId,
            status: 'in_progress',
          })
          .select()
          .single();

        if (sessionError || !newSession) {
          console.error('[ClientChatPage] Failed to create session:', sessionError);
          return null;
        }

        return newSession.id;
      }

      return null;
    } catch (error) {
      console.error('[ClientChatPage] Failed to load/create session:', error);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!sessionId || !userId || !projectId) {
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
              : 'A manager has not been assigned to this project yet. Please wait for assignment.'
            }
          </p>
          <Link
            href="/dashboard?tab=messages"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard?tab=messages"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Messages
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{projectName}</h1>
          <p className="text-sm text-gray-500 mt-1">Chat with your manager</p>
        </div>

        {/* Chat Component */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[calc(100vh-12rem)]">
          <ManagerChat
            sessionId={sessionId}
            projectId={projectId}
            userId={userId}
            isManager={false}
            showQuickReplies={false}
          />
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

