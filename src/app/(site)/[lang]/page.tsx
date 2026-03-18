import { notFound } from 'next/navigation'
import { getDictionary, locales } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import { getFeaturedArtworks, getSiteSettings, getFeaturedCollections } from '@/lib/queries'
import { AboutSection, FeaturedCollectionsRow, ContactCTA } from '@/components/HomeSections'
import HeroSection from '@/components/HeroSection'
import ArtworkWall from '@/components/ArtworkWall'
import SectionLabel from '@/components/SectionLabel'
import { urlFor } from '@/lib/sanity'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: _lang } = await params
  return {
    title: 'Alejandro Stein — Artist',
    description:
      'Buenos Aires-born visual artist working across paintings, murals, tapestries, digital art, and mixed media.',
    alternates: {
      languages: { en: '/en', es: '/es' },
    },
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!locales.includes(lang as Locale)) notFound()

  const dict = getDictionary(lang)

  // Parallel fetch — all gracefully handle Sanity not being configured yet
  const [settings, featuredArtworks, featuredCollections] = await Promise.all([
    getSiteSettings().catch(() => null),
    getFeaturedArtworks().catch(() => []),
    getFeaturedCollections().catch(() => []),
  ])

  // Preload hero image — React 19 hoists <link rel="preload"> to <head>
  const heroSource = settings?.homepageHeroImage ?? featuredArtworks[0]?.images?.[0] ?? null
  const heroPreloadUrl = heroSource
    ? urlFor(heroSource).width(1920).quality(75).auto('format').url()
    : null

  return (
    <>
      {heroPreloadUrl && (
        <link rel="preload" as="image" href={heroPreloadUrl} />
      )}

      {/* 1. Hero — server component, renders immediately, no JS for above-fold content */}
      <HeroSection
        settings={settings}
        featuredArtworks={featuredArtworks}
        lang={lang}
      />

      {/* 2. Artwork wall */}
      <section className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] py-16 border-t border-border">
        <SectionLabel text={dict.selectedWorks} />
        <ArtworkWall artworks={featuredArtworks} lang={lang} dict={dict} />
      </section>

      {/* 3. Brief about */}
      <AboutSection bio={settings?.bio} lang={lang} dict={dict} />

      {/* 4. Featured collections row */}
      <FeaturedCollectionsRow
        collections={featuredCollections}
        lang={lang}
        dict={dict}
      />

      {/* 5. Contact CTA */}
      <ContactCTA email={settings?.contactEmail} dict={dict} />
    </>
  )
}
