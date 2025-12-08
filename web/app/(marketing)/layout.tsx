import { MainHeader } from '@/components/site/main-header';
import { MainFooter } from '@/components/site/main-footer';
import Script from 'next/script';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Script src="https://gumroad.com/js/gumroad.js" strategy="lazyOnload" />
      <MainHeader />
      <main className="flex-1">{children}</main>
      <MainFooter />
    </div>
  );
}

