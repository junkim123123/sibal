import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import AuthProvider from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/i18n/language-provider"
import { Analytics } from "@vercel/analytics/next"
import { ErrorHandler } from "@/components/error-handler"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "NexSupply",
  description: "NexSupply Marketing Site",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Content Security Policy로 외부 스크립트 제한 */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://gumroad.com https://www.gumroad.com https://*.gumroad.com https://assets.gumroad.com https://www.googletagmanager.com https://www.google-analytics.com https://clarity.ms https://connect.facebook.net; script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://gumroad.com https://www.gumroad.com https://*.gumroad.com https://assets.gumroad.com https://www.googletagmanager.com https://www.google-analytics.com https://clarity.ms https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://assets.gumroad.com; style-src-elem 'self' 'unsafe-inline' https://assets.gumroad.com; img-src 'self' data: https:; font-src 'self' data: https://assets.gumroad.com; connect-src 'self' https: https://gumroad.com https://www.gumroad.com https://*.gumroad.com https://api.gumroad.com https://assets.gumroad.com https://www.google-analytics.com https://clarity.ms https://www.facebook.com; frame-src 'self' https://www.youtube.com https://youtube.com https://gumroad.com https://www.gumroad.com https://*.gumroad.com https://assets.gumroad.com;"
        />
        {/* Gumroad Overlay Script */}
        <script src="https://gumroad.com/js/gumroad.js" async></script>
        
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA4_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA4_ID}');
                `,
              }}
            />
          </>
        )}
        
        {/* Microsoft Clarity */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
              `,
            }}
          />
        )}
        
        {/* Meta Pixel */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
        {/* 외부 스크립트 오류를 가장 먼저 차단하는 인라인 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                
                // 즉시 itemscout.io 요소 제거
                function removeItemscoutElements() {
                  // 스크립트 태그 제거
                  document.querySelectorAll('script[src*="itemscout.io"]').forEach(function(el) {
                    el.remove();
                  });
                  
                  // iframe 제거
                  document.querySelectorAll('iframe[src*="itemscout.io"]').forEach(function(el) {
                    el.remove();
                  });
                  
                  // pixel.itemscout.io 관련 요소 제거
                  document.querySelectorAll('[src*="pixel.itemscout.io"]').forEach(function(el) {
                    el.remove();
                  });
                }
                
                // DOMContentLoaded 전에 실행
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', removeItemscoutElements);
                } else {
                  removeItemscoutElements();
                }
                
                // MutationObserver로 실시간 감시
                if (typeof MutationObserver !== 'undefined') {
                  const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // ELEMENT_NODE
                          var element = node;
                          if (element.tagName === 'SCRIPT' || element.tagName === 'IFRAME') {
                            var src = element.src || element.getAttribute('src') || '';
                            if (src.indexOf('itemscout.io') !== -1) {
                              element.remove();
                            }
                          }
                        }
                      });
                    });
                  });
                  
                  observer.observe(document.documentElement, {
                    childList: true,
                    subtree: true
                  });
                  
                  // 주기적 체크 제거 - MutationObserver만으로 충분하며, 클릭 이벤트 간섭 방지
                  // setInterval 제거: MutationObserver가 실시간으로 처리하므로 불필요
                }
                
                // 콘솔 오류 필터링
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.error = function() {
                  const message = Array.from(arguments).join(' ');
                  if (
                    message.includes('itemscout.io') ||
                    message.includes('4bd1b696-182b6b13bdad92e3.js') ||
                    message.includes('removeChild') ||
                    message.includes('Quirks Mode') ||
                    message.includes('ud @') ||
                    message.includes('uf @')
                  ) {
                    return;
                  }
                  originalError.apply(console, arguments);
                };
                
                console.warn = function() {
                  const message = Array.from(arguments).join(' ');
                  if (
                    message.includes('Quirks Mode') ||
                    message.includes('itemscout.io') ||
                    message.includes('4bd1b696-182b6b13bdad92e3.js')
                  ) {
                    return;
                  }
                  originalWarn.apply(console, arguments);
                };
                
                // 전역 에러 핸들러 (ErrorEvent만 처리, 클릭 이벤트는 자동으로 무시됨)
                window.addEventListener('error', function(e) {
                  // ErrorEvent는 클릭 이벤트와 별개이므로 자동으로 구분됨
                  const filename = e.filename || '';
                  const message = e.message || '';
                  if (
                    filename.indexOf('itemscout.io') !== -1 ||
                    filename.indexOf('4bd1b696-182b6b13bdad92e3.js') !== -1 ||
                    filename.indexOf('extension://') !== -1 ||
                    filename.indexOf('chrome-extension://') !== -1 ||
                    message.indexOf('removeChild') !== -1 ||
                    message.indexOf('itemscout') !== -1
                  ) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                  }
                }, true);
                
                // Unhandled Promise Rejection 차단
                window.addEventListener('unhandledrejection', function(e) {
                  const reason = e.reason;
                  const reasonStr = typeof reason === 'string' 
                    ? reason 
                    : reason instanceof Error 
                    ? reason.message 
                    : String(reason);
                  if (
                    reasonStr.indexOf('removeChild') !== -1 ||
                    reasonStr.indexOf('itemscout') !== -1 ||
                    reasonStr.indexOf('4bd1b696') !== -1
                  ) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="system" storageKey="nexsupply-theme">
          <LanguageProvider defaultLanguage="en" storageKey="nexsupply-language">
            <ErrorHandler />
            <AuthProvider>{children}</AuthProvider>
            <Analytics />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

