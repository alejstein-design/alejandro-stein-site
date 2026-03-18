'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, type Variants } from 'framer-motion'
import { urlFor } from '@/lib/sanity'
import { t } from '@/lib/i18n'
import ArtworkLightbox from '@/components/ArtworkLightbox'
import type { CollectionWithArtworks, Artwork } from '@/types/sanity'
import type { Dictionary } from '@/lib/i18n'

interface CollectionViewProps {
  collection: CollectionWithArtworks
  lang: string
  dict: Dictionary
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const itemVariant: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function CollectionView({ collection, lang, dict }: CollectionViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const { artworks, layoutStyle = 'grid' } = collection

  return (
    <>
      {layoutStyle === 'grid' && (
        <TightGrid artworks={artworks} lang={lang} onSelect={setSelectedIndex} />
      )}
      {layoutStyle === 'masonry' && (
        <MasonryGrid artworks={artworks} lang={lang} onSelect={setSelectedIndex} />
      )}
      {layoutStyle === 'editorial' && (
        <EditorialGrid artworks={artworks} lang={lang} onSelect={setSelectedIndex} />
      )}

      {selectedIndex !== null && (
        <ArtworkLightbox
          artworks={artworks}
          selectedIndex={selectedIndex}
          lang={lang}
          dict={dict}
          onClose={() => setSelectedIndex(null)}
          onPrev={() => setSelectedIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() =>
            setSelectedIndex((i) => Math.min(artworks.length - 1, (i ?? 0) + 1))
          }
        />
      )}
    </>
  )
}

/* ── Grid layout (uniform tight grid — for Mosaico Refractario etc.) ── */
function TightGrid({
  artworks,
  lang,
  onSelect,
}: {
  artworks: Artwork[]
  lang: string
  onSelect: (i: number) => void
}) {
  return (
    <motion.div
      className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {artworks.map((artwork, i) => (
        <ArtworkThumb
          key={artwork._id}
          artwork={artwork}
          lang={lang}
          index={i}
          onSelect={onSelect}
          aspectClass="aspect-square"
          sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          imageWidth={400}
          imageHeight={400}
        />
      ))}
    </motion.div>
  )
}

/* ── Masonry layout (for varied aspect ratios — murals, paintings) ── */
function MasonryGrid({
  artworks,
  lang,
  onSelect,
}: {
  artworks: Artwork[]
  lang: string
  onSelect: (i: number) => void
}) {
  return (
    <motion.div
      className="columns-1 md:columns-2 lg:columns-3 [column-gap:8px]"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {artworks.map((artwork, i) => {
        const primaryImage = artwork.images?.[0]
        const imageUrl = primaryImage
          ? urlFor(primaryImage).width(700).quality(90).auto('format').url()
          : null
        const altText =
          primaryImage?.alt?.[lang as 'es' | 'en'] ?? t(artwork.title, lang)

        return (
          <motion.div
            key={artwork._id}
            variants={itemVariant}
            className="break-inside-avoid mb-2"
          >
            <ArtworkThumbMasonry
              artwork={artwork}
              lang={lang}
              index={i}
              imageUrl={imageUrl}
              altText={altText}
              onSelect={onSelect}
            />
          </motion.div>
        )
      })}
    </motion.div>
  )
}

/* ── Editorial layout (2-col, generous spacing — large murals/tapestries) ── */
function EditorialGrid({
  artworks,
  lang,
  onSelect,
}: {
  artworks: Artwork[]
  lang: string
  onSelect: (i: number) => void
}) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {artworks.map((artwork, i) => (
        <ArtworkThumb
          key={artwork._id}
          artwork={artwork}
          lang={lang}
          index={i}
          onSelect={onSelect}
          aspectClass="aspect-[3/4]"
          sizes="(max-width: 768px) 100vw, 50vw"
          imageWidth={800}
          imageHeight={1067}
        />
      ))}
    </motion.div>
  )
}

/* ── Shared thumbnail component ── */
function ArtworkThumb({
  artwork,
  lang,
  index,
  onSelect,
  aspectClass,
  sizes,
  imageWidth,
  imageHeight,
}: {
  artwork: Artwork
  lang: string
  index: number
  onSelect: (i: number) => void
  aspectClass: string
  sizes: string
  imageWidth: number
  imageHeight: number
}) {
  const primaryImage = artwork.images?.[0]
  const imageUrl = primaryImage
    ? urlFor(primaryImage).width(imageWidth).height(imageHeight).quality(88).auto('format').url()
    : null
  const title = t(artwork.title, lang)
  const altText = primaryImage?.alt?.[lang as 'es' | 'en'] ?? title

  return (
    <motion.button
      variants={itemVariant}
      onClick={() => onSelect(index)}
      aria-label={title}
      className={`group relative ${aspectClass} w-full overflow-hidden bg-border block cursor-pointer`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={altText}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="w-full h-full bg-border" />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/50 transition-colors duration-300 flex items-end">
        <div className="w-full p-3 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <p className="font-sans text-[11px] uppercase tracking-[1.5px] text-background leading-tight line-clamp-2">
            {title}
          </p>
        </div>
      </div>
    </motion.button>
  )
}

/* ── Masonry variant (no fixed aspect ratio) ── */
function ArtworkThumbMasonry({
  artwork,
  lang,
  index,
  imageUrl,
  altText,
  onSelect,
}: {
  artwork: Artwork
  lang: string
  index: number
  imageUrl: string | null
  altText: string
  onSelect: (i: number) => void
}) {
  const title = t(artwork.title, lang)

  return (
    <button
      onClick={() => onSelect(index)}
      aria-label={title}
      className="group relative w-full overflow-hidden bg-border block cursor-pointer"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={altText}
          className="w-full h-auto block transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
      ) : (
        <div className="w-full aspect-square bg-border" />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/50 transition-colors duration-300 flex items-end">
        <div className="w-full p-3 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <p className="font-sans text-[11px] uppercase tracking-[1.5px] text-background leading-tight line-clamp-2">
            {title}
          </p>
        </div>
      </div>
    </button>
  )
}
