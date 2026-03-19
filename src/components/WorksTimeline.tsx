import Image from 'next/image'
import Link from 'next/link'
import { t } from '@/lib/i18n'
import { urlFor } from '@/lib/sanity'
import type { Collection, CareerEvent } from '@/types/sanity'

const EVENT_TYPE_LABELS: Record<string, { en: string; es: string }> = {
  solo:      { en: 'Solo Exhibition',  es: 'Exposición Individual' },
  group:     { en: 'Group Exhibition', es: 'Exposición Grupal' },
  award:     { en: 'Award / Prize',    es: 'Premio' },
  milestone: { en: 'Milestone',        es: 'Hito' },
}

type TimelineItem =
  | { kind: 'event';      year: number; data: CareerEvent }
  | { kind: 'collection'; year: number; data: Collection }

interface Props {
  events: CareerEvent[]
  collections: Collection[]
  lang: string
}

export default function WorksTimeline({ events, collections, lang }: Props) {
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
    if (last && last[0] === item.year) {
      last[1].push(item)
    } else {
      yearGroups.push([item.year, [item]])
    }
  }

  return (
    <div className="max-w-[900px]">
      {yearGroups.map(([year, groupItems]) => {
        const yearEvents     = groupItems.filter((i) => i.kind === 'event')      as { kind: 'event';      year: number; data: CareerEvent }[]
        const yearCollections = groupItems.filter((i) => i.kind === 'collection') as { kind: 'collection'; year: number; data: Collection }[]

        return (
          <div key={year}>
            {/* ── Desktop: 3-column grid ── Mobile: stacked ──────────── */}
            <div className="grid grid-cols-1 md:grid-cols-[80px_1px_1fr] md:gap-x-8">

              {/* Year label */}
              <div className="md:text-right pb-2 md:pb-0 md:pt-1">
                <span className="text-[2.5rem] md:text-[3rem] font-semibold leading-none text-[#E8E5E0] tracking-tight tabular-nums">
                  {year || '—'}
                </span>
              </div>

              {/* Vertical line + dot — desktop only */}
              <div className="hidden md:flex flex-col items-center">
                <div className="w-[7px] h-[7px] bg-[#1A1A1A] mt-[6px] shrink-0" />
                <div className="w-px flex-1 bg-[#E8E5E0]" />
              </div>

              {/* Content column */}
              <div className="pb-8 pl-4 border-l border-[#E8E5E0] md:border-l-0 md:pl-0">

                {/* Events first — compact, text-forward */}
                {yearEvents.length > 0 && (
                  <div className="space-y-4 mb-5">
                    {yearEvents.map((item) => (
                      <EventCard key={item.data._id} event={item.data} lang={lang} />
                    ))}
                  </div>
                )}

                {/* Collections — visual centrepiece */}
                {yearCollections.length === 1 && (
                  <CollectionCardFull
                    collection={yearCollections[0].data}
                    lang={lang}
                  />
                )}

                {yearCollections.length === 2 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {yearCollections.map((item) => (
                      <CollectionCardHalf
                        key={item.data._id}
                        collection={item.data}
                        lang={lang}
                      />
                    ))}
                  </div>
                )}

                {yearCollections.length >= 3 && (
                  <div>
                    <CollectionCardFull
                      collection={yearCollections[0].data}
                      lang={lang}
                    />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {yearCollections.slice(1).map((item) => (
                        <CollectionCardHalf
                          key={item.data._id}
                          collection={item.data}
                          lang={lang}
                        />
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Event Card — compact ──────────────────────────────────────────────────────

function EventCard({ event, lang }: { event: CareerEvent; lang: string }) {
  const isAward = event.eventType === 'award'
  const label = EVENT_TYPE_LABELS[event.eventType]
  const title = lang === 'es' ? event.titleEs : event.title
  const location = lang === 'es' ? event.locationEs : event.location
  const description = lang === 'es' ? event.descriptionEs : event.description
  const labelText = lang === 'es' ? label?.es : label?.en

  const thumbUrl =
    event.highlight && event.image?.asset
      ? urlFor(event.image).width(160).height(160).quality(80).auto('format').url()
      : null

  return (
    <div className="flex items-start gap-3">
      {thumbUrl && (
        <div className="shrink-0 w-[56px] h-[56px] relative overflow-hidden bg-border">
          <Image
            src={thumbUrl}
            alt=""
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
      )}
      <div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
          <span className="text-[13px] font-semibold text-foreground leading-tight">{title}</span>
          {event.eventType && (
            <span
              className="text-[10px] font-medium uppercase tracking-[0.08em] border px-2 py-0.5 leading-none"
              style={
                isAward
                  ? { color: '#854F0B', borderColor: '#BA7517' }
                  : { color: '#6B6B6B', borderColor: '#E8E5E0' }
              }
            >
              {labelText}
            </span>
          )}
        </div>
        {(event.venue || location) && (
          <p className="text-[12px] text-muted leading-snug">
            {[event.venue, location].filter(Boolean).join(' — ')}
          </p>
        )}
        {description && (
          <p className="text-[12px] text-muted leading-snug mt-0.5">{description}</p>
        )}
      </div>
    </div>
  )
}

// ── Collection Card — full width ──────────────────────────────────────────────

function CollectionCardFull({ collection, lang }: { collection: Collection; lang: string }) {
  const imageUrl = collection.coverImage?.asset
    ? urlFor(collection.coverImage).width(1400).quality(80).auto('format').url()
    : null
  const w = (collection.coverImage as { width?: number } | undefined)?.width ?? 1400
  const h = (collection.coverImage as { height?: number } | undefined)?.height ?? 900
  const meta = [collection.year, t(collection.medium, lang)].filter(Boolean).join(' · ')
  const viewLabel = lang === 'es' ? 'Ver colección →' : 'View collection →'

  return (
    <Link href={`/${lang}/works/${collection.slug.current}`} className="block group mb-4">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={t(collection.title, lang)}
          width={w}
          height={h}
          className="w-full h-auto block"
          sizes="(max-width: 768px) 100vw, 60vw"
        />
      ) : (
        <div className="w-full aspect-[4/3] bg-border" />
      )}
      <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-foreground mt-3">
        {t(collection.title, lang)}
      </p>
      {meta && <p className="text-[12px] text-muted mt-1">{meta}</p>}
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted mt-1">
        {viewLabel}
      </p>
    </Link>
  )
}

// ── Collection Card — half width (2-up grid) ──────────────────────────────────

function CollectionCardHalf({ collection, lang }: { collection: Collection; lang: string }) {
  const imageUrl = collection.coverImage?.asset
    ? urlFor(collection.coverImage).width(800).quality(80).auto('format').url()
    : null
  const w = (collection.coverImage as { width?: number } | undefined)?.width ?? 800
  const h = (collection.coverImage as { height?: number } | undefined)?.height ?? 900
  const meta = [collection.year, t(collection.medium, lang)].filter(Boolean).join(' · ')
  const viewLabel = lang === 'es' ? 'Ver colección →' : 'View collection →'

  return (
    <Link href={`/${lang}/works/${collection.slug.current}`} className="block group">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={t(collection.title, lang)}
          width={w}
          height={h}
          className="w-full h-auto block"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 30vw"
        />
      ) : (
        <div className="w-full aspect-[4/3] bg-border" />
      )}
      <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-foreground mt-3">
        {t(collection.title, lang)}
      </p>
      {meta && <p className="text-[12px] text-muted mt-1">{meta}</p>}
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted mt-1">
        {viewLabel}
      </p>
    </Link>
  )
}
