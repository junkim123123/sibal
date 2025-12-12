'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/login/actions';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector } from '@/components/i18n/language-selector';
import { useLanguage } from '@/components/i18n/language-provider';

export function MainHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // 페이지 로드 시 목적지 미리 로드 (클릭 반응 속도 향상)
  useEffect(() => {
    router.prefetch('/chat');
    router.prefetch('/login');
  }, [router]);

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
    setIsLoading(true); // 로그아웃 시작 시 로딩 상태 표시
    await signOut();
    setUserMenuOpen(false);
    router.refresh();
  };

  // UX 개선: Get Started 버튼 클릭 핸들러 통합
  // ✅ 수정됨: preventDefault/stopPropagation 제거
  const handleGetStarted = () => {
    if (isLoading) return;
    
    // 버튼을 누르자마자 로딩 상태로 변경해 '눌렸다'는 피드백을 줌
    // (페이지 이동이 시작되면 어차피 현재 페이지는 멈추므로 로딩 보여주는 게 UX상 좋음)
    setIsLoading(true);

    if (isAuthenticated) {
      router.push('/chat');
    } else {
      router.push('/login');
    }
  };

  // Determine if current page is an app page
  const isAppPage = pathname?.startsWith('/dashboard') || 
                    pathname?.startsWith('/account') || 
                    pathname?.startsWith('/support') ||
                    pathname?.startsWith('/results');

  // Marketing navigation (for landing pages)
  const marketingNavItems = [
    { label: t.nav.solutions, href: '/how-it-works' },
    { label: t.nav.useCases, href: '/use-cases' },
    { label: t.nav.resources, href: '/resources' },
    { label: t.nav.pricing, href: '/pricing' },
  ];

  // App navigation (for app pages)
  const appNavItems = [
    { label: t.nav.dashboard, href: '/dashboard' },
    { label: t.nav.support, href: '/support' },
    { label: t.nav.account, href: '/account' },
  ];

  // Navigation items based on current page type
  const currentNavItems = isAppPage ? appNavItems : marketingNavItems;

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-black dark:text-white">NexSupply</span>
          </Link>

          {/* Center: Navigation Links (Based on Page Type) */}
          {/* 로딩 중에도 메뉴 위치를 유지하여 Layout Shift 방지 */}
          <nav className={`hidden md:flex md:items-center md:gap-8 md:absolute md:left-1/2 md:-translate-x-1/2 z-20 ${isLoading ? 'opacity-50' : ''}`}>
            {currentNavItems.map((item) => {
              const isActive = pathname === item.href;
              if (isActive) {
                // 활성화된 링크는 span으로 렌더링 (클릭 방지)
                return (
                  <span
                    key={item.href}
                    className="text-sm font-normal transition-colors relative text-black dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black dark:after:bg-white cursor-default"
                  >
                    {item.label}
                  </span>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-normal transition-colors relative text-zinc-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Action Buttons Group */}
          {isLoading ? (
            <div className="hidden md:flex md:items-center">
              <div className="px-4 py-2 text-zinc-400 dark:text-gray-500 text-sm font-medium flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.common.loading}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex md:items-center md:gap-3">
              {/* Language Selector */}
              <LanguageSelector />
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Get Started Button (Show on marketing pages) */}
              {!isAppPage && (
                <button
                  type="button"
                  onClick={handleGetStarted}
                  disabled={isLoading}
                  className="rounded-full bg-[#008080] px-5 py-2 text-sm font-medium text-white hover:bg-[#006666] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.common.getStarted}
                </button>
              )}

              {/* User Icon (Always visible - Right position) */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    // 메뉴 토글 등 '부모에게 클릭 사실을 숨겨야 할 때'만 stopPropagation 사용
                    e.stopPropagation();
                    if (isAuthenticated) {
                      setUserMenuOpen(!userMenuOpen);
                    } else {
                      router.push('/login');
                    }
                  }}
                  disabled={isLoading}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-400 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-gray-500 dark:hover:border-gray-500 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={isAuthenticated ? "User menu" : "Sign in"}
                  title={isAuthenticated ? "User menu" : "Sign in"}
                >
                  <User className="h-6 w-6" />
                </button>

                {/* User Dropdown Menu (Logged in only) */}
                {isAuthenticated && userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm font-semibold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {t.common.myDashboard}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-zinc-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition-colors"
                    >
                      {t.common.signOut}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-black dark:text-white" />
              ) : (
                <Menu className="h-6 w-6 text-black dark:text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {isLoading ? (
              <div className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-zinc-400 dark:text-gray-500">
                {t.common.loading}
              </div>
            ) : (
              <>
                {/* Language Selector for Mobile */}
                <div className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-800">
                  <LanguageSelector />
                </div>
                
                {/* Navigation Links (Based on Page Type) */}
                {currentNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMobileMenuOpen(false);
                    }}
                    className="block rounded-md px-3 py-2 text-base font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Action Buttons */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2">
                  {/* Get Started Button (Show on marketing pages) */}
                  {!isAppPage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        // ✅ 수정됨: 여기서도 preventDefault 제거
                        setMobileMenuOpen(false);
                        handleGetStarted();
                      }}
                      disabled={isLoading}
                      className="block w-full rounded-full bg-[#008080] px-6 py-2 text-center text-sm font-medium text-white hover:bg-[#006666] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t.common.getStarted}
                    </button>
                  )}
                  {/* Sign In 링크는 Get Started 버튼이 아닌 경우에만 표시 */}
                  {!isAuthenticated && isAppPage && (
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {t.common.signIn}
                    </Link>
                  )}
                  {isAuthenticated && (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {t.common.myDashboard}
                      </Link>
                      <button
                        onClick={async () => {
                          await handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-zinc-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors"
                      >
                        {t.common.signOut}
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

