/**
 * Manager Settings Page
 * 
 * 매니저 프로필 및 설정 관리
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAdminClient } from '@/lib/supabase/admin';
import { Loader2, Save, User, Briefcase, Mail, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ManagerProfile {
  name: string;
  email: string;
  company: string;
  bio: string;
  expertise: string[];
  availability_status: string;
}

export default function ManagerSettingsPage() {
  const [profile, setProfile] = useState<ManagerProfile>({
    name: '',
    email: '',
    company: '',
    bio: '',
    expertise: [],
    availability_status: 'available',
  });
  const [newExpertise, setNewExpertise] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const adminClient = getAdminClient();
      const { data: profileData, error } = await adminClient
        .from('profiles')
        .select('name, email, company, bio, expertise, availability_status')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profileData) {
        setProfile({
          name: profileData.name || '',
          email: profileData.email || user.email || '',
          company: profileData.company || '',
          bio: profileData.bio || '',
          expertise: profileData.expertise || [],
          availability_status: profileData.availability_status || 'available',
        });
      }
    } catch (error) {
      console.error('[Manager Settings] Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const adminClient = getAdminClient();
      const { error } = await adminClient
        .from('profiles')
        .update({
          name: profile.name,
          company: profile.company,
          bio: profile.bio,
          expertise: profile.expertise,
          availability_status: profile.availability_status,
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('프로필이 저장되었습니다.');
    } catch (error) {
      console.error('[Manager Settings] Failed to save profile:', error);
      alert('프로필 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !profile.expertise.includes(newExpertise.trim())) {
      setProfile({
        ...profile,
        expertise: [...profile.expertise, newExpertise.trim()],
      });
      setNewExpertise('');
    }
  };

  const removeExpertise = (expertise: string) => {
    setProfile({
      ...profile,
      expertise: profile.expertise.filter((e) => e !== expertise),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          프로필 및 계정 설정을 관리하세요
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">프로필 정보</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4" />
              이름
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="이름을 입력하세요"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              이메일
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">이메일은 변경할 수 없습니다</p>
          </div>

          {/* Company */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4" />
              회사/소속
            </label>
            <input
              type="text"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="회사 또는 소속을 입력하세요"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4" />
              소개
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="자신에 대한 간단한 소개를 입력하세요"
            />
          </div>

          {/* Expertise Tags */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4" />
              전문 분야
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newExpertise}
                onChange={(e) => setNewExpertise(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addExpertise();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="전문 분야를 입력하고 Enter를 누르세요"
              />
              <Button onClick={addExpertise} variant="outline">
                추가
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.expertise.map((exp, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {exp}
                  <button
                    onClick={() => removeExpertise(exp)}
                    className="text-blue-700 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Availability Status */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              상태
            </label>
            <select
              value={profile.availability_status}
              onChange={(e) => setProfile({ ...profile, availability_status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="available">Available (사용 가능)</option>
              <option value="busy">Busy (바쁨)</option>
              <option value="offline">Offline (오프라인)</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                저장
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

