/**
 * QCStatsCard Component
 * 
 * QC 리포트의 통계 정보를 표시하는 카드 컴포넌트
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { QCReport } from '@/lib/types/qc';

interface QCStatsCardProps {
  report: QCReport;
}

export function QCStatsCard({ report }: QCStatsCardProps) {
  const passRate = report.total_quantity > 0
    ? ((report.passed_quantity / report.total_quantity) * 100).toFixed(1)
    : '0.0';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">검수 통계</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 총 수량 */}
          <div className="flex flex-col items-center p-4 bg-neutral-50 rounded-lg">
            <Package className="h-8 w-8 text-neutral-600 mb-2" />
            <div className="text-2xl font-bold text-neutral-900">
              {report.total_quantity.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-600 mt-1">총 수량</div>
          </div>

          {/* 합격 수량 */}
          <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
            <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-700">
              {report.passed_quantity.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 mt-1">합격</div>
          </div>

          {/* 불량 수량 */}
          <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg">
            <XCircle className="h-8 w-8 text-red-600 mb-2" />
            <div className="text-2xl font-bold text-red-700">
              {report.defect_quantity.toLocaleString()}
            </div>
            <div className="text-sm text-red-600 mt-1">불량</div>
          </div>

          {/* 불량률 */}
          <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mb-2" />
            <div className="text-2xl font-bold text-yellow-700">
              {report.defect_rate.toFixed(2)}%
            </div>
            <div className="text-sm text-yellow-600 mt-1">불량률</div>
          </div>
        </div>

        {/* 합격률 표시 */}
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">합격률</span>
            <span className="text-lg font-bold text-green-600">{passRate}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all"
              style={{ width: `${passRate}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
