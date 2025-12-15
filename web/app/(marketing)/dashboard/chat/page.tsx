/**
 * Client Chat Page
 * 
 * 클라이언트가 매니저와 실시간으로 소통하는 채팅 페이지
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { WhatsAppConnectCard } from '@/components/WhatsAppConnectCard';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ArrowLeft, MessageSquare, FileText, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function ClientChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams?.get('project_id') || null;
  const sessionIdParam = searchParams?.get('session_id') || null;
  
  const [sessionId, setSessionId] = useState<string | null>(sessionIdParam);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [project, setProject] = useState<any>(null);
  const [projectSpecs, setProjectSpecs] = useState<{ qty?: number | string; targetPrice?: number; port?: string; image?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(sessionIdParam);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState<number>(0);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUserId(user.id);
      setUserEmail(user.email || null);
      
      // 데스크탑 알림 권한 요청 (채팅 페이지 진입 시)
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            console.log('[ClientChatPage] Notification permission granted');
          }
        });
      }
      
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

  // 채팅 세션 클릭 핸들러
  const handleSessionClick = (session: any) => {
    setSelectedSession(session.id);
    router.push(`/dashboard/chat?project_id=${session.project_id}&session_id=${session.id}`);
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
        .select('name, manager_id, user_id, status, milestones, current_milestone_index, analysis_data')
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
      
      // 마일스톤 정보 로드
      if (project.milestones && Array.isArray(project.milestones)) {
        setMilestones(project.milestones);
        setCurrentMilestoneIndex(project.current_milestone_index || 0);
      }
      
      // 프로젝트 스펙 정보 추출 (analysis_data에서)
      if (project.analysis_data) {
        try {
          const analysisData = typeof project.analysis_data === 'string' 
            ? JSON.parse(project.analysis_data) 
            : project.analysis_data;
          
          const answers = analysisData.answers || analysisData.userContext || {};
          const specs = {
            qty: answers.volume || answers.quantity,
            targetPrice: answers.target_price || answers.price,
            port: answers.source_country || answers.origin,
            // image는 나중에 추가 가능
          };
          setProjectSpecs(specs);
        } catch (e) {
          console.error('[ClientChatPage] Failed to parse analysis_data:', e);
        }
      }
      
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
          
          // 매니저가 없으면 AI 비서 환영 메시지 전송
          if (!project?.manager_id) {
            await sendWelcomeMessage(finalSessionId, user.id);
          }
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

  // AI 비서 환영 메시지 전송
  const sendWelcomeMessage = async (sessionId: string, userId: string) => {
    try {
      // 이미 환영 메시지가 있는지 확인
      const supabase = createClient();
      const { data: existingMessages } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('session_id', sessionId)
        .eq('role', 'system')
        .limit(1);

      if (existingMessages && existingMessages.length > 0) {
        // 이미 환영 메시지가 있으면 스킵
        return;
      }

      // API를 통해 시스템 메시지 전송
      const response = await fetch('/api/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          role: 'system',
          content: "안녕하세요! 프로젝트 접수가 완료되었습니다. 담당 매니저가 배정되기 전까지, 혹시 **제품 사양서(Spec Sheet)**나 **참고 이미지**가 있다면 여기에 미리 올려주시겠어요? 파일을 업로드하시면 매니저가 더 빠르게 견적을 준비할 수 있습니다. 📎",
        }),
      });

      if (!response.ok) {
        console.error('[ClientChatPage] Failed to send welcome message');
      }
    } catch (error) {
      console.error('[ClientChatPage] Error sending welcome message:', error);
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition-colors"
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
                        Dedicated Expert
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
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      {/* 3-Column Layout */}
      <div className="flex-1 grid grid-cols-12 h-[calc(100vh-64px)] overflow-hidden">
        {/* Left: Chat List (col-span-3) - 모바일에서는 숨김 */}
        <div className="hidden lg:flex col-span-3 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Active Chats</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
            {chatSessions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No active chats
              </p>
            ) : (
              chatSessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => handleSessionClick(session)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedSession === session.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-white bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <h3 className="font-medium text-sm text-gray-900 truncate flex-1">
                      {session.projectName}
                    </h3>
                    {session.lastMessageAt && (
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {(() => {
                          try {
                            const date = new Date(session.lastMessageAt);
                            const now = new Date();
                            const diffMs = now.getTime() - date.getTime();
                            const diffMins = Math.floor(diffMs / 60000);
                            const diffHours = Math.floor(diffMs / 3600000);
                            const diffDays = Math.floor(diffMs / 86400000);
                            
                            if (diffMins < 1) return 'now';
                            if (diffMins < 60) return `${diffMins}m`;
                            if (diffHours < 24) return `${diffHours}h`;
                            if (diffDays < 7) return `${diffDays}d`;
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          } catch {
                            return '';
                          }
                        })()}
                      </span>
                    )}
                  </div>
                  {session.lastMessage ? (
                    <p className="text-xs text-gray-600 truncate mb-1">
                      {session.lastMessage}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic truncate mb-1">
                      Start a conversation
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Center: Live Chat Area (col-span-6) - Main */}
        <div className="col-span-12 lg:col-span-6 bg-white flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 truncate">{projectName}</h1>
            
            {/* Project Summary Bar - Pill Badges */}
            {projectSpecs && (projectSpecs.qty || projectSpecs.targetPrice || projectSpecs.port) && (
              <div className="flex items-center gap-2 sm:gap-3 mb-2 overflow-x-auto flex-wrap">
                {projectSpecs.image && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                    <Image
                      src={projectSpecs.image}
                      alt={projectName}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                )}
                {projectSpecs.qty && (
                  <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                    <Package className="w-3 h-3 flex-shrink-0" />
                    <span className="font-medium">Qty:</span>
                    <span>
                      {(() => {
                        const qty = projectSpecs.qty;
                        if (typeof qty === 'string') {
                          const qtyLower = qty.toLowerCase();
                          if (qtyLower.includes('no idea') || qtyLower.includes('not specified') || qtyLower === 'tbd') {
                            return 'TBD';
                          }
                          return qty;
                        } else if (typeof qty === 'number') {
                          return qty.toLocaleString();
                        }
                        return String(qty);
                      })()}
                    </span>
                  </span>
                )}
                {projectSpecs.targetPrice && (
                  <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                    <span className="font-medium">Target:</span>
                    <span>${projectSpecs.targetPrice}</span>
                  </span>
                )}
                {projectSpecs.port && (
                  <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                    <span className="font-medium">Port:</span>
                    <span>{projectSpecs.port}</span>
                  </span>
                )}
              </div>
            )}
            
            <p className="text-[10px] sm:text-xs text-gray-500">
              {project?.manager_id 
                ? `Connect with your Dedicated Expert via WhatsApp` 
                : 'Your Dedicated Expert will be assigned within 1 business day.'
              }
            </p>
          </div>

          {/* Chat Body - Flex-1 to fill remaining space */}
          <div className="flex-1 overflow-hidden">
            {projectId ? (
              <WhatsAppConnectCard
                projectId={projectId}
                projectName={projectName}
                managerId={project?.manager_id || null}
                clientName={userId ? undefined : undefined}
                userEmail={userEmail || undefined}
              />
            ) : (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading project information...</p>
                  <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Project Context / Action Items (col-span-3) - 모바일에서는 숨김 */}
        <div className="hidden lg:block col-span-3 bg-gray-50 border-l border-gray-200 overflow-y-auto">
          <div className="p-3 sm:p-4">
            {milestones.length > 0 ? (
              <>
                {/* Progress Bar */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xs sm:text-sm font-semibold text-gray-900">Project Progress</h2>
                    <span className="text-[10px] sm:text-xs font-medium text-gray-600">
                      {Math.round((milestones.filter((m: any) => m.status === 'completed').length / milestones.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#008080] transition-all duration-300"
                      style={{ 
                        width: `${(milestones.filter((m: any) => m.status === 'completed').length / milestones.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative">
                  {/* Timeline Line - Dynamic color based on completed milestones */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5">
                    {/* Calculate how many milestones are completed */}
                    {(() => {
                      const completedCount = milestones.filter((m: any) => m.status === 'completed').length;
                      const totalMilestones = milestones.length;
                      const completedPercentage = totalMilestones > 0 ? (completedCount / totalMilestones) * 100 : 0;
                      const completedHeight = completedPercentage > 0 ? `${completedPercentage}%` : '0%';
                      
                      return (
                        <>
                          {/* Green line for completed milestones */}
                          <div 
                            className="absolute top-0 w-full bg-teal-500 transition-all duration-300"
                            style={{ height: completedHeight }}
                          />
                          {/* Gray line for remaining milestones */}
                          <div 
                            className="absolute w-full bg-gray-200 transition-all duration-300"
                            style={{ top: completedHeight, bottom: 0 }}
                          />
                        </>
                      );
                    })()}
                  </div>
                  
                  <div className="space-y-4 sm:space-y-5">
                    {milestones.map((milestone: any, index: number) => {
                      const isCompleted = milestone.status === 'completed';
                      const isInProgress = milestone.status === 'in_progress';
                      const isCurrent = index === currentMilestoneIndex && !isCompleted;
                      
                      return (
                        <div key={milestone.index || index} className="relative flex items-start gap-3 sm:gap-4">
                          {/* Timeline Dot */}
                          <div className={`relative z-10 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all flex-shrink-0 ${
                            isCompleted
                              ? 'bg-teal-500 border-teal-500'
                              : isInProgress || isCurrent
                              ? 'bg-[#008080] border-[#008080] animate-pulse'
                              : 'bg-white border-gray-300'
                          }`}>
                            {isCompleted ? (
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <div className={`w-3 h-3 rounded-full ${
                                isInProgress || isCurrent ? 'bg-white' : 'bg-gray-400'
                              }`} />
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0 pt-0.5 sm:pt-1">
                            <p className={`text-xs sm:text-sm font-medium ${
                              isCompleted 
                                ? 'text-gray-500 line-through' 
                                : isInProgress || isCurrent
                                ? 'text-[#008080] font-semibold'
                                : 'text-gray-900'
                            }`}>
                              {milestone.title}
                            </p>
                            {milestone.date && (
                              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                {new Date(milestone.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            )}
                            {!milestone.date && (isInProgress || isCurrent) && (
                              <p className="text-[10px] sm:text-xs text-[#008080] mt-1 font-medium">
                                In Progress
                              </p>
                            )}
                            {!milestone.date && !isCompleted && !isInProgress && !isCurrent && (
                              <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                                Est: {new Date(Date.now() + (index - currentMilestoneIndex) * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            )}
                            {milestone.title === 'Samples Ordered' && isCompleted && (
                              <button className="mt-2 text-[10px] sm:text-xs text-[#008080] hover:underline flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                View Invoice
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No milestones</p>
                <p className="text-xs text-gray-400 mt-1">Project milestones will appear here</p>
              </div>
            )}
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

