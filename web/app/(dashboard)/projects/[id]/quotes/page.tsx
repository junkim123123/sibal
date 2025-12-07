/**
 * Quote Comparison Page
 * 
 * Visual Quote Comparison 페이지
 * 공장 견적을 비교하고 선택할 수 있는 인터페이스
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getQuotes, selectQuote } from '@/actions/quote-actions';
import { ComparisonCard } from '@/components/quotes/ComparisonCard';
import { ComparisonTable } from '@/components/quotes/ComparisonTable';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import type { FactoryQuote } from '@/lib/types/quote';

export default function QuotesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [quotes, setQuotes] = useState<FactoryQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [selectedQuoteName, setSelectedQuoteName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    loadQuotes();
  }, [projectId]);

  async function loadQuotes() {
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

      // 매니저 권한 확인
      const userEmail = user.email?.toLowerCase() || '';
      const isNexsupplyDomain = userEmail.endsWith('@nexsupply.net') && userEmail !== 'k.myungjun@nexsupply.net';
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_manager')
        .eq('id', user.id)
        .single();

      const userIsManager = profile?.is_manager === true || isNexsupplyDomain;
      setIsReadOnly(userIsManager); // 매니저는 읽기 전용

      // 견적 로드
      const result = await getQuotes(projectId);
      if (!result.success || !result.data) {
        setError(result.error || '견적을 불러올 수 없습니다.');
        return;
      }

      setQuotes(result.data);
    } catch (err) {
      console.error('[Quotes] Load error:', err);
      setError('견적을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectClick(quoteId: string) {
    const quote = quotes.find((q) => q.id === quoteId);
    if (quote) {
      setSelectedQuoteId(quoteId);
      setSelectedQuoteName(quote.factory_name);
      setShowConfirmDialog(true);
    }
  }

  async function handleConfirmSelect() {
    if (!selectedQuoteId) return;

    try {
      setIsSelecting(true);
      const result = await selectQuote({
        project_id: projectId,
        quote_id: selectedQuoteId,
      });

      if (!result.success) {
        setError(result.error || '견적 선택에 실패했습니다.');
        setShowConfirmDialog(false);
        return;
      }

      // 성공 시 견적 다시 로드
      await loadQuotes();
      setShowConfirmDialog(false);
      setSelectedQuoteId(null);
      setSelectedQuoteName('');
    } catch (err) {
      console.error('[Quotes] Select error:', err);
      setError('견적 선택 중 오류가 발생했습니다.');
      setShowConfirmDialog(false);
    } finally {
      setIsSelecting(false);
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error && quotes.length === 0) {
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

  const selectedQuote = quotes.find((q) => q.status === 'selected');
  const recommendedQuotes = quotes.filter((q) => q.is_recommended);

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
              <h1 className="text-3xl font-bold text-neutral-900">
                견적 비교
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                {quotes.length}개의 공장 견적을 비교하세요
              </p>
            </div>
          </div>
        </div>

        {/* 에러 알림 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 선택된 견적 알림 */}
        {selectedQuote && (
          <Alert variant="success">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>선택된 공장</AlertTitle>
            <AlertDescription>
              <strong>{selectedQuote.factory_name}</strong> 공장이 선택되었습니다.
            </AlertDescription>
          </Alert>
        )}

        {/* 추천 견적 알림 */}
        {recommendedQuotes.length > 0 && !selectedQuote && (
          <Alert variant="info">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>NexSupply 추천</AlertTitle>
            <AlertDescription>
              {recommendedQuotes.map((q) => q.factory_name).join(', ')} 공장이 NexSupply AI에 의해 추천되었습니다.
            </AlertDescription>
          </Alert>
        )}

        {/* 견적이 없는 경우 */}
        {quotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-neutral-700 mb-2">
                비교할 견적이 없습니다
              </p>
              <p className="text-sm text-neutral-500">
                매니저가 견적을 추가하면 여기에 표시됩니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 모바일: 카드 뷰 */}
            <div className="block md:hidden space-y-4">
              {quotes.map((quote) => (
                <ComparisonCard
                  key={quote.id}
                  quote={quote}
                  onSelect={!isReadOnly ? handleSelectClick : undefined}
                  isSelected={quote.status === 'selected'}
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>

            {/* 데스크탑: 테이블 뷰 */}
            <div className="hidden md:block">
              <Card>
                <CardContent className="p-0">
                  <ComparisonTable
                    quotes={quotes}
                    onSelect={!isReadOnly ? handleSelectClick : undefined}
                    isReadOnly={isReadOnly}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* 확인 다이얼로그 */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>공장 선택 확인</DialogTitle>
              <DialogDescription>
                정말 <strong>{selectedQuoteName}</strong> 공장으로 진행하시겠습니까?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-neutral-600">
                선택하시면 다른 모든 견적은 자동으로 거절 처리되며, 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedQuoteId(null);
                  setSelectedQuoteName('');
                }}
                disabled={isSelecting}
              >
                취소
              </Button>
              <Button
                onClick={handleConfirmSelect}
                disabled={isSelecting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSelecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    처리 중...
                  </>
                ) : (
                  '확인'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
