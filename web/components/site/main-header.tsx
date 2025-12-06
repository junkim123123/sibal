'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/login/actions';

export function MainHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

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

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  // Simplified marketing menu (logged out)
  const marketingNavItems = [
    { label: 'Solutions', href: '/how-it-works' }, // Merges How it works & Use cases
    { label: 'Pricing', href: '/pricing' },
    { label: 'Resources', href: '/resources' }, // Merges Resources & Support
  ];

  // App navigation (logged in)
  const appNavItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Support', href: '/support' },
    { label: 'Account', href: '/account' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-black">NexSupply</span>
          </Link>

          {/* Desktop Navigation - Center/Right */}
          {!isLoading ? (
            <>
              {isAuthenticated ? (
                // Logged In: Show App Navigation (Dr. B Style - Right Aligned)
                <nav className="hidden md:flex md:items-center md:gap-8">
                  {appNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-sm font-medium transition-colors relative ${
                        pathname === item.href
                          ? 'text-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black'
                          : 'text-zinc-600 hover:text-black'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-medium text-zinc-500 hover:text-red-500 transition-colors"
                  >
                    Log out
                  </button>
                </nav>
              ) : (
                // Logged Out: Show Marketing Navigation + Sign In + Get Started
                <>
                  <nav className="hidden md:flex md:items-center md:gap-8">
                    {marketingNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`text-sm font-medium transition-colors relative ${
                          pathname === item.href
                            ? 'text-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black'
                            : 'text-zinc-600 hover:text-black'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  {/* Right Side Actions - Logged Out */}
                  <div className="hidden md:flex md:items-center md:gap-4">
                    <Link
                      href="/login"
                      className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/chat"
                      className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                </>
              )}
            </>
          ) : (
            // Loading State
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
            ) : isAuthenticated ? (
              // Logged In: Show App Navigation
              <>
                {appNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-50 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={async () => {
                    await handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-zinc-500 hover:bg-gray-50 hover:text-red-500 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              // Logged Out: Show Marketing Navigation + Sign In + Get Started
              <>
                {marketingNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-50 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-black hover:bg-gray-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/chat"
                    className="block w-full rounded-full bg-black px-6 py-2 text-center text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
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

