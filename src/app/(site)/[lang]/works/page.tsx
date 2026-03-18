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
  return { title: `${dict.works} — Alejandro Stein` }
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
