'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import { t } from '@/lib/i18n'
import type { Collection } from '@/types/sanity'
import type { Dictionary } from '@/lib/i18n'

// ── Row layout system ─────────────────────────────────────────────────────────

type RowConfig = { gridCols: string; aspect: number; imgWidth: number }

const P2: RowConfig[] = [
  { gridCols: '1.3fr 1fr',   aspect: 1.2,  imgWidth: 800 },
  { gridCols: '1fr 1.5fr',   aspect: 1.35, imgWidth: 800 },
  { gridCols: '1.1fr 0.9fr', aspect: 1.1,  imgWidth: 800 },
  { gridCols: '1fr 1fr',     aspect: 1.0,  imgWidth: 800 },
]

const P3: RowConfig[] = [
  { gridCols: '1fr 1fr 1.4fr',  aspect: 0.85, imgWidth: 600 },
  { gridCols: '1.2fr 1fr 1fr',  aspect: 0.9,  imgWidth: 600 },
  { gridCols: '1fr 1.3fr 1fr',  aspect: 0.8,  imgWidth: 600 },
  { gridCols: '1fr 1fr 1fr',    aspect: 0.75, imgWidth: 600 },
]

type RowLayout = RowConfig & { items: Collection[] }

function buildRows(collections: Collection[]): RowLayout[] {
  if (collections.length === 0) return []
  if (collections.length === 1) {
    return [{ items: collections, gridCols: '1fr', aspect: 2.2, imgWidth: 1200 }]
  }

  const rows: RowLayout[] = []
  let i = 0, i2 = 0, i3 = 0

  while (i < collections.length) {
    const remaining = collections.length - i

    if (remaining === 1) {
      rows.push({ items: [collections[i]], gridCols: '1fr', aspect: 1.5, imgWidth: 1200 })
      i++
    } else if (remaining === 2) {
      rows.push({ items: collections.slice(i, i + 2), ...P2[i2 % P2.length] })
      i += 2; i2++
    } else {
      if (rows.length % 2 === 0) {
        rows.push({ items: collections.slice(i, i + 2), ...P2[i2 % P2.length] })
        i += 2; i2++
      } else {
        rows.push({ items: collections.slice(i, i + 3), ...P3[i3 % P3.length] })
        i += 3; i3++
      }
    }
  }

  return rows
}

// ── Main component ────────────────────────────────────────────────────────────

interface WorksGridProps {
  collections: Collection[]
  lang: string
  dict: Dictionary
}

export default function WorksGrid({ collections, lang, dict }: WorksGridProps) {
  const rows = buildRows(collections)

  return (
    <div className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] pb-24">
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="flex flex-col md:grid gap-5 mb-10"
          style={{ gridTemplateColumns: row.gridCols }}
        >
          {row.items.map((collection) => (
            <CollectionCard
              key={collection._id}
              collection={collection}
              lang={lang}
              dict={dict}
              aspect={row.aspect}
              imgWidth={row.imgWidth}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Collection card ───────────────────────────────────────────────────────────

function CollectionCard({
  collection, lang, dict, aspect, imgWidth,
}: {
  collection: Collection
  lang: string
  dict: Dictionary
  aspect: number
  imgWidth: number
}) {
  const [loaded, setLoaded] = useState(false)

  const imageUrl = collection.coverImage
    ? urlFor(collection.coverImage).width(imgWidth).quality(80).auto('format').url()
    : null

  const sizes = imgWidth >= 1400
    ? '(max-width: 768px) 100vw, 50vw'
    : '(max-width: 768px) 100vw, 33vw'

  const meta = [collection.year, t(collection.medium, lang)].filter(Boolean).join(' — ')

  return (
    <Link href={`/${lang}/works/${collection.slug.current}`} className="group block">
      <div className="relative overflow-hidden" style={{ aspectRatio: String(aspect) }}>
        {/* Shimmer placeholder */}
        <div
          className="absolute inset-0 bg-[#EDEAE5]"
          style={{
            backgroundImage: 'linear-gradient(90deg, #EDEAE5 25%, #E3E0DB 50%, #EDEAE5 75%)',
            backgroundSize: '200% 100%',
            animation: loaded ? 'none' : 'shimmer 1.6s infinite',
          }}
        />
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={t(collection.title, lang)}
            fill
            sizes={sizes}
            className="object-cover"
            style={{
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.6s ease',
            }}
            onLoad={() => setLoaded(true)}
          />
        )}
      </div>
      <p className="text-[15px] font-semibold uppercase tracking-[0.05em] text-foreground mt-2">
        {t(collection.title, lang)}
      </p>
      {meta && <p className="text-[11px] text-muted tracking-wide mt-0.5">{meta}</p>}
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted mt-1.5 group-hover:underline underline-offset-2">
        {dict.viewCollection} →
      </p>
    </Link>
  )
}
