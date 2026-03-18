import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import { t } from '@/lib/i18n'
import type { SiteSettings, FeaturedArtwork } from '@/types/sanity'

interface HeroSectionProps {
  settings: SiteSettings | null
  featuredArtworks: FeaturedArtwork[]
  lang: string
}

export default function HeroSection({ settings, featuredArtworks, lang }: HeroSectionProps) {
  const artistName = settings?.artistName ?? 'Alejandro Stein'
  const tagline = t(settings?.tagline, lang)

  const heroImageSource =
    settings?.homepageHeroImage ?? featuredArtworks[0]?.images?.[0] ?? null
  const heroImageUrl = heroImageSource
    ? urlFor(heroImageSource).width(1920).quality(75).auto('format').url()
    : null
  const heroBlurhash = heroImageSource?.lqip ?? undefined

  return (
    <section>
      {/* ── Part 1: Solid white text zone ──────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] pt-10 pb-10">
        <h1 className="animate-slide-up text-[clamp(3rem,8vw,6rem)] font-semibold uppercase tracking-[0.02em] text-foreground leading-[0.95] mb-3">
          {artistName}
        </h1>

        <p
          className="animate-fade-up text-[13px] uppercase tracking-[0.12em] text-muted my-3"
          style={{ animationDelay: '0.14s' }}
        >
          BUENOS AIRES — MENDOZA — TEL AVIV — BERLIN
        </p>

        {tagline && (
          <p
            className="animate-fade-up text-base text-muted max-w-lg leading-[1.8] mt-3"
            style={{ animationDelay: '0.28s' }}
          >
            {tagline}
          </p>
        )}
      </div>

      {/* ── Part 2: Full-bleed image — hard edges, no gradients ─────────────── */}
      {heroImageUrl && (
        <div
          className="relative w-full overflow-hidden bg-border"
          style={{ height: 'clamp(400px, 70vh, 800px)' }}
        >
          <Image
            src={heroImageUrl}
            alt={artistName}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            {...(heroBlurhash
              ? { placeholder: 'blur' as const, blurDataURL: heroBlurhash }
              : {})}
          />

          {/* Scroll indicator overlaid on image */}
          <div className="absolute inset-x-0 bottom-6 flex justify-center z-[1]" aria-hidden>
            <span
              className="animate-bounce text-xl select-none"
              style={{ color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
            >
              ↓
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
