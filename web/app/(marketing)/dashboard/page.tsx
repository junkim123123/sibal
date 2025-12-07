'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, Package, Truck, Folder } from 'lucide-react'
import { AssetLibrary } from '@/components/AssetLibrary'

// Dummy data for estimates
const dummyEstimates = [
  {
    id: '1',
    productName: 'Bluetooth Speaker V2',
    landedCost: '$4.20',
    date: 'Dec 6, 2025',
    status: 'Completed',
    href: '/dashboard/estimates/1',
  },
  {
    id: '2',
    productName: 'Wireless Earbuds Pro',
    landedCost: '$12.50',
    date: 'Dec 4, 2025',
    status: 'Draft',
    href: '/dashboard/estimates/2',
  },
  {
    id: '3',
    productName: 'USB-C Charging Cable',
    landedCost: '$2.80',
    date: 'Dec 2, 2025',
    status: 'Completed',
    href: '/dashboard/estimates/3',
  },
  {
    id: '4',
    productName: 'Laptop Stand Aluminum',
    landedCost: '$8.90',
    date: 'Nov 28, 2025',
    status: 'Completed',
    href: '/dashboard/estimates/4',
  },
]

// Dummy data for saved products
const dummyProducts = [
  {
    id: '1',
    productName: 'Wireless Mouse',
    category: 'Electronics',
    date: 'Dec 5, 2025',
    status: 'Saved',
  },
  {
    id: '2',
    productName: 'Mechanical Keyboard',
    category: 'Electronics',
    date: 'Dec 3, 2025',
    status: 'Saved',
  },
  {
    id: '3',
    productName: 'USB Hub',
    category: 'Accessories',
    date: 'Nov 30, 2025',
    status: 'Saved',
  },
]

// Dummy data for shipments
const dummyShipments = [
  {
    id: '1',
    batchName: 'Sea Freight - Batch #204',
    destination: 'Los Angeles, CA',
    date: 'Dec 15, 2025',
    status: 'In Transit',
  },
  {
    id: '2',
    batchName: 'Sea Freight - Batch #203',
    destination: 'New York, NY',
    date: 'Dec 10, 2025',
    status: 'Completed',
  },
  {
    id: '3',
    batchName: 'Air Freight - Batch #102',
    destination: 'Chicago, IL',
    date: 'Dec 8, 2025',
    status: 'Customs Clearance',
  },
]

type TabType = 'estimates' | 'products' | 'shipments' | 'documents'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('estimates')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          window.location.href = '/login'
          return
        }
        setIsAuthenticated(true)
        setUserId(user.id)
        const name = user.user_metadata?.full_name || 
                     user.user_metadata?.name ||
                     user.email?.split('@')[0] ||
                     'Founder'
        setUserName(name)
      } catch (error) {
        window.location.href = '/login'
      }
    }
    checkAuth()
  }, [])

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
        {/* Header - Welcome Message */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-2">
            Welcome back, {userName}.
          </h1>
          <p className="text-zinc-600 text-lg">
            Manage your sourcing estimates and track shipments.
          </p>
        </div>

        {/* Tabs Navigation - Dr. B Style */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <TabButton
            label="Recent Estimates"
            active={activeTab === 'estimates'}
            onClick={() => setActiveTab('estimates')}
          />
          <TabButton
            label="Saved Products"
            active={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
          />
          <TabButton
            label="Shipments"
            active={activeTab === 'shipments'}
            onClick={() => setActiveTab('shipments')}
          />
          <TabButton
            label="Documents"
            active={activeTab === 'documents'}
            onClick={() => setActiveTab('documents')}
          />
        </div>

        {/* Content Area */}
        <div className="space-y-3">
          {activeTab === 'estimates' && (
            <EstimatesList estimates={dummyEstimates} />
          )}
          {activeTab === 'products' && (
            <ProductsList products={dummyProducts} />
          )}
          {activeTab === 'shipments' && (
            <ShipmentsList shipments={dummyShipments} />
          )}
          {activeTab === 'documents' && userId && (
            <AssetLibrary userId={userId} />
          )}
        </div>
      </div>
    </div>
  )
}

// Tab Button Component - Dr. B Style
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
          ? 'text-black font-semibold'
          : 'text-zinc-500 hover:text-black'
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black border-b-2 border-black" />
      )}
    </button>
  )
}

// Estimates List Component
function EstimatesList({ estimates }: { estimates: typeof dummyEstimates }) {
  if (estimates.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="No estimates yet"
        description="Start by analyzing your first product to see estimates here."
        actionLabel="Create first estimate"
        actionHref="/analyze"
      />
    )
  }

  return (
    <>
      {estimates.map((estimate) => (
        <Link
          key={estimate.id}
          href={estimate.href}
          className="group block"
        >
          <DashboardCard
            icon={<Package className="h-5 w-5" />}
            title={estimate.productName}
            subtitle={estimate.date}
            rightContent={
              <div className="flex items-center gap-6 ml-6">
                <div className="text-right">
                  <p className="text-lg font-semibold text-black">
                    {estimate.landedCost}
                  </p>
                  <p className="text-xs text-zinc-500">per unit</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={estimate.status} />
                  <ChevronRight className="h-5 w-5 text-zinc-400 group-hover:text-black transition-colors" />
                </div>
              </div>
            }
          />
        </Link>
      ))}
    </>
  )
}

// Products List Component
function ProductsList({ products }: { products: typeof dummyProducts }) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="No saved products yet"
        description="Save products from your estimates to see them here."
        actionLabel="View estimates"
        actionHref="/dashboard"
      />
    )
  }

  return (
    <>
      {products.map((product) => (
        <div key={product.id} className="group">
          <DashboardCard
            icon={<Package className="h-5 w-5" />}
            title={product.productName}
            subtitle={`${product.category} • ${product.date}`}
            rightContent={
              <div className="flex items-center gap-3 ml-6">
                <StatusBadge status={product.status} />
                <ChevronRight className="h-5 w-5 text-zinc-400 group-hover:text-black transition-colors" />
              </div>
            }
          />
        </div>
      ))}
    </>
  )
}

// Shipments List Component
function ShipmentsList({ shipments }: { shipments: typeof dummyShipments }) {
  if (shipments.length === 0) {
    return (
      <EmptyState
        icon={<Truck className="h-12 w-12" />}
        title="No shipments yet"
        description="Your active shipments will appear here."
        actionLabel="Create estimate"
        actionHref="/analyze"
      />
    )
  }

  return (
    <>
      {shipments.map((shipment) => (
        <div key={shipment.id} className="group">
          <DashboardCard
            icon={<Truck className="h-5 w-5" />}
            title={shipment.batchName}
            subtitle={`${shipment.destination} • ${shipment.date}`}
            rightContent={
              <div className="flex items-center gap-3 ml-6">
                <StatusBadge status={shipment.status} />
                <ChevronRight className="h-5 w-5 text-zinc-400 group-hover:text-black transition-colors" />
              </div>
            }
          />
        </div>
      ))}
    </>
  )
}

// Reusable Dashboard Card Component
function DashboardCard({
  icon,
  title,
  subtitle,
  rightContent,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  rightContent: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
      <div className="flex items-center justify-between">
        {/* Left: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="text-zinc-600 flex-shrink-0">{icon}</div>
            <h3 className="text-lg font-semibold text-black truncate">
              {title}
            </h3>
          </div>
          <p className="text-sm text-zinc-600 ml-8">
            {subtitle}
          </p>
        </div>

        {/* Right: Content */}
        {rightContent}
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel: string
  actionHref: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
      <div className="text-zinc-400 mx-auto mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-black mb-2">
        {title}
      </h3>
      <p className="text-zinc-600 mb-6">
        {description}
      </p>
      <Link
        href={actionHref}
        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
      >
        {actionLabel}
        <ChevronRight className="h-5 w-5" />
      </Link>
    </div>
  )
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    Completed: 'bg-green-50 text-green-700 border-green-200',
    Draft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'In Transit': 'bg-blue-50 text-blue-700 border-blue-200',
    'Customs Clearance': 'bg-orange-50 text-orange-700 border-orange-200',
    Saved: 'bg-gray-50 text-gray-700 border-gray-200',
    Processing: 'bg-blue-50 text-blue-700 border-blue-200',
  }

  const colorClass = statusColors[status] || 
                     'bg-gray-50 text-gray-700 border-gray-200'

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}
    >
      {status}
    </span>
  )
}
