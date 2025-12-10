/**
 * Manager Dashboard Overview
 * 
 * 주요 지표 및 최근 활동 표시
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAdminClient } from '@/lib/supabase/admin';
import { 
  Users2, 
  DollarSign, 
  MessageSquare, 
  FileText,
  Clock,
  Loader2,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  activeClients: number;
  estimatedRevenue: number;
  pendingMessages: number;
  pendingQuotes: number;
}

interface RecentActivity {
  id: string;
  project_id: string;
  project_name: string;
  client_name: string;
  type: 'message' | 'quote' | 'milestone';
  message: string;
  timestamp: string;
}

export default function ManagerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeClients: 0,
    estimatedRevenue: 0,
    pendingMessages: 0,
    pendingQuotes: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const adminClient = getAdminClient();

        // 활성 클라이언트 수
        const { data: activeProjects } = await adminClient
          .from('projects')
          .select('id')
          .eq('manager_id', user.id)
          .eq('status', 'active');

        // 예상 정산금 (완료된 프로젝트의 총 비용 * 5%)
        const { data: completedProjects } = await adminClient
          .from('projects')
          .select('total_landed_cost')
          .eq('manager_id', user.id)
          .eq('status', 'completed')
          .not('total_landed_cost', 'is', null);

        const estimatedRevenue = completedProjects
          ? completedProjects.reduce((sum, p) => sum + (Number(p.total_landed_cost) || 0), 0) * 0.05
          : 0;

        // 읽지 않은 메시지 수 (간단한 구현 - 실제로는 read_at 필드 필요)
        const { count: unreadCount } = await adminClient
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('read_at', null)
          .neq('sender_id', user.id);

        // 승인 대기 중인 견적 수
        const { count: pendingQuotes } = await adminClient
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('manager_id', user.id)
          .eq('final_quote_status', 'accepted');

        setStats({
          activeClients: activeProjects?.length || 0,
          estimatedRevenue,
          pendingMessages: unreadCount || 0,
          pendingQuotes: pendingQuotes || 0,
        });

        // 최근 활동 로드 (최근 메시지, 견적, 마일스톤 업데이트)
        await loadRecentActivities(adminClient, user.id);
      } catch (error) {
        console.error('[Manager Dashboard] Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const loadRecentActivities = async (adminClient: any, managerId: string) => {
    try {
      // 최근 채팅 메시지
      const { data: recentMessages } = await adminClient
        .from('chat_messages')
        .select(`
          id,
          session_id,
          content,
          created_at,
          chat_sessions!inner(
            project_id,
            projects!inner(
              id,
              name,
              user_id,
              profiles!projects_user_id_fkey(name, email)
            )
          )
        `)
        .eq('chat_sessions.manager_id', managerId)
        .neq('sender_id', managerId)
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: RecentActivity[] = [];

      if (recentMessages) {
        for (const msg of recentMessages) {
          const project = msg.chat_sessions?.projects;
          if (project) {
            activities.push({
              id: msg.id,
              project_id: project.id,
              project_name: project.name,
              client_name: project.profiles?.name || project.profiles?.email || 'Client',
              type: 'message',
              message: msg.content.substring(0, 100),
              timestamp: msg.created_at,
            });
          }
        }
      }

      // 시간순 정렬
      activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setRecentActivities(activities.slice(0, 10));
    } catch (error) {
      console.error('[Manager Dashboard] Failed to load recent activities:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          주요 지표와 최근 활동을 확인하세요
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Clients"
          value={stats.activeClients}
          icon={<Users2 className="w-5 h-5" />}
          description="Active projects"
          color="blue"
        />
        <StatCard
          title="Est. Revenue"
          value={`$${stats.estimatedRevenue.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5" />}
          description="Estimated settlement this month"
          color="green"
        />
        <StatCard
          title="Pending Messages"
          value={stats.pendingMessages}
          icon={<MessageSquare className="w-5 h-5" />}
          description="Unread messages"
          color="orange"
        />
        <StatCard
          title="Pending Quotes"
          value={stats.pendingQuotes}
          icon={<FileText className="w-5 h-5" />}
          description="Pending approval"
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivities.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>최근 활동이 없습니다</p>
            </div>
          ) : (
            recentActivities.map((activity) => (
              <Link
                key={activity.id}
                href={`/manager/workstation?project_id=${activity.project_id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === 'message' && (
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                    )}
                    {activity.type === 'quote' && (
                      <FileText className="w-5 h-5 text-purple-500" />
                    )}
                    {activity.type === 'milestone' && (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.client_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {activity.project_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.message}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-900 mt-1">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}

