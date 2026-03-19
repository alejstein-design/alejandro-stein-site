import { notFound } from 'next/navigation'
import { getDictionary, locales } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import { getFeaturedArtworks, getSiteSettings, getFeaturedCollections } from '@/lib/queries'
import { AboutSection, FeaturedCollectionsRow } from '@/components/HomeSections'
import HeroSection from '@/components/HeroSection'
import HeroImage from '@/components/HeroImage'
import ArtworkWall from '@/components/ArtworkWall'
import SectionLabel from '@/components/SectionLabel'
import { urlFor } from '@/lib/sanity'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const settings = await getSiteSettings().catch(() => null)

  const isEs = lang === 'es'
  const title = isEs
    ? 'Alejandro Stein — Artista Visual'
    : 'Alejandro Stein — Visual Artist'
  const description = isEs
    ? 'Portfolio y obras de Alejandro Stein, artista visual que explora formas geométricas, patrones sagrados y técnica mixta. Buenos Aires · Tel Aviv · Berlín.'
    : 'Portfolio and works of Alejandro Stein, visual artist exploring geometric forms, sacred patterns, and mixed media. Buenos Aires · Tel Aviv · Berlin.'

  const heroSource = settings?.homepageHeroImage ?? null
  const ogImageUrl = heroSource
    ? urlFor(heroSource).width(1200).height(630).quality(80).auto('format').url()
    : null

  return {
    title,
    description,
    alternates: {
      canonical: `https://alejandrostein.com/${lang}`,
      languages: { en: 'https://alejandrostein.com/en', es: 'https://alejandrostein.com/es' },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `https://alejandrostein.com/${lang}`,
      siteName: 'Alejandro Stein',
      locale: isEs ? 'es_AR' : 'en_US',
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
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

  // Parallel fetch — siteSettings is the primary source for homepage slots;
  // document-level queries serve as fallbacks when slots aren't configured yet.
  const [settings, fallbackArtworks, fallbackCollections] = await Promise.all([
    getSiteSettings().catch(() => null),
    getFeaturedArtworks().catch(() => []),
    getFeaturedCollections().catch(() => []),
  ])

  const featuredArtworks = settings?.featuredArtworks?.length
    ? settings.featuredArtworks
    : fallbackArtworks

  const featuredCollections = settings?.selectedCollections?.length
    ? settings.selectedCollections
    : fallbackCollections

  // Preload hero image — React 19 hoists <link rel="preload"> to <head>
  const heroSource = settings?.homepageHeroImage ?? featuredArtworks[0]?.images?.[0] ?? null
  const heroPreloadUrl = heroSource
    ? urlFor(heroSource).width(1920).quality(75).auto('format').url()
    : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Alejandro Stein',
    url: 'https://alejandrostein.com',
    sameAs: [
      'https://instagram.com/alustein',
    ],
    jobTitle: 'Visual Artist',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Buenos Aires',
      addressCountry: 'AR',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {heroPreloadUrl && (
        <link rel="preload" as="image" href={heroPreloadUrl} />
      )}

      {/* 1. Text zone — z-10, gradient bg white→transparent, overlaps hero via negative margin */}
      <HeroSection settings={settings} lang={lang} />

      {/* 2. Sticky hero image — z-0, stays pinned while content scrolls over it */}
      {heroSource && (
        <HeroImage
          image={heroSource}
          alt={settings?.artistName ?? 'Alejandro Stein'}
          lqip={heroSource.lqip ?? undefined}
        />
      )}

      {/* 3. Curtain — z-10 bg-[#FAFAF8], slides over the sticky hero on scroll */}
      <div className="relative z-10 bg-[#FAFAF8]">
        <section className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] pt-[30px] pb-16 border-t border-border">
          <SectionLabel text={dict.selectedWorks} />
          <ArtworkWall artworks={featuredArtworks} lang={lang} dict={dict} />
        </section>

        <AboutSection bio={settings?.bio} lang={lang} dict={dict} />

        <FeaturedCollectionsRow
          collections={featuredCollections}
          lang={lang}
          dict={dict}
        />

      </div>
    </>
  )
}
