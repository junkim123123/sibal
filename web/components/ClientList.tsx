/**
 * Client List Component
 * 
 * 매니저가 할당된 프로젝트의 클라이언트 리스트
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAdminClient } from '@/lib/supabase/admin';
import { MessageSquare, Loader2, User } from 'lucide-react';

interface ClientProject {
  id: string;
  name: string;
  client_name: string;
  client_email: string;
  status: string;
  unread_count: number;
  last_message_at: string | null;
}

interface ClientListProps {
  onProjectSelect: (projectId: string) => void;
  selectedProjectId: string | null;
}

export function ClientList({ onProjectSelect, selectedProjectId }: ClientListProps) {
  const [clients, setClients] = useState<ClientProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const adminClient = getAdminClient();

        // 매니저가 할당된 프로젝트들 로드
        const { data: projects, error: projectsError } = await adminClient
          .from('projects')
          .select(`
            id,
            name,
            status,
            user_id,
            profiles!projects_user_id_fkey(
              name,
              email
            )
          `)
          .eq('manager_id', user.id)
          .in('status', ['active', 'in_progress'])
          .order('updated_at', { ascending: false });

        if (projectsError || !projects) {
          console.error('[ClientList] Failed to load projects:', projectsError);
          return;
        }

        // 각 프로젝트의 읽지 않은 메시지 수 조회
        const clientsWithUnread: ClientProject[] = [];

        for (const project of projects) {
          // 채팅 세션 찾기
          const { data: session } = await adminClient
            .from('chat_sessions')
            .select('id')
            .eq('project_id', project.id)
            .eq('manager_id', user.id)
            .maybeSingle();

          let unreadCount = 0;
          let lastMessageAt: string | null = null;

          if (session) {
            // 읽지 않은 메시지 수 (간단한 구현 - 실제로는 read_at 필드 사용)
            const { count } = await adminClient
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', session.id)
              .neq('sender_id', user.id)
              .is('read_at', null);

            unreadCount = count || 0;

            // 최근 메시지 시간
            const { data: lastMessage } = await adminClient
              .from('chat_messages')
              .select('created_at')
              .eq('session_id', session.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            lastMessageAt = lastMessage?.created_at || null;
          }

          clientsWithUnread.push({
            id: project.id,
            name: project.name,
            client_name: project.profiles?.name || project.profiles?.email || 'Client',
            client_email: project.profiles?.email || '',
            status: project.status,
            unread_count: unreadCount,
            last_message_at: lastMessageAt,
          });
        }

        setClients(clientsWithUnread);
      } catch (error) {
        console.error('[ClientList] Failed to load clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
    
    // 30초마다 자동 새로고침 (새로 할당된 프로젝트 감지)
    const interval = setInterval(() => {
      loadClients();
    }, 30000); // 30초

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Clients</h2>
        <p className="text-xs text-gray-500 mt-1">{clients.length} active projects</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
        {clients.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No assigned projects</p>
          </div>
        ) : (
          clients.map((client) => (
            <button
              key={client.id}
              onClick={() => onProjectSelect(client.id)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                selectedProjectId === client.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {client.client_name}
                    </p>
                    {client.unread_count > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                        {client.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{client.name}</p>
                  {client.last_message_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(client.last_message_at).toLocaleTimeString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
                <MessageSquare
                  className={`w-4 h-4 flex-shrink-0 mt-1 ${
                    selectedProjectId === client.id ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

