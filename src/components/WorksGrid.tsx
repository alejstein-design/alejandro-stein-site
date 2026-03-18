'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, type Variants } from 'framer-motion'
import { urlFor } from '@/lib/sanity'
import { t } from '@/lib/i18n'
import type { Collection } from '@/types/sanity'
import type { Dictionary } from '@/lib/i18n'

interface WorksGridProps {
  collections: Collection[]
  lang: string
  dict: Dictionary
}

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const item: Variants = {
  hidden: { y: 24 },  // no opacity: 0 — cards stay visible for LCP/CLS
  show: { y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function WorksGrid({ collections, lang, dict }: WorksGridProps) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
    >
      {collections.map((collection) => (
        <CollectionCard
          key={collection._id}
          collection={collection}
          lang={lang}
          dict={dict}
        />
      ))}
    </motion.div>
  )
}

function CollectionCard({
  collection,
  lang,
  dict,
}: {
  collection: Collection
  lang: string
  dict: Dictionary
}) {
  const imageUrl = collection.coverImage
    ? urlFor(collection.coverImage).width(700).quality(75).auto('format').url()
    : null

  return (
    <motion.article variants={item}>
      <Link
        href={`/${lang}/works/${collection.slug.current}`}
        className="group block"
      >
        {/* Image — 4:3 aspect ratio */}
        <div className="relative aspect-[4/3] overflow-hidden bg-border mb-5 transition-shadow duration-300 group-hover:shadow-xl">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={t(collection.title, lang)}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full bg-border flex items-center justify-center">
              <span className="text-[11px] text-tertiary uppercase tracking-[2px]">
                No image
              </span>
            </div>
          )}
        </div>

        {/* Card info */}
        <div className="transition-transform duration-300 group-hover:-translate-y-0.5">
          <h2 className="text-[16px] font-semibold uppercase tracking-[0.05em] text-foreground leading-tight mb-2">
            {t(collection.title, lang)}
          </h2>

          <div className="flex flex-wrap gap-x-6 gap-y-1 mb-3">
            {collection.year && (
              <span className="text-[12px] text-muted">{collection.year}</span>
            )}
            {t(collection.medium, lang) && (
              <span className="text-[12px] text-muted">
                {t(collection.medium, lang)}
              </span>
            )}
          </div>

          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted group-hover:text-foreground transition-colors">
            {dict.viewCollection} →
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
