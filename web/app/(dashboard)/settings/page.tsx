/**
 * Settings Page
 * 
 * 사용자 설정 페이지
 * Profile, Security, Billing 관리
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getProfile, updateProfile, updatePassword } from '@/actions/settings-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Lock,
  CreditCard,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface ProfileData {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  role: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile form
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const result = await getProfile();
      if (!result.success || !result.data) {
        setError(result.error || '프로필을 불러올 수 없습니다.');
        return;
      }

      setProfile(result.data);
      setName(result.data.name || '');
      setCompany(result.data.company || '');
    } catch (err) {
      console.error('[Settings] Load error:', err);
      setError('프로필을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!profile) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const result = await updateProfile({
        name,
        company,
      });

      if (!result.success) {
        setError(result.error || '프로필 저장에 실패했습니다.');
        return;
      }

      setSuccess('프로필이 성공적으로 저장되었습니다.');
      await loadProfile();
    } catch (err) {
      console.error('[Settings] Save profile error:', err);
      setError('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangePassword() {
    try {
      setIsChangingPassword(true);
      setError(null);
      setSuccess(null);

      // 유효성 검사
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError('모든 필드를 입력해주세요.');
        return;
      }

      if (newPassword.length < 6) {
        setError('새 비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
        return;
      }

      const result = await updatePassword({
        currentPassword,
        newPassword,
      });

      if (!result.success) {
        setError(result.error || '비밀번호 변경에 실패했습니다.');
        return;
      }

      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('[Settings] Change password error:', err);
      setError('비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleOpenLemonSqueezy() {
    try {
      // Lemon Squeezy Customer Portal URL 가져오기
      // 사용자 이메일을 기반으로 고객 포털 링크 생성
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        setError('이메일 정보를 찾을 수 없습니다.');
        return;
      }

      // Lemon Squeezy Customer Portal은 일반적으로 이메일 기반으로 접근
      // 실제 운영 환경에서는 Lemon Squeezy API를 통해 고객 포털 URL을 가져와야 함
      // 여기서는 간단히 고정된 포털 링크 사용 (또는 환경 변수에서 가져오기)
      const portalUrl = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CUSTOMER_PORTAL_URL || 
                        'https://app.lemonsqueezy.com/my-orders';
      
      window.open(portalUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('[Settings] Failed to open customer portal:', error);
      setError('고객 포털을 열 수 없습니다. 나중에 다시 시도해주세요.');
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const isPro = profile.role === 'pro';

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">설정</h1>
          <p className="text-sm text-neutral-600 mt-1">
            계정 정보 및 구독을 관리하세요
          </p>
        </div>

        {/* 에러/성공 알림 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>성공</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Profile 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              프로필
            </CardTitle>
            <CardDescription>
              이름과 회사명을 수정할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-neutral-50"
              />
              <p className="text-xs text-neutral-500">
                이메일은 변경할 수 없습니다
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">회사명</Label>
              <Input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="회사명을 입력하세요"
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full md:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              보안
            </CardTitle>
            <CardDescription>
              비밀번호를 변경할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">현재 비밀번호</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요 (최소 6자)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
              />
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="w-full md:w-auto"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  변경 중...
                </>
              ) : (
                '비밀번호 변경'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Billing 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              구독
            </CardTitle>
            <CardDescription>
              현재 구독 상태를 확인하고 관리하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-1">
                  현재 구독
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={isPro ? 'default' : 'secondary'}>
                    {isPro ? 'Pro' : 'Free'}
                  </Badge>
                  {isPro && (
                    <span className="text-sm text-neutral-600">
                      $49.00/월
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleOpenLemonSqueezy}
              variant="outline"
              className="w-full md:w-auto gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Manage Subscription
            </Button>

            <p className="text-xs text-neutral-500">
              구독 관리는 Lemon Squeezy 고객 포털에서 진행됩니다
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
