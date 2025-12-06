'use client'

import { useState } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type TabType = 'profile' | 'company' | 'shipping'

export default function AccountPage() {
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-2">
            Account Settings
          </h1>
          <p className="text-zinc-600 text-lg">
            Manage your profile, company information, and shipping preferences.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <TabButton
            label="My Profile"
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />
          <TabButton
            label="Company Details"
            active={activeTab === 'company'}
            onClick={() => setActiveTab('company')}
          />
          <TabButton
            label="Shipping Defaults"
            active={activeTab === 'shipping'}
            onClick={() => setActiveTab('shipping')}
          />
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          {activeTab === 'profile' && <ProfileTab userEmail={userEmail} />}
          {activeTab === 'company' && <CompanyTab />}
          {activeTab === 'shipping' && <ShippingTab />}
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
      onClick={onClick}
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

// Profile Tab
function ProfileTab({ userEmail }: { userEmail: string }) {
  return (
    <form className="space-y-6">
      <div>
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
          Full Name
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
          placeholder="John Doe"
        />
      </div>

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
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          type="button"
          className="px-6 py-2 text-sm font-medium text-zinc-600 hover:text-black transition-colors"
        >
          Change Password
        </button>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}

// Company Tab
function CompanyTab() {
  return (
    <form className="space-y-6">
      <div>
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
          Company Name
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
          placeholder="Acme Corporation"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
          Website URL
        </label>
        <input
          type="url"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
          placeholder="https://www.company.com"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
          Expected Import Volume
        </label>
        <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all">
          <option value="">Select volume...</option>
          <option value="small">1-5 containers/year</option>
          <option value="medium">6-20 containers/year</option>
          <option value="large">21-50 containers/year</option>
          <option value="enterprise">50+ containers/year</option>
        </select>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}

// Shipping Tab
function ShippingTab() {
  return (
    <form className="space-y-6">
      <div>
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
          Address
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
          placeholder="123 Main Street"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
          Apt / Suite
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
          placeholder="Suite 100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
            City
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            placeholder="Los Angeles"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
            State
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            placeholder="CA"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
          Zip Code
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
          placeholder="90001"
        />
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}
