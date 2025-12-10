'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/login/actions';

export function MainHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    router.refresh();
  };

  // Determine if current page is an app page
  const isAppPage = pathname?.startsWith('/dashboard') || 
                    pathname?.startsWith('/account') || 
                    pathname?.startsWith('/support');

  // Marketing navigation (for landing pages)
  const marketingNavItems = [
    { label: 'Solutions', href: '/how-it-works' },
    { label: 'Use Cases', href: '/use-cases' },
    { label: 'Resources', href: '/resources' },
    { label: 'Pricing', href: '/pricing' },
  ];

  // App navigation (for app pages)
  const appNavItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Support', href: '/support' },
    { label: 'Account', href: '/account' },
  ];

  // Navigation items based on current page type
  const currentNavItems = isAppPage ? appNavItems : marketingNavItems;

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-black">NexSupply</span>
          </Link>

          {/* Center: Navigation Links (Based on Page Type) */}
          {!isLoading && (
            <nav className="hidden md:flex md:items-center md:gap-8 md:absolute md:left-1/2 md:-translate-x-1/2 z-20">
              {currentNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-normal transition-colors relative ${
                    pathname === item.href
                      ? 'text-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black'
                      : 'text-zinc-700 hover:text-black'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right: Action Buttons Group */}
          {!isLoading ? (
            <div className="hidden md:flex md:items-center md:gap-4">
              {/* Get Started Button (Show on marketing pages, regardless of auth status - Left position) */}
              {!isAppPage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isLoading) return;
                    
                    // 로그인한 경우 /chat으로, 로그인하지 않은 경우 /login으로
                    if (isAuthenticated) {
                      router.push('/chat');
                    } else {
                      router.push('/login');
                    }
                  }}
                  disabled={isLoading}
                  className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Get Started
                </button>
              )}

              {/* User Icon (Always visible - Right position) */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // 로딩 중이면 아무것도 하지 않음
                    if (isLoading) return;
                    
                    if (isAuthenticated) {
                      setUserMenuOpen(!userMenuOpen);
                    } else {
                      // 로그인 안 된 경우 로그인 페이지로 리다이렉트
                      window.location.href = '/login';
                    }
                  }}
                  disabled={isLoading}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-400 text-gray-800 hover:border-gray-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={isAuthenticated ? "User menu" : "Sign in"}
                  title={isAuthenticated ? "User menu" : "Sign in"}
                >
                  <User className="h-6 w-6" />
                </button>

                {/* User Dropdown Menu (Logged in only) */}
                {isAuthenticated && userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm font-semibold text-black hover:bg-gray-50 transition-colors"
                    >
                      My dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-zinc-600 hover:bg-gray-50 hover:text-black transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex md:items-center">
              <div className="px-4 py-2 text-zinc-400 text-sm font-medium">
                Loading...
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-black" />
            ) : (
              <Menu className="h-6 w-6 text-black" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {isLoading ? (
              <div className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-zinc-400">
                Loading...
              </div>
            ) : (
              <>
                {/* Navigation Links (Based on Page Type) */}
                {currentNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMobileMenuOpen(false);
                    }}
                    className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-50 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  {!isAuthenticated && (
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-50 transition-colors"
                    >
                      Sign In
                    </Link>
                  )}
                  {/* Get Started Button (Show on marketing pages, regardless of auth status) */}
                  {!isAppPage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setMobileMenuOpen(false);
                        if (isLoading) return;
                        
                        // 로그인한 경우 /chat으로, 로그인하지 않은 경우 /login으로
                        if (isAuthenticated) {
                          router.push('/chat');
                        } else {
                          router.push('/login');
                        }
                      }}
                      disabled={isLoading}
                      className="block w-full rounded-full bg-black px-6 py-2 text-center text-sm font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Get Started
                    </button>
                  )}
                  {isAuthenticated && (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-50 transition-colors"
                      >
                        My dashboard
                      </Link>
                      <button
                        onClick={async () => {
                          await handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-zinc-600 hover:bg-gray-50 hover:text-black transition-colors"
                      >
                        Sign out
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

