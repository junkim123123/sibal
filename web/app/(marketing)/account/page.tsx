'use client'

import { useState } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Camera, ChevronDown, ChevronUp, Loader2, MapPin, Package } from 'lucide-react'
import { useLanguage } from '@/components/i18n/language-provider'

type TabType = 'profile' | 'company' | 'shipping'

export default function AccountPage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setIsAuthenticated(true)
        setUserEmail(user.email || '')
      }
    }
    checkAuth()
  }, [router])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-zinc-600">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-2">
            {t.account.title}
          </h1>
          <p className="text-zinc-600 text-lg">
            {t.account.subtitle}
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-200">
          <div className="flex gap-8">
            <TabButton
              label={t.account.tabs.myProfile}
              active={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
            />
            <TabButton
              label={t.account.tabs.companyDetails}
              active={activeTab === 'company'}
              onClick={() => setActiveTab('company')}
            />
            <TabButton
              label={t.account.tabs.warehouseDestination}
              active={activeTab === 'shipping'}
              onClick={() => setActiveTab('shipping')}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-20 md:mb-0 max-w-3xl">
          {activeTab === 'profile' && <ProfileTab userEmail={userEmail} t={t} />}
          {activeTab === 'company' && <CompanyTab t={t} />}
          {activeTab === 'shipping' && <ShippingTab t={t} />}
        </div>
      </div>
      
      {/* Sticky Save Button Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 px-4 py-4 md:hidden">
        <div className="max-w-4xl mx-auto">
          <button
            type="submit"
            form={activeTab === 'profile' ? 'profile-form' : activeTab === 'company' ? 'company-form' : 'shipping-form'}
            className="w-full px-6 py-3 bg-[#008080] text-white rounded-lg font-medium hover:bg-[#006666] transition-colors"
          >
            {t.account.profile.saveChanges}
          </button>
        </div>
      </div>
    </div>
  )
}

// Tab Button Component
function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
        active
          ? 'text-black'
          : 'text-zinc-600 hover:text-black'
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
      )}
    </button>
  )
}

// Profile Avatar Component
function ProfileAvatar({ name, onImageChange }: { name: string; onImageChange?: (file: File) => void }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // 이름에서 이니셜 추출
  const getInitials = (fullName: string): string => {
    if (!fullName || fullName.trim().length === 0) return '?'
    const words = fullName.trim().split(/\s+/).filter(word => word.length > 0)
    if (words.length === 0) return '?'
    const firstLetter = words[0].charAt(0).toUpperCase()
    const secondLetter = words.length > 1 
      ? words[1].charAt(0).toUpperCase()
      : words[0].length > 1 
        ? words[0].charAt(1).toUpperCase()
        : firstLetter
    return `${firstLetter}${secondLetter}`
  }

  const initials = getInitials(name)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageChange) {
      onImageChange(file)
      // 미리보기 생성
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="relative">
        {avatarUrl ? (
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center">
            <span className="text-teal-700 font-bold text-2xl">{initials}</span>
          </div>
        )}
        <label
          htmlFor="avatar-upload"
          className="absolute bottom-0 right-0 w-7 h-7 bg-[#008080] rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-700 transition-colors border-2 border-white"
        >
          <Camera className="h-4 w-4 text-white" />
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
      <div>
        <button
          type="button"
          onClick={() => document.getElementById('avatar-upload')?.click()}
          className="text-sm font-medium text-zinc-600 hover:text-[#008080] transition-colors"
        >
          {t.account.profile.changePhoto}
        </button>
        <p className="text-xs text-zinc-500 mt-1">{t.account.profile.photoHint}</p>
      </div>
    </div>
  )
}

// Profile Tab
function ProfileTab({ userEmail, t }: { userEmail: string; t: any }) {
  const [name, setName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const supabase = createClient()

  // 프로필 데이터 로드
  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // profiles 테이블에서 데이터 가져오기
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, phone, job_title')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('[ProfileTab] Failed to load profile:', profileError)
          // 에러가 있어도 계속 진행 (새 프로필일 수 있음)
        }

        if (profile) {
          setName(profile.name || '')
          setJobTitle(profile.job_title || '')
          setPhone(profile.phone || '')
        }
      } catch (err) {
        console.error('[ProfileTab] Load error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [supabase])

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError(t.account.profile.loginRequired)
        return
      }

      // profiles 테이블 업데이트
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: name.trim() || null,
          job_title: jobTitle.trim() || null,
          phone: phone.trim() || null,
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('[ProfileTab] Failed to update profile:', updateError)
        setError(t.account.profile.saveFailed)
        return
      }

      setSuccess(t.account.profile.profileSaved)
      // 성공 메시지 3초 후 제거
      setTimeout(() => setSuccess(null), 3000)
      } catch (err) {
        console.error('[ProfileTab] Save error:', err)
        setError(t.account.profile.saveError)
      } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-600">Loading...</div>
      </div>
    )
  }

  // 비밀번호 변경 핸들러
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    try {
      setIsChangingPassword(true)
      setError(null)

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        console.error('[ProfileTab] Failed to update password:', updateError)
        setError('Failed to update password. Please try again.')
        return
      }

      setSuccess('Password updated successfully.')
      setShowPasswordForm(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('[ProfileTab] Password change error:', err)
      setError('An error occurred while changing password.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // 프로필 사진 업로드 핸들러
  const handleAvatarChange = async (file: File) => {
    // TODO: 실제 업로드 로직 구현 (Supabase Storage 사용)
    console.log('Avatar file selected:', file)
  }

  return (
    <form className="space-y-6" id="profile-form" onSubmit={handleSubmit}>
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Profile Avatar */}
      <ProfileAvatar name={name} onImageChange={handleAvatarChange} />

      {/* 2-Column Grid: Full Name + Job Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
            {t.account.profile.fullName}
          </label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
            {t.account.profile.jobTitle}
          </label>
          <input
            type="text"
            name="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
            placeholder={t.account.profile.jobTitlePlaceholder}
          />
        </div>
      </div>

      {/* 2-Column Grid: Email + Phone Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
            Email
          </label>
          <input
            type="email"
            value={userEmail}
            disabled
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-zinc-500 cursor-not-allowed focus:outline-none"
          />
          <p className="mt-2 text-xs text-zinc-500">
            Email cannot be changed. Contact support if you need to update it.
          </p>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      {/* Password Change Accordion */}
      <div className="pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="flex items-center justify-between w-full px-6 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium text-zinc-700">Update Password</span>
          {showPasswordForm ? (
            <ChevronUp className="h-5 w-5 text-zinc-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-zinc-500" />
          )}
        </button>

        {showPasswordForm && (
          <div className="mt-4 p-6 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="px-6 py-2 bg-[#008080] text-white rounded-lg font-medium hover:bg-[#006666] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isChangingPassword ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Button - Desktop (폼 하단) */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 bg-[#008080] text-white rounded-lg font-medium hover:bg-[#006666] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  )
}

// Company Tab
function CompanyTab({ t }: { t: any }) {
  return (
    <form className="space-y-6" id="company-form">
      {/* 2-Column Grid: Company Name + Tax ID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
            Company Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
            placeholder="Acme Corporation"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
            Tax ID / EIN <span className="text-zinc-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
            placeholder="e.g. EIN, VAT Number, or Business Reg. ID"
          />
          <p className="mt-2 text-xs text-zinc-500">
            Required for invoicing and tax documentation
          </p>
        </div>
      </div>

      {/* Storefront URL - Full Width */}
      <div>
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
          Storefront / Sales Channel URL
        </label>
        <input
          type="url"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
          placeholder="https://www.amazon.com/shops/yourstore or https://yourstore.com"
        />
        <p className="mt-2 text-xs text-zinc-500">
          Your Amazon store, Shopify store, or other sales channel
        </p>
      </div>

      {/* Expected Import Volume */}
      <div>
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
          Expected Import Volume
        </label>
        <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all">
          <option value="">Select volume...</option>
          <option value="lcl">Less than 1 container (LCL / Air Freight)</option>
          <option value="small">1-5 containers/year</option>
          <option value="medium">6-20 containers/year</option>
          <option value="large">21-50 containers/year</option>
          <option value="enterprise">50+ containers/year</option>
        </select>
      </div>

      {/* Save Button - Desktop (폼 하단) */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          form="company-form"
          className="px-6 py-3 bg-[#008080] text-white rounded-lg font-medium hover:bg-[#006666] transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}

// US States for dropdown
const US_STATES = [
  { value: '', label: 'Select State' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
]

// Shipping Tab
function ShippingTab({ t }: { t: any }) {
  const [isFBAWarehouse, setIsFBAWarehouse] = useState(false)
  const [country, setCountry] = useState('US')

  return (
    <form className="space-y-6" id="shipping-form">
      {/* Amazon FBA Warehouse Checkbox - Enhanced Styling */}
      <div className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-200 ${
        isFBAWarehouse 
          ? 'bg-orange-50 border-orange-300' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="mt-0.5">
          <Package className={`h-5 w-5 ${isFBAWarehouse ? 'text-orange-600' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="fba-warehouse"
              checked={isFBAWarehouse}
              onChange={(e) => setIsFBAWarehouse(e.target.checked)}
              className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
            />
            <label htmlFor="fba-warehouse" className="flex-1 cursor-pointer">
              <span className={`text-sm font-medium ${isFBAWarehouse ? 'text-orange-900' : 'text-zinc-700'}`}>
                This is an Amazon FBA Warehouse
              </span>
              <p className="text-xs text-zinc-500 mt-1">
                Check this if you're shipping directly to an Amazon fulfillment center
              </p>
            </label>
          </div>
          {isFBAWarehouse && (
            <div className="mt-3 pt-3 border-t border-orange-200">
              <p className="text-xs font-medium text-orange-800">
                ⚠️ Amazon FBA Labeling Required
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Make sure you have your FBA Shipment ID ready for proper labeling
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FBA-specific fields - conditionally shown */}
      {isFBAWarehouse && (
        <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-lg transition-all duration-300">
          <div>
            <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
              FBA Shipment ID / Reference Code
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white border border-orange-300 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              placeholder="e.g. FBA123456789 or Shipment Reference"
            />
            <p className="mt-2 text-xs text-zinc-500">
              Optional: Your Amazon shipment reference for labeling
            </p>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
              Store Name (for Labeling)
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white border border-orange-300 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              placeholder="e.g. My Amazon Store"
            />
            <p className="mt-2 text-xs text-zinc-500">
              Optional: Store name for FBA shipment labeling
            </p>
          </div>
        </div>
      )}

      {/* Country Selection */}
      <div>
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
          Country / Region
        </label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
        >
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="GB">United Kingdom</option>
          <option value="AU">Australia</option>
          <option value="DE">Germany</option>
          <option value="FR">France</option>
          <option value="JP">Japan</option>
          <option value="KR">South Korea</option>
          <option value="CN">China</option>
          <option value="MX">Mexico</option>
          <option value="BR">Brazil</option>
          <option value="IN">India</option>
          <option value="SG">Singapore</option>
          <option value="NL">Netherlands</option>
          <option value="IT">Italy</option>
          <option value="ES">Spain</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Address with Map Icon */}
      <div>
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
          Address
        </label>
        <div className="relative">
          <input
            type="text"
            className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
            placeholder="123 Main Street"
          />
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        </div>
      </div>

      {/* Apt / Suite */}
      <div>
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
          Apt / Suite
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
          placeholder="Suite 100"
        />
      </div>

      {/* 3-Column Grid: City (50%) | State (25%) | Zip Code (25%) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6">
          <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
            City
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
            placeholder="Los Angeles"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
            State
          </label>
          <select
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
          >
            {US_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
            Zip Code
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
            placeholder="90001"
          />
        </div>
      </div>

      {/* Save Button - Desktop (폼 하단) */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          form="shipping-form"
          className="px-6 py-3 bg-[#008080] text-white rounded-lg font-medium hover:bg-[#006666] transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}
