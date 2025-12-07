/**
 * Sample Feedback Page
 * 
 * Sample Feedback with Image Annotation 페이지
 * 이미지 위에 Pin을 찍고 피드백을 남기는 인터페이스
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  getSampleFeedback,
  createSampleAnnotation,
  deleteSampleAnnotation,
} from '@/actions/sample-actions';
import { AnnotationCanvas } from '@/components/sample/AnnotationCanvas';
import { FeedbackList } from '@/components/sample/FeedbackList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import type { SampleFeedbackWithAnnotations, SampleAnnotation } from '@/lib/types/sample';

export default function SampleFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const feedbackId = params.feedbackId as string;

  const [feedback, setFeedback] = useState<SampleFeedbackWithAnnotations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const annotationRefs = useRef<Record<string, HTMLDivElement>>({});

  useEffect(() => {
    loadFeedback();
  }, [feedbackId]);

  async function loadFeedback() {
    try {
      setIsLoading(true);
      setError(null);

      // 사용자 정보 확인
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // 피드백 로드
      const result = await getSampleFeedback(feedbackId);
      if (!result.success || !result.data) {
        setError(result.error || '피드백을 불러올 수 없습니다.');
        return;
      }

      setFeedback(result.data);

      // 이미지 URL 추출 (주석에서 고유한 이미지 URL 수집)
      const uniqueImageUrls = Array.from(
        new Set(result.data.annotations.map((ann) => ann.image_url))
      );
      setImageUrls(uniqueImageUrls);
    } catch (err) {
      console.error('[Sample Feedback] Load error:', err);
      setError('피드백을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddAnnotation(
    positionX: number,
    positionY: number,
    comment: string,
    imageUrl: string
  ) {
    if (!feedback) return;

    try {
      setIsCreating(true);
      const result = await createSampleAnnotation({
        feedback_id: feedbackId,
        image_url: imageUrl,
        position_x: positionX,
        position_y: positionY,
        comment,
      });

      if (!result.success) {
        setError(result.error || '피드백 추가에 실패했습니다.');
        return;
      }

      // 피드백 다시 로드
      await loadFeedback();
    } catch (err) {
      console.error('[Sample Feedback] Add annotation error:', err);
      setError('피드백 추가 중 오류가 발생했습니다.');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteAnnotation(annotationId: string) {
    if (!feedback) return;

    try {
      setIsDeleting(true);
      const result = await deleteSampleAnnotation(annotationId);

      if (!result.success) {
        setError(result.error || '피드백 삭제에 실패했습니다.');
        return;
      }

      // 피드백 다시 로드
      await loadFeedback();
      setSelectedAnnotationId(null);
    } catch (err) {
      console.error('[Sample Feedback] Delete annotation error:', err);
      setError('피드백 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  }

  function handleAnnotationClick(annotationId: string) {
    setSelectedAnnotationId(annotationId);
    // 해당 주석으로 스크롤 (이미지 컨테이너 찾기)
    const annotation = feedback?.annotations.find((ann) => ann.id === annotationId);
    if (annotation) {
      // 이미지 URL로 해당 이미지 찾기
      const imageElement = document.querySelector(`[data-image-url="${annotation.image_url}"]`);
      if (imageElement) {
        imageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error && !feedback) {
    return (
      <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return null;
  }

  // 상태별 배지 및 알림
  const statusConfig = {
    pending: {
      badge: 'secondary' as const,
      label: '검토 중',
      icon: Clock,
      color: 'text-yellow-600',
    },
    approved: {
      badge: 'success' as const,
      label: '승인됨',
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    changes_requested: {
      badge: 'destructive' as const,
      label: '수정 요청',
      icon: XCircle,
      color: 'text-red-600',
    },
  };

  const config = statusConfig[feedback.overall_status];
  const StatusIcon = config.icon;

  // 이미지별 주석 그룹화
  const annotationsByImage = imageUrls.map((imageUrl) => ({
    imageUrl,
    annotations: feedback.annotations.filter((ann) => ann.image_url === imageUrl),
  }));

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              뒤로
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-neutral-900">
                  {feedback.round_number}차 샘플 피드백
                </h1>
                <Badge variant={config.badge} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </div>
              <p className="text-sm text-neutral-600">
                이미지를 클릭하여 수정 요청 사항을 표시하세요
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            disabled
          >
            <Download className="h-4 w-4" />
            Generate Tech Pack Update
          </Button>
        </div>

        {/* 에러 알림 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 메인 컨텐츠 */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* 이미지 및 주석 캔버스 (좌측, 2/3) */}
          <div className="md:col-span-2 space-y-6">
            {annotationsByImage.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-neutral-700 mb-2">
                    샘플 이미지가 없습니다
                  </p>
                  <p className="text-sm text-neutral-500">
                    매니저가 샘플 이미지를 업로드하면 여기에 표시됩니다.
                  </p>
                </CardContent>
              </Card>
            ) : (
              annotationsByImage.map(({ imageUrl, annotations }) => (
                <div key={imageUrl} data-image-url={imageUrl}>
                  <AnnotationCanvas
                    imageUrl={imageUrl}
                    annotations={annotations}
                    onAddAnnotation={(x, y, comment, imgUrl) =>
                      handleAddAnnotation(x, y, comment, imgUrl)
                    }
                    onDeleteAnnotation={handleDeleteAnnotation}
                    isReadOnly={false}
                  />
                </div>
              ))
            )}
          </div>

          {/* 피드백 리스트 (우측, 1/3) */}
          <div className="md:col-span-1">
            <div className="sticky top-6">
              <FeedbackList
                annotations={feedback.annotations}
                onAnnotationClick={handleAnnotationClick}
                selectedAnnotationId={selectedAnnotationId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
