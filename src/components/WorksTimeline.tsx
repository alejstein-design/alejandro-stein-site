import Image from 'next/image'
import Link from 'next/link'
import { t } from '@/lib/i18n'
import { urlFor } from '@/lib/sanity'
import type { Collection, CareerEvent } from '@/types/sanity'

// ── Types ─────────────────────────────────────────────────────────────────────

type TimelineItem =
  | { kind: 'event';      year: number; data: CareerEvent }
  | { kind: 'collection'; year: number; data: Collection }

type CollectionSize = 'large' | 'medium' | 'small'

// ── Size / alignment tables ───────────────────────────────────────────────────

const SIZE_CYCLE: CollectionSize[] = ['large', 'medium', 'large', 'small', 'medium']

const SIZE_CLASSES: Record<CollectionSize, string> = {
  large:  'md:max-w-[75%]',
  medium: 'md:max-w-[55%]',
  small:  'md:max-w-[40%]',
}

const ALIGN_CLASSES: Record<CollectionSize, string> = {
  large:  '',
  medium: 'md:mx-auto',
  small:  'md:ml-auto',
}

const URLFOR_WIDTH: Record<CollectionSize, number> = {
  large:  700,
  medium: 500,
  small:  380,
}

// ── Event type labels ─────────────────────────────────────────────────────────

const EVENT_TYPE_LABELS: Record<string, { en: string; es: string }> = {
  solo:      { en: 'Solo Exhibition',  es: 'Exposición Individual' },
  group:     { en: 'Group Exhibition', es: 'Exposición Grupal' },
  award:     { en: 'Award / Prize',    es: 'Premio' },
  milestone: { en: 'Milestone',        es: 'Hito' },
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  events:      CareerEvent[]
  collections: Collection[]
  lang:        string
}

export default function WorksTimeline({ events, collections, lang }: Props) {
  // Merge and sort descending by year
  const items: TimelineItem[] = [
    ...events.map((e) => ({ kind: 'event' as const, year: e.year, data: e })),
    ...collections.map((c) => ({
      kind: 'collection' as const,
      year: parseInt(c.year ?? '', 10) || 0,
      data: c,
    })),
  ].sort((a, b) => b.year - a.year)

  // Group by year, preserving descending order
  const yearGroups: [number, TimelineItem[]][] = []
  for (const item of items) {
    const last = yearGroups[yearGroups.length - 1]
    if (last && last[0] === item.year) last[1].push(item)
    else yearGroups.push([item.year, [item]])
  }

  // Pre-compute per-collection sizes across the whole page
  let counter = 0
  const enriched = yearGroups.map(([year, groupItems], groupIdx) => {
    const yearEvents      = groupItems.filter((i): i is Extract<TimelineItem, { kind: 'event' }>      => i.kind === 'event')
    const yearCollections = groupItems.filter((i): i is Extract<TimelineItem, { kind: 'collection' }> => i.kind === 'collection')
    const sizes = yearCollections.map(() => {
      const s = SIZE_CYCLE[counter % SIZE_CYCLE.length]
      counter++
      return s
    })
    return { year, yearEvents, yearCollections, sizes, groupIdx }
  })

  return (
    <div className="max-w-[900px]">
      {enriched.map(({ year, yearEvents, yearCollections, sizes, groupIdx }) => (
        <div key={year}>
          {/* Desktop: 3-col grid  |  Mobile: stacked */}
          <div className="grid grid-cols-1 md:grid-cols-[100px_24px_1fr]">

            {/* Year label */}
            <div className="md:text-right pb-2 md:pb-0 md:pt-1 md:pr-0">
              <span
                className="text-3xl md:text-5xl font-semibold leading-none tracking-tight tabular-nums"
                style={{ color: '#C8C5C0' }}
              >
                {year || '—'}
              </span>
            </div>

            {/* Vertical line + dot — desktop only */}
            <div className="hidden md:flex flex-col items-center">
              <div className="w-2 h-2 bg-[#1A1A1A] mt-5 shrink-0" />
              <div className="w-px flex-1 bg-[#E8E5E0]" />
            </div>

            {/* Content column */}
            <div className="pb-8 pl-4 border-l border-[#E8E5E0] md:border-l-0 md:pl-0">

              {/* Events first — compact */}
              {yearEvents.length > 0 && (
                <div className="space-y-4 mb-5">
                  {yearEvents.map((item) => (
                    <EventCard key={item.data._id} event={item.data} lang={lang} />
                  ))}
                </div>
              )}

              {/* Collections — visual centrepiece */}

              {yearCollections.length === 1 && (
                <CollectionCardSized
                  collection={yearCollections[0].data}
                  lang={lang}
                  size={sizes[0]}
                />
              )}

              {yearCollections.length === 2 && (
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: groupIdx % 2 === 0
                      ? '1.2fr 0.8fr'
                      : '0.8fr 1.2fr',
                  }}
                >
                  {yearCollections.map((item, i) => (
                    <CollectionCardGrid
                      key={item.data._id}
                      collection={item.data}
                      lang={lang}
                      width={500}
                    />
                  ))}
                </div>
              )}

              {yearCollections.length >= 3 && (
                <>
                  <CollectionCardSized
                    collection={yearCollections[0].data}
                    lang={lang}
                    size={sizes[0]}
                  />
                  <div
                    className="grid gap-4 mt-4"
                    style={{
                      gridTemplateColumns: groupIdx % 2 === 0
                        ? '1.2fr 0.8fr'
                        : '0.8fr 1.2fr',
                    }}
                  >
                    {yearCollections.slice(1).map((item) => (
                      <CollectionCardGrid
                        key={item.data._id}
                        collection={item.data}
                        lang={lang}
                        width={500}
                      />
                    ))}
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Event Card — compact ──────────────────────────────────────────────────────

function EventCard({ event, lang }: { event: CareerEvent; lang: string }) {
  const isAward  = event.eventType === 'award'
  const label    = EVENT_TYPE_LABELS[event.eventType]
  const title    = lang === 'es' ? event.titleEs    : event.title
  const location = lang === 'es' ? event.locationEs : event.location
  const desc     = lang === 'es' ? event.descriptionEs : event.description
  const pill     = lang === 'es' ? label?.es : label?.en

  const thumbUrl =
    event.highlight && event.image?.asset
      ? urlFor(event.image).width(160).height(160).quality(80).auto('format').url()
      : null

  return (
    <div className="flex items-start gap-3">
      {thumbUrl && (
        <div className="shrink-0 w-[56px] h-[56px] relative overflow-hidden bg-border">
          <Image src={thumbUrl} alt="" fill className="object-cover" sizes="56px" />
        </div>
      )}
      <div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
          <span className="text-[16px] font-semibold text-foreground leading-tight">{title}</span>
          {event.eventType && (
            <span
              className="text-[12px] font-medium uppercase tracking-[0.08em] border px-2 py-0.5 leading-none"
              style={
                isAward
                  ? { color: '#854F0B', borderColor: '#BA7517' }
                  : { color: '#6B6B6B', borderColor: '#E8E5E0' }
              }
            >
              {pill}
            </span>
          )}
        </div>
        {(event.venue || location) && (
          <p className="text-[14px] text-muted leading-snug">
            {[event.venue, location].filter(Boolean).join(' — ')}
          </p>
        )}
        {desc && (
          <p className="text-[14px] text-muted leading-snug mt-0.5">{desc}</p>
        )}
      </div>
    </div>
  )
}

// ── Collection card — sized (single-in-year, or first-of-3+) ─────────────────

function CollectionCardSized({
  collection,
  lang,
  size,
}: {
  collection: Collection
  lang:       string
  size:       CollectionSize
}) {
  const urlWidth = URLFOR_WIDTH[size]
  const imageUrl = collection.coverImage?.asset
    ? urlFor(collection.coverImage).width(urlWidth).quality(80).auto('format').url()
    : null
  const w    = (collection.coverImage as { width?: number }  | undefined)?.width  ?? urlWidth
  const h    = (collection.coverImage as { height?: number } | undefined)?.height ?? Math.round(urlWidth * 0.75)
  const meta = [collection.year, t(collection.medium, lang)].filter(Boolean).join(' · ')
  const view = lang === 'es' ? 'Ver colección →' : 'View collection →'

  return (
    <Link
      href={`/${lang}/works/${collection.slug.current}`}
      className={`block mb-4 ${SIZE_CLASSES[size]} ${ALIGN_CLASSES[size]}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={t(collection.title, lang)}
          width={w}
          height={h}
          className="w-full h-auto block"
          sizes={`(max-width: 768px) 100vw, ${urlWidth}px`}
        />
      ) : (
        <div className="w-full aspect-[4/3] bg-border" />
      )}
      <p className="text-[16px] font-semibold uppercase tracking-[0.05em] text-foreground mt-3">
        {t(collection.title, lang)}
      </p>
      {meta && <p className="text-[14px] text-muted mt-1">{meta}</p>}
      <p className="text-[14px] font-medium uppercase tracking-[0.08em] text-muted mt-1">
        {view}
      </p>
    </Link>
  )
}

// ── Collection card — grid cell (2-up layouts) ────────────────────────────────

function CollectionCardGrid({
  collection,
  lang,
  width,
}: {
  collection: Collection
  lang:       string
  width:      number
}) {
  const imageUrl = collection.coverImage?.asset
    ? urlFor(collection.coverImage).width(width).quality(80).auto('format').url()
    : null
  const w    = (collection.coverImage as { width?: number }  | undefined)?.width  ?? width
  const h    = (collection.coverImage as { height?: number } | undefined)?.height ?? Math.round(width * 0.75)
  const meta = [collection.year, t(collection.medium, lang)].filter(Boolean).join(' · ')
  const view = lang === 'es' ? 'Ver colección →' : 'View collection →'

  return (
    <Link href={`/${lang}/works/${collection.slug.current}`} className="block">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={t(collection.title, lang)}
          width={w}
          height={h}
          className="w-full h-auto block"
          sizes="(max-width: 768px) 50vw, 30vw"
        />
      ) : (
        <div className="w-full aspect-[4/3] bg-border" />
      )}
      <p className="text-[16px] font-semibold uppercase tracking-[0.05em] text-foreground mt-3">
        {t(collection.title, lang)}
      </p>
      {meta && <p className="text-[14px] text-muted mt-1">{meta}</p>}
      <p className="text-[14px] font-medium uppercase tracking-[0.08em] text-muted mt-1">
        {view}
      </p>
    </Link>
  )
}
