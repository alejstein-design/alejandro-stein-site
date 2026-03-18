import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDictionary, locales } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import { getSiteSettings } from '@/lib/queries'
import PageHeader from '@/components/PageHeader'
import FadeUp from '@/components/FadeUp'
import SectionLabel from '@/components/SectionLabel'
import InstagramFeed from '@/components/InstagramFeed'

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
  return {
    title: `${dict.contact} — Alejandro Stein`,
    description,
    alternates: {
      canonical: `https://alejandrostein.com/${lang}/contact`,
      languages: {
        en: 'https://alejandrostein.com/en/contact',
        es: 'https://alejandrostein.com/es/contact',
      },
    },
    robots: { index: true, follow: true },
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

  const email = settings?.contactEmail ?? 'alejandrosteinart@gmail.com'
  const instagramImages = settings?.instagramImages ?? []

  const commissionNote =
    lang === 'es'
      ? 'Abierto a encargos de pintura, murales y puertas pintadas.'
      : 'Open to commissions for paintings, murals, and painted doors.'

  return (
    <div>
      <PageHeader title={lang === 'es' ? 'CONTACTO' : 'CONTACT'} />

      <div className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] pb-24">
        <div className="max-w-[720px]">

          {/* Email */}
          <FadeUp delay={0.15}>
            <div className="mb-10">
              <SectionLabel text="Email" />
              <a
                href={`mailto:${email}`}
                className="text-[16px] text-foreground hover:underline underline-offset-2 leading-[1.8] transition-colors"
              >
                {email}
              </a>
            </div>
          </FadeUp>

          {/* Instagram */}
          <FadeUp delay={0.25}>
            <div className="mb-10">
              <SectionLabel text="Instagram" />
              <a
                href="https://instagram.com/alustein"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[16px] text-foreground hover:underline underline-offset-2 leading-[1.8] transition-colors"
              >
                @alustein
              </a>
            </div>
          </FadeUp>

          {/* Studio */}
          <FadeUp delay={0.35}>
            <div className="mb-10">
              <SectionLabel text={lang === 'es' ? 'Estudio' : 'Studio'} />
              <p className="text-[16px] text-foreground leading-[1.8]">
                Buenos Aires, Argentina
              </p>
            </div>
          </FadeUp>

          {/* Commissions */}
          <FadeUp delay={0.45}>
            <div className="mb-10">
              <SectionLabel text={lang === 'es' ? 'Comisiones' : dict.commissions} />
              <p className="text-[16px] text-foreground leading-[1.8]">
                {commissionNote}
              </p>
            </div>
          </FadeUp>

          {/* Instagram feed */}
          {instagramImages.length > 0 && (
            <FadeUp delay={0.55}>
              <InstagramFeed images={instagramImages} lang={lang} />
            </FadeUp>
          )}

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-10 border-t border-border max-w-[720px]">
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
