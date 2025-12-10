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
  const projectId = searchParams?.get('project_id') || null;
  const sessionIdParam = searchParams?.get('session_id') || null;
  
  const [sessionId, setSessionId] = useState<string | null>(sessionIdParam);
  const [userId, setUserId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(sessionIdParam);
  const [todoList, setTodoList] = useState<Array<{ id: string; task: string; status: 'pending' | 'completed'; requestedBy: string; requestedAt: string }>>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUserId(user.id);
      await loadChatSessions();
      
      if (projectId) {
        await initializeChat();
      } else {
        setIsLoading(false);
      }
    };
    
    init();
  }, [projectId, sessionIdParam]);

  // 채팅 세션 목록 로드
  const loadChatSessions = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // 사용자의 모든 채팅 세션 가져오기
      const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          project_id,
          manager_id,
          status,
          created_at,
          updated_at,
          projects!chat_sessions_project_id_fkey(
            id,
            name,
            manager_id
          ),
          profiles!chat_sessions_manager_id_fkey(
            id,
            name,
            email
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['open', 'in_progress'])
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('[ClientChatPage] Failed to load chat sessions:', error);
        return;
      }

      // 각 세션의 최근 메시지 가져오기
      const sessionsWithMessages = await Promise.all(
        (sessions || []).map(async (session) => {
          const { data: lastMessage } = await supabase
            .from('chat_messages')
            .select('content, created_at, sender_id')
            .eq('session_id', session.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...session,
            lastMessage: lastMessage?.content || null,
            lastMessageAt: lastMessage?.created_at || session.updated_at,
            managerName: (session.profiles as any)?.name || (session.profiles as any)?.email || 'Manager',
            projectName: (session.projects as any)?.name || 'Project',
          };
        })
      );

      setChatSessions(sessionsWithMessages);
      
      // 현재 선택된 세션 업데이트
      if (sessionIdParam) {
        setSelectedSession(sessionIdParam);
      } else if (projectId) {
        // project_id가 있으면 해당 프로젝트의 세션 찾기
        const currentSession = sessionsWithMessages.find(s => s.project_id === projectId);
        if (currentSession) {
          setSelectedSession(currentSession.id);
        }
      }
    } catch (error) {
      console.error('[ClientChatPage] Error loading chat sessions:', error);
    }
  };

  // To-Do 리스트 로드 (매니저가 요청한 작업들)
  const loadTodoList = async () => {
    if (!projectId) return;
    
    try {
      const supabase = createClient();
      
      // 프로젝트의 마일스톤에서 pending 상태인 작업들 가져오기
      const { data: projectData } = await supabase
        .from('projects')
        .select('milestones')
        .eq('id', projectId)
        .single();

      if (projectData?.milestones) {
        const milestones = Array.isArray(projectData.milestones) ? projectData.milestones : [];
        const todos = milestones
          .filter((m: any) => m.status === 'pending' || m.status === 'in_progress')
          .map((m: any, index: number) => ({
            id: `milestone-${index}`,
            task: m.title || m.task || 'Complete milestone',
            status: m.status === 'completed' ? 'completed' as const : 'pending' as const,
            requestedBy: 'Process Agent',
            requestedAt: m.date || new Date().toISOString(),
          }));
        
        setTodoList(todos);
      }
    } catch (error) {
      console.error('[ClientChatPage] Error loading todo list:', error);
    }
  };

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

      if (!projectId) {
        setIsLoading(false);
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
      
      // To-Do 리스트 로드
      await loadTodoList();
      
      // sessionId가 설정되면 selectedSession도 업데이트
      if (sessionId) {
        setSelectedSession(sessionId);
      }

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

  // project_id가 없으면 채팅 세션 목록 표시
  if (!userId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!projectId) {
    // 채팅 세션 목록 표시
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Agent Chat</h1>
            <p className="text-sm text-gray-500 mt-1">
              Chat with your sourcing agents and managers
            </p>
          </div>

          {chatSessions.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No active chats
              </h2>
              <p className="text-gray-600 mb-6">
                Start a new project to begin chatting with your agent.
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Start New Analysis
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chatSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/dashboard/chat?project_id=${session.project_id}&session_id=${session.id}`}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:border-gray-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {session.projectName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {session.managerName}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      session.status === 'in_progress' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {session.status === 'in_progress' ? 'Active' : 'Open'}
                    </span>
                  </div>
                  {session.lastMessage && (
                    <p className="text-sm text-gray-600 truncate mb-2">
                      {session.lastMessage}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {session.lastMessageAt 
                      ? new Date(session.lastMessageAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'No messages yet'
                    }
                  </p>
                </Link>
              ))}
            </div>
          )}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar: Chat Sessions List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sticky top-8">
              <div className="mb-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Link>
                <h2 className="text-lg font-semibold text-gray-900">Active Chats</h2>
              </div>
              <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {chatSessions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No active chats
                  </p>
                ) : (
                  chatSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/dashboard/chat?project_id=${session.project_id}&session_id=${session.id}`}
                    className={`block p-3 rounded-lg border transition-all ${
                      selectedSession === session.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {session.projectName}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-1">
                      {session.managerName}
                    </p>
                    {session.lastMessage && (
                      <p className="text-xs text-gray-600 truncate">
                        {session.lastMessage}
                      </p>
                    )}
                  </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content: Chat + To-Do List */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{projectName}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {project?.manager_id 
                  ? `Chat with ${chatSessions.find(s => s.project_id === projectId)?.managerName || 'your manager'}` 
                  : '⏰ Manager will be assigned within 24 hours. You can send messages now.'
                }
              </p>
            </div>

            {/* To-Do List (if any) */}
            {todoList.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Action Items</h2>
                <div className="space-y-3">
                  {todoList.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <input
                        type="checkbox"
                        id={`todo-${todo.id}`}
                        name={`todo-${todo.id}`}
                        checked={todo.status === 'completed'}
                        disabled
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        aria-label={`${todo.task} - ${todo.status === 'completed' ? 'Completed' : 'Pending'}`}
                      />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          todo.status === 'completed' 
                            ? 'text-gray-500 line-through' 
                            : 'text-gray-900'
                        }`}>
                          {todo.task}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Requested by {todo.requestedBy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Component */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[calc(100vh-16rem)]">
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

