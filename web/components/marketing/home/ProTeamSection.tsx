import { HomeTeamSection } from '@/lib/content/homePage';

export function ProTeamSection({ section }: { section: HomeTeamSection }) {
  const { eyebrow, title, body, members } = section;

  return (
    <section className="py-16 sm:py-24 border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12 md:items-start">
          <div className="space-y-4 mb-8 md:mb-0">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {eyebrow}
              </p>
            )}
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">{body}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {members.map((member) => (
              <article
                key={member.id}
                className="flex h-full flex-col rounded-2xl bg-neutral-50 p-5 shadow-sm border border-neutral-100"
              >
                {/* Later we can add a photo/avatar at the top if desired */}
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-neutral-900">{member.name}</h3>
                  <p className="text-xs text-neutral-500">{member.title}</p>
                </div>
                <p className="mt-3 text-sm text-neutral-700 flex-1 leading-relaxed">
                  {member.bio}
                </p>
                {member.badges && member.badges.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {member.badges.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center rounded-full border border-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-600 bg-white"
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

