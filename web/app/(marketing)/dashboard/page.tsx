'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, Package, Truck, Folder, MessageSquare } from 'lucide-react'
import { AssetLibrary } from '@/components/AssetLibrary'
import { ClientMessagesList } from '@/components/ClientMessagesList'
import { Loader2 } from 'lucide-react'

// 더미 데이터 제거 - 실제 Supabase 데이터 사용

type TabType = 'estimates' | 'products' | 'orders' | 'documents' | 'agent'

function DashboardPageContent() {
  const searchParams = useSearchParams()
  const initialTab = (searchParams?.get('tab') as TabType) || 'estimates'
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [userId, setUserId] = useState<string | null>(null)
  const [estimates, setEstimates] = useState<any[]>([])
  const [savedProducts, setSavedProducts] = useState<any[]>([])
  const [shipments, setShipments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [usageData, setUsageData] = useState<{
    hasActiveSubscription: boolean;
    analysisCount: number;
    limit: number;
  } | null>(null)
  const router = useRouter()

  // URL 파라미터에서 탭 변경 감지 및 데이터 새로고침
  useEffect(() => {
    const tab = searchParams?.get('tab') as TabType
    if (tab && ['estimates', 'products', 'orders', 'documents', 'agent'].includes(tab)) {
      setActiveTab(tab)
      
      // 탭 변경 시 데이터 새로고침 (특히 products 탭)
      if (userId && isAuthenticated) {
        loadProjects(userId)
      }
    }
  }, [searchParams, userId, isAuthenticated])

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
        
        // 프로젝트 데이터 로드
        await loadProjects(user.id)
        // 사용량 데이터 로드 (선택적 - 에러가 나도 계속 진행)
        try {
          await loadUsageData(user.id)
        } catch (usageError) {
          console.error('[Dashboard] Failed to load usage data:', usageError)
          // 사용량 데이터 로드 실패는 치명적이지 않으므로 계속 진행
        }
      } catch (error) {
        console.error('[Dashboard] Auth check error:', error)
        window.location.href = '/login'
      }
    }
    checkAuth()
  }, [])

  // 페이지 포커스 시 데이터 다시 불러오기
  useEffect(() => {
    if (!userId || !isAuthenticated) return

    const handleFocus = () => {
      console.log('[Dashboard] Page focused, reloading data...')
      loadProjects(userId)
    }

    // 페이지 포커스 시 데이터 새로고침
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [userId, isAuthenticated])

  // 프로젝트 데이터 로드
  async function loadProjects(userId: string) {
    try {
      setIsLoading(true)
      const response = await fetch('/api/projects')
      const data = await response.json()

      console.log('[Dashboard] Loaded projects:', data.projects?.length || 0, 'projects')
      console.log('[Dashboard] Projects with saved status:', data.projects?.filter((p: any) => p.status === 'saved').length || 0)

      if (data.ok && data.projects) {
        // Recent Estimates: status가 'active'인 프로젝트들 (최근 분석)
        const activeProjects = data.projects
          .filter((p: any) => p.status === 'active')
          .map((p: any) => ({
            id: p.id,
            productName: p.name,
            landedCost: p.total_landed_cost ? `$${p.total_landed_cost.toFixed(2)}` : 'N/A',
            date: new Date(p.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            status: 'Completed',
            href: `/results?project_id=${p.id}`,
          }))
          .sort((a: any, b: any) => {
            // 최신순 정렬
            const projectA = data.projects.find((p: any) => p.id === a.id)
            const projectB = data.projects.find((p: any) => p.id === b.id)
            return new Date(projectB.created_at).getTime() - new Date(projectA.created_at).getTime()
          })

        // Saved Products: status가 'saved'인 프로젝트들
        const savedProjects = data.projects
          .filter((p: any) => p.status === 'saved')
          .map((p: any) => {
            // 프로젝트 이름에서 카테고리 추출 시도 (없으면 기본값)
            const category = 'Product' // 기본 카테고리
            return {
              id: p.id,
              productName: p.name,
              category: category,
              date: new Date(p.created_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }),
              status: 'Saved',
              href: `/results?project_id=${p.id}`,
            }
          })
          .sort((a: any, b: any) => {
            // 최신순 정렬
            const projectA = data.projects.find((p: any) => p.id === a.id)
            const projectB = data.projects.find((p: any) => p.id === b.id)
            return new Date(projectB.created_at).getTime() - new Date(projectA.created_at).getTime()
          })

        console.log('[Dashboard] Setting saved products:', savedProducts.length)
        setEstimates(activeProjects)
        setSavedProducts(savedProducts)

        // Active Orders: 견적이 선택되고 QC 리포트가 승인된 프로젝트들
        await loadShipments(userId, data.projects)
      }
    } catch (error) {
      console.error('[Dashboard] Failed to load projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 사용량 데이터 로드
  async function loadUsageData(userId: string) {
    try {
      const supabase = createClient()
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('has_active_subscription, analysis_count')
        .eq('id', userId)
        .single()

      if (profileError || !profile) {
        console.error('[Dashboard] Failed to load usage data:', profileError)
        // 기본값 설정
        setUsageData({
          hasActiveSubscription: false,
          analysisCount: 0,
          limit: 30,
        })
        return
      }

      setUsageData({
        hasActiveSubscription: profile.has_active_subscription || false,
        analysisCount: profile.analysis_count || 0,
        limit: 30,
      })
    } catch (error) {
      console.error('[Dashboard] Failed to load usage data:', error)
      // 기본값 설정
      setUsageData({
        hasActiveSubscription: false,
        analysisCount: 0,
        limit: 30,
      })
    }
  }

  // Active Orders 데이터 로드 (견적 선택 + QC 승인된 프로젝트)
  async function loadShipments(userId: string, projects: any[]) {
    try {
      const supabase = createClient()
      
      // 1. 선택된 견적이 있는 프로젝트 ID 목록 가져오기
      const { data: selectedQuotes, error: quotesError } = await supabase
        .from('factory_quotes')
        .select('project_id, factory_name, created_at')
        .eq('status', 'selected')
        .order('created_at', { ascending: false })

      if (quotesError) {
        console.error('[Dashboard] Failed to load quotes:', quotesError)
        return
      }

      // 2. 승인된 QC 리포트가 있는 프로젝트 ID 목록 가져오기
      const { data: approvedQCReports, error: qcError } = await supabase
        .from('qc_reports')
        .select('project_id, inspection_date, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (qcError) {
        console.error('[Dashboard] Failed to load QC reports:', qcError)
        return
      }

      // 3. 견적이 선택되고 QC 리포트가 승인된 프로젝트 찾기
      const projectIdsWithQuotes = new Set(selectedQuotes?.map((q: any) => q.project_id) || [])
      const projectIdsWithQC = new Set(approvedQCReports?.map((qc: any) => qc.project_id) || [])
      
      // 두 조건을 모두 만족하는 프로젝트 ID
      const orderProjectIds = Array.from(projectIdsWithQuotes).filter((id: string) => 
        projectIdsWithQC.has(id)
      )

      // 4. 프로젝트 정보와 견적 정보를 결합하여 Active Orders 데이터 생성
      const ordersData = orderProjectIds
        .map((projectId: string) => {
          const project = projects.find((p: any) => p.id === projectId)
          if (!project) return null

          const quote = selectedQuotes?.find((q: any) => q.project_id === projectId)
          const qcReport = approvedQCReports?.find((qc: any) => qc.project_id === projectId)

          // 배송 타입 결정 (견적 정보나 프로젝트 정보 기반)
          const shippingType = quote?.factory_name ? 'Sea Freight' : 'Air Freight'
          const batchNumber = `#${projectId.substring(0, 8).toUpperCase()}`
          
          // 목적지 (프로젝트 정보에서 추출하거나 기본값)
          const destination = 'TBD' // 나중에 프로젝트 정보에서 추출 가능
          
          // 날짜 (QC 리포트 승인일 또는 견적 선택일)
          const shipmentDate = qcReport?.inspection_date 
            ? new Date(qcReport.inspection_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })
            : quote?.created_at 
            ? new Date(quote.created_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })
            : new Date(project.created_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })

          // 배송 상태 결정
          // QC 승인 후 시간 경과에 따라 상태 결정 (간단한 로직)
          const qcDate = qcReport?.inspection_date 
            ? new Date(qcReport.inspection_date)
            : qcReport?.created_at 
            ? new Date(qcReport.created_at)
            : null

          let status = 'In Transit'
          if (qcDate) {
            const daysSinceQC = Math.floor((Date.now() - qcDate.getTime()) / (1000 * 60 * 60 * 24))
            if (daysSinceQC > 30) {
              status = 'Completed'
            } else if (daysSinceQC > 14) {
              status = 'Customs Clearance'
            }
          }

          return {
            id: projectId,
            batchName: `${shippingType} - Batch ${batchNumber}`,
            destination: destination,
            date: shipmentDate,
            status: status,
            projectName: project.name,
            href: `/results?project_id=${projectId}`,
          }
        })
        .filter((s: any) => s !== null)
        .sort((a: any, b: any) => {
          // 최신순 정렬
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        })

      setShipments(ordersData)
    } catch (error) {
      console.error('[Dashboard] Failed to load shipments:', error)
    }
  }

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
            label="Active Orders"
            active={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
          />
          <TabButton
            label="Documents"
            active={activeTab === 'documents'}
            onClick={() => setActiveTab('documents')}
          />
          <TabButton
            label="Your Agent"
            active={activeTab === 'agent'}
            onClick={() => setActiveTab('agent')}
          />
        </div>

        {/* Content Area */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <div className="text-zinc-400">Loading...</div>
            </div>
          ) : (
            <>
              {activeTab === 'estimates' && (
                <EstimatesList estimates={estimates} />
              )}
              {activeTab === 'products' && (
                <ProductsList products={savedProducts} />
              )}
              {activeTab === 'shipments' && (
                <ShipmentsList shipments={shipments} />
              )}
              {activeTab === 'documents' && userId && (
                <AssetLibrary userId={userId} />
              )}
              {activeTab === 'agent' && userId && (
                <ClientMessagesList userId={userId} />
              )}
            </>
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
function EstimatesList({ estimates }: { estimates: any[] }) {
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
function ProductsList({ products }: { products: any[] }) {
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
        <Link
          key={product.id}
          href={product.href || `/results?project_id=${product.id}`}
          className="group block"
        >
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
        </Link>
      ))}
    </>
  )
}

// Active Orders List Component
function ShipmentsList({ shipments }: { shipments: any[] }) {
  if (shipments.length === 0) {
    return (
      <EmptyState
        icon={<Truck className="h-12 w-12" />}
        title="No active orders yet"
        description="Active orders will appear here once you select a quote and approve QC reports."
        actionLabel="View projects"
        actionHref="/dashboard?tab=estimates"
      />
    )
  }

  return (
    <>
      {shipments.map((shipment) => (
        <Link
          key={shipment.id}
          href={shipment.href || `/results?project_id=${shipment.id}`}
          className="group block"
        >
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
        </Link>
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

// Main export with Suspense wrapper
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  )
}
