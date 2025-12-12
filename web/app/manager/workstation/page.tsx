/**
 * Manager Workstation Page - Professional Cockpit
 * 
 * 3-Column Layout: Smart Queue (Left) + Communication Hub (Center) + Command Center (Right)
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ManagerChat } from '@/components/ManagerChat';
import { SmartQueue } from '@/components/SmartQueue';
import { CommandCenter } from '@/components/CommandCenter';
import { Loader2 } from 'lucide-react';

function WorkstationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    searchParams?.get('project_id') || null
  );
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [managerId, setManagerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<any>(null);

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

      setProject(data.project);

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
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Workstation</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Professional client management cockpit
            </p>
          </div>
        </div>
      </div>

      {/* 3-Column Cockpit Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Smart Queue (25%) */}
        <div className="w-[25%] flex-shrink-0 border-r border-gray-200 bg-white overflow-hidden flex flex-col">
          <SmartQueue
            onProjectSelect={handleProjectSelect}
            selectedProjectId={selectedProjectId}
          />
        </div>

        {/* Center: Communication Hub (50%) */}
        <div className="w-[50%] flex-shrink-0 flex flex-col overflow-hidden bg-white border-r border-gray-200">
          {selectedProjectId && chatSessionId && managerId ? (
            <ManagerChat
              sessionId={chatSessionId}
              projectId={selectedProjectId}
              userId={managerId}
              showQuickReplies={true}
              isManager={true}
              projectData={project ? {
                name: project.name,
                // Load from analysis_data if available
                quantity: project.analysis_data?.answers?.volume || project.analysis_data?.answers?.quantity,
                targetPrice: project.analysis_data?.answers?.target_price || project.analysis_data?.answers?.price,
                port: project.analysis_data?.answers?.source_country || project.analysis_data?.answers?.origin,
              } : null}
            />
          ) : selectedProjectId && managerId ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-gray-500 text-sm">Setting up chat session...</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Select a project to start chatting</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Command Center (25%) */}
        <div className="w-[25%] flex-shrink-0 bg-gray-50 overflow-y-auto">
          {selectedProjectId && project ? (
            <CommandCenter
              project={project}
              projectId={selectedProjectId}
              sessionId={chatSessionId}
              managerId={managerId || ''}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Select a project to view details</p>
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
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      }
    >
      <WorkstationPageContent />
    </Suspense>
  );
}
