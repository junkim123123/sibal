'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 에러를 콘솔에 로깅
    console.error('[Error Boundary] Client-side error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      name: error.name,
    })
  }, [error])

  return (
    <div 
      style={{
        fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        height: '100vh',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#09090b',
        color: '#ffffff',
      }}
    >
      <div style={{ maxWidth: '600px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Application Error
        </h1>
        <p style={{ fontSize: '16px', color: '#a1a1aa', marginBottom: '24px' }}>
          A client-side exception has occurred.
        </p>
        
        <div 
          style={{ 
            backgroundColor: '#18181b', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '24px',
            textAlign: 'left',
            fontSize: '14px',
            fontFamily: 'monospace',
            overflow: 'auto',
            maxHeight: '300px',
          }}
        >
          <div style={{ color: '#ef4444', marginBottom: '8px' }}>
            <strong>Error Message:</strong>
          </div>
          <div style={{ color: '#f4f4f5', marginBottom: '16px', wordBreak: 'break-word' }}>
            {error.message || 'Unknown error'}
          </div>
          
          {error.stack && (
            <>
              <div style={{ color: '#ef4444', marginBottom: '8px' }}>
                <strong>Stack Trace:</strong>
              </div>
              <div style={{ color: '#a1a1aa', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {error.stack}
              </div>
            </>
          )}
          
          {error.digest && (
            <div style={{ color: '#a1a1aa', marginTop: '16px', fontSize: '12px' }}>
              <strong>Error Digest:</strong> {error.digest}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button
            onClick={reset}
            style={{
              backgroundColor: '#008080',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            style={{
              backgroundColor: '#27272a',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

