/**
 * Manager Workstation Page
 * 
 * 분할 뷰: 클라이언트 리스트 + 실시간 채팅 + 프로젝트 관리
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getAdminClient } from '@/lib/supabase/admin';
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

export default function WorkstationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    searchParams.get('project_id')
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
        const projectId = searchParams.get('project_id');
        if (projectId) {
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
      const adminClient = getAdminClient();

      // 프로젝트 정보 로드 (클라이언트 정보 포함)
      const { data: projectData, error: projectError } = await adminClient
        .from('projects')
        .select(`
          id,
          name,
          user_id,
          status,
          total_landed_cost,
          created_at,
          profiles!projects_user_id_fkey(
            name,
            email
          )
        `)
        .eq('id', projectId)
        .eq('manager_id', managerUserId)
        .single();

      if (projectError || !projectData) {
        console.error('[Workstation] Failed to load project:', projectError);
        return;
      }

      setProject({
        id: projectData.id,
        name: projectData.name,
        user_id: projectData.user_id,
        client_name: projectData.profiles?.name || projectData.profiles?.email || 'Client',
        client_email: projectData.profiles?.email || '',
        status: projectData.status,
        total_landed_cost: projectData.total_landed_cost,
        created_at: projectData.created_at,
      });

      // 채팅 세션 로드 또는 생성
      await loadOrCreateChatSession(projectId, managerUserId);
    } catch (error) {
      console.error('[Workstation] Failed to load project:', error);
    }
  };

  const loadOrCreateChatSession = async (projectId: string, managerUserId: string) => {
    try {
      const adminClient = getAdminClient();

      // 기존 세션 확인 (매니저가 할당된 세션)
      const { data: existingSession } = await adminClient
        .from('chat_sessions')
        .select('id')
        .eq('project_id', projectId)
        .eq('manager_id', managerUserId)
        .in('status', ['open', 'in_progress'])
        .maybeSingle();

      if (existingSession) {
        setChatSessionId(existingSession.id);
        return;
      }

      // 프로젝트 정보 가져오기 (user_id 필요)
      const { data: projectData } = await adminClient
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single();

      if (!projectData) {
        console.error('[Workstation] Project not found');
        return;
      }

      // 세션이 없으면 생성 (매니저 ID 할당)
      const { data: newSession, error: sessionError } = await adminClient
        .from('chat_sessions')
        .insert({
          project_id: projectId,
          user_id: projectData.user_id,
          manager_id: managerUserId,
          status: 'in_progress',
        })
        .select()
        .single();

      if (sessionError || !newSession) {
        console.error('[Workstation] Failed to create session:', sessionError);
        return;
      }

      setChatSessionId(newSession.id);
    } catch (error) {
      console.error('[Workstation] Failed to load/create session:', error);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    router.push(`/manager/workstation?project_id=${projectId}`, { scroll: false });
    if (managerId) {
      loadProject(projectId, managerId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Workstation</h1>
        <p className="mt-1 text-sm text-gray-500">
          클라이언트와 소통하고 프로젝트를 관리하세요
        </p>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-12rem)]">
        {/* Left: Client List (30%) */}
        <div className="col-span-12 lg:col-span-3">
          <ClientList
            onProjectSelect={handleProjectSelect}
            selectedProjectId={selectedProjectId}
          />
        </div>

        {/* Center: Chat (40%) */}
        <div className="col-span-12 lg:col-span-5">
          {selectedProjectId && chatSessionId && managerId ? (
            <ManagerChat
              sessionId={chatSessionId}
              projectId={selectedProjectId}
              userId={managerId}
              showQuickReplies={true}
              isManager={true}
            />
          ) : (
            <div className="h-full bg-white rounded-lg border border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">프로젝트를 선택하여 채팅을 시작하세요</p>
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
                <p className="text-gray-500">프로젝트를 선택하여 관리하세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

