'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import { t } from '@/lib/i18n'
import type { Collection } from '@/types/sanity'
import type { Dictionary } from '@/lib/i18n'

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORY_ORDER = [
  'handmade', 'digital', 'murals', 'tapestries', 'mixed-media',
  'doors', 'portraits', 'mosaico-refractario', 'combinacion', 'architectural-patterns',
]

const CATEGORY_LABELS: Record<string, { en: string; es: string }> = {
  'handmade':               { en: 'Painting',            es: 'Pintura' },
  'digital':                { en: 'Digital',             es: 'Digital' },
  'murals':                 { en: 'Murals',              es: 'Murales' },
  'tapestries':             { en: 'Textiles',            es: 'Textiles' },
  'mixed-media':            { en: 'Mixed Media',         es: 'Técnica Mixta' },
  'doors':                  { en: 'Doors',               es: 'Puertas' },
  'portraits':              { en: 'Portraits',           es: 'Retratos' },
  'mosaico-refractario':    { en: 'Mosaico Refractario', es: 'Mosaico Refractario' },
  'combinacion':            { en: 'Combinación',         es: 'Combinación' },
  'architectural-patterns': { en: 'Arch. Patterns',      es: 'Patrones Arq.' },
}

function catLabel(category: string, lang: string) {
  const l = CATEGORY_LABELS[category]
  return l ? (lang === 'es' ? l.es : l.en) : category
}

// ── Row layout system ─────────────────────────────────────────────────────────

type RowConfig = { gridCols: string; aspect: number; imgWidth: number }

// Two-column patterns
const P2: RowConfig[] = [
  { gridCols: '1.3fr 1fr',   aspect: 1.2,  imgWidth: 1400 },
  { gridCols: '1fr 1.5fr',   aspect: 1.35, imgWidth: 1400 },
  { gridCols: '1.1fr 0.9fr', aspect: 1.1,  imgWidth: 1400 },
  { gridCols: '1fr 1fr',     aspect: 1.0,  imgWidth: 1400 },
]

// Three-column patterns
const P3: RowConfig[] = [
  { gridCols: '1fr 1fr 1.4fr',  aspect: 0.85, imgWidth: 900 },
  { gridCols: '1.2fr 1fr 1fr',  aspect: 0.9,  imgWidth: 900 },
  { gridCols: '1fr 1.3fr 1fr',  aspect: 0.8,  imgWidth: 900 },
  { gridCols: '1fr 1fr 1fr',    aspect: 0.75, imgWidth: 900 },
]

type RowLayout = RowConfig & { items: Collection[] }

function buildRows(collections: Collection[], catIdx: number): RowLayout[] {
  if (collections.length === 0) return []
  if (collections.length === 1) {
    return [{ items: collections, gridCols: '1fr', aspect: 2.2, imgWidth: 1600 }]
  }

  const rows: RowLayout[] = []
  let i = 0
  let i2 = catIdx % P2.length
  let i3 = catIdx % P3.length

  while (i < collections.length) {
    const remaining = collections.length - i

    if (remaining === 1) {
      // Lone orphan — full width
      rows.push({ items: [collections[i]], gridCols: '1fr', aspect: 1.5, imgWidth: 1600 })
      i++
    } else if (remaining === 2) {
      rows.push({ items: collections.slice(i, i + 2), ...P2[i2 % P2.length] })
      i += 2; i2++
    } else {
      // 3+ remaining — alternate 2-col / 3-col rows
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
  const [activeSection, setActiveSection] = useState('all')

  // Group by category in defined order, only categories that have data
  const grouped = useMemo(() => {
    const byCat: Record<string, Collection[]> = {}
    for (const c of collections) {
      const cat = c.category ?? 'mixed-media'
      ;(byCat[cat] ??= []).push(c)
    }
    const result: { category: string; items: Collection[] }[] = []
    for (const cat of CATEGORY_ORDER) {
      if (byCat[cat]?.length) result.push({ category: cat, items: byCat[cat] })
    }
    // Any categories not in the known list
    for (const [cat, items] of Object.entries(byCat)) {
      if (!CATEGORY_ORDER.includes(cat)) result.push({ category: cat, items })
    }
    return result
  }, [collections])

  // Scroll-based active section detection
  useEffect(() => {
    function onScroll() {
      if (window.scrollY < 80) {
        setActiveSection('all')
        return
      }
      // Walk sections bottom-up; first one whose top is above threshold is active
      for (let i = grouped.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${grouped[i].category}`)
        if (el && el.getBoundingClientRect().top <= 80) {
          setActiveSection(grouped[i].category)
          return
        }
      }
      setActiveSection('all')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [grouped])

  function scrollTo(category: string) {
    if (category === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const el = document.getElementById(`section-${category}`)
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 36
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }
  }

  const allLabel = lang === 'es' ? 'Todos' : 'All'

  return (
    <div className="max-w-[1400px] mx-auto">

      {/* Mobile: horizontal pill bar */}
      <div className="flex md:hidden gap-3 overflow-x-auto px-[clamp(20px,4vw,48px)] pt-6 pb-4">
        <PillBtn label={allLabel} active={activeSection === 'all'} onClick={() => scrollTo('all')} />
        {grouped.map(({ category }) => (
          <PillBtn
            key={category}
            label={catLabel(category, lang)}
            active={activeSection === category}
            onClick={() => scrollTo(category)}
          />
        ))}
      </div>

      {/* Two-column layout: sidebar + content */}
      <div className="grid grid-cols-1 md:grid-cols-[160px_1fr]">

        {/* Sidebar */}
        <aside className="hidden md:block sticky top-0 self-start pt-9 pl-10 pr-5 max-h-screen overflow-y-auto">
          <SidebarBtn label={allLabel} active={activeSection === 'all'} onClick={() => scrollTo('all')} />
          {grouped.map(({ category }) => (
            <SidebarBtn
              key={category}
              label={catLabel(category, lang)}
              active={activeSection === category}
              onClick={() => scrollTo(category)}
            />
          ))}
        </aside>

        {/* Content */}
        <div className="pt-6 md:pt-9 px-[clamp(20px,4vw,48px)] md:pl-0 md:pr-10 pb-24">
          {grouped.map(({ category, items }, catIdx) => {
            const rows = buildRows(items, catIdx)
            const isLast = catIdx === grouped.length - 1

            return (
              <div key={category} id={`section-${category}`}>
                {/* Section label — block element, sits alone above grid */}
                <p className="text-[14px] font-medium italic uppercase tracking-widest text-muted mb-6">
                  {catLabel(category, lang)}
                </p>

                {rows.map((row, rowIdx) => (
                  <div
                    key={rowIdx}
                    className="grid gap-1 mb-7"
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

                {!isLast && <hr className="border-t border-[#E8E5E0] mt-3 mb-8" />}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

// ── Sidebar button ────────────────────────────────────────────────────────────

function SidebarBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 py-1.5 w-full group">
      <span className={`w-1.5 h-1.5 shrink-0 ${active ? 'bg-[#1A1A1A]' : 'bg-transparent'}`} />
      <span className={`text-[11px] uppercase tracking-[0.08em] text-left leading-tight ${
        active
          ? 'font-semibold text-[#1A1A1A]'
          : 'font-medium text-[#6B6B6B] group-hover:text-[#1A1A1A] transition-colors'
      }`}>
        {label}
      </span>
    </button>
  )
}

// ── Mobile pill button ────────────────────────────────────────────────────────

function PillBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.08em] pb-1 border-b-2 transition-colors ${
        active ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#6B6B6B]'
      }`}
    >
      {label}
    </button>
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
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={t(collection.title, lang)}
            fill
            sizes={sizes}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-border" />
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
