/**
 * Manager Workstation Page
 * 
 * 분할 뷰: 클라이언트 리스트 + 실시간 채팅 + 프로젝트 관리
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ManagerChat } from '@/components/ManagerChat';
import { MilestoneTracker } from '@/components/MilestoneTracker';
import { ClientList } from '@/components/ClientList';
import { ProjectFiles } from '@/components/ProjectFiles';
import { Loader2, MessageSquare, Package } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  user_id: string;
  client_name: string;
  client_email: string;
  status: string;
  total_landed_cost: number | null;
  created_at: string;
}

function WorkstationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    searchParams?.get('project_id') || null
  );
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [managerId, setManagerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        setManagerId(user.id);

        // URL에서 project_id가 있으면 로드
        const projectId = searchParams?.get('project_id');
        if (projectId && projectId !== selectedProjectId) {
          await loadProject(projectId, user.id);
        }
      } catch (error) {
        console.error('[Workstation] Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [searchParams, router]);

  const loadProject = async (projectId: string, managerUserId: string) => {
    try {
      // API Route를 통해 서버 사이드에서 프로젝트 정보 가져오기
      const response = await fetch(`/api/manager/projects/${projectId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!data.ok || !data.project) {
        console.error('[Workstation] Failed to load project:', data.error);
        return;
      }

      setProject({
        id: data.project.id,
        name: data.project.name,
        user_id: data.project.user_id,
        client_name: data.project.client_name,
        client_email: data.project.client_email,
        status: data.project.status,
        total_landed_cost: data.project.total_landed_cost,
        created_at: data.project.created_at,
      });

      // 채팅 세션 로드 또는 생성
      await loadOrCreateChatSession(projectId, managerUserId);
    } catch (error) {
      console.error('[Workstation] Failed to load project:', error);
    }
  };

  const loadOrCreateChatSession = async (projectId: string, managerUserId: string) => {
    try {
      // API Route를 통해 서버 사이드에서 채팅 세션 로드 또는 생성
      const response = await fetch(
        `/api/manager/chat-sessions?project_id=${projectId}&manager_id=${managerUserId}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = await response.json();

      if (!data.ok || !data.session) {
        console.error('[Workstation] Failed to load/create session:', data.error);
        return;
      }

      setChatSessionId(data.session.id);
    } catch (error) {
      console.error('[Workstation] Failed to load/create session:', error);
    }
  };

  const handleProjectSelect = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setChatSessionId(null); // Reset chat session
    setProject(null); // Reset project data
    router.push(`/manager/workstation?project_id=${projectId}`, { scroll: false });
    if (managerId) {
      await loadProject(projectId, managerId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Workstation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Communicate with clients and manage projects
        </p>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-12 gap-0 h-[calc(100vh-12rem)] border border-gray-200 rounded-lg overflow-hidden">
        {/* Left: Client List (30%) */}
        <div className="col-span-12 lg:col-span-3 border-r border-gray-300">
          <ClientList
            onProjectSelect={handleProjectSelect}
            selectedProjectId={selectedProjectId}
          />
        </div>

        {/* Center: Chat (40%) */}
        <div className="col-span-12 lg:col-span-5 border-r border-gray-300">
          {selectedProjectId && chatSessionId && managerId ? (
            <ManagerChat
              sessionId={chatSessionId}
              projectId={selectedProjectId}
              userId={managerId}
              showQuickReplies={true}
              isManager={true}
              projectData={project ? {
                name: project.name,
                // TODO: Load quantity, targetPrice, port from analysis_data
              } : null}
            />
          ) : selectedProjectId && managerId ? (
            <div className="h-full bg-white rounded-lg border border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-gray-500">Setting up chat session...</p>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-lg border border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Select a project to start chatting</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Project Management (30%) */}
        <div className="col-span-12 lg:col-span-4">
          {selectedProjectId && project ? (
            <div className="h-full flex flex-col gap-4">
              {/* Project Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 flex-shrink-0">
                <div className="flex items-start gap-3 mb-4">
                  <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{project.client_name}</p>
                  </div>
                </div>
                {project.total_landed_cost && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Total Landed Cost</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${project.total_landed_cost.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Milestone Tracker */}
              <div className="flex-1 min-h-0">
                <MilestoneTracker projectId={selectedProjectId} managerId={managerId || ''} />
              </div>

              {/* Shared Files */}
              <div className="flex-1 min-h-0">
                <ProjectFiles projectId={selectedProjectId} sessionId={chatSessionId} />
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-lg border border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Select a project to manage</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WorkstationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      }
    >
      <WorkstationPageContent />
    </Suspense>
  );
}
