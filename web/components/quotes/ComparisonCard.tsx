/**
 * ComparisonCard Component
 * 
 * 견적 비교를 위한 카드 컴포넌트
 * 모바일에서 사용
 */

'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Package, DollarSign, Award } from 'lucide-react';
import type { FactoryQuote } from '@/lib/types/quote';

interface ComparisonCardProps {
  quote: FactoryQuote;
  onSelect?: (quoteId: string) => void;
  isSelected?: boolean;
  isReadOnly?: boolean;
}

export function ComparisonCard({ quote, onSelect, isSelected = false, isReadOnly = false }: ComparisonCardProps) {
  const riskConfig = {
    Low: {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: '낮음',
    },
    Medium: {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: '보통',
    },
    High: {
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: '높음',
    },
  };

  const risk = riskConfig[quote.risk_level];
  const cardBorderClass = quote.is_recommended
    ? 'border-2 border-blue-500 shadow-lg'
    : isSelected
    ? 'border-2 border-green-500'
    : 'border border-neutral-200';

  return (
    <Card className={cardBorderClass}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-neutral-900">
                {quote.factory_name}
              </h3>
              {quote.is_recommended && (
                <Badge variant="default" className="bg-blue-600 text-white gap-1">
                  <Award className="h-3 w-3" />
                  NexSupply Choice
                </Badge>
              )}
              {isSelected && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  선택됨
                </Badge>
              )}
            </div>
            {quote.status === 'selected' && (
              <Badge variant="success" className="mt-1">
                선택된 공장
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 가격 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-neutral-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-neutral-600" />
              <span className="text-sm text-neutral-600">단가</span>
            </div>
            <div className="text-xl font-bold text-neutral-900">
              ${quote.unit_price.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-neutral-600" />
              <span className="text-sm text-neutral-600">MOQ</span>
            </div>
            <div className="text-xl font-bold text-neutral-900">
              {quote.moq.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 납기 및 샘플 비용 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-neutral-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-neutral-600" />
              <span className="text-sm text-neutral-600">납기</span>
            </div>
            <div className="text-lg font-semibold text-neutral-900">
              {quote.lead_time_days}일
            </div>
          </div>
          {quote.sample_cost && (
            <div className="p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-neutral-600" />
                <span className="text-sm text-neutral-600">샘플 비용</span>
              </div>
              <div className="text-lg font-semibold text-neutral-900">
                ${quote.sample_cost.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* 리스크 레벨 */}
        <div className={`p-3 rounded-lg ${risk.bgColor} ${risk.borderColor} border`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`h-4 w-4 ${risk.color}`} />
            <span className={`text-sm font-medium ${risk.color}`}>리스크 레벨</span>
          </div>
          <div className={`text-lg font-semibold ${risk.color}`}>
            {risk.label}
          </div>
        </div>

        {/* 장점 */}
        {quote.pros && quote.pros.length > 0 && (
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-2">장점</p>
            <div className="flex flex-wrap gap-2">
              {quote.pros.map((pro, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {pro}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 단점 */}
        {quote.cons && quote.cons.length > 0 && (
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-2">단점</p>
            <div className="flex flex-wrap gap-2">
              {quote.cons.map((con, index) => (
                <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {con}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 선택 버튼 */}
        {!isReadOnly && quote.status === 'pending' && onSelect && (
          <Button
            onClick={() => onSelect(quote.id)}
            className="w-full"
            variant={quote.is_recommended ? 'primary' : 'outline'}
          >
            이 공장 선택하기
          </Button>
        )}

        {quote.status === 'selected' && (
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-sm font-medium text-green-700">
              ✓ 선택된 공장입니다
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
