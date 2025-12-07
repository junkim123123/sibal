/**
 * Client Messages List Component
 * 
 * 클라이언트가 매니저와 소통할 수 있는 프로젝트별 채팅 세션 목록
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getAdminClient } from '@/lib/supabase/admin';
import { MessageSquare, ChevronRight, Loader2, Clock } from 'lucide-react';

interface ProjectChat {
  projectId: string;
  projectName: string;
  sessionId: string | null;
  managerName: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  status: string;
}

interface ClientMessagesListProps {
  userId: string;
}

export function ClientMessagesList({ userId }: ClientMessagesListProps) {
  const [projects, setProjects] = useState<ProjectChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadProjectsWithChats();
  }, [userId]);

  const loadProjectsWithChats = async () => {
    try {
      setIsLoading(true);
      const adminClient = getAdminClient();

      // 사용자의 모든 프로젝트 가져오기 (매니저가 할당된 것만)
      const { data: projectsData, error: projectsError } = await adminClient
        .from('projects')
        .select(`
          id,
          name,
          status,
          manager_id,
          profiles!projects_manager_id_fkey(
            name,
            email
          )
        `)
        .eq('user_id', userId)
        .not('manager_id', 'is', null)
        .order('updated_at', { ascending: false });

      if (projectsError || !projectsData) {
        console.error('[ClientMessagesList] Failed to load projects:', projectsError);
        return;
      }

      // 각 프로젝트의 채팅 세션 정보 가져오기
      const projectsWithChats: ProjectChat[] = [];

      for (const project of projectsData) {
        // 채팅 세션 찾기
        const { data: session } = await adminClient
          .from('chat_sessions')
          .select('id')
          .eq('project_id', project.id)
          .eq('user_id', userId)
          .maybeSingle();

        let lastMessage: string | null = null;
        let lastMessageAt: string | null = null;
        let unreadCount = 0;

        if (session) {
          // 최근 메시지 가져오기
          const { data: messages } = await adminClient
            .from('chat_messages')
            .select('content, created_at, sender_id')
            .eq('session_id', session.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (messages) {
            lastMessage = messages.content?.substring(0, 100) || null;
            lastMessageAt = messages.created_at || null;

            // 읽지 않은 메시지 수 (매니저가 보낸 메시지만)
            const { count } = await adminClient
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', session.id)
              .neq('sender_id', userId)
              .is('read_at', null);

            unreadCount = count || 0;
          }
        }

        projectsWithChats.push({
          projectId: project.id,
          projectName: project.name,
          sessionId: session?.id || null,
          managerName: (project.profiles as any)?.name || (project.profiles as any)?.email || 'Manager',
          lastMessage,
          lastMessageAt,
          unreadCount,
          status: project.status,
        });
      }

      setProjects(projectsWithChats);
    } catch (error) {
      console.error('[ClientMessagesList] Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (project: ProjectChat) => {
    if (project.sessionId) {
      router.push(`/dashboard/chat?project_id=${project.projectId}&session_id=${project.sessionId}`);
    } else {
      // 세션이 없으면 프로젝트 상세로 이동 (또는 채팅 생성)
      router.push(`/dashboard/project/${project.projectId}`);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-black mb-2">No messages yet</h3>
        <p className="text-zinc-600">
          Your conversations with managers will appear here once a project is assigned.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <button
          key={project.projectId}
          onClick={() => handleProjectClick(project)}
          className="w-full text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Left: Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="h-5 w-5 text-gray-600 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-black truncate">
                  {project.projectName}
                </h3>
                {project.unreadCount > 0 && (
                  <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-medium">
                    {project.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 ml-8 mb-1">
                Manager: {project.managerName}
              </p>
              {project.lastMessage && (
                <p className="text-sm text-zinc-500 ml-8 truncate">
                  {project.lastMessage}
                </p>
              )}
              {project.lastMessageAt && (
                <div className="flex items-center gap-1 ml-8 mt-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <p className="text-xs text-gray-400">
                    {formatDate(project.lastMessageAt)}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Arrow */}
            <ChevronRight className="h-5 w-5 text-zinc-400 group-hover:text-black transition-colors flex-shrink-0 mt-1" />
          </div>
        </button>
      ))}
    </div>
  );
}

