import { t } from '@/lib/i18n'
import type { SiteSettings } from '@/types/sanity'

interface HeroSectionProps {
  settings: SiteSettings | null
  lang: string
}

export default function HeroSection({ settings, lang }: HeroSectionProps) {
  const artistName = settings?.artistName ?? 'Alejandro Stein'
  const tagline = t(settings?.tagline, lang)

  return (
    <section
      className="relative z-10 w-full"
      style={{ background: 'linear-gradient(to bottom, #FFFFFF 65%, transparent 100%)' }}
    >
      <div className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] pt-10 pb-20">
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
    </section>
  )
}
