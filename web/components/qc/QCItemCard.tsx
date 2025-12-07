/**
 * QCItemCard Component
 * 
 * 각 검수 항목을 표시하는 카드 컴포넌트
 * 이미지 갤러리 및 상태 표시 포함
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, AlertTriangle, ImageIcon } from 'lucide-react';
import type { QCReportItem } from '@/lib/types/qc';

interface QCItemCardProps {
  item: QCReportItem;
  isManager?: boolean;
  onEdit?: (item: QCReportItem) => void;
  onDelete?: (itemId: string) => void;
}

export function QCItemCard({ item, isManager = false, onEdit, onDelete }: QCItemCardProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const statusConfig = {
    pass: {
      icon: CheckCircle2,
      badge: 'success' as const,
      label: '합격',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    fail: {
      icon: XCircle,
      badge: 'destructive' as const,
      label: '불합격',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    warning: {
      icon: AlertTriangle,
      badge: 'warning' as const,
      label: '주의',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  };

  const config = statusConfig[item.status];
  const StatusIcon = config.icon;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config.bgColor}`}>
                <StatusIcon className={`h-5 w-5 ${config.color}`} />
              </div>
              <div>
                <Badge variant={config.badge} className="mb-2">
                  {config.label}
                </Badge>
                <h3 className="font-semibold text-lg text-neutral-900">
                  {item.category}
                </h3>
              </div>
            </div>
            {isManager && (onEdit || onDelete) && (
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    수정
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    삭제
                  </button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* 설명 */}
          <p className="text-neutral-700 mb-4 whitespace-pre-wrap">
            {item.description}
          </p>

          {/* 매니저 코멘트 */}
          {item.manager_comment && (
            <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
              <p className="text-sm font-medium text-neutral-600 mb-1">
                매니저 코멘트
              </p>
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                {item.manager_comment}
              </p>
            </div>
          )}

          {/* 이미지 갤러리 */}
          {item.image_urls && item.image_urls.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-neutral-600 mb-2">
                첨부 이미지 ({item.image_urls.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {item.image_urls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(url)}
                    className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 hover:border-neutral-400 transition-colors group"
                  >
                    <Image
                      src={url}
                      alt={`${item.category} 이미지 ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 이미지 확대 Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{item.category} - 이미지</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <Image
                src={selectedImage}
                alt={item.category}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
