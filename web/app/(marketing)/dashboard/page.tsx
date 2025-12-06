import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChevronRight, Package, Truck, Settings } from 'lucide-react'

// Dummy data for estimates - will be replaced with DB data later
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

async function getUserName() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  // Try to get user name from user metadata or email
  const name = user.user_metadata?.full_name || 
               user.user_metadata?.name ||
               user.email?.split('@')[0] ||
               'Founder'
  
  return { name, email: user.email }
}

export default async function DashboardPage() {
  const user = await getUserName()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header - Welcome Message */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-2">
            Welcome back, {user.name}.
          </h1>
          <p className="text-zinc-600 text-lg">
            Manage your sourcing estimates and track shipments.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <TabButton href="/dashboard" label="Recent Estimates" active />
          <TabButton href="/dashboard/products" label="Saved Products" />
          <TabButton href="/dashboard/shipments" label="Shipments" />
          <TabButton href="/account" label="Settings" />
        </div>

        {/* Main Content - Estimates List */}
        <div className="space-y-3">
          {dummyEstimates.map((estimate) => (
            <Link
              key={estimate.id}
              href={estimate.href}
              className="group block"
            >
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  {/* Left: Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="h-5 w-5 text-zinc-600 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-black group-hover:text-black truncate">
                        {estimate.productName}
                      </h3>
                    </div>
                    <p className="text-sm text-zinc-600">
                      {estimate.date}
                    </p>
                  </div>

                  {/* Right: Cost & Status */}
                  <div className="flex items-center gap-6 ml-6">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-black">
                        {estimate.landedCost}
                      </p>
                      <p className="text-xs text-zinc-500">per unit</p>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                      <StatusBadge status={estimate.status} />
                      <ChevronRight className="h-5 w-5 text-zinc-400 group-hover:text-black transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State (if no estimates) */}
        {dummyEstimates.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Package className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">
              No estimates yet
            </h3>
            <p className="text-zinc-600 mb-6">
              Start by analyzing your first product to see estimates here.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
            >
              Create first estimate
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// Tab Button Component
function TabButton({ 
  href, 
  label, 
  active = false 
}: { 
  href: string
  label: string
  active?: boolean 
}) {
  return (
    <Link
      href={href}
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
    </Link>
  )
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusColors = {
    Completed: 'bg-green-50 text-green-700 border-green-200',
    Draft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Processing: 'bg-blue-50 text-blue-700 border-blue-200',
  }

  const colorClass = statusColors[status as keyof typeof statusColors] || 
                     'bg-gray-50 text-gray-700 border-gray-200'

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}
    >
      {status}
    </span>
  )
}
