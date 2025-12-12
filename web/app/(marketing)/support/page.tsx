'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, AlertCircle, MessageCircle, Briefcase, Handshake, UserCircle } from 'lucide-react'
import { useLanguage } from '@/components/i18n/language-provider'

export default function SupportPage() {
  const { t } = useLanguage()
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 lg:gap-16">
          {/* Left Column - Sticky Header */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-4 text-black">
                {t.support.title}
              </h1>
              <p className="text-lg text-zinc-600">
                {t.support.subtitle}
              </p>
            </div>
          </div>

          {/* Right Column - Support Sections (2-Column Grid) */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Critical Logistics Escalation */}
              <section className="bg-red-50 border-2 border-red-100 rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-3 text-black">
                      {t.support.critical.title}
                    </h2>
                    <p className="text-base text-zinc-700 mb-3 leading-relaxed">
                      {t.support.critical.description}
                    </p>
                    <p className="text-sm font-medium text-red-700 mb-4">
                      {t.support.critical.avgResponse}
                    </p>
                    <a
                      href="mailto:urgent@nexsupply.net"
                      className="inline-flex items-center gap-2 text-base font-semibold text-red-700 hover:text-red-800 transition-colors group"
                    >
                      urgent@nexsupply.net
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </section>

              {/* Card 2: Talk to your Sourcing Agent (Hero Card) */}
              <section className="bg-white border-2 border-[#008080] rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0 border border-teal-200">
                    <UserCircle className="h-6 w-6 text-[#008080]" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-3 text-black">
                      {t.support.agent.title}
                    </h2>
                    <p className="text-base text-zinc-600 mb-4 leading-relaxed">
                      {t.support.agent.description}
                    </p>
                    <Link
                      href="/dashboard/chat"
                      className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#008080] hover:bg-teal-700 text-white rounded-lg font-semibold transition-all hover:shadow-md group"
                    >
                      {t.support.agent.button}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </section>

              {/* Card 3: Trade Operations Desk */}
              <section className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-3 text-black">
                      {t.support.operations.title}
                    </h2>
                    <p className="text-base text-zinc-600 mb-2 leading-relaxed">
                      {t.support.operations.description}
                    </p>
                    <p className="text-sm text-zinc-500 mb-1">
                      {t.support.operations.hours}
                    </p>
                    <p className="text-xs text-zinc-400 mb-4 italic">
                      {t.support.operations.asyncSupport}
                    </p>
                    <a
                      href="mailto:support@nexsupply.net"
                      className="inline-flex items-center gap-2 text-base font-medium text-black hover:underline transition-colors group"
                    >
                      support@nexsupply.net
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </section>

              {/* Card 4: Business & Press */}
              <section className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Handshake className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-3 text-black">
                      {t.support.business.title}
                    </h2>
                    <p className="text-base text-zinc-600 mb-4 leading-relaxed">
                      {t.support.business.description}
                    </p>
                    <a
                      href="mailto:partners@nexsupply.net"
                      className="inline-flex items-center gap-2 text-base font-medium text-black hover:underline transition-colors group"
                    >
                      partners@nexsupply.net
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white text-black px-6 py-4 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all hover:scale-105 font-medium"
        aria-label="Need help?"
      >
        <MessageCircle className="h-5 w-5" />
        <span>{t.support.chat.needHelp}</span>
      </button>

      {/* Simple Chat Panel (placeholder) */}
      {showChat && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-black">{t.support.chat.chatSupport}</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-zinc-600 hover:text-black"
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-6">
            <p className="text-zinc-600 text-sm mb-4">
              {t.support.chat.startConversation}
            </p>
            <a
              href="mailto:support@nexsupply.net"
              className="block w-full text-center px-4 py-2 bg-[#008080] text-white rounded-lg font-medium hover:bg-[#006666] transition-colors"
            >
              {t.support.chat.emailSupport}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
