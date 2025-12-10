'use client'

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, Package, Truck, Folder, MessageSquare, FileText, BarChart3, Clock, CheckCircle2, Shield, Loader2 } from 'lucide-react'
import { AssetLibrary } from '@/components/AssetLibrary'
import { ClientMessagesList } from '@/components/ClientMessagesList'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// 더미 데이터 제거 - 실제 Supabase 데이터 사용

// 상태 포맷팅 함수: 언더스코어를 공백으로 바꾸고 각 단어의 첫 글자를 대문자로
function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

type TabType = 'overview' | 'requests' | 'production' | 'agent'

function DashboardPageContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams?.get('tab') || 'overview'
  
  // 하위 호환성: 기존 탭 이름 매핑
  let initialTab: TabType = 'overview'
  if (tabParam === 'overview' || tabParam === 'home' || tabParam === 'dashboard') {
    initialTab = 'overview'
  } else if (tabParam === 'estimates' || tabParam === 'products' || tabParam === 'documents' || tabParam === 'requests') {
    initialTab = 'requests'
  } else if (tabParam === 'orders' || tabParam === 'active' || tabParam === 'production') {
    initialTab = 'production'
  } else if (tabParam === 'agent') {
    initialTab = 'agent'
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

  // 프로젝트 데이터 로드 함수 (useCallback으로 메모이제이션)
  const loadProjects = useCallback(async (userId: string) => {
    try {
      setIsLoading(true)
      console.log('[Dashboard] Loading projects for user:', userId)
      
      const response = await fetch('/api/projects', {
        cache: 'no-store', // 항상 최신 데이터 가져오기
      })
      
      if (!response.ok) {
        console.error('[Dashboard] Failed to fetch projects:', response.status, response.statusText)
        throw new Error(`Failed to fetch projects: ${response.statusText}`)
      }
      
      const data = await response.json()

      console.log('[Dashboard] API response:', {
        ok: data.ok,
        projectsCount: data.projects?.length || 0,
        debug: data.debug,
      })
      
      console.log('[Dashboard] Loaded projects:', data.projects?.length || 0, 'projects')
      
      // 모든 프로젝트 상태 확인
      if (data.projects && data.projects.length > 0) {
        const statusCounts = data.projects.reduce((acc: any, p: any) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {});
        console.log('[Dashboard] Projects by status:', statusCounts);
        console.log('[Dashboard] All project statuses:', data.projects.map((p: any) => ({
          id: p.id,
          name: p.name,
          status: p.status,
          user_id: p.user_id,
          created_at: p.created_at,
        })));
      } else {
        console.warn('[Dashboard] No projects returned from API');
      }
      
      const savedCount = data.projects?.filter((p: any) => p.status === 'saved').length || 0;
      console.log('[Dashboard] Projects with saved status:', savedCount);

      if (data.ok && data.projects) {
        // My Requests: 모든 프로젝트 (active, in_progress, saved, completed 모두 포함)
        // ✨ completed 상태도 포함하여 분석 완료된 프로젝트도 표시
        const allRequests = data.projects
          .filter((p: any) => p.status === 'active' || p.status === 'in_progress' || p.status === 'saved' || p.status === 'completed')
          .map((p: any) => ({
            id: p.id,
            productName: p.name,
            landedCost: p.total_landed_cost ? `$${p.total_landed_cost.toFixed(2)}` : 'N/A per unit',
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
        console.error('[Dashboard] API returned error or no projects:', {
          ok: data.ok,
          error: data.error,
          projects: data.projects,
        })
        // 에러가 있어도 빈 배열로 설정하여 UI가 올바르게 표시되도록 함
        setEstimates([])
        setSavedProducts([])
      }
    } catch (error) {
      console.error('[Dashboard] Failed to load projects:', error)
      // 에러 발생 시에도 빈 배열로 설정
      setEstimates([])
      setSavedProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // URL 파라미터에서 탭 변경 감지 (URL에서 직접 변경된 경우만)
  useEffect(() => {
    const tabParam = searchParams?.get('tab') || ''
    const refresh = searchParams?.get('refresh')
    
    let tab: TabType | null = null
    
    // 하위 호환성: 기존 탭 이름 매핑
    if (tabParam === 'estimates' || tabParam === 'products' || tabParam === 'documents') {
      tab = 'requests'
    } else if (tabParam === 'orders' || tabParam === 'active') {
      tab = 'production'
    } else if (tabParam === 'requests' || tabParam === 'production' || tabParam === 'agent') {
      tab = tabParam as TabType
    }
    
    if (tab && tab !== activeTab) {
      // URL 파라미터가 현재 activeTab과 다를 때만 업데이트
      setActiveTab(tab)
    }
    
    // refresh 파라미터 제거 (URL 정리)
    if (refresh) {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('refresh')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [searchParams, activeTab])

  // 초기 로드 시에만 데이터 로드 (탭 클릭은 직접 처리하므로 useEffect 제거)
  // URL 파라미터 변경은 위의 useEffect에서 처리

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

  // 페이지 포커스/가시성 변경 시 데이터 다시 불러오기
  useEffect(() => {
    if (!userId || !isAuthenticated || !loadProjects) return

    const handleFocus = () => {
      console.log('[Dashboard] Page focused, reloading data...')
      loadProjects(userId)
      loadUsageData(userId) // 사용량 데이터도 새로고침
    }

    const handleVisibilityChange = () => {
      // 페이지가 보이게 되었을 때 (다른 탭에서 돌아왔을 때) 데이터 새로고침
      if (!document.hidden) {
        console.log('[Dashboard] Page visible, reloading data...')
        loadProjects(userId)
        loadUsageData(userId)
      }
    }

    // 페이지 포커스 시 데이터 새로고침
    window.addEventListener('focus', handleFocus)
    // 페이지 가시성 변경 시 데이터 새로고침 (다른 탭에서 돌아올 때)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [userId, isAuthenticated, loadProjects])


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
        console.error('[Dashboard] Failed to load usage data:', profileError)
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
    } catch (error) {
      console.error('[Dashboard] Failed to load usage data:', error)
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
      
      // milestones 데이터 가져오기
      const projectIds = projects.map((p: any) => p.id)
      const { data: milestonesData } = await supabase
        .from('projects')
        .select('id, milestones')
        .in('id', projectIds)

      const milestonesMap = new Map()
      milestonesData?.forEach((p: any) => {
        if (p.milestones) {
          try {
            const milestones = typeof p.milestones === 'string' ? JSON.parse(p.milestones) : p.milestones
            milestonesMap.set(p.id, Array.isArray(milestones) ? milestones : [])
          } catch {
            milestonesMap.set(p.id, [])
          }
        }
      })

      // 2. 선택된 견적이 있는 프로젝트 ID 목록 가져오기 (먼저 가져와서 activeProjects에서 사용)
      const { data: selectedQuotes, error: quotesError } = await supabase
        .from('factory_quotes')
        .select('project_id, factory_name, created_at, updated_at')
        .eq('status', 'selected')
        .order('created_at', { ascending: false })

      if (quotesError) {
        console.error('[Dashboard] Failed to load quotes:', quotesError)
      }

      // 1. status='active' 또는 'in_progress'인 프로젝트들 (새로 생성된 소싱 요청 또는 매니저가 할당된 프로젝트)
      const activeProjects = projects
        .filter((p: any) => p.status === 'active' || p.status === 'in_progress')
        .map((p: any) => {
          // 이 프로젝트에 선택된 견적이 있는지 확인
          const hasSelectedQuote = selectedQuotes?.some((q: any) => q.project_id === p.id) || false
          
          return {
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
            hasSelectedQuote: hasSelectedQuote, // 견적이 선택되었는지 여부
            milestones: milestonesMap.get(p.id) || [],
          }
        })

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
            milestones: milestonesMap.get(p.id) || [],
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
            milestones: milestonesMap.get(projectId) || [],
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
                  className="bg-[#008080] hover:bg-[#006666] text-white rounded-lg px-6 py-3 font-semibold"
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

        {/* Tabs Navigation */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <TabButton
            label="Overview"
            active={activeTab === 'overview'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (activeTab !== 'overview') {
                setActiveTab('overview')
                if (userId && isAuthenticated) {
                  loadProjects(userId)
                }
              }
            }}
          />
          <TabButton
            label="Sourcing Estimates"
            active={activeTab === 'requests'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (activeTab !== 'requests') {
                setActiveTab('requests')
                if (userId && isAuthenticated) {
                  loadProjects(userId)
                }
              }
            }}
          />
          <TabButton
            label="Active Orders"
            active={activeTab === 'production'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (activeTab !== 'production') {
                setActiveTab('production')
                if (userId && isAuthenticated) {
                  loadProjects(userId)
                }
              }
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
              {activeTab === 'overview' && (
                <OverviewTab 
                  estimates={estimates} 
                  shipments={shipments}
                  userId={userId}
                />
              )}
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
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
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
      aria-pressed={active}
      aria-label={`${label} tab`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black border-b-2 border-black" />
      )}
    </button>
  )
}

// Summary Card Component
function SummaryCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode
  label: string
  value: number
  color: 'blue' | 'orange' | 'green' | 'red'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ 
  estimates, 
  shipments,
  userId 
}: { 
  estimates: any[]
  shipments: any[]
  userId: string | null
}) {
  // Action Required: 승인 대기 중인 견적 (status가 completed이고 아직 agent 요청 안 한 것)
  const actionRequired = estimates.filter((e: any) => 
    e.status === 'completed' && !shipments.some((s: any) => s.id === e.id)
  ).length

  // In Transit: 배송 중인 주문
  const inTransit = shipments.filter((s: any) => 
    s.status === 'Shipping' || s.status === 'In Transit' || s.status === 'Customs Clearance'
  ).length

  // Total Spend 계산 (이번 달)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const totalSpend = shipments
    .filter((s: any) => {
      const shipmentDate = new Date(s.date || s.created_at || 0)
      return shipmentDate.getMonth() === currentMonth && shipmentDate.getFullYear() === currentYear
    })
    .length * 0 // 실제로는 프로젝트의 결제 금액을 합산해야 함 (임시로 주문 건수 표시)

  // Recent Activity: 최근 업데이트된 항목들 (estimates와 shipments 합쳐서 정렬)
  const recentActivity = [
    ...estimates.slice(0, 3).map((e: any) => ({ ...e, type: 'estimate' })),
    ...shipments.slice(0, 2).map((s: any) => ({ ...s, type: 'order' }))
  ]
    .sort((a: any, b: any) => {
      const dateA = new Date(a.date || a.created_at || 0).getTime()
      const dateB = new Date(b.date || b.created_at || 0).getTime()
      return dateB - dateA
    })
    .slice(0, 4)

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          icon={<Clock className="w-5 h-5" />}
          label="Action Required"
          value={actionRequired}
          color="red"
        />
        <SummaryCard
          icon={<Truck className="w-5 h-5" />}
          label="In Transit"
          value={inTransit}
          color="blue"
        />
        <SummaryCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Active Orders"
          value={shipments.length}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item: any) => (
                  <Link
                    key={item.id}
                    href={item.type === 'estimate' ? `/results?project_id=${item.id}` : `/dashboard/projects/${item.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.type === 'estimate' ? (
                          <Package className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Truck className="w-5 h-5 text-blue-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.productName || item.batchName}
                          </p>
                          <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Action */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <Link href="/chat">
              <Button
                size="lg"
                className="w-full bg-[#008080] hover:bg-[#006666] text-white rounded-lg py-6 font-semibold text-base"
              >
                + New Analysis Request
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Payment Modal Component (Reusable)
function PaymentModal({ 
  isOpen, 
  onClose, 
  onProceed, 
  isProcessing,
  projectId
}: { 
  isOpen: boolean
  onClose: () => void
  onProceed: (e: React.MouseEvent<HTMLAnchorElement>) => void
  isProcessing: boolean
  projectId?: string | null
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Connect with a Dedicated Agent
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Get official quotes and negotiate with suppliers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Price Display */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">$49 Sourcing Retainer</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-gray-900">$49</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">One-time sourcing initiation fee</p>
          </div>

          {/* Credited Upon Order Policy (Most Important) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Credited Upon Order</p>
                <p className="text-sm text-blue-900 leading-relaxed">
                  This fee covers the agent's labor for negotiation and is <strong>non-refundable</strong>. However, it will be <strong>fully deducted</strong> from your final 5% service fee when you proceed with the order.
                </p>
              </div>
            </div>
          </div>

          {/* Feature List */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Dedicated Agent Assignment</p>
                <p className="text-sm text-gray-600">
                  Your personal sourcing specialist assigned to your project
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Factory Verification & Price Negotiation</p>
                <p className="text-sm text-gray-600">
                  We find and verify trusted factories, then negotiate the best prices
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Official Quote (PI) Issuance</p>
                <p className="text-sm text-gray-600">
                  Receive formal Proforma Invoice from verified manufacturers
                </p>
              </div>
            </div>
          </div>

          {/* Non-refundable Notice (Microcopy) */}
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              The sourcing fee is non-refundable once the official quote has been delivered.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          {isProcessing ? (
            <Button
              disabled
              className="w-full bg-[#008080] hover:bg-teal-700 text-white font-semibold py-3"
            >
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </span>
            </Button>
          ) : (
            <a
              href={projectId 
                ? `https://junkim82.gumroad.com/l/wmtnuv?custom_field1=${projectId}`
                : 'https://junkim82.gumroad.com/l/wmtnuv'
              }
              data-gumroad-single-product="true"
              onClick={onProceed}
              className="w-full inline-flex items-center justify-center bg-[#008080] hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Proceed to Payment
            </a>
          )}
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            Cancel
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Estimates List Component (Table Format)
function EstimatesList({ estimates }: { estimates: any[] }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const handleConnectAgent = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedProjectId(projectId)
    setShowPaymentModal(true)
  }

  const handleProceedToPayment = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 모달만 닫기 (Gumroad Overlay는 <a> 태그가 자동 처리)
    setShowPaymentModal(false)
  }

  if (estimates.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="No estimates yet"
        description="Start by analyzing your first product to see your estimates here."
        actionLabel="Create first request"
        actionHref="/chat"
      />
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Info</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Est. Unit Cost</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {estimates.map((estimate) => {
              const isComplete = estimate.status === 'completed'
              const isPending = estimate.status === 'active' || estimate.status === 'in_progress'
              
              return (
                <tr key={estimate.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <Link 
                          href={`/results?project_id=${estimate.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {estimate.productName}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {estimate.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-bold text-gray-900">{estimate.landedCost}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <StatusBadge 
                      status={isComplete ? 'Analysis Complete' : isPending ? 'Pending' : formatStatus(estimate.status)} 
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {isComplete ? (
                      <button
                        onClick={(e) => handleConnectAgent(e, estimate.id)}
                        className="px-4 py-2 text-sm font-semibold bg-[#008080] hover:bg-teal-700 text-white rounded-lg transition-colors"
                      >
                        Connect Agent
                      </button>
                    ) : (
                      <Link href={`/results?project_id=${estimate.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          View Report
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onProceed={handleProceedToPayment}
        isProcessing={isProcessingPayment}
        projectId={selectedProjectId}
      />
    </div>
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

// Order Progress Stepper Component
function OrderStepper({ 
  currentStep, 
  quoteStatus 
}: { 
  currentStep: number
  quoteStatus?: 'preparing' | 'ready' | 'approved'
}) {
  const steps = [
    { label: 'Quote', key: 'quote' },
    { label: 'Deposit', key: 'deposit' },
    { label: 'Production', key: 'production' },
    { label: 'QC', key: 'qc' },
    { label: 'Shipping', key: 'shipping' },
    { label: 'Delivered', key: 'delivered' },
  ]

  // Step 1(Quote)의 상태 결정
  const getQuoteStepState = () => {
    if (quoteStatus === 'approved' || currentStep > 0) {
      return { isCompleted: true, isCurrent: false, label: 'Quote' }
    }
    if (quoteStatus === 'ready') {
      return { isCompleted: false, isCurrent: true, label: 'Quote Received' }
    }
    // quoteStatus === 'preparing' or undefined
    return { isCompleted: false, isCurrent: true, label: 'Preparing Quote' }
  }

  const quoteState = getQuoteStepState()

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0">
          <div 
            className="absolute top-0 left-0 h-full bg-[#008080] transition-all duration-300 z-10"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          // Step 1 (Quote)는 특별 처리
          if (index === 0) {
            return (
              <div key={step.key} className="relative z-20 flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    quoteState.isCompleted
                      ? 'bg-[#008080] border-[#008080] text-white'
                      : quoteState.isCurrent
                      ? 'bg-white border-[#008080] text-[#008080]'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {quoteState.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span className="text-xs font-semibold">1</span>
                  )}
                </div>
                {/* Step Label */}
                <span
                  className={`mt-2 text-xs font-medium ${
                    quoteState.isCompleted || quoteState.isCurrent
                      ? 'text-[#008080]'
                      : 'text-gray-400'
                  }`}
                >
                  {quoteState.label}
                </span>
              </div>
            )
          }

          // 나머지 단계들
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep && currentStep > 0
          const isPending = index > currentStep

          return (
            <div key={step.key} className="relative z-20 flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'bg-[#008080] border-[#008080] text-white'
                    : isCurrent
                    ? 'bg-white border-[#008080] text-[#008080]'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>
              {/* Step Label */}
              <span
                className={`mt-2 text-xs font-medium ${
                  isCompleted || isCurrent
                    ? 'text-[#008080]'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Active Orders List Component with Stepper
function ShipmentsList({ shipments }: { shipments: any[] }) {
  if (shipments.length === 0) {
    return (
      <EmptyState
        icon={<Truck className="h-12 w-12" />}
        title="No active orders yet"
        description="Request an agent from your estimates to see active orders here."
        actionLabel="View estimates"
        actionHref="/dashboard?tab=requests"
      />
    )
  }

  // 견적 상태 확인 함수
  const getQuoteStatus = (shipment: any): 'preparing' | 'ready' | 'approved' => {
    // hasSelectedQuote가 true면 견적이 준비됨
    if (shipment.hasSelectedQuote) {
      // 실제로는 quote의 status나 payment_status를 확인해야 함
      // 임시로 hasSelectedQuote만 확인
      return 'ready' // 견적 도착, 승인 대기
    }
    // 매니저가 할당되었지만 견적이 아직 없음
    if (shipment.hasManager || shipment.status === 'In Progress') {
      return 'preparing' // 견적 준비 중
    }
    // 기본값: 준비 중
    return 'preparing'
  }

  // 상태를 Stepper 단계로 매핑
  const getStepFromStatus = (status: string, shipment: any): number => {
    // milestones 데이터가 있으면 사용
    if (shipment.milestones && Array.isArray(shipment.milestones)) {
      const completedCount = shipment.milestones.filter((m: any) => m.status === 'completed').length
      // Step 1(Quote)이 완료되려면 최소 1개 milestone이 완료되어야 함
      return Math.max(0, Math.min(completedCount - 1, 5)) // 0-5 단계
    }

    // 상태 기반 매핑 (견적이 확정된 후의 단계들)
    // 견적이 아직 없으면 currentStep = 0 (Step 1 진행 중)
    const quoteStatus = getQuoteStatus(shipment)
    if (quoteStatus === 'preparing') return 0 // Step 1 진행 중
    
    // 견적이 도착했지만 아직 승인 안 함
    if (quoteStatus === 'ready') return 0 // Step 1 완료 대기 (사용자 승인 필요)
    
    // 견적 승인 후 단계들
    if (status === 'In Progress' || status === 'in_progress') {
      return shipment.hasManager ? 1 : 0 // Deposit 단계
    }
    if (status.includes('Production') || status.includes('Manufacturing')) return 2
    if (status.includes('QC') || status.includes('Inspection')) return 3
    if (status === 'Shipping' || status === 'In Transit') return 4
    if (status === 'Delivered' || status === 'Completed') return 5
    return 0 // 기본값: Step 1 진행 중
  }

  // 현재 단계에서 필요한 액션 결정
  const getActionForStep = (step: number, shipment: any, quoteStatus: 'preparing' | 'ready' | 'approved') => {
    // Step 1: 견적 상태에 따라 다른 액션
    if (step === 0) {
      if (quoteStatus === 'ready') {
        return { label: 'View Quote & Approve', href: `/dashboard/projects/${shipment.id}` }
      }
      // preparing 상태일 때는 액션 버튼 없음 (Message Agent만 표시)
      return null
    }
    if (step === 3) return { label: 'View Inspection Report', href: `/dashboard/projects/${shipment.id}` }
    return null
  }

  return (
    <div className="space-y-6">
      {shipments.map((shipment) => {
        const quoteStatus = getQuoteStatus(shipment)
        const currentStep = getStepFromStatus(shipment.status, shipment)
        const action = getActionForStep(currentStep, shipment, quoteStatus)

        return (
          <div key={shipment.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link 
                    href={shipment.href || `/dashboard/projects/${shipment.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {shipment.batchName}
                  </Link>
                  {quoteStatus === 'preparing' ? (
                    <p className="text-sm text-gray-500 mt-1">
                      Waiting for Quote
                    </p>
                  ) : shipment.destination === 'TBD' ? (
                    <p className="text-sm text-gray-600 mt-1">
                      {shipment.date}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">
                      {shipment.destination} • {shipment.date}
                    </p>
                  )}
                  {shipment.awaitingManager && (
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      ⏰ Manager will be assigned within 24 hours
                    </p>
                  )}
                  {quoteStatus === 'preparing' && (
                    <p className="text-xs text-orange-600 font-medium mt-1">
                      Agent is preparing your quote
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={shipment.status} />
                <Link href={`/dashboard/chat?project_id=${shipment.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    Message Agent
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stepper */}
            <div className="mb-6">
              <OrderStepper currentStep={currentStep} quoteStatus={quoteStatus} />
            </div>

            {/* Action Area */}
            {action && (
              <div className="pt-4 border-t border-gray-200">
                <Link href={action.href}>
                  <button
                    className="px-4 py-2 text-sm font-semibold bg-[#008080] hover:bg-teal-700 text-white rounded-lg transition-colors"
                  >
                    {action.label}
                  </button>
                </Link>
              </div>
            )}
          </div>
        )
      })}
    </div>
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
          <div className="flex items-center gap-4 mb-2">
            {icon}
            <h3 className="text-lg font-semibold text-black truncate">
              {title}
            </h3>
          </div>
          <div className="text-sm text-zinc-600 ml-14">
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
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#008080] text-white rounded-lg font-medium hover:bg-[#006666] transition-colors"
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
    'Analysis Complete': 'bg-green-50 text-green-700 border-green-200',
    'Completed': 'bg-green-50 text-green-700 border-green-200',
    'Pending': 'bg-orange-50 text-orange-700 border-orange-200',
    'Processing': 'bg-blue-50 text-blue-700 border-blue-200',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
    'Draft': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'In Transit': 'bg-blue-50 text-blue-700 border-blue-200',
    'Customs Clearance': 'bg-orange-50 text-orange-700 border-orange-200',
    'Saved': 'bg-gray-50 text-gray-700 border-gray-200',
    'Awaiting Manager': 'bg-purple-50 text-purple-700 border-purple-200',
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
