/**
 * Milestone Tracker Component
 * 
 * 프로젝트 마일스톤 타임라인 및 업데이트 기능
 */

'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    loadMilestones();
  }, [projectId]);

  const loadMilestones = async () => {
    try {
      setIsLoading(true);
      
      // API Route를 통해 서버 사이드에서 마일스톤 정보 가져오기
      const response = await fetch(`/api/manager/milestones?project_id=${projectId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!data.ok) {
        console.error('[MilestoneTracker] Failed to load milestones:', data.error);
        setMilestones(DEFAULT_MILESTONES);
        return;
      }

      if (data.milestones && Array.isArray(data.milestones)) {
        setMilestones(data.milestones as Milestone[]);
      } else {
        setMilestones(DEFAULT_MILESTONES);
      }
    } catch (error) {
      console.error('[MilestoneTracker] Failed to load milestones:', error);
      setMilestones(DEFAULT_MILESTONES);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMilestone = async (index: number, isCompleted: boolean) => {
    if (isUpdating) return;

    // 토글 OFF (완료 취소)는 허용하지 않음 - 순차적 진행만 허용
    if (!isCompleted) {
      // 토글 ON (완료 처리)
      await updateMilestone(index);
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

      // 업데이트된 마일스톤으로 상태 업데이트
      if (data.milestones && Array.isArray(data.milestones)) {
        setMilestones(data.milestones);
      } else {
        // 업데이트 실패 시 다시 로드
        await loadMilestones();
      }

      // 자동 시스템 메시지는 API에서 처리됨

    } catch (error) {
      console.error('[MilestoneTracker] Failed to update milestone:', error);
      alert('마일스톤 업데이트에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUpdating(false);
    }
  };


  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  // 현재 진행 중인 마일스톤 인덱스 찾기
  const currentIndex = milestones.findIndex((m) => m.status === 'in_progress');
  // 완료된 마일스톤 중 가장 마지막 인덱스 찾기
  const lastCompletedIndex = milestones.map((m, idx) => ({ status: m.status, idx }))
    .filter(({ status }) => status === 'completed')
    .map(({ idx }) => idx)
    .sort((a, b) => b - a)[0] ?? -1;

  // 다음 업데이트 가능한 마일스톤 인덱스
  const nextUpdatableIndex = currentIndex >= 0 ? currentIndex : (lastCompletedIndex + 1);
  
  // 각 마일스톤이 토글 가능한지 확인
  const canToggle = (idx: number) => {
    const milestone = milestones[idx];
    // 완료된 마일스톤은 토글 불가 (순차적 진행만 허용)
    if (milestone.status === 'completed') return false;
    // 진행 중이거나 다음 업데이트 가능한 마일스톤만 토글 가능
    return milestone.status === 'in_progress' || idx === nextUpdatableIndex;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
      <div className="mb-4 pb-3 border-b border-gray-200 bg-gray-50 -mx-4 -mt-4 px-4 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Project Milestones</h3>
        <p className="text-xs text-gray-500">진행 단계를 업데이트하세요</p>
      </div>

      <div className="relative flex-1 overflow-y-auto">
        {milestones.map((milestone, idx) => {
          const isCompleted = milestone.status === 'completed';
          const isInProgress = milestone.status === 'in_progress';
          const toggleable = canToggle(idx);

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
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted
                          ? 'text-[#008080] line-through'
                          : isInProgress
                          ? 'text-[#008080]'
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
                    {isInProgress && !milestone.date && (
                      <p className="text-xs text-blue-600 mt-0.5 font-medium">
                        진행 중...
                      </p>
                    )}
                  </div>
                  
                  {/* Toggle Switch */}
                  <div className="flex flex-col items-end gap-1">
                    {isCompleted ? (
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#008080]">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                      </div>
                    ) : toggleable ? (
                      <button
                        onClick={() => toggleMilestone(idx, isCompleted)}
                        disabled={isUpdating}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#008080] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isInProgress ? 'bg-[#008080]' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                        title={isInProgress ? '완료 처리하기' : '시작하기'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isInProgress ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                        {isUpdating && (
                          <Loader2 className="absolute w-3 h-3 animate-spin text-white left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </button>
                    ) : (
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 opacity-50">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                      </div>
                    )}
                    {(isCompleted || isInProgress) && (
                      <p className="text-xs text-gray-500 text-right whitespace-nowrap">
                        고객 대시보드에 업데이트됨
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

