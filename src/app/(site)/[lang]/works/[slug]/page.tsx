import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCollectionWithArtworks, getAllCollectionSlugs } from '@/lib/queries'
import { getDictionary, locales, t } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import { urlFor } from '@/lib/sanity'
import PageHeader from '@/components/PageHeader'

export async function generateStaticParams() {
  try {
    const slugs = await getAllCollectionSlugs()
    return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const collection = await getCollectionWithArtworks(slug)
  if (!collection) return {}
  return {
    title: `${t(collection.title, lang)} — Alejandro Stein`,
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params

  if (!locales.includes(lang as Locale)) notFound()

  const collection = await getCollectionWithArtworks(slug)
  if (!collection) notFound()

  const dict = getDictionary(lang)

  return (
    <div>
      {/* Back link */}
      <div className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] pt-8">
        <Link
          href={`/${lang}/works`}
          className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted hover:text-foreground transition-colors"
        >
          <span aria-hidden>←</span>
          {dict.allCollections}
        </Link>
      </div>

      {/* Page header — tighter pt since back link is above */}
      <PageHeader
        title={t(collection.title, lang).toUpperCase()}
        subtitle={t(collection.description, lang) || undefined}
        className="pt-10"
      />

      {/* Meta row */}
      {(collection.year || t(collection.medium, lang)) && (
        <div className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] -mt-4 pb-12 flex flex-wrap gap-8">
          {collection.year && (
            <span className="text-[12px] text-muted">
              <span className="text-tertiary uppercase tracking-[2px] text-[10px] mr-2">
                {dict.year}
              </span>
              {collection.year}
            </span>
          )}
          {t(collection.medium, lang) && (
            <span className="text-[12px] text-muted">
              <span className="text-tertiary uppercase tracking-[2px] text-[10px] mr-2">
                {dict.medium}
              </span>
              {t(collection.medium, lang)}
            </span>
          )}
        </div>
      )}

      {/* Artworks — full-width stacked images */}
      <div className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] pb-24">
        {collection.artworks.length === 0 ? (
          <p className="text-sm text-muted py-8">{dict.noArtworks}</p>
        ) : (
          <div className="space-y-8">
            {collection.artworks.map((artwork, artworkIdx) =>
              artwork.images?.map((img, imgIdx) => {
                const isFirst = artworkIdx === 0 && imgIdx === 0
                const url = urlFor(img).width(1400).quality(90).auto('format').url()
                const w = img.width ?? 1200
                const h = img.height ?? 900
                const altText =
                  img.alt?.[lang as 'es' | 'en'] ?? t(artwork.title, lang)

                return (
                  <div key={`${artwork._id}-${imgIdx}`}>
                    <Image
                      src={url}
                      alt={altText}
                      width={w}
                      height={h}
                      sizes="(max-width: 1400px) 100vw, 1400px"
                      className="w-full h-auto block"
                      priority={isFirst}
                      loading={isFirst ? undefined : 'lazy'}
                      {...(img.lqip
                        ? { placeholder: 'blur' as const, blurDataURL: img.lqip }
                        : {})}
                    />
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
