/**
 * Manager Chat Component
 * 
 * 실시간 채팅 컴포넌트 (Supabase Realtime 사용)
 * 관리자와 사용자 간의 실시간 채팅 인터페이스
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 기존 메시지 로드
  useEffect(() => {
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

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const messageContent = inputMessage.trim();
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
    } catch (error) {
      console.error('[ManagerChat] Failed to send message:', error);
      setInputMessage(messageContent); // 실패 시 입력 복원
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
          <h3 className="font-semibold text-gray-900">실시간 채팅</h3>
          <p className="text-xs text-gray-500">NexSupply 전문가와 소통하세요</p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            닫기
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm space-y-3">
            <div className="text-center">
              <p className="mb-2">아직 메시지가 없습니다.</p>
              <p className="text-xs text-gray-400">
                {!projectId || !sessionId 
                  ? '채팅 세션을 준비 중입니다...'
                  : '첫 메시지를 보내주세요. 매니저가 배당되면 답변을 드립니다.'
                }
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isManagerMessage = message.role === 'manager';
            const isSystemMessage = message.content.startsWith('System:');
            const isOwnMessage = isManager && isManagerMessage;
            
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
                    {new Date(message.created_at).toLocaleTimeString('ko-KR', {
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
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    </div>
  );
}

