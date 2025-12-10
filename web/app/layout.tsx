import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import AuthProvider from "@/components/auth-provider"
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
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* 외부 스크립트 오류를 가장 먼저 차단하는 인라인 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                // 콘솔 오류 필터링 (가장 먼저 실행)
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
                    return; // 오류 무시
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
                    return; // 경고 무시
                  }
                  originalWarn.apply(console, arguments);
                };
                
                // 전역 에러 핸들러 (capture phase)
                window.addEventListener('error', function(e) {
                  const filename = e.filename || '';
                  const message = e.message || '';
                  if (
                    filename.includes('itemscout.io') ||
                    filename.includes('4bd1b696-182b6b13bdad92e3.js') ||
                    filename.includes('extension://') ||
                    filename.includes('chrome-extension://') ||
                    message.includes('removeChild') ||
                    message.includes('itemscout')
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
                    reasonStr.includes('removeChild') ||
                    reasonStr.includes('itemscout') ||
                    reasonStr.includes('4bd1b696')
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
        <ErrorHandler />
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

