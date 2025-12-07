/**
 * QC Report Page
 * 
 * Interactive QC Report 상세 페이지
 * 권한별로 다른 뷰 제공 (매니저/클라이언트)
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { getQCReport, publishQCReport, reviewQCReport } from '@/actions/qc-actions';
import { QCStatsCard } from '@/components/qc/QCStatsCard';
import { QCItemCard } from '@/components/qc/QCItemCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Edit,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import type { QCReportWithItems, QCReportItem } from '@/lib/types/qc';

export default function QCReportPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const reportId = params.reportId as string;

  const [report, setReport] = useState<QCReportWithItems | null>(null);
  const [isManager, setIsManager] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  async function loadReport() {
    try {
      setIsLoading(true);
      setError(null);

      // 사용자 정보 및 권한 확인
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // 매니저 권한 확인
      const userEmail = user.email?.toLowerCase() || '';
      const isNexsupplyDomain = userEmail.endsWith('@nexsupply.net') && userEmail !== 'k.myungjun@nexsupply.net';
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_manager')
        .eq('id', user.id)
        .single();

      const userIsManager = profile?.is_manager === true || isNexsupplyDomain;
      setIsManager(userIsManager);

      // 리포트 로드
      const result = await getQCReport(reportId);
      if (!result.success || !result.data) {
        setError(result.error || '리포트를 불러올 수 없습니다.');
        return;
      }

      setReport(result.data);
    } catch (err) {
      console.error('[QC Report] Load error:', err);
      setError('리포트를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePublish() {
    if (!report) return;

    try {
      setIsPublishing(true);
      const result = await publishQCReport(reportId);
      
      if (!result.success) {
        setError(result.error || '발행에 실패했습니다.');
        return;
      }

      // 리포트 다시 로드
      await loadReport();
    } catch (err) {
      console.error('[QC Report] Publish error:', err);
      setError('발행 중 오류가 발생했습니다.');
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleApprove() {
    if (!report) return;

    try {
      setIsReviewing(true);
      const result = await reviewQCReport({
        report_id: reportId,
        status: 'approved',
      });

      if (!result.success) {
        setError(result.error || '승인에 실패했습니다.');
        return;
      }

      // 리포트 다시 로드
      await loadReport();
    } catch (err) {
      console.error('[QC Report] Approve error:', err);
      setError('승인 중 오류가 발생했습니다.');
    } finally {
      setIsReviewing(false);
    }
  }

  async function handleReject() {
    if (!report) return;

    try {
      setIsReviewing(true);
      const result = await reviewQCReport({
        report_id: reportId,
        status: 'rejected',
        client_feedback: rejectFeedback,
      });

      if (!result.success) {
        setError(result.error || '거절에 실패했습니다.');
        return;
      }

      setShowRejectDialog(false);
      setRejectFeedback('');
      // 리포트 다시 로드
      await loadReport();
    } catch (err) {
      console.error('[QC Report] Reject error:', err);
      setError('거절 중 오류가 발생했습니다.');
    } finally {
      setIsReviewing(false);
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error && !report) {
    return (
      <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  // 상태별 배지 및 알림
  const statusConfig = {
    draft: {
      badge: 'secondary' as const,
      label: '초안',
      alert: {
        variant: 'info' as const,
        title: '이 리포트는 아직 초안입니다.',
        description: '매니저가 내용을 완성한 후 발행할 예정입니다.',
      },
    },
    published: {
      badge: 'default' as const,
      label: '발행됨',
      alert: {
        variant: 'info' as const,
        title: '이 리포트가 클라이언트에게 공개되었습니다.',
        description: '클라이언트의 승인을 기다리고 있습니다.',
      },
    },
    approved: {
      badge: 'success' as const,
      label: '승인됨',
      alert: {
        variant: 'success' as const,
        title: '클라이언트가 이 리포트를 승인했습니다.',
        description: report.client_feedback || '승인되었습니다.',
      },
    },
    rejected: {
      badge: 'destructive' as const,
      label: '거절됨',
      alert: {
        variant: 'destructive' as const,
        title: '클라이언트가 이 리포트를 거절했습니다.',
        description: report.client_feedback || '수정이 필요합니다.',
      },
    },
  };

  const config = statusConfig[report.status];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
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
                  {report.title}
                </h1>
                <Badge variant={config.badge}>{config.label}</Badge>
              </div>
              {report.inspection_date && (
                <p className="text-sm text-neutral-600">
                  검수일: {new Date(report.inspection_date).toLocaleDateString('ko-KR')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 상태 알림 */}
        <Alert variant={config.alert.variant}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{config.alert.title}</AlertTitle>
          <AlertDescription>{config.alert.description}</AlertDescription>
        </Alert>

        {/* 통계 카드 */}
        <QCStatsCard report={report} />

        {/* 매니저 노트 */}
        {report.manager_note && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                매니저 종합 의견
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 whitespace-pre-wrap">
                {report.manager_note}
              </p>
            </CardContent>
          </Card>
        )}

        {/* 검수 항목 목록 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-neutral-900">
            검수 항목 ({report.items.length})
          </h2>
          {report.items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-neutral-500">
                검수 항목이 없습니다.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {report.items.map((item) => (
                <QCItemCard
                  key={item.id}
                  item={item}
                  isManager={isManager && report.status === 'draft'}
                />
              ))}
            </div>
          )}
        </div>

        {/* 매니저 액션 바 */}
        {isManager && report.status === 'draft' && (
          <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4 rounded-t-lg shadow-lg">
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/projects/${projectId}/qc/${reportId}/edit`)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                수정하기
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="gap-2"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    발행 중...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    리포트 발행
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 클라이언트 액션 바 */}
        {!isManager && report.status === 'published' && (
          <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4 rounded-t-lg shadow-lg">
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(true)}
                disabled={isReviewing}
                className="gap-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" />
                거절 및 수정 요청
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isReviewing}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                {isReviewing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    승인
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 거절 다이얼로그 */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>리포트 거절 및 수정 요청</DialogTitle>
              <DialogDescription>
                거절 사유를 입력해주세요. 매니저가 확인 후 수정하겠습니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <textarea
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                placeholder="수정이 필요한 부분을 구체적으로 설명해주세요..."
                className="w-full min-h-[120px] p-3 border border-neutral-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectFeedback('');
                }}
              >
                취소
              </Button>
              <Button
                onClick={handleReject}
                disabled={!rejectFeedback.trim() || isReviewing}
                className="bg-red-600 hover:bg-red-700"
              >
                {isReviewing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    처리 중...
                  </>
                ) : (
                  '거절하기'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
