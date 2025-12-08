'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, FileText, Package, MessageSquare, ArrowLeft } from 'lucide-react'
import { AssetLibrary } from '@/components/AssetLibrary'
import { Loader2 } from 'lucide-react'

type ProjectTabType = 'overview' | 'documents' | 'chat'

function ProjectDetailPageContent() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [activeTab, setActiveTab] = useState<ProjectTabType>('overview')
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

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
    } catch (error) {
      console.error('[Project Detail] Error:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
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

        {/* Tabs Navigation */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <TabButton
            label="Overview"
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            label="Documents"
            active={activeTab === 'documents'}
            onClick={() => setActiveTab('documents')}
          />
          <TabButton
            label="Chat"
            active={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
          />
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Project Status</h2>
                  <p className="text-lg font-medium text-gray-900 capitalize">{project.status}</p>
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
          )}

          {activeTab === 'documents' && projectId && (
            <AssetLibrary projectId={projectId} />
          )}

          {activeTab === 'chat' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Project Chat</h3>
                <p className="text-gray-600 mb-6">
                  Chat with your dedicated agent about this project
                </p>
                <Link
                  href={`/dashboard/chat?project_id=${project.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open Chat
                </Link>
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
