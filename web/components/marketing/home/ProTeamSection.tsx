'use client';

import { HomeTeamSection } from '@/lib/content/homePage';
import { useLanguage } from '@/components/i18n/language-provider';

export function ProTeamSection({ section }: { section: HomeTeamSection }) {
  const { eyebrow, title, body, members } = section;
  const { t } = useLanguage();

  return (
    <section className="py-16 sm:py-24 border-t border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12 md:items-start">
          <div className="space-y-4 mb-8 md:mb-0">
            {t.home.team.eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-gray-400">
                {t.home.team.eyebrow}
              </p>
            )}
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              {t.home.team.title}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-gray-300 leading-relaxed">{t.home.team.body}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {members.map((member) => (
              <article
                key={member.id}
                className="flex h-full flex-col rounded-2xl bg-neutral-50 dark:bg-gray-800 p-5 shadow-sm border border-neutral-100 dark:border-gray-700"
              >
                {/* Team Member Avatar */}
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-neutral-500 dark:text-gray-400">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="space-y-1 flex-1">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{member.name}</h3>
                    <p className="text-xs text-neutral-500 dark:text-gray-400">{member.title}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-neutral-700 dark:text-gray-300 flex-1 leading-relaxed">
                  {member.bio}
                </p>
                {member.badges && member.badges.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {member.badges.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center rounded-full border border-neutral-200 dark:border-gray-600 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:text-gray-300 bg-white dark:bg-gray-700"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

