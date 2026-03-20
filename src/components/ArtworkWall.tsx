import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import { t } from '@/lib/i18n'
import type { FeaturedArtwork } from '@/types/sanity'
import type { Dictionary } from '@/lib/i18n'

interface ArtworkWallProps {
  artworks: FeaturedArtwork[]
  lang: string
  dict: Dictionary
}

export default function ArtworkWall({ artworks, lang, dict }: ArtworkWallProps) {
  if (artworks.length === 0) {
    return <p className="text-sm text-muted py-12">{dict.noArtworks}</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[6px] [grid-auto-flow:dense]">
      {artworks.map((artwork) => {
        const isWide =
          artwork.homepageSize === 'large' || artwork.homepageSize === 'wide'
        const primaryImage = artwork.images?.[0]
        const imageUrl = primaryImage
          ? urlFor(primaryImage)
              .width(isWide ? 1920 : 800)
              .quality(80)
              .auto('format')
              .url()
          : null
        const altText =
          primaryImage?.alt?.[lang as 'es' | 'en'] ?? t(artwork.title, lang)
        const href = artwork.collection
          ? `/${lang}/works/${artwork.collection.slug.current}`
          : `/${lang}/works`

        return (
          <Link
            key={artwork._id}
            href={href}
            className={`group relative block overflow-hidden bg-border ${
              isWide ? 'md:col-span-2 aspect-video' : 'aspect-[4/3]'
            } min-h-[200px] md:min-h-[300px]`}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={altText}
                fill
                sizes={
                  isWide
                    ? '100vw'
                    : '(max-width: 768px) 100vw, 50vw'
                }
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                {...(primaryImage?.lqip
                  ? { placeholder: 'blur' as const, blurDataURL: primaryImage.lqip }
                  : {})}
              />
            ) : (
              <div className="w-full h-full bg-border" />
            )}
          </Link>
        )
      })}
    </div>
  )
}
