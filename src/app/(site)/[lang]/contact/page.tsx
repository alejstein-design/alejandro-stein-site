import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDictionary, locales, t } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import { getSiteSettings } from '@/lib/queries'
import PageHeader from '@/components/PageHeader'
import SocialIcons from '@/components/SocialIcons'
import BeholdFeed from '@/components/BeholdFeed'

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
  const description = lang === 'es'
    ? 'Contacta a Alejandro Stein para encargos de pinturas, murales y puertas pintadas.'
    : 'Get in touch with Alejandro Stein for commissions — paintings, murals, and painted doors.'
  const title = `${dict.contact} — Alejandro Stein`
  return {
    title,
    description,
    alternates: {
      canonical: `https://alejandrostein.com/${lang}/contact`,
      languages: {
        en: 'https://alejandrostein.com/en/contact',
        es: 'https://alejandrostein.com/es/contact',
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `https://alejandrostein.com/${lang}/contact`,
      siteName: 'Alejandro Stein',
      locale: lang === 'es' ? 'es_AR' : 'en_US',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!locales.includes(lang as Locale)) notFound()

  const dict = getDictionary(lang)
  const settings = await getSiteSettings().catch(() => null)

  const email           = settings?.contactEmail ?? 'alejandrosteinart@gmail.com'
  const studioLocation  = settings?.studioLocation ?? 'Buenos Aires, Argentina'
  const commissionsText = t(settings?.commissionsText, lang) ||
    (lang === 'es'
      ? 'Abierto a encargos de pintura, murales y puertas pintadas.'
      : 'Open to commissions for paintings, murals, and painted doors.')
  const handle       = settings?.instagramHandle ?? 'alustein'
  const beholdFeedId = settings?.beholdFeedId ?? 'cbj6v4U5dR9dGucknTwk'
  const socialLinks  = {
    ...settings?.socialLinks,
    instagram: settings?.socialLinks?.instagram || `https://instagram.com/${handle}`,
  }

  const labelClass = 'text-[14px] font-medium italic uppercase tracking-widest text-muted pt-[3px]'
  const valueClass = 'text-[15px] text-foreground leading-[1.6]'

  return (
    <div>
      <PageHeader title={lang === 'es' ? 'CONTACTO' : 'CONTACT'} />

      <div className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] pb-24">

        {/* ── Contact info grid ─────────────────────────────────────────── */}
        <div className="max-w-[600px]">
          <div className="grid gap-y-3 grid-cols-1 sm:grid-cols-[160px_1fr]">
            {/* Email */}
            <span className={labelClass}>Email</span>
            <a
              href={`mailto:${email}`}
              className={`${valueClass} hover:underline underline-offset-2 transition-colors`}
            >
              {email}
            </a>

            {/* Studio */}
            <span className={labelClass}>{lang === 'es' ? 'Estudio' : 'Studio'}</span>
            <p className={valueClass}>{studioLocation}</p>

            {/* Commissions */}
            <span className={labelClass}>{lang === 'es' ? 'Encargos' : 'Commissions'}</span>
            <p className={valueClass}>{commissionsText}</p>
          </div>

          {/* Social icons */}
          {Object.values(socialLinks).some(Boolean) && (
            <div className="mt-8" style={{ color: '#1A1A1A' }}>
              <SocialIcons links={socialLinks} />
            </div>
          )}
        </div>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div className="border-t border-border mt-10 mb-8" />

        {/* ── Instagram feed (Behold.so) ────────────────────────────────── */}
        <div>
          <p className="text-[14px] font-medium italic uppercase tracking-widest text-muted mb-4">
            {lang === 'es' ? 'LO ÚLTIMO EN INSTAGRAM' : 'LATEST ON INSTAGRAM'}
          </p>
          <BeholdFeed feedId={beholdFeedId} />
          <a
            href={`https://instagram.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-5 text-[14px] text-muted hover:text-foreground transition-colors"
          >
            @{handle} →
          </a>
        </div>

        {/* ── Back link ─────────────────────────────────────────────────── */}
        <div className="mt-16 pt-10 border-t border-border max-w-[600px]">
          <Link
            href={`/${lang}/works`}
            className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted hover:text-foreground transition-colors"
          >
            ← {dict.works}
          </Link>
        </div>

      </div>
    </div>
  )
}
