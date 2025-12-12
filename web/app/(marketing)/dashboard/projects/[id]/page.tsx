'use client'

import { useState, useEffect, Suspense, useRef, useCallback, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, FileText, Package, MessageSquare, ArrowLeft, Upload, Loader2 as Loader2Icon, CheckCircle2 } from 'lucide-react'
import { ManagerChat } from '@/components/ManagerChat'
import { Loader2 } from 'lucide-react'

// Progress Tracker Component (Client-facing, read-only)
function ProgressTracker({ projectId, managerId }: { projectId: string; managerId: string }) {
  const [milestones, setMilestones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // [수정] 컴포넌트가 마운트될 때마다 데이터를 새로 불러오도록 보장
  useEffect(() => {
    console.log('🔄 ProgressTracker Mounted: Loading milestones for project:', projectId)
    loadMilestones()
  }, [projectId]) // projectId가 변경되거나 컴포넌트가 재마운트될 때 실행

  const loadMilestones = async () => {
    try {
      setIsLoading(true)
      console.log('[ProgressTracker] Fetching milestones from API...')
      const response = await fetch(`/api/projects/${projectId}/progress`)
      const data = await response.json()
      
      if (data.ok && data.milestones) {
        console.log('[ProgressTracker] Milestones loaded:', data.milestones.length)
        setMilestones(data.milestones)
      } else {
        console.warn('[ProgressTracker] No milestones returned from API')
      }
    } catch (error) {
      console.error('[ProgressTracker] Failed to load milestones:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Project Progress</h2>
        <p className="text-sm text-gray-500">
          Real-time updates from your dedicated manager
        </p>
      </div>

      <div className="relative">
        {milestones.map((milestone, idx) => {
          const isCompleted = milestone.status === 'completed'
          const isInProgress = milestone.status === 'in_progress'
          
          return (
            <div key={idx} className="relative flex items-start gap-4 pb-8 last:pb-0">
              {/* Timeline Line */}
              {idx < milestones.length - 1 && (
                <div
                  className={`absolute left-[18px] top-8 w-0.5 h-full ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Icon */}
              <div className="relative flex-shrink-0 z-10 bg-white">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : isInProgress ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p
                  className={`text-base font-medium ${
                    isCompleted
                      ? 'text-gray-900'
                      : isInProgress
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}
                >
                  {milestone.title}
                </p>
                {milestone.date && (
                  <p className="text-sm text-gray-500 mt-1">
                    Completed on {new Date(milestone.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                )}
                {isInProgress && (
                  <p className="text-sm text-blue-600 mt-1 font-medium">
                    In progress...
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type ProjectTabType = 'chat' | 'progress' | 'overview'

function ProjectDetailPageContent() {
  const params = useParams()
  const router = useRouter()
  const projectId = (params?.id as string) || ''
  const [activeTab, setActiveTab] = useState<ProjectTabType>('chat')
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()

  // 탭 변경 핸들러를 useCallback으로 메모이제이션
  const handleTabChange = useCallback((tab: ProjectTabType) => {
    // 이미 같은 탭이 활성화되어 있으면 무시
    if (activeTab === tab) {
      return
    }
    
    console.log('👆 Tab change requested:', tab, 'current:', activeTab)
    // 즉시 상태 업데이트
    setActiveTab(tab)
    console.log('✅ Tab state updated to:', tab)
  }, [activeTab])

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUserId(user.id)
        await loadProject(projectId, user.id)
      } catch (error) {
        console.error('[Project Detail] Auth error:', error)
        router.push('/login')
      }
    }
    checkAuth()
  }, [projectId, router])

  async function loadProject(projectId: string, userId: string) {
    try {
      setIsLoading(true)
      const supabase = createClient()
      
      const { data: projectData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single()

      if (error || !projectData) {
        console.error('[Project Detail] Failed to load project:', error)
        router.push('/dashboard')
        return
      }

      setProject(projectData)
      
      // 채팅 세션 찾기 또는 생성
      await loadOrCreateChatSession(projectData.id, userId)
    } catch (error) {
      console.error('[Project Detail] Error:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  // 채팅 세션 로드 또는 생성
  async function loadOrCreateChatSession(projectId: string, userId: string) {
    try {
      const supabase = createClient()
      
      // 기존 활성 세션 찾기
      const { data: existingSession } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (existingSession) {
        setSessionId(existingSession.id)
        return
      }
      
      // 세션이 없으면 생성 (올바른 API 사용)
      const response = await fetch('/api/chat-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
        }),
      })
      
      const data = await response.json()
      if (data.ok && data.session) {
        setSessionId(data.session.id)
      }
    } catch (error) {
      console.error('[Project Detail] Failed to load/create chat session:', error)
    }
  }

  const uploadFile = async (file: File) => {
    if (!file || !projectId) return

    // [중요] 사용자가 파일을 선택하자마자 일단 input을 비워버립니다.
    // 그래야 실패하든 성공하든 바로 다음 클릭(같은 파일 선택)이 먹힙니다.
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    try {
      setIsUploading(true)
      setUploadSuccess(false)

      console.log('[File Upload] Starting upload for file:', file.name)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/projects/${projectId}/files/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const data = await response.json()

      if (!data.ok) {
        throw new Error(data.error || 'Failed to upload file')
      }

      console.log('[File Upload] Upload successful')
      setUploadSuccess(true)

      // 파일 업로드 성공 후 Overview 탭으로 전환 (Documents 탭 제거됨)
      // 필요시 Overview 탭에서 파일 목록을 표시할 수 있음

      // 성공 메시지 3초 후 제거
      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('[Project Detail] Failed to upload file:', error)
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    console.log('[File Upload] File selected:', file?.name)
    if (file) {
      await uploadFile(file)
    } else {
      console.warn('[File Upload] No file selected')
    }
  }

  // Drag and Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      await uploadFile(file)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  // 상태 포맷팅 함수: 언더스코어를 공백으로 바꾸고 각 단어의 첫 글자를 대문자로
  const formatStatus = (status: string): string => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Project not found</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Created {new Date(project.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            {/* Quick Upload Button */}
            <div className="ml-6">
              <label htmlFor="file-upload-header" className="sr-only">
                Upload project file
              </label>
              <input
                id="file-upload-header"
                name="file-upload-header"
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                aria-label="Upload project file"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Upload file"
              >
                {isUploading ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    <span>Upload File</span>
                  </>
                )}
              </button>
              {uploadSuccess && (
                <p className="text-xs text-green-600 mt-2 text-center" role="status" aria-live="polite">
                  File uploaded successfully!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <TabButton
            label="Chat"
            active={activeTab === 'chat'}
            onClick={() => handleTabChange('chat')}
          />
          <TabButton
            label="Progress"
            active={activeTab === 'progress'}
            onClick={() => handleTabChange('progress')}
          />
          <TabButton
            label="Overview"
            active={activeTab === 'overview'}
            onClick={() => handleTabChange('overview')}
          />
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'chat' && (
            <div className="bg-white rounded-lg border border-gray-200">
              {sessionId && userId ? (
                <ManagerChat
                  sessionId={sessionId}
                  projectId={projectId}
                  userId={userId}
                  showQuickReplies={true}
                />
              ) : (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Loading chat...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && project && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {project.manager_id ? (
                // key prop 추가하여 탭 전환 시 강제로 재마운트 (데이터 새로고침 보장)
                <ProgressTracker 
                  key={`progress-${projectId}-${activeTab}`}
                  projectId={projectId} 
                  managerId={project.manager_id} 
                />
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Manager Not Assigned</h3>
                  <p className="text-gray-600">
                    A manager will be assigned to your project soon. Progress updates will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Project Info Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Project Status</h2>
                    <p className="text-lg font-medium text-gray-900">{formatStatus(project.status)}</p>
                  </div>
                  {project.total_landed_cost && (
                    <div>
                      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Estimated Landed Cost</h2>
                      <p className="text-lg font-medium text-gray-900">
                        ${project.total_landed_cost.toFixed(2)}
                      </p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      href={`/results?project_id=${project.id}`}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Full Analysis Report
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick File Upload Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">Quick Upload</h2>
                <label htmlFor="file-upload-dropzone" className="sr-only">
                  Upload project files by dragging and dropping or clicking
                </label>
                <div
                  ref={dropZoneRef}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isUploading) {
                      e.preventDefault()
                      fileInputRef.current?.click()
                    }
                  }}
                  aria-label="File upload drop zone"
                >
                  <input
                    id="file-upload-dropzone"
                    name="file-upload-dropzone"
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    aria-label="Upload project files"
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2Icon className="w-8 h-8 text-gray-400 animate-spin" aria-hidden="true" />
                      <p className="text-sm text-gray-600">Uploading file...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {isDragging ? 'Drop file here' : 'Drag and drop files here, or click to upload'}
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, Word, Excel, Images (max 50MB)
                        </p>
                      </div>
                      {!isDragging && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            fileInputRef.current?.click()
                          }}
                          className="mt-2 px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition-colors text-sm font-medium"
                          aria-label="Select file to upload"
                        >
                          Select File
                        </button>
                      )}
                    </div>
                  )}
                  {uploadSuccess && (
                    <p className="text-sm text-green-600 mt-3" role="status" aria-live="polite">
                      ✓ File uploaded successfully!
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Upload Quotes, Invoices, POs, or other project documents
                </p>
              </div>
            </div>
          )}

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
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    console.log(`🔘 TabButton "${label}" clicked, active:`, active)
    onClick()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
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

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    }>
      <ProjectDetailPageContent />
    </Suspense>
  )
}
