import { notFound } from 'next/navigation'
import { getAllCollections } from '@/lib/queries'
import { getDictionary, locales } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import WorksGrid from '@/components/WorksGrid'
import PageHeader from '@/components/PageHeader'

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
  const isEs = lang === 'es'
  const title = `${dict.works} — Alejandro Stein`
  const description = isEs
    ? 'Explora las colecciones y obras de Alejandro Stein: pinturas, murales, tapices y arte digital.'
    : 'Explore the collections and works of Alejandro Stein: paintings, murals, tapestries, and digital art.'
  return {
    title,
    description,
    alternates: {
      canonical: `https://alejandrostein.com/${lang}/works`,
      languages: {
        en: 'https://alejandrostein.com/en/works',
        es: 'https://alejandrostein.com/es/works',
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `https://alejandrostein.com/${lang}/works`,
      siteName: 'Alejandro Stein',
      locale: isEs ? 'es_AR' : 'en_US',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function WorksPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!locales.includes(lang as Locale)) notFound()

  const dict = getDictionary(lang)
  const collections = await getAllCollections().catch(() => [])

  return (
    <div>
      <PageHeader title={lang === 'es' ? 'OBRAS' : 'WORKS'} />

      <div className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] pb-24">
        {collections.length === 0 ? (
          <p className="text-sm text-muted">{dict.noArtworks}</p>
        ) : (
          <WorksGrid collections={collections} lang={lang} dict={dict} />
        )}
      </div>
    </div>
  )
}
