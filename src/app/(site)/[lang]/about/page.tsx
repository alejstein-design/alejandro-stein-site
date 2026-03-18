import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getDictionary, locales, t } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import { getPageBySlug, getExhibitions } from '@/lib/queries'
import { urlFor } from '@/lib/sanity'
import PageBody from '@/components/PageBody'
import PageHeader from '@/components/PageHeader'
import FadeUp from '@/components/FadeUp'
import SectionLabel from '@/components/SectionLabel'
import type { Exhibition } from '@/types/sanity'

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = getDictionary(lang)
  return { title: `${dict.about} — Alejandro Stein` }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!locales.includes(lang as Locale)) notFound()

  const dict = getDictionary(lang)
  const [aboutPage, statementPage, exhibitions] = await Promise.all([
    getPageBySlug('about').catch(() => null),
    getPageBySlug('statement').catch(() => null),
    getExhibitions().catch(() => []),
  ])

  const bioContent = aboutPage?.body?.[lang as 'es' | 'en']
  const statementContent = statementPage?.body?.[lang as 'es' | 'en']
  const portraitUrl = aboutPage?.image
    ? urlFor(aboutPage.image).width(240).height(240).quality(90).auto('format').url()
    : null

  // Group exhibitions by year for the timeline
  const groupedExhibitions = exhibitions.reduce<Record<string, Exhibition[]>>(
    (acc, ex) => {
      const yr = ex.year ?? '—'
      if (!acc[yr]) acc[yr] = []
      acc[yr].push(ex)
      return acc
    },
    {}
  )
  const sortedYears = Object.keys(groupedExhibitions).sort((a, b) =>
    b.localeCompare(a)
  )

  return (
    <div>
      <PageHeader title={lang === 'es' ? 'SOBRE' : 'ABOUT'} />

      <FadeUp delay={0.15}>
      <div className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] pb-24">
        <div className="max-w-[720px]">
          {/* Portrait — small, sits above bio */}
          {portraitUrl && (
            <div className="relative w-24 h-24 overflow-hidden bg-border mb-8">
              <Image
                src={portraitUrl}
                alt="Alejandro Stein"
                fill
                sizes="96px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Bio text */}
          {bioContent?.length ? (
            <PageBody value={bioContent} />
          ) : (
            <p className="text-[16px] text-muted leading-[1.8]">
              Alejandro Stein is a Buenos Aires-born self-taught visual artist
              working across handmade paintings, murals, tapestries, digital art,
              painted doors, and 3D mixed-media objects.
            </p>
          )}

          {/* Statement section — always shows if statement page exists or as placeholder */}
          <>
            <hr className="border-border my-12" />
            <SectionLabel text={dict.statement} />
            {statementContent?.length ? (
              <PageBody value={statementContent} />
            ) : (
              <p className="text-[16px] italic text-muted leading-[1.8]">
                {lang === 'es'
                  ? '(Contenido próximamente)'
                  : '(Content coming soon)'}
              </p>
            )}
          </>
        </div>

        {/* Exhibition history */}
        {sortedYears.length > 0 && (
          <div className="mt-20 md:mt-24 max-w-[720px]">
            <h2 className="text-[12px] font-medium uppercase tracking-widest text-muted mb-10">
              {dict.exhibitionHistory}
            </h2>

            <div className="space-y-0">
              {sortedYears.map((year) => (
                <div key={year} className="flex gap-8 border-t border-border pt-5 pb-5">
                  {/* Year column */}
                  <span className="text-[12px] text-tertiary w-16 shrink-0 tabular-nums pt-0.5">
                    {year}
                  </span>

                  {/* Entries for this year */}
                  <div className="flex-1 space-y-4">
                    {groupedExhibitions[year].map((ex) => (
                      <div key={ex._id}>
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <p className="text-[16px] text-foreground leading-snug">
                            {t(ex.title, lang) || '—'}
                          </p>
                          {ex.type && (
                            <span className="text-[10px] font-medium uppercase tracking-[1.5px] text-tertiary border border-border px-1.5 py-0.5">
                              {ex.type === 'solo' ? dict.solo : dict.group}
                            </span>
                          )}
                        </div>
                        {(ex.venue || ex.city) && (
                          <p className="text-[13px] text-muted mt-0.5">
                            {[ex.venue, ex.city].filter(Boolean).join(' — ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back to works */}
        <div className="mt-16 pt-10 border-t border-border max-w-[720px]">
          <Link
            href={`/${lang}/works`}
            className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted hover:text-foreground transition-colors"
          >
            ← {dict.works}
          </Link>
        </div>
      </div>
      </FadeUp>
    </div>
  )
}
