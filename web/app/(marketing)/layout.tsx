'use client';

import { MainHeader } from '@/components/site/main-header';
import { MainFooter } from '@/components/site/main-footer';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
// import Script from 'next/script';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <div className="flex min-h-screen flex-col">
      {/* 💥 Gumroad 스크립트 일시 중지: CSP 위반으로 인한 투명 오버레이 문제 해결 */}
      {/* <Script src="https://gumroad.com/js/gumroad.js" strategy="lazyOnload" /> */}
      <MainHeader />
      <main className="flex-1">{children}</main>
      {isDashboard ? (
        // Dashboard: 간소화된 Footer
        <footer className="border-t border-gray-200 bg-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <p>&copy; {new Date().getFullYear()} NexSupply. All rights reserved.</p>
              <Link href="/support" className="hover:text-gray-900">
                Contact Support
              </Link>
            </div>
          </div>
        </footer>
      ) : (
        // 마케팅 페이지: 전체 Footer
        <MainFooter />
      )}
    </div>
  );
}

