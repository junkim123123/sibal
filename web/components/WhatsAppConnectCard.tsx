/**
 * WhatsApp/Telegram Connect Card Component
 * 
 * 채팅 대신 WhatsApp/Telegram으로 연결하는 카드
 */

'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Phone, CheckCircle2, Copy, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

interface WhatsAppConnectCardProps {
  projectId: string;
  projectName?: string;
  managerId?: string | null;
  clientName?: string;
}

export function WhatsAppConnectCard({
  projectId,
  projectName = 'your project',
  managerId,
  clientName,
}: WhatsAppConnectCardProps) {
  const [managerPhone, setManagerPhone] = useState<string | null>(null);
  const [managerName, setManagerName] = useState<string | null>(null);
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userPhone, setUserPhone] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [callbackRequested, setCallbackRequested] = useState(false);

  useEffect(() => {
    loadManagerContact();
    loadUserPhone();
  }, [managerId]);

  const loadManagerContact = async () => {
    if (!managerId) {
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('phone, full_name, telegram_id')
        .eq('id', managerId)
        .single();

      if (error) {
        console.error('[WhatsAppConnectCard] Failed to load manager contact:', error);
      } else if (data) {
        setManagerPhone(data.phone || null);
        setManagerName(data.full_name || 'Your Manager');
        setTelegramId(data.telegram_id || null);
      }
    } catch (error) {
      console.error('[WhatsAppConnectCard] Error loading manager contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPhone = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single();

      if (!error && profile?.phone) {
        setUserPhone(profile.phone);
      }
    } catch (error) {
      console.error('[WhatsAppConnectCard] Error loading user phone:', error);
    }
  };

  // WhatsApp 링크 생성 (전화번호 포맷팅)
  const formatPhoneForWhatsApp = (phone: string): string => {
    // + 기호와 공백, 특수문자 제거, 숫자만 남기기
    const cleaned = phone.replace(/[\s\+()-]/g, '');
    return cleaned;
  };

  const getWhatsAppLink = (): string | null => {
    // Default phone number for WhatsApp (hardcoded)
    // Format: Country code + Area code + Number (no symbols)
    const DEFAULT_PHONE = '13146577892'; // +1 (314) 657-7892
    
    // Use manager phone if available, otherwise use default
    const phoneToUse = managerPhone ? formatPhoneForWhatsApp(managerPhone) : DEFAULT_PHONE;
    
    const projectContext = `Hello Myungjun, I have a question about the project: ${projectName}`;
    const encodedMessage = encodeURIComponent(projectContext);
    
    return `https://wa.me/${phoneToUse}?text=${encodedMessage}`;
  };

  const handleCopyAgentId = () => {
    if (telegramId) {
      navigator.clipboard.writeText(telegramId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartWhatsApp = async () => {
    if (!whatsAppLink || !userPhone.trim() || isSaving) return;

    setIsSaving(true);

    try {
      // 1. Save/Update phone number to user profile
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ phone: userPhone.trim() })
          .eq('id', user.id);

        if (updateError) {
          console.error('[WhatsAppConnectCard] Failed to update phone:', updateError);
        }
      }

      // 2. Log activity event
      try {
        const response = await fetch('/api/manager/activity-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            activity_type: 'whatsapp_connect_clicked',
            metadata: {
              user_phone: userPhone.trim(),
              project_name: projectName,
            },
          }),
        });

        if (!response.ok) {
          console.error('[WhatsAppConnectCard] Failed to log activity');
        }
      } catch (error) {
        console.error('[WhatsAppConnectCard] Error logging activity:', error);
        // Don't block the flow if logging fails
      }

      // 3. Open WhatsApp URL in new tab
      window.open(whatsAppLink, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('[WhatsAppConnectCard] Error in handleStartWhatsApp:', error);
      alert('Failed to start WhatsApp chat. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestCallback = async () => {
    if (callbackRequested) return;

    try {
      // Log callback request
      const response = await fetch('/api/manager/activity-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          activity_type: 'callback_requested',
          metadata: {
            user_phone: userPhone.trim() || 'Not provided',
            project_name: projectName,
          },
        }),
      });

      if (response.ok) {
        setCallbackRequested(true);
        // Show toast-like notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
        notification.innerHTML = '<span>✓</span> <span>Callback request sent!</span>';
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.remove();
        }, 3000);
      }
    } catch (error) {
      console.error('[WhatsAppConnectCard] Error requesting callback:', error);
      alert('Failed to send callback request. Please try again.');
    }
  };

  const whatsAppLink = getWhatsAppLink();

  // Generate QR Code URL using external API
  const getQRCodeUrl = (): string | null => {
    if (!whatsAppLink) return null;
    // Using qrserver.com API for QR code generation
    const encodedUrl = encodeURIComponent(whatsAppLink);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
  };

  const qrCodeUrl = getQRCodeUrl();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6">
      {/* Connect Card */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-8 space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Chat with your Dedicated Agent
          </h2>
          <p className="text-gray-600 text-sm">
            For the fastest response and file sharing, please communicate directly via WhatsApp. Your expert is ready to help.
          </p>
        </div>

        {/* Manager Info */}
        {managerName && (
          <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-medium text-teal-900">
                Your Agent: {managerName}
              </span>
            </div>
          </div>
        )}

        {/* Contact Section: Flex Layout (Text + Button | QR Code) */}
        {whatsAppLink ? (
          <div className="space-y-4">
            {/* Phone Number Input Field */}
            <div>
              <label htmlFor="whatsapp-phone" className="block text-sm font-medium text-gray-700 mb-2">
                Your WhatsApp Number
              </label>
              <input
                id="whatsapp-phone"
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="Enter your number (e.g., 010-1234-5678)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                We'll use this number to connect you via WhatsApp
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Left: Button */}
              <div className="flex-1 w-full md:w-auto space-y-3">
                <Button
                  onClick={handleStartWhatsApp}
                  disabled={!userPhone.trim() || isSaving}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Start WhatsApp Chat
                    </>
                  )}
                </Button>

                {/* Request Callback Link */}
                <button
                  onClick={handleRequestCallback}
                  disabled={callbackRequested}
                  className="w-full text-xs text-gray-600 hover:text-teal-600 underline text-center disabled:text-gray-400 disabled:no-underline"
                >
                  {callbackRequested ? '✓ Callback requested' : "Don't have WhatsApp? Request a Callback"}
                </button>
              </div>

              {/* Right: QR Code */}
              {qrCodeUrl && (
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm">
                    <Image
                      src={qrCodeUrl}
                      alt="WhatsApp QR Code"
                      width={160}
                      height={160}
                      className="w-40 h-40"
                      unoptimized
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center max-w-[160px]">
                    Scan to chat on mobile
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 text-center">
              Your agent's contact information will be available once assigned.
            </p>
          </div>
        )}

        {/* Telegram Alternative */}
        {telegramId && (
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <p className="text-xs text-gray-500 text-center">
              Prefer Telegram? Copy your agent's ID:
            </p>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <code className="flex-1 text-sm font-mono text-gray-700">
                {telegramId}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAgentId}
                className="flex-shrink-0"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            <strong className="text-gray-500">Disclaimer:</strong> Official quotes and payments must be processed through the NexSupply dashboard to be valid. WhatsApp is for communication only.
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 text-center max-w-md">
        <p className="text-sm text-gray-500">
          💡 <strong>Tip:</strong> For file sharing or urgent inquiries, messaging apps are the fastest way to get in touch.
        </p>
      </div>
    </div>
  );
}

