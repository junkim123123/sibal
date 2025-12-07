/**
 * Super Admin Layout
 * 
 * God Mode - Complete system control
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  TrendingUp, 
  Shield,
  LogOut,
  Loader2,
  Menu,
  X
} from 'lucide-react';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/login?redirect=/admin');
          return;
        }

        // Super admin 권한 확인
        // 이메일로 먼저 체크 (k.myungjun@nexsupply.net)
        const userEmail = user.email?.toLowerCase() || '';
        const isSuperAdminEmail = userEmail === 'k.myungjun@nexsupply.net';

        if (isSuperAdminEmail) {
          // 이메일로 super admin 확인됨
          setIsSuperAdmin(true);
          setIsAuthenticated(true);
          setUserName(user.email?.split('@')[0] || 'Super Admin');
          return;
        }

        // 이메일이 아니면 데이터베이스에서 role 확인
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, name, email')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          router.push('/login?redirect=/admin');
          return;
        }

        if (profile.role !== 'super_admin') {
          // 슈퍼 어드민이 아닌 경우 접근 차단
          router.push('/dashboard');
          return;
        }

        setIsSuperAdmin(true);
        setIsAuthenticated(true);
        setUserName(profile.name || user.email?.split('@')[0] || 'Super Admin');
      } catch (error) {
        console.error('[Super Admin Layout] Auth check error:', error);
        router.push('/login?redirect=/admin');
      }
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAuthenticated || !isSuperAdmin) {
    return null;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/dispatch', label: 'Dispatch Center', icon: UserCheck },
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/revenue', label: 'Revenue', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-neutral-900 text-white p-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Super Admin</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-neutral-800 rounded"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-neutral-900 text-white transform transition-transform duration-200 ease-in-out lg:transition-none`}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-neutral-800">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-yellow-500" />
                <h1 className="text-xl font-bold">Super Admin</h1>
              </div>
              <p className="text-sm text-neutral-400">God Mode</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-yellow-600 text-white'
                        : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-800">
              <div className="mb-3 px-4">
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs text-neutral-400">Super Admin</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-neutral-300 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="pt-16 lg:pt-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

