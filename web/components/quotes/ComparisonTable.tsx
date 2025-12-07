/**
 * ComparisonTable Component
 * 
 * 견적 비교를 위한 테이블 컴포넌트
 * 데스크탑에서 사용
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Award } from 'lucide-react';
import type { FactoryQuote } from '@/lib/types/quote';

interface ComparisonTableProps {
  quotes: FactoryQuote[];
  onSelect?: (quoteId: string) => void;
  isReadOnly?: boolean;
}

export function ComparisonTable({ quotes, onSelect, isReadOnly = false }: ComparisonTableProps) {
  const riskConfig = {
    Low: {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: '낮음',
    },
    Medium: {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      label: '보통',
    },
    High: {
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: '높음',
    },
  };

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        비교할 견적이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="text-left p-4 font-semibold text-neutral-900">공장명</th>
            <th className="text-right p-4 font-semibold text-neutral-900">단가</th>
            <th className="text-right p-4 font-semibold text-neutral-900">MOQ</th>
            <th className="text-right p-4 font-semibold text-neutral-900">납기</th>
            <th className="text-right p-4 font-semibold text-neutral-900">샘플 비용</th>
            <th className="text-center p-4 font-semibold text-neutral-900">리스크</th>
            <th className="text-left p-4 font-semibold text-neutral-900">장점</th>
            <th className="text-left p-4 font-semibold text-neutral-900">단점</th>
            <th className="text-center p-4 font-semibold text-neutral-900">액션</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => {
            const risk = riskConfig[quote.risk_level];
            const isSelected = quote.status === 'selected';

            return (
              <tr
                key={quote.id}
                className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${
                  quote.is_recommended ? 'bg-blue-50' : ''
                } ${isSelected ? 'bg-green-50' : ''}`}
              >
                {/* 공장명 */}
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">
                      {quote.factory_name}
                    </span>
                    {quote.is_recommended && (
                      <Badge variant="default" className="bg-blue-600 text-white text-xs gap-1">
                        <Award className="h-3 w-3" />
                        Choice
                      </Badge>
                    )}
                    {isSelected && (
                      <Badge variant="success" className="text-xs gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        선택됨
                      </Badge>
                    )}
                  </div>
                </td>

                {/* 단가 */}
                <td className="p-4 text-right">
                  <span className="font-semibold text-neutral-900">
                    ${quote.unit_price.toLocaleString()}
                  </span>
                </td>

                {/* MOQ */}
                <td className="p-4 text-right">
                  <span className="text-neutral-700">
                    {quote.moq.toLocaleString()}
                  </span>
                </td>

                {/* 납기 */}
                <td className="p-4 text-right">
                  <span className="text-neutral-700">
                    {quote.lead_time_days}일
                  </span>
                </td>

                {/* 샘플 비용 */}
                <td className="p-4 text-right">
                  <span className="text-neutral-700">
                    {quote.sample_cost ? `$${quote.sample_cost.toLocaleString()}` : '-'}
                  </span>
                </td>

                {/* 리스크 */}
                <td className="p-4 text-center">
                  <Badge
                    variant="outline"
                    className={`${risk.bgColor} ${risk.color} border-transparent`}
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {risk.label}
                  </Badge>
                </td>

                {/* 장점 */}
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {quote.pros && quote.pros.length > 0 ? (
                      quote.pros.slice(0, 2).map((pro, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 text-xs"
                        >
                          {pro}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-neutral-400 text-sm">-</span>
                    )}
                  </div>
                </td>

                {/* 단점 */}
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {quote.cons && quote.cons.length > 0 ? (
                      quote.cons.slice(0, 2).map((con, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 text-xs"
                        >
                          {con}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-neutral-400 text-sm">-</span>
                    )}
                  </div>
                </td>

                {/* 액션 */}
                <td className="p-4 text-center">
                  {!isReadOnly && quote.status === 'pending' && onSelect ? (
                    <Button
                      onClick={() => onSelect(quote.id)}
                      size="sm"
                      variant={quote.is_recommended ? 'primary' : 'outline'}
                    >
                      선택
                    </Button>
                  ) : isSelected ? (
                    <span className="text-sm text-green-600 font-medium">선택됨</span>
                  ) : (
                    <span className="text-sm text-neutral-400">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
