/**
 * Manager Chat Component
 * 
 * 실시간 채팅 컴포넌트 (Supabase Realtime 사용)
 * 관리자와 사용자 간의 실시간 채팅 인터페이스
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, Loader2, FileText, X, Paperclip, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
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
  role: 'user' | 'manager' | 'system';
  content: string;
  created_at: string;
  file_url?: string | null;
  file_type?: string | null;
  file_name?: string | null;
  message_type?: 'text' | 'quote' | 'system';
  quote_data?: {
    title: string;
    price: number;
    currency?: string;
    description?: string;
  };
}

interface ManagerChatProps {
  sessionId: string;
  projectId: string;
  userId: string;
  onClose?: () => void;
  showQuickReplies?: boolean;
  isManager?: boolean;
  projectData?: {
    name?: string;
    quantity?: number;
    targetPrice?: number;
    port?: string;
  } | null;
}

const QUICK_REPLIES = [
  "Checking the quote. I'll get back to you shortly.",
  "Sample has been shipped. Please check the tracking number.",
  "QC inspection is complete. Waiting for final approval.",
  "Supplier verification is complete.",
  "Shipping preparation is complete. Will be dispatched soon.",
];

const CLIENT_START_MESSAGES = [
  "Hello! I'd like to discuss my project requirements.",
  "Can you provide an update on my project status?",
  "I have some questions about the sourcing process.",
  "When can I expect to receive samples?",
  "What's the estimated timeline for my order?",
];

export function ManagerChat({ 
  sessionId, 
  projectId, 
  userId, 
  onClose,
  showQuickReplies = false,
  isManager = false,
  projectData = null,
}: ManagerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ file: File; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // 메시지 스크롤 (모바일에서는 조건부로만)
  useEffect(() => {
    // 모바일 감지
    const isMobile = window.innerWidth < 768;
    
    // 모바일에서는 입력 필드가 포커스되어 있지 않을 때만 스크롤
    if (isMobile) {
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' || 
                            activeElement?.tagName === 'TEXTAREA' ||
                            activeElement?.getAttribute('contenteditable') === 'true';
      
      // 입력 필드가 포커스되어 있으면 스크롤하지 않음
      if (isInputFocused) {
        return;
      }
      
      // 사용자가 이미 하단 근처에 있는지 확인
      const container = messagesEndRef.current?.parentElement?.parentElement;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
        if (!isNearBottom) {
          // 사용자가 위쪽을 보고 있으면 자동 스크롤하지 않음
          return;
        }
      }
    }
    
    const timeoutId = setTimeout(() => {
      // 모바일에서는 scrollIntoView 대신 scrollTop 사용 (더 부드럽게)
      if (isMobile) {
        const container = messagesEndRef.current?.parentElement?.parentElement;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timeoutId);
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
        console.log('[ManagerChat] Loading messages for session:', sessionId);
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('[ManagerChat] Error loading messages:', error);
          throw error;
        }
        
        if (data) {
          console.log('[ManagerChat] Loaded messages:', data.length);
          console.log('[ManagerChat] Messages:', data.map(m => ({ id: m.id, role: m.role, sender_id: m.sender_id, content: m.content?.substring(0, 50) })));
          setMessages(data);
        } else {
          console.log('[ManagerChat] No messages found');
          setMessages([]);
        }
      } catch (error) {
        console.error('[ManagerChat] Failed to load messages:', error);
        setMessages([]);
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

    console.log('[ManagerChat] Setting up Realtime subscription for session:', sessionId);

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
          console.log('[ManagerChat] New message received via Realtime:', payload.new);
          const newMessage = payload.new as ChatMessage;
          
          // 중복 메시지 체크 (이미 있는 메시지는 추가하지 않음)
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) {
              console.log('[ManagerChat] Message already exists, skipping:', newMessage.id);
              return prev;
            }
            console.log('[ManagerChat] Adding new message to state');
            
            // 새 메시지가 도착했고, 사용자가 현재 탭에 있지 않거나 매니저 메시지인 경우 알림 표시
            if (!isManager && newMessage.role === 'manager' && 'Notification' in window && Notification.permission === 'granted') {
              // 사용자가 다른 탭에 있거나 페이지가 포커스되지 않은 경우에만 알림 표시
              if (document.hidden || !document.hasFocus()) {
                new Notification('New message from your Dedicated Expert', {
                  body: newMessage.content.length > 100 
                    ? newMessage.content.substring(0, 100) + '...' 
                    : newMessage.content,
                  icon: '/favicon.ico',
                  tag: `chat-${sessionId}`,
                  requireInteraction: false,
                });
              }
            }
            
            return [...prev, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log('[ManagerChat] Realtime subscription status:', status);
      });

    return () => {
      console.log('[ManagerChat] Cleaning up Realtime subscription');
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

  // 파일 업로드 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 미리보기
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewFile({
          file,
          preview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewFile({ file, preview: '' });
    }
  };

  // 파일 업로드 및 메시지 전송
  const handleFileUpload = async () => {
    if (!previewFile || !sessionId || uploadingFile) return;

    setUploadingFile(true);
    const tempMessageId = `temp-${Date.now()}`;

    try {
      // Supabase Storage에 파일 업로드
      const fileExt = previewFile.file.name.split('.').pop();
      const fileName = `${sessionId}/${Date.now()}.${fileExt}`;
      const filePath = `chat-files/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, previewFile.file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      // Optimistic update
      const optimisticMessage: ChatMessage = {
        id: tempMessageId,
        sender_id: userId,
        role: isManager ? 'manager' : 'user',
        content: previewFile.file.name,
        created_at: new Date().toISOString(),
        file_url: publicUrl,
        file_type: previewFile.file.type,
        file_name: previewFile.file.name,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setPreviewFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // API를 통해 메시지 전송
      const response = await fetch('/api/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          sender_id: userId,
          role: isManager ? 'manager' : 'user',
          content: previewFile.file.name,
          file_url: publicUrl,
          file_type: previewFile.file.type,
          file_name: previewFile.file.name,
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to send file');
      }

      // 실제 메시지로 교체
      if (data.message) {
        setMessages((prev) => {
          const tempIndex = prev.findIndex((msg) => msg.id === tempMessageId);
          if (tempIndex >= 0) {
            const updated = [...prev];
            updated[tempIndex] = {
              ...data.message,
              sender_id: userId,
              role: isManager ? 'manager' : 'user',
            };
            return updated;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('[ManagerChat] Failed to upload file:', error);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingFile(false);
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
        setMessages((prev) => {
          // 임시 메시지 찾기
          const tempIndex = prev.findIndex((msg) => msg.id === tempMessageId);
          if (tempIndex >= 0) {
            // 임시 메시지를 실제 메시지로 교체
            const updated = [...prev];
            updated[tempIndex] = {
              ...data.message,
              sender_id: userId,
              role: isManager ? 'manager' : 'user',
            };
            return updated;
          } else {
            // 임시 메시지가 없으면 (이미 Realtime으로 추가되었을 수 있음) 그냥 추가
            const exists = prev.some((msg) => msg.id === data.message.id);
            if (!exists) {
              return [...prev, {
                ...data.message,
                sender_id: userId,
                role: isManager ? 'manager' : 'user',
              }];
            }
            return prev;
          }
        });
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
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex-1 min-w-0 mb-2 sm:mb-0">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Live Chat</h3>
          <p className="text-xs text-gray-500 hidden sm:block">Chat with your NexSupply expert</p>
          {/* Contextual Summary (Manager Only) */}
          {isManager && projectData && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 text-xs">
                {projectData.name && (
                  <span className="text-gray-700 truncate">
                    <span className="font-semibold">Product:</span> <span className="truncate">{projectData.name}</span>
                  </span>
                )}
                {projectData.quantity && (
                  <span className="text-gray-700">
                    <span className="font-semibold">QTY:</span> {projectData.quantity.toLocaleString()} units
                  </span>
                )}
                {projectData.targetPrice && (
                  <span className="text-gray-700">
                    <span className="font-semibold">Target:</span> ${projectData.targetPrice}
                  </span>
                )}
                {projectData.port && (
                  <span className="text-gray-700">
                    <span className="font-semibold">Port:</span> {projectData.port}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* View AI Analysis Button (Manager Only) */}
          {isManager && projectId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAnalysis}
              disabled={isLoadingAnalysis}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
            >
              {isLoadingAnalysis ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="hidden sm:inline">View AI Analysis</span>
              <span className="sm:hidden">AI</span>
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm space-y-4">
            <div className="text-center">
              <p className="mb-2">No messages yet.</p>
              <p className="text-xs text-gray-400 mb-4">
                {!projectId || !sessionId 
                  ? 'Preparing chat session...'
                  : isManager
                  ? 'Start the conversation with your client.'
                  : 'Send your first message. Your manager will respond once assigned.'
                }
              </p>
              
              {/* 클라이언트용 초기 메시지 제안 - 가로 스크롤 칩 형태 */}
              {!isManager && projectId && sessionId && (
                <div className="mt-6">
                  <p className="text-xs font-medium text-gray-600 mb-3 text-center">Suggested messages:</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 px-2 max-w-md mx-auto scrollbar-hide">
                    {CLIENT_START_MESSAGES.map((message, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputMessage(message);
                          // 자동으로 포커스 이동
                          setTimeout(() => {
                            const input = document.querySelector('input[type="text"][placeholder="Type your message..."]') as HTMLInputElement;
                            input?.focus();
                          }, 100);
                        }}
                        className="px-4 py-2 text-xs sm:text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-full transition-colors text-gray-700 whitespace-nowrap flex-shrink-0"
                      >
                        {message}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isManagerMessage = message.role === 'manager';
            const isSystemMessage = message.role === 'system' || message.content.startsWith('System:') || message.content.startsWith('[System]');
            const isQuoteMessage = message.message_type === 'quote' || message.quote_data;
            
            // 자신의 메시지인지 확인
            const isOwnMessage = 
              (isManager && isManagerMessage && message.sender_id === userId) ||
              (!isManager && !isManagerMessage && message.sender_id === userId);
            
            // 상대방 메시지
            const isOtherMessage = !isOwnMessage && !isSystemMessage;
            
            // 시스템 메시지 렌더링
            if (isSystemMessage) {
              return (
                <div key={message.id} className="flex items-center justify-center my-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <p className="text-xs text-gray-500 text-center">
                      {message.content.replace(/^\[System\]:?\s*/i, '').replace(/^System:\s*/i, '')}
                    </p>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              );
            }

            // 견적서 카드 렌더링
            if (isQuoteMessage && message.quote_data) {
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[85%] sm:max-w-[80%] rounded-lg border-2 border-[#008080] bg-white shadow-md overflow-hidden">
                    <div className="bg-[#008080] text-white px-4 py-2">
                      <p className="text-sm font-semibold">{message.quote_data.title || 'Official Quote Ready'}</p>
                    </div>
                    <div className="p-4">
                      {message.quote_data.description && (
                        <p className="text-sm text-gray-700 mb-3">{message.quote_data.description}</p>
                      )}
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-bold text-gray-900">
                          {message.quote_data.currency || '$'}{message.quote_data.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">per unit</span>
                      </div>
                      <Button
                        onClick={() => {
                          // 견적서 승인 로직 (프로젝트 상세 페이지로 이동)
                          window.location.href = `/dashboard/projects/${projectId}`;
                        }}
                        className="w-full bg-[#008080] hover:bg-teal-700 text-white"
                      >
                        View & Approve
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 px-4 pb-2 text-right">
                      {new Date(message.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            }
            
            // 일반 메시지 렌더링
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2.5 sm:p-3 ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {isOtherMessage && (
                    <p className="text-[10px] sm:text-xs font-medium text-gray-600 mb-1">
                      {isManagerMessage ? 'Manager' : 'You'}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  
                  {/* 파일 미리보기 */}
                  {message.file_url && (
                    <div className="mt-2">
                      {message.file_type?.startsWith('image/') ? (
                        <a
                          href={message.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg overflow-hidden border border-gray-300 hover:border-gray-400 transition-colors"
                        >
                          <img
                            src={message.file_url}
                            alt={message.file_name || 'Image'}
                            className="max-w-full h-auto max-h-64 object-contain"
                          />
                        </a>
                      ) : (
                        <a
                          href={message.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg mt-2 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{message.file_name || 'File'}</span>
                        </a>
                      )}
                    </div>
                  )}
                  
                  <p className={`text-[10px] sm:text-xs mt-1 ${
                    isOwnMessage 
                      ? 'text-blue-100' 
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
        <div className="px-3 sm:px-4 pt-3 sm:pt-4 border-t border-gray-200 flex-shrink-0">
          <p className="text-xs text-gray-500 mb-2">Quick Replies:</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {QUICK_REPLIES.map((reply, idx) => (
              <button
                key={idx}
                onClick={async () => {
                  if (!sessionId || isSending) return;
                  
                  const tempMessageId = `temp-${Date.now()}`;
                  const optimisticMessage: ChatMessage = {
                    id: tempMessageId,
                    sender_id: userId,
                    role: 'manager',
                    content: reply,
                    created_at: new Date().toISOString(),
                    file_url: null,
                    file_type: null,
                    file_name: null,
                  };
                  
                  setMessages((prev) => [...prev, optimisticMessage]);
                  setIsSending(true);

                  try {
                    const response = await fetch('/api/chat-messages', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        session_id: sessionId,
                        sender_id: userId,
                        role: 'manager',
                        content: reply,
                      }),
                    });

                    const data = await response.json();
                    if (!data.ok) throw new Error(data.error || 'Failed to send message');

                    if (data.message) {
                      setMessages((prev) => {
                        const tempIndex = prev.findIndex((msg) => msg.id === tempMessageId);
                        if (tempIndex >= 0) {
                          const updated = [...prev];
                          updated[tempIndex] = {
                            ...data.message,
                            sender_id: userId,
                            role: 'manager',
                          };
                          return updated;
                        }
                        return prev;
                      });
                    }
                  } catch (error) {
                    console.error('[ManagerChat] Failed to send quick reply:', error);
                    setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
                  } finally {
                    setIsSending(false);
                  }
                }}
                disabled={isSending}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-gray-100 hover:bg-[#008080] hover:text-white text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* File Preview */}
      {previewFile && (
        <div className="px-3 sm:px-4 pt-3 sm:pt-4 border-t border-gray-200 flex-shrink-0">
          <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200 flex items-start gap-2 sm:gap-3">
            {previewFile.preview ? (
              <img
                src={previewFile.preview}
                alt="Preview"
                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
              />
            ) : (
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {previewFile.file.name}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500">
                {(previewFile.file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => setPreviewFile(null)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              onClick={handleFileUpload}
              disabled={uploadingFile}
              className="bg-[#008080] hover:bg-teal-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 flex-1 sm:flex-none"
            >
              {uploadingFile ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Uploading...</span>
                  <span className="sm:hidden">Uploading</span>
                </>
              ) : (
                'Send File'
              )}
            </Button>
            <Button
              onClick={() => setPreviewFile(null)}
              variant="outline"
              disabled={uploadingFile}
              className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex gap-2">
          {/* File Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            disabled={isSending || uploadingFile || !!previewFile}
            title="Attach file"
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
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
            className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white min-w-0"
            disabled={isSending || uploadingFile || !!previewFile}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending || uploadingFile || !!previewFile}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 sm:px-4 flex-shrink-0"
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

