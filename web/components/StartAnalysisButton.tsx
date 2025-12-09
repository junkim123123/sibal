'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface StartAnalysisButtonProps {
  href: string
  label: string
  className?: string
}

export function StartAnalysisButton({ href, label, className }: StartAnalysisButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    
    if (isLoading || isNavigating) return
    
    try {
      setIsNavigating(true)
      // Always redirect to /chat for unified chat experience
      await router.push('/chat')
    } catch (error) {
      console.error('[StartAnalysisButton] Navigation error:', error)
      setIsNavigating(false)
    }
  }

  if (isLoading) {
    return (
      <Button
        variant="primary"
        size="lg"
        className={className}
        disabled
      >
        {label}
      </Button>
    )
  }

  return (
    <Button
      variant="primary"
      size="lg"
      className={className}
      onClick={handleClick}
      disabled={isNavigating}
    >
      {isNavigating ? 'Loading...' : label}
    </Button>
  )
}
