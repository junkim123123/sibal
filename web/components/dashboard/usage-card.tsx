/**
 * Usage Card Component
 * 
 * 대시보드에 표시되는 AI 분석 사용량 카드
 * Free 유저: 사용 횟수 / 제한 표시 + 업그레이드 버튼
 * Pro 유저: 무제한 액세스 표시
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import Link from 'next/link';

interface UsageCardProps {
  usedCount: number;
  limit: number;
  hasActiveSubscription: boolean;
  userRole?: string;
}

export function UsageCard({
  usedCount,
  limit,
  hasActiveSubscription,
  userRole = 'free',
}: UsageCardProps) {
  const percentage = hasActiveSubscription ? 100 : (usedCount / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = usedCount >= limit;

  // Progress Bar 컴포넌트 (간단한 버전)
  const ProgressBar = ({ percentage, isNearLimit }: { percentage: number; isNearLimit: boolean }) => {
    const colorClass = hasActiveSubscription
      ? 'bg-green-500'
      : isNearLimit
      ? 'bg-red-500'
      : 'bg-black';

    return (
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Monthly Analysis Usage
          </h3>

          {/* Free User Content */}
          {!hasActiveSubscription ? (
            <div className="space-y-4">
              {/* Usage Count */}
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {usedCount} / {limit}
                </div>
                <p className="text-xs text-gray-500">
                  {isAtLimit
                    ? 'Monthly limit reached'
                    : `${limit - usedCount} analyses remaining this month`
                  }
                </p>
              </div>

              {/* Progress Bar */}
              <ProgressBar percentage={percentage} isNearLimit={isNearLimit} />

              {/* Upgrade Button */}
              <Link href="/pricing" className="block">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Upgrade for Unlimited
                </Button>
              </Link>
            </div>
          ) : (
            /* Pro/Paid User Content */
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <span>✨</span>
                  <span>Unlimited Access</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  You have full access to AI sourcing analysis.
                </p>
              </div>

              {/* Full Progress Bar (Green) */}
              <ProgressBar percentage={100} isNearLimit={false} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
