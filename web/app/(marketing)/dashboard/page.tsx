'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, Package, Truck, Folder, MessageSquare, FileText } from 'lucide-react'
import { AssetLibrary } from '@/components/AssetLibrary'
import { ClientMessagesList } from '@/components/ClientMessagesList'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// 더미 데이터 제거 - 실제 Supabase 데이터 사용

// 상태 포맷팅 함수: 언더스코어를 공백으로 바꾸고 각 단어의 첫 글자를 대문자로
function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

type TabType = 'requests' | 'production' | 'agent'

function DashboardPageContent() {
  const searchParams = useSearchParams()
  let initialTab = (searchParams?.get('tab') as TabType) || 'requests'
  
  // 하위 호환성: 기존 탭 이름 매핑
  if (initialTab === 'estimates' || initialTab === 'products') {
    initialTab = 'requests'
  }
  if (initialTab === 'orders' || initialTab === 'active') {
    initialTab = 'production'
  }
  if (initialTab === 'documents') {
    initialTab = 'requests' // Documents는 프로젝트별로 이동
  }
  
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
    userRole?: string;
  } | null>(null)
  const router = useRouter()

  // URL 파라미터에서 탭 변경 감지 및 데이터 새로고침
  useEffect(() => {
    let tab = searchParams?.get('tab') as TabType
    const refresh = searchParams?.get('refresh')
    
    // 'active'를 'orders'로 매핑 (하위 호환성)
    if (tab === 'active') {
      tab = 'orders'
    }
    
    if (tab && ['requests', 'production', 'agent'].includes(tab)) {
      setActiveTab(tab)
      
      // refresh 파라미터 제거 (URL 정리)
      if (refresh) {
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('refresh')
        window.history.replaceState({}, '', newUrl.toString())
      }
    }
  }, [searchParams])

  // activeTab 변경 시 데이터 새로고침 (탭 클릭 시)
  useEffect(() => {
    if (userId && isAuthenticated && activeTab) {
      loadProjects(userId)
    }
  }, [activeTab, userId, isAuthenticated])

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
        
        // 사용자 이름 가져오기 (profiles 테이블 우선, 없으면 metadata)
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single()
        
        // Real name 우선, 없으면 null (인사말에서 처리)
        const name = profile?.name ||
                     user.user_metadata?.full_name || 
                     user.user_metadata?.name ||
                     null
        setUserName(name || '')
        
        // 프로젝트 데이터 로드
        await loadProjects(user.id)
        // 사용량 데이터 로드 (선택적 - 에러가 나도 계속 진행)
        try {
          await loadUsageData(user.id)
        } catch {
          // 사용량 데이터 로드 실패는 치명적이지 않으므로 계속 진행
        }
      } catch (error) {
        window.location.href = '/login'
      }
    }
    checkAuth()
  }, [])

  // 페이지 포커스 시 데이터 다시 불러오기
  useEffect(() => {
    if (!userId || !isAuthenticated) return

    const handleFocus = () => {
      loadProjects(userId)
      loadUsageData(userId).catch(() => {
        // Silently fail - usage data is not critical
      })
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [userId, isAuthenticated])

  // 프로젝트 데이터 로드
  async function loadProjects(userId: string) {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/projects', {
        cache: 'no-store', // 항상 최신 데이터 가져오기
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`)
      }
      
      const data = await response.json()

      if (data.ok && data.projects) {
        // My Requests: 모든 프로젝트 (active, in_progress, saved 모두 포함)
        // 별표 기능은 추후 추가 예정
        const allRequests = data.projects
          .filter((p: any) => p.status === 'active' || p.status === 'in_progress' || p.status === 'saved')
          .map((p: any) => ({
            id: p.id,
            productName: p.name,
            landedCost: p.total_landed_cost ? `$${p.total_landed_cost.toFixed(2)}` : 'N/A',
            date: new Date(p.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            status: p.status, // StatusBadge에서 포맷팅됨
            href: `/results?project_id=${p.id}`,
            isSaved: p.status === 'saved',
          }))
          .sort((a: any, b: any) => {
            // 최신순 정렬
            const projectA = data.projects.find((p: any) => p.id === a.id)
            const projectB = data.projects.find((p: any) => p.id === b.id)
            return new Date(projectB.created_at).getTime() - new Date(projectA.created_at).getTime()
          })
        
        setEstimates(allRequests)
        setSavedProducts([]) // 더 이상 사용하지 않지만 호환성을 위해 유지

        // Active Orders: status='active'인 프로젝트 + 견적 선택 + QC 승인된 프로젝트들
        await loadShipments(userId, data.projects)
      } else {
        // 에러가 있어도 빈 배열로 설정하여 UI가 올바르게 표시되도록 함
        setEstimates([])
        setSavedProducts([])
      }
    } catch (error) {
      // 에러 발생 시에도 빈 배열로 설정
      setEstimates([])
      setSavedProducts([])
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
        .select('has_active_subscription, analysis_count, role, last_analysis_date')
        .eq('id', userId)
        .single()

      if (profileError || !profile) {
        // 기본값 설정
        setUsageData({
          hasActiveSubscription: false,
          analysisCount: 0,
          limit: 30,
          userRole: 'free',
        })
        return
      }

      // 월 단위 리셋 체크 (analyze API와 동일한 로직)
      const now = new Date()
      const lastAnalysisDate = profile.last_analysis_date 
        ? new Date(profile.last_analysis_date) 
        : null

      let currentCount = profile.analysis_count || 0

      // 월이 바뀌면 카운트 리셋 (클라이언트 측에서만 표시용으로 처리)
      if (lastAnalysisDate) {
        const lastMonth = lastAnalysisDate.getMonth()
        const lastYear = lastAnalysisDate.getFullYear()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        if (lastMonth !== currentMonth || lastYear !== currentYear) {
          // 월이 바뀌었으므로 카운트는 0으로 표시 (실제 DB 업데이트는 analyze API에서 처리)
          currentCount = 0
        }
      }

      setUsageData({
        hasActiveSubscription: profile.has_active_subscription || false,
        analysisCount: currentCount,
        limit: 30,
        userRole: profile.role || 'free',
      })
    } catch {
      // 기본값 설정
      setUsageData({
        hasActiveSubscription: false,
        analysisCount: 0,
        limit: 30,
        userRole: 'free',
      })
    }
  }

  // Active Orders 데이터 로드
  // 1. status='active'인 프로젝트 (새로 생성된 소싱 요청)
  // 2. 견적이 선택되고 QC 리포트가 승인된 프로젝트 (진행 중인 주문)
  async function loadShipments(userId: string, projects: any[]) {
    try {
      const supabase = createClient()
      
      // 1. status='active' 또는 'in_progress'인 프로젝트들 (새로 생성된 소싱 요청 또는 매니저가 할당된 프로젝트)
      const activeProjects = projects
        .filter((p: any) => p.status === 'active' || p.status === 'in_progress')
        .map((p: any) => ({
          id: p.id,
          batchName: p.name,
          destination: 'TBD',
          date: new Date(p.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          status: p.status === 'in_progress' ? 'In Progress' : 'Processing', // 매니저가 할당되면 In Progress, 아니면 Processing
          projectName: p.name,
          href: `/dashboard/chat?project_id=${p.id}`, // 매니저 채팅 페이지로 이동
          isNewRequest: p.status === 'active', // active 상태면 새 소싱 요청
          hasManager: p.status === 'in_progress', // in_progress 상태면 매니저가 할당됨
        }))

      // 2. 선택된 견적이 있는 프로젝트 ID 목록 가져오기
      const { data: selectedQuotes, error: quotesError } = await supabase
        .from('factory_quotes')
        .select('project_id, factory_name, created_at, updated_at')
        .eq('status', 'selected')
        .order('created_at', { ascending: false })

      if (quotesError) {
        console.error('[Dashboard] Failed to load quotes:', quotesError)
      }

      // 선택된 견적이 있지만 매니저가 배당되지 않은 프로젝트 찾기
      const projectsWithSelectedQuotes = projects.filter((p: any) => {
        return selectedQuotes?.some((q: any) => q.project_id === p.id)
      })

      // 매니저가 배당되지 않은 프로젝트 (manager_id가 null)
      const projectsAwaitingManager = projectsWithSelectedQuotes
        .filter((p: any) => !p.manager_id)
        .map((p: any) => {
          const quote = selectedQuotes?.find((q: any) => q.project_id === p.id)
          const quoteSelectedAt = quote?.updated_at || quote?.created_at
          const hoursSinceSelection = quoteSelectedAt 
            ? Math.floor((Date.now() - new Date(quoteSelectedAt).getTime()) / (1000 * 60 * 60))
            : 0
          
          return {
            id: p.id,
            batchName: p.name,
            destination: 'TBD',
            date: new Date(p.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            status: 'Awaiting Manager',
            projectName: p.name,
            href: `/dashboard/chat?project_id=${p.id}`, // 매니저 채팅 페이지로 이동
            isNewRequest: false,
            hasSelectedQuote: true,
            awaitingManager: true,
            hoursSinceSelection: hoursSinceSelection,
          }
        })

      // 3. 승인된 QC 리포트가 있는 프로젝트 ID 목록 가져오기
      const { data: approvedQCReports, error: qcError } = await supabase
        .from('qc_reports')
        .select('project_id, inspection_date, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (qcError) {
        console.error('[Dashboard] Failed to load QC reports:', qcError)
      }

      // 4. 견적이 선택되고 QC 리포트가 승인된 프로젝트 찾기 (기존 로직)
      const projectIdsWithQuotes = new Set(selectedQuotes?.map((q: any) => q.project_id) || [])
      const projectIdsWithQC = new Set(approvedQCReports?.map((qc: any) => qc.project_id) || [])
      
      // 두 조건을 모두 만족하는 프로젝트 ID
      const orderProjectIds = Array.from(projectIdsWithQuotes).filter((id: string) => 
        projectIdsWithQC.has(id)
      )

      // 5. 진행 중인 주문 데이터 생성 (견적 선택 + QC 승인)
      const ordersInProgress = orderProjectIds
        .map((projectId: string) => {
          const project = projects.find((p: any) => p.id === projectId)
          if (!project) return null

          const quote = selectedQuotes?.find((q: any) => q.project_id === projectId)
          const qcReport = approvedQCReports?.find((qc: any) => qc.project_id === projectId)

          // 배송 타입 결정
          const shippingType = quote?.factory_name ? 'Sea Freight' : 'Air Freight'
          const batchNumber = `#${projectId.substring(0, 8).toUpperCase()}`
          
          // 날짜
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
            destination: 'TBD',
            date: shipmentDate,
            status: status,
            projectName: project.name,
            href: `/dashboard/chat?project_id=${projectId}`, // 매니저 채팅 페이지로 이동
            isNewRequest: false,
          }
        })
        .filter((s: any) => s !== null)

      // 6. 세 리스트 합치기 (새 소싱 요청 + 매니저 대기 중 + 진행 중인 주문)
      // 중복 제거: Set을 사용하여 프로젝트 ID 기준으로 중복 제거
      const orderProjectIdsSet = new Set(orderProjectIds)
      const awaitingManagerIds = new Set(projectsAwaitingManager.map((p: any) => p.id))
      
      // 진행 중인 주문에 포함되지 않은 새 소싱 요청만 추가
      // 매니저가 할당된 프로젝트(in_progress)는 항상 포함
      const newRequestsOnly = activeProjects.filter((p: any) => {
        // 진행 중인 주문에 포함된 프로젝트는 제외
        if (orderProjectIdsSet.has(p.id)) {
          return false;
        }
        // 매니저 대기 중인 프로젝트는 제외 (별도 섹션에 표시)
        if (awaitingManagerIds.has(p.id)) {
          return false;
        }
        // 나머지는 모두 포함 (active 또는 in_progress)
        return true;
      })
      
      // 모든 주문 합치기 (중복 제거)
      const allOrdersMap = new Map<string, any>();
      
      // 1. 새 소싱 요청 추가
      newRequestsOnly.forEach((order: any) => {
        allOrdersMap.set(order.id, order);
      });
      
      // 2. 매니저 대기 중인 프로젝트 추가
      projectsAwaitingManager.forEach((order: any) => {
        allOrdersMap.set(order.id, order);
      });
      
      // 3. 진행 중인 주문 추가
      ordersInProgress.forEach((order: any) => {
        allOrdersMap.set(order.id, order);
      });
      
      // Map을 배열로 변환하고 정렬
      const allOrders = Array.from(allOrdersMap.values())
        .sort((a: any, b: any) => {
          // 최신순 정렬 (created_at 기준)
          const projectA = projects.find((p: any) => p.id === a.id)
          const projectB = projects.find((p: any) => p.id === b.id)
          if (!projectA || !projectB) return 0
          return new Date(projectB.created_at).getTime() - new Date(projectA.created_at).getTime()
        })

      console.log('[Dashboard] Active Orders loaded:', {
        newRequests: newRequestsOnly.length,
        inProgress: ordersInProgress.length,
        total: allOrders.length,
      })

      setShipments(allOrders)
    } catch (error) {
      console.error('[Dashboard] Failed to load shipments:', error)
      setShipments([])
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header - Clean Command Center Style */}
        <div className="mb-12">
          {/* Top Row: Greeting (Left) + Action Button (Right) */}
          <div className="flex items-center justify-between gap-6 mb-3">
            {/* Left: Greeting */}
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight">
                {userName ? `Welcome back, ${userName}.` : 'Welcome back.'}
              </h1>
            </div>
            
            {/* Right: Primary Action Button */}
            <div className="flex-shrink-0">
              <Link href="/chat">
                <Button
                  size="lg"
                  className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg px-6 py-3 font-semibold"
                >
                  + New Analysis Request
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Sub-text below greeting */}
          <p className="text-zinc-600 text-lg">
            Manage your sourcing estimates and track shipments.
          </p>
        </div>

        {/* Tabs Navigation - 3-Tab Structure (Past/Current/Future) */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <TabButton
            label="My Requests"
            active={activeTab === 'requests'}
            onClick={() => {
              setActiveTab('requests')
              // useEffect에서 activeTab 변경 시 자동으로 loadProjects 호출됨
            }}
          />
          <TabButton
            label="Production & Shipping"
            active={activeTab === 'production'}
            onClick={() => {
              setActiveTab('production')
              // useEffect에서 activeTab 변경 시 자동으로 loadProjects 호출됨
            }}
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
              {activeTab === 'requests' && (
                <EstimatesList estimates={estimates} />
              )}
              {activeTab === 'production' && (
                <ShipmentsList shipments={shipments} />
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
      type="button"
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
        title="No requests yet"
        description="Start by analyzing your first product to see your requests here."
        actionLabel="Create first request"
        actionHref="/chat"
      />
    )
  }

  return (
    <>
      {estimates.map((estimate) => (
        <Link
          key={estimate.id}
          href={`/dashboard/projects/${estimate.id}`}
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
        description="Start a sourcing request to see your active orders here."
        actionLabel="View projects"
        actionHref="/dashboard?tab=requests"
      />
    )
  }

  return (
    <>
      {shipments.map((shipment) => (
        <div key={shipment.id} className="group">
          <Link href={`/dashboard/projects/${shipment.id}`} className="block">
            <DashboardCard
              icon={<Truck className="h-5 w-5" />}
              title={shipment.batchName}
              subtitle={
                shipment.awaitingManager ? (
                  <span className="flex items-center gap-2">
                    <span>{shipment.destination} • {shipment.date}</span>
                    <span className="text-xs text-blue-600 font-medium">
                      ⏰ Manager will be assigned within 24 hours
                    </span>
                  </span>
                ) : (
                  `${shipment.destination} • ${shipment.date}`
                )
              }
              rightContent={
                <div className="flex items-center gap-3 ml-6">
                  <StatusBadge status={shipment.status} />
                  <ChevronRight className="h-5 w-5 text-zinc-400 group-hover:text-black transition-colors" />
                </div>
              }
            />
          </Link>
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
  subtitle: string | React.ReactNode
  rightContent: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between">
        {/* Left: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="text-zinc-600 flex-shrink-0">{icon}</div>
            <h3 className="text-lg font-semibold text-black truncate">
              {title}
            </h3>
          </div>
          <div className="text-sm text-zinc-600 ml-8">
            {subtitle}
          </div>
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
  // 상태 포맷팅 (언더스코어 제거)
  const formattedStatus = formatStatus(status)
  
  const statusColors: Record<string, string> = {
    Completed: 'bg-green-50 text-green-700 border-green-200',
    Draft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'In Transit': 'bg-blue-50 text-blue-700 border-blue-200',
    'Customs Clearance': 'bg-orange-50 text-orange-700 border-orange-200',
    Saved: 'bg-gray-50 text-gray-700 border-gray-200',
    Processing: 'bg-blue-50 text-blue-700 border-blue-200',
    'Awaiting Manager': 'bg-purple-50 text-purple-700 border-purple-200',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  }

  const colorClass = statusColors[formattedStatus] || 
                     'bg-gray-50 text-gray-700 border-gray-200'

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}
    >
      {formattedStatus}
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
