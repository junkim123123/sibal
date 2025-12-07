/**
 * Manager Chat Component
 * 
 * 실시간 채팅 컴포넌트 (Supabase Realtime 사용)
 * 관리자와 사용자 간의 실시간 채팅 인터페이스
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, Loader2, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ChatMessage {
  id: string;
  sender_id: string;
  role: 'user' | 'manager';
  content: string;
  created_at: string;
  file_url?: string | null;
  file_type?: string | null;
  file_name?: string | null;
}

interface ManagerChatProps {
  sessionId: string;
  projectId: string;
  userId: string;
  onClose?: () => void;
  showQuickReplies?: boolean;
  isManager?: boolean;
}

const QUICK_REPLIES = [
  "Checking the quote. I'll get back to you shortly.",
  "Sample has been shipped. Please check the tracking number.",
  "QC inspection is complete. Waiting for final approval.",
  "Supplier verification is complete.",
  "Shipping preparation is complete. Will be dispatched soon.",
];

export function ManagerChat({ 
  sessionId, 
  projectId, 
  userId, 
  onClose,
  showQuickReplies = false,
  isManager = false,
}: ManagerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 기존 메시지 로드
  useEffect(() => {
    if (!sessionId) {
      console.warn('[ManagerChat] No sessionId provided, skipping message load');
      setIsLoading(false);
      return;
    }

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        if (data) {
          setMessages(data);
        }
      } catch (error) {
        console.error('[ManagerChat] Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [sessionId, supabase]);

  // Supabase Realtime 구독
  useEffect(() => {
    if (!sessionId) {
      console.warn('[ManagerChat] No sessionId provided, skipping realtime subscription');
      return;
    }

    const channel = supabase
      .channel(`chat-session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, supabase]);

  // AI 분석 데이터 로드
  const handleViewAnalysis = async () => {
    if (!projectId || isLoadingAnalysis) return;

    setIsLoadingAnalysis(true);
    setShowAnalysisModal(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/analysis`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.ok) {
        setAnalysisData({
          answers: data.answers,
          ai_analysis: data.ai_analysis,
        });
      } else {
        console.error('[ManagerChat] Failed to load analysis:', data.error);
        setAnalysisData(null);
      }
    } catch (error) {
      console.error('[ManagerChat] Error loading analysis:', error);
      setAnalysisData(null);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending || !sessionId) return;

    const messageContent = inputMessage.trim();
    const tempMessageId = `temp-${Date.now()}`;
    
    // Optimistic update: 즉시 UI에 메시지 추가
    const optimisticMessage: ChatMessage = {
      id: tempMessageId,
      sender_id: userId,
      role: isManager ? 'manager' : 'user',
      content: messageContent,
      created_at: new Date().toISOString(),
      file_url: null,
      file_type: null,
      file_name: null,
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      // API를 통해 메시지 전송 (중요 파일 알림 포함)
      const response = await fetch('/api/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          sender_id: userId,
          role: isManager ? 'manager' : 'user',
          content: messageContent,
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // 성공 시 임시 메시지를 실제 메시지로 교체
      if (data.message) {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === tempMessageId 
              ? {
                  ...data.message,
                  sender_id: userId,
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('[ManagerChat] Failed to send message:', error);
      // 실패 시 optimistic update 제거 및 입력 복원
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
      setInputMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="font-semibold text-gray-900">Live Chat</h3>
          <p className="text-xs text-gray-500">Chat with your NexSupply expert</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View AI Analysis Button (Manager Only) */}
          {isManager && projectId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAnalysis}
              disabled={isLoadingAnalysis}
              className="flex items-center gap-2"
            >
              {isLoadingAnalysis ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              View AI Analysis
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm space-y-3">
            <div className="text-center">
              <p className="mb-2">No messages yet.</p>
              <p className="text-xs text-gray-400">
                {!projectId || !sessionId 
                  ? 'Preparing chat session...'
                  : 'Send your first message. Your manager will respond once assigned.'
                }
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isManagerMessage = message.role === 'manager';
            const isSystemMessage = message.content.startsWith('System:');
            const isOwnMessage = (isManager && isManagerMessage) || (!isManager && !isManagerMessage && message.sender_id === userId);
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    isSystemMessage
                      ? 'bg-yellow-50 border border-yellow-200'
                      : isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {isSystemMessage && (
                    <p className="text-xs font-semibold text-yellow-700 mb-1">System</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isOwnMessage 
                      ? 'text-blue-100' 
                      : isSystemMessage
                      ? 'text-yellow-600'
                      : 'text-gray-500'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies (Manager Only) */}
      {showQuickReplies && isManager && (
        <div className="px-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Quick Replies:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_REPLIES.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputMessage(reply);
                }}
                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            disabled={isSending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* AI Analysis Modal */}
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Analysis Preview</DialogTitle>
            <DialogDescription>
              Review the AI-generated analysis for this project
            </DialogDescription>
          </DialogHeader>

          {isLoadingAnalysis ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : analysisData ? (
            <div className="space-y-6 mt-4">
              {/* Answers Section */}
              {analysisData.answers && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {Object.entries(analysisData.answers).map(([key, value]: [string, any]) => {
                      if (!value || value === 'skip' || value === 'Skip') return null;
                      return (
                        <div key={key} className="border-b border-gray-200 pb-2 last:border-0">
                          <p className="text-sm font-medium text-gray-700 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </p>
                          <p className="text-sm text-gray-900 mt-1">{String(value)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Analysis Section */}
              {analysisData.ai_analysis && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Analysis</h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                    {analysisData.ai_analysis.summary && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Summary</p>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {analysisData.ai_analysis.summary}
                        </p>
                      </div>
                    )}
                    {analysisData.ai_analysis.recommendations && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Recommendations</p>
                        <ul className="list-disc list-inside text-sm text-gray-900 space-y-1">
                          {Array.isArray(analysisData.ai_analysis.recommendations)
                            ? analysisData.ai_analysis.recommendations.map((rec: string, idx: number) => (
                                <li key={idx}>{rec}</li>
                              ))
                            : Object.entries(analysisData.ai_analysis.recommendations || {}).map(
                                ([key, value]: [string, any]) => (
                                  <li key={key}>
                                    <strong>{key}:</strong> {String(value)}
                                  </li>
                                )
                              )}
                        </ul>
                      </div>
                    )}
                    {analysisData.ai_analysis.financials && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Financial Analysis</p>
                        <div className="bg-white rounded p-3 text-sm text-gray-900">
                          {analysisData.ai_analysis.financials.estimated_landed_cost && (
                            <p>
                              <strong>Estimated Landed Cost:</strong> $
                              {Number(analysisData.ai_analysis.financials.estimated_landed_cost).toFixed(2)}
                            </p>
                          )}
                          {analysisData.ai_analysis.financials.breakdown && (
                            <div className="mt-2">
                              <p className="font-medium mb-1">Cost Breakdown:</p>
                              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                {JSON.stringify(analysisData.ai_analysis.financials.breakdown, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {analysisData.ai_analysis.risk_assessment && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Risk Assessment</p>
                        <div className="bg-white rounded p-3 text-sm text-gray-900">
                          {analysisData.ai_analysis.risk_assessment.overall_risk && (
                            <p>
                              <strong>Overall Risk:</strong>{' '}
                              {String(analysisData.ai_analysis.risk_assessment.overall_risk)}
                            </p>
                          )}
                          {analysisData.ai_analysis.risk_assessment.risk_factors && (
                            <div className="mt-2">
                              <p className="font-medium mb-1">Risk Factors:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {Array.isArray(analysisData.ai_analysis.risk_assessment.risk_factors)
                                  ? analysisData.ai_analysis.risk_assessment.risk_factors.map(
                                      (factor: string, idx: number) => <li key={idx}>{factor}</li>
                                    )
                                  : Object.entries(
                                      analysisData.ai_analysis.risk_assessment.risk_factors || {}
                                    ).map(([key, value]: [string, any]) => (
                                      <li key={key}>
                                        <strong>{key}:</strong> {String(value)}
                                      </li>
                                    ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Full AI Analysis JSON (for debugging) */}
                    <details className="mt-4">
                      <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                        View Full Analysis (JSON)
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto max-h-64">
                        {JSON.stringify(analysisData.ai_analysis, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              )}

              {!analysisData.answers && !analysisData.ai_analysis && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No analysis data available for this project</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Failed to load analysis data</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

