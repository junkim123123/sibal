/**
 * AnnotationCanvas Component
 * 
 * 이미지 위에 Pin을 찍고 코멘트를 남기는 캔버스 컴포넌트
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MapPin, X, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SampleAnnotation } from '@/lib/types/sample';

interface AnnotationCanvasProps {
  imageUrl: string;
  annotations: SampleAnnotation[];
  onAddAnnotation?: (positionX: number, positionY: number, comment: string, imageUrl: string) => void;
  onDeleteAnnotation?: (annotationId: string) => void;
  isReadOnly?: boolean;
}

export function AnnotationCanvas({
  imageUrl,
  annotations,
  onAddAnnotation,
  onDeleteAnnotation,
  isReadOnly = false,
}: AnnotationCanvasProps) {
  const [newComment, setNewComment] = useState('');
  const [newPosition, setNewPosition] = useState<{ x: number; y: number } | null>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isReadOnly || !onAddAnnotation) return;

      const rect = imageRef.current?.getBoundingClientRect();
      if (!rect) return;

      // 클릭한 위치의 상대 좌표 계산 (%)
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // 좌표 유효성 검사
      if (x < 0 || x > 100 || y < 0 || y > 100) return;

      setNewPosition({ x, y });
      setShowPopover(true);
      setNewComment('');
    },
    [isReadOnly, onAddAnnotation]
  );

  const handleSubmitComment = useCallback(() => {
    if (!newPosition || !newComment.trim() || !onAddAnnotation) return;

    onAddAnnotation(newPosition.x, newPosition.y, newComment.trim(), imageUrl);
    setNewComment('');
    setNewPosition(null);
    setShowPopover(false);
  }, [newPosition, newComment, onAddAnnotation, imageUrl]);

  const handleCancelComment = useCallback(() => {
    setNewComment('');
    setNewPosition(null);
    setShowPopover(false);
  }, []);

  const handleDeleteAnnotation = useCallback(
    (annotationId: string) => {
      if (onDeleteAnnotation) {
        onDeleteAnnotation(annotationId);
      }
    },
    [onDeleteAnnotation]
  );

  // 이미지별로 그룹화된 주석
  const annotationsByImage = annotations.filter((ann) => ann.image_url === imageUrl);

  return (
    <div className="relative w-full">
      {/* 이미지 컨테이너 */}
      <div
        ref={imageRef}
        className="relative w-full bg-neutral-100 rounded-lg overflow-hidden cursor-crosshair"
        onClick={handleImageClick}
      >
        <Image
          src={imageUrl}
          alt="Sample image"
          width={1200}
          height={800}
          className="w-full h-auto"
          style={{ pointerEvents: isReadOnly ? 'none' : 'auto' }}
        />

        {/* 기존 Pin들 */}
        <AnimatePresence>
          {annotationsByImage.map((annotation) => (
            <motion.div
              key={annotation.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute"
              style={{
                left: `${annotation.position_x}%`,
                top: `${annotation.position_y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseEnter={() => setHoveredAnnotation(annotation.id)}
              onMouseLeave={() => setHoveredAnnotation(null)}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={`relative z-10 transition-transform hover:scale-110 ${
                      annotation.is_resolved ? 'opacity-50' : ''
                    }`}
                  >
                    <motion.div
                      animate={{
                        scale: hoveredAnnotation === annotation.id ? 1.2 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      {annotation.is_resolved ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600 fill-green-100" />
                      ) : (
                        <MapPin className="h-6 w-6 text-red-600 fill-red-100 drop-shadow-lg" />
                      )}
                    </motion.div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-neutral-900">피드백</p>
                      {annotation.is_resolved && (
                        <Badge variant="success" className="text-xs">
                          해결됨
                        </Badge>
                      )}
                      {!isReadOnly && onDeleteAnnotation && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAnnotation(annotation.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                      {annotation.comment}
                    </p>
                    <p className="text-xs text-neutral-500 mt-2">
                      {new Date(annotation.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 새 Pin 추가 중 (Popover) */}
        {newPosition && showPopover && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute z-20"
            style={{
              left: `${newPosition.x}%`,
              top: `${newPosition.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Popover open={showPopover} onOpenChange={setShowPopover}>
              <PopoverTrigger asChild>
                <button>
                  <MapPin className="h-6 w-6 text-blue-600 fill-blue-100 drop-shadow-lg animate-pulse" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-neutral-900 mb-1 block">
                      수정 요청 사항
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="이 위치에 대한 피드백을 입력하세요..."
                      className="w-full min-h-[80px] p-2 border border-neutral-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelComment}
                    >
                      취소
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim()}
                    >
                      저장
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>
        )}
      </div>

      {/* 안내 메시지 */}
      {!isReadOnly && onAddAnnotation && (
        <p className="text-xs text-neutral-500 mt-2 text-center">
          이미지를 클릭하여 피드백을 추가하세요
        </p>
      )}
    </div>
  );
}

