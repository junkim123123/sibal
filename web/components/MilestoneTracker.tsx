/**
 * Milestone Tracker Component
 * 
 * 프로젝트 마일스톤 타임라인 및 업데이트 기능
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAdminClient } from '@/lib/supabase/admin';
import { CheckCircle2, Circle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Milestone {
  title: string;
  status: 'completed' | 'pending' | 'in_progress';
  date: string | null;
  index: number;
}

interface MilestoneTrackerProps {
  projectId: string;
  managerId: string;
}

const DEFAULT_MILESTONES: Milestone[] = [
  { title: 'Sourcing Started', status: 'completed', date: null, index: 0 },
  { title: 'Supplier Verified', status: 'pending', date: null, index: 1 },
  { title: 'Samples Ordered', status: 'pending', date: null, index: 2 },
  { title: 'QC Inspection', status: 'pending', date: null, index: 3 },
  { title: 'Shipping Arranged', status: 'pending', date: null, index: 4 },
  { title: 'Final Delivery', status: 'pending', date: null, index: 5 },
];

export function MilestoneTracker({ projectId, managerId }: MilestoneTrackerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();
  const adminClient = getAdminClient();

  useEffect(() => {
    loadMilestones();
  }, [projectId]);

  const loadMilestones = async () => {
    try {
      setIsLoading(true);
      const { data: project, error } = await adminClient
        .from('projects')
        .select('milestones, current_milestone_index')
        .eq('id', projectId)
        .single();

      if (error) throw error;

      if (project?.milestones && Array.isArray(project.milestones)) {
        setMilestones(project.milestones as Milestone[]);
      } else {
        // 기본 마일스톤 사용
        setMilestones(DEFAULT_MILESTONES);
      }
    } catch (error) {
      console.error('[MilestoneTracker] Failed to load milestones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMilestone = async (index: number) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);

      const updatedMilestones = [...milestones];
      
      // 이전 마일스톤들 완료 처리
      for (let i = 0; i <= index; i++) {
        if (updatedMilestones[i].status === 'pending') {
          updatedMilestones[i] = {
            ...updatedMilestones[i],
            status: 'completed',
            date: new Date().toISOString(),
          };
        }
      }

      // 다음 마일스톤을 in_progress로 설정 (아직 완료되지 않은 경우)
      if (index < updatedMilestones.length - 1) {
        if (updatedMilestones[index + 1].status === 'pending') {
          updatedMilestones[index + 1] = {
            ...updatedMilestones[index + 1],
            status: 'in_progress',
          };
        }
      }

      // API를 통해 마일스톤 업데이트 (이메일 알림 포함)
      const response = await fetch('/api/manager/update-milestone', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          milestone_index: index,
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to update milestone');
      }

      setMilestones(data.milestones || updatedMilestones);

      // 자동 시스템 메시지는 API에서 처리됨

    } catch (error) {
      console.error('[MilestoneTracker] Failed to update milestone:', error);
      alert('마일스톤 업데이트에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUpdating(false);
    }
  };

  const sendSystemMessage = async (milestoneTitle: string) => {
    try {
      // 채팅 세션 찾기
      const { data: session } = await adminClient
        .from('chat_sessions')
        .select('id')
        .eq('project_id', projectId)
        .maybeSingle();

      if (!session) return;

      // 시스템 메시지 전송
      await supabase.from('chat_messages').insert({
        session_id: session.id,
        sender_id: managerId,
        role: 'manager',
        content: `System: Project status updated to '${milestoneTitle}'.`,
      });
    } catch (error) {
      console.error('[MilestoneTracker] Failed to send system message:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  const currentIndex = milestones.findIndex(
    (m) => m.status === 'in_progress' || (m.status === 'completed' && milestones.indexOf(m) === milestones.length - 1)
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Project Milestones</h3>
        <p className="text-xs text-gray-500">진행 단계를 업데이트하세요</p>
      </div>

      <div className="relative flex-1 overflow-y-auto">
        {milestones.map((milestone, idx) => {
          const isCompleted = milestone.status === 'completed';
          const isInProgress = milestone.status === 'in_progress';
          const isNext = idx <= (currentIndex >= 0 ? currentIndex + 1 : 0) && !isCompleted;
          const canUpdate = isInProgress || (isNext && idx === (currentIndex >= 0 ? currentIndex + 1 : 0));

          return (
            <div key={idx} className="relative flex items-start gap-3 pb-6 last:pb-0">
              {/* Timeline Line */}
              {idx < milestones.length - 1 && (
                <div
                  className={`absolute left-[18px] top-8 w-0.5 h-full ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Icon */}
              <div className="relative flex-shrink-0 z-10 bg-white">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : isInProgress ? (
                  <Clock className="w-5 h-5 text-blue-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isCompleted
                          ? 'text-gray-900'
                          : isInProgress
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {milestone.title}
                    </p>
                    {milestone.date && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(milestone.date).toLocaleDateString('ko-KR')}
                      </p>
                    )}
                  </div>
                  {canUpdate && (
                    <Button
                      size="sm"
                      onClick={() => updateMilestone(idx)}
                      disabled={isUpdating}
                      className="h-7 text-xs"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        '완료'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

