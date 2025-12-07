/**
 * FeedbackList Component
 * 
 * 피드백 리스트를 표시하는 사이드패널 컴포넌트
 * 데스크탑: 우측, 모바일: 하단
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, MapPin } from 'lucide-react';
import type { SampleAnnotation } from '@/lib/types/sample';

interface FeedbackListProps {
  annotations: SampleAnnotation[];
  onAnnotationClick?: (annotationId: string) => void;
  selectedAnnotationId?: string | null;
}

export function FeedbackList({
  annotations,
  onAnnotationClick,
  selectedAnnotationId,
}: FeedbackListProps) {
  if (annotations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MapPin className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">
            아직 피드백이 없습니다
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          피드백 목록 ({annotations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {annotations.map((annotation, index) => {
            const isSelected = selectedAnnotationId === annotation.id;
            const isResolved = annotation.is_resolved;

            return (
              <button
                key={annotation.id}
                onClick={() => onAnnotationClick?.(annotation.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                } ${isResolved ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-500">
                      #{index + 1}
                    </span>
                    {isResolved ? (
                      <Badge variant="success" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        해결됨
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        대기 중
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400">
                    {new Date(annotation.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <p className="text-sm text-neutral-700 line-clamp-2">
                  {annotation.comment}
                </p>
                <div className="mt-2 text-xs text-neutral-500">
                  위치: ({annotation.position_x.toFixed(1)}%, {annotation.position_y.toFixed(1)}%)
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
