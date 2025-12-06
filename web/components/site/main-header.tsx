'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, LayoutDashboard, LifeBuoy, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/login/actions';

export function MainHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
        setUserEmail(user?.email || null);
      } catch (error) {
        setIsAuthenticated(false);
        setUserEmail(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  const marketingNavItems = [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Use Cases', href: '/use-cases' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Resources', href: '/resources' },
    { label: 'Support', href: '/support' },
  ];

  const appNavItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Support', href: '/support' },
    { label: 'Account', href: '/account' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-neutral-900">NexSupply</span>
          </Link>

          {/* Desktop Navigation */}
          {!isLoading && (
            <>
              {isAuthenticated ? (
                // Logged In: Show App Navigation (Dr. B Style)
                <nav className="hidden md:flex md:items-center md:gap-8">
                  {appNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? 'text-black'
                          : 'text-zinc-600 hover:text-black'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
                  >
                    Log out
                  </button>
                </nav>
              ) : (
                // Logged Out: Show Marketing Navigation
                <>
                  <nav className="hidden md:flex md:items-center md:gap-8">
                    {marketingNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`text-sm font-medium transition-colors hover:text-neutral-900 ${
                          pathname === item.href
                            ? 'text-neutral-900'
                            : 'text-neutral-600'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="hidden md:flex md:items-center md:gap-4">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/chat"
                      className="rounded-full bg-neutral-900 px-6 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
          
          {isLoading && (
            <div className="hidden md:flex md:items-center">
              <div className="px-4 py-2 text-neutral-400 text-sm font-medium">
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
              <X className="h-6 w-6 text-neutral-900" />
            ) : (
              <Menu className="h-6 w-6 text-neutral-900" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-neutral-200 bg-white md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {isLoading ? (
              <div className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-neutral-400">
                Loading...
              </div>
            ) : isAuthenticated ? (
              // Logged In: Show App Navigation
              <>
                {appNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={async () => {
                    await handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                >
                  Log out
                </button>
              </>
            ) : (
              // Logged Out: Show Marketing Navigation
              <>
                {marketingNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-neutral-200 pt-4">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/chat"
                    className="mt-2 block w-full rounded-full bg-neutral-900 px-6 py-2 text-center text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

