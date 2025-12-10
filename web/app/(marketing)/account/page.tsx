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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-2">
            Account Settings
          </h1>
          <p className="text-zinc-600 text-lg">
            Manage your profile, company information, and shipping preferences.
          </p>
        </div>

        {/* Tabs Navigation with Save Button */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-200">
          <div className="flex gap-8">
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
              label="Warehouse / Destination"
              active={activeTab === 'shipping'}
              onClick={() => setActiveTab('shipping')}
            />
          </div>
          {/* Desktop Save Button */}
          <button
            type="submit"
            form={activeTab === 'profile' ? 'profile-form' : activeTab === 'company' ? 'company-form' : 'shipping-form'}
            className="hidden md:block px-6 py-2 bg-[#008080] text-white rounded-lg font-medium hover:bg-[#006666] transition-colors text-sm"
          >
            Save Changes
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-20 md:mb-0">
          {activeTab === 'profile' && <ProfileTab userEmail={userEmail} />}
          {activeTab === 'company' && <CompanyTab />}
          {activeTab === 'shipping' && <ShippingTab />}
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
            Save Changes
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

// Profile Tab
function ProfileTab({ userEmail }: { userEmail: string }) {
  return (
    <form className="space-y-6" id="profile-form">
      <div>
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
          Full Name
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
          Job Title
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
          placeholder="e.g. CEO, Purchasing Manager, Operations Lead"
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
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
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

      <div className="flex justify-end pt-6 border-t border-gray-200 md:hidden">
        <button
          type="submit"
          form="profile-form"
          className="px-6 py-3 bg-[#008080] text-white rounded-lg font-medium hover:bg-[#006666] transition-colors"
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
    <form className="space-y-6" id="company-form">
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

      <div>
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
          Tax ID / EIN <span className="text-zinc-400 font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
          placeholder="12-3456789"
        />
        <p className="mt-2 text-xs text-zinc-500">
          Required for invoicing and tax documentation
        </p>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
          Expected Import Volume
        </label>
        <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all">
          <option value="">Select volume...</option>
          <option value="small">1-5 containers/year</option>
          <option value="medium">6-20 containers/year</option>
          <option value="large">21-50 containers/year</option>
          <option value="enterprise">50+ containers/year</option>
        </select>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200 md:hidden">
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

// Shipping Tab
function ShippingTab() {
  const [isFBAWarehouse, setIsFBAWarehouse] = useState(false)

  return (
    <>
      <form className="space-y-6" id="shipping-form">
        <div className="flex items-start gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
          <input
            type="checkbox"
            id="fba-warehouse"
            checked={isFBAWarehouse}
            onChange={(e) => setIsFBAWarehouse(e.target.checked)}
            className="mt-1 w-4 h-4 text-[#008080] border-gray-300 rounded focus:ring-[#008080] focus:ring-2"
          />
          <label htmlFor="fba-warehouse" className="text-sm text-zinc-700 cursor-pointer">
            <span className="font-medium">This is an Amazon FBA Warehouse</span>
            <p className="text-xs text-zinc-500 mt-1">
              Check this if you're shipping directly to an Amazon fulfillment center
            </p>
          </label>
        </div>

        {/* FBA-specific fields - conditionally shown */}
        {isFBAWarehouse && (
          <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg transition-all duration-300">
            <div>
              <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
                FBA Shipment ID / Reference Code
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white border border-amber-300 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
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
                className="w-full px-4 py-3 bg-white border border-amber-300 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
                placeholder="e.g. My Amazon Store"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Optional: Store name for FBA shipment labeling
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
            Address
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
            placeholder="123 Main Street"
          />
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
              City
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
              placeholder="Los Angeles"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2 font-semibold">
              State
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
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
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-all"
            placeholder="90001"
          />
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200 md:hidden">
          <button
            type="submit"
            form="shipping-form"
            className="px-6 py-3 bg-[#008080] text-white rounded-lg font-medium hover:bg-[#006666] transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </>
  )
}
