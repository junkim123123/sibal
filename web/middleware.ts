import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const pathname = request.nextUrl.pathname

  // Skip Supabase auth check if environment variables are not set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response
  }

  // Super Admin route protection
  if (pathname.startsWith('/admin')) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              request.cookies.set({
                name,
                value,
                ...options,
              })
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              response.cookies.set({
                name,
                value,
                ...options,
              })
            },
            remove(name: string, options: CookieOptions) {
              request.cookies.set({
                name,
                value: '',
                ...options,
              })
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              response.cookies.set({
                name,
                value: '',
                ...options,
              })
            },
          },
        }
      )

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        // Not authenticated - redirect to login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Check if user is super admin (using service role for RLS bypass)
      // Check by email domain first, then by role
      const userEmail = user.email?.toLowerCase() || ''
      
      // Allow if email is k.myungjun@nexsupply.net (super admin)
      if (userEmail === 'k.myungjun@nexsupply.net') {
        // Allow access
      } else {
        // Check role in database
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role !== 'super_admin') {
          // Not a super admin - redirect to dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    } catch (error) {
      // On error, redirect to login for safety
      console.error('[Middleware] Super Admin route protection error:', error)
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Manager route protection
  if (pathname.startsWith('/manager')) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              request.cookies.set({
                name,
                value,
                ...options,
              })
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              response.cookies.set({
                name,
                value,
                ...options,
              })
            },
            remove(name: string, options: CookieOptions) {
              request.cookies.set({
                name,
                value: '',
                ...options,
              })
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              response.cookies.set({
                name,
                value: '',
                ...options,
              })
            },
          },
        }
      )

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        // Not authenticated - redirect to login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Check if user is manager or admin (using service role for RLS bypass)
      // Note: We use a lightweight check here - full verification happens in layout
      const userEmail = user.email?.toLowerCase() || ''
      
      // 하드코딩된 매니저 이메일
      if (userEmail === 'junkimfrom82@gmail.com') {
        // Allow access for hardcoded manager
      } else if (userEmail.endsWith('@nexsupply.net') && userEmail !== 'k.myungjun@nexsupply.net') {
        // Allow all @nexsupply.net domain users (except super admin who should go to /admin)
      } else {
        // Check database for manager flag or admin role
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_manager, role')
          .eq('id', user.id)
          .single()

        const isManager = profile?.is_manager === true
        const isAdmin = profile?.role === 'admin'

        if (!isManager && !isAdmin) {
          // Not a manager or admin - redirect to dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    } catch (error) {
      // On error, redirect to login for safety
      console.error('[Middleware] Manager route protection error:', error)
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  } else {
    // For non-manager/admin routes, check if user is manager or admin and redirect them
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              request.cookies.set({
                name,
                value,
                ...options,
              })
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              response.cookies.set({
                name,
                value,
                ...options,
              })
            },
            remove(name: string, options: CookieOptions) {
              request.cookies.set({
                name,
                value: '',
                ...options,
              })
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              response.cookies.set({
                name,
                value: '',
                ...options,
              })
            },
          },
        }
      )

      const { data: { user }, error: authError } = await supabase.auth.getUser()

      // Only check redirect if user is authenticated
      if (!authError && user) {
        const userEmail = user.email?.toLowerCase() || ''
        
        // Super Admin: redirect to /admin if trying to access other pages
        if (userEmail === 'k.myungjun@nexsupply.net') {
          // Allow access to /admin routes, /login, /auth/callback, /auth/verify-email
          if (!pathname.startsWith('/admin') && 
              !pathname.startsWith('/login') && 
              !pathname.startsWith('/auth/callback') &&
              !pathname.startsWith('/auth/verify-email') &&
              !pathname.startsWith('/api') &&
              !pathname.startsWith('/_next')) {
            return NextResponse.redirect(new URL('/admin', request.url))
          }
        }
        
        // Manager: redirect to /manager/dashboard if trying to access other pages
        const isManagerEmail = userEmail === 'junkimfrom82@gmail.com' || 
                               (userEmail.endsWith('@nexsupply.net') && userEmail !== 'k.myungjun@nexsupply.net')
        
        if (isManagerEmail) {
          // Allow access to /manager routes, /login, /auth/callback, /auth/verify-email
          if (!pathname.startsWith('/manager') && 
              !pathname.startsWith('/login') && 
              !pathname.startsWith('/auth/callback') &&
              !pathname.startsWith('/auth/verify-email') &&
              !pathname.startsWith('/api') &&
              !pathname.startsWith('/_next')) {
            return NextResponse.redirect(new URL('/manager/dashboard', request.url))
          }
        } else {
          // Check database for manager flag
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_manager, role')
            .eq('id', user.id)
            .single()

          if (profile?.is_manager === true || profile?.role === 'admin') {
            // Manager detected - redirect to /manager/dashboard
            if (!pathname.startsWith('/manager') && 
                !pathname.startsWith('/login') && 
                !pathname.startsWith('/auth/callback') &&
                !pathname.startsWith('/auth/verify-email') &&
                !pathname.startsWith('/api') &&
                !pathname.startsWith('/_next')) {
              return NextResponse.redirect(new URL('/manager/dashboard', request.url))
            }
          }
        }
      }

      // Refresh session if expired - required for Server Components
      await Promise.race([
        supabase.auth.getUser(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth check timeout')), 5000)
        )
      ]).catch(() => {
        // Silently fail if auth check times out or errors
      })
    } catch (error) {
      // Silently handle any errors to prevent middleware from blocking requests
      console.error('[Middleware] Auth check error:', error)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (next-auth routes)
     * - auth/callback (Supabase auth callback)
     * - auth/verify-email (Email verification page)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|auth/callback|auth/verify-email|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
