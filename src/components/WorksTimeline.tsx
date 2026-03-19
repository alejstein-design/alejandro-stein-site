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

const PULL_QUOTE = {
  en: '"My work is based on exploring geometric forms and the multiple interactions generated through the combination of patterns and colors. They are born from a seed that will eventually grow fractally and without limits."',
  es: '"Mi trabajo se basa en explorar e investigar formas geométricas y las múltiples interacciones que se pueden generar a través de la combinación de patrones y colores. Nacen de una semilla, que eventualmente, crecerá fractal e ilimitadamente."',
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
  // Parse collection year from string like "2021" or "2018 — Present"
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
    <div className="max-w-[860px]">
      {yearGroups.map(([year, groupItems], groupIdx) => (
        <div key={year}>
          {/* Year group row */}
          <div className="grid grid-cols-1 md:grid-cols-[80px_1px_1fr] md:gap-x-8">

            {/* Year label */}
            <div className="md:text-right pb-1 md:pb-0 md:pt-0.5">
              <span className="text-[2.5rem] md:text-[3rem] font-semibold leading-none text-[#E8E5E0] tracking-tight tabular-nums">
                {year || '—'}
              </span>
            </div>

            {/* Vertical line + dot — desktop only */}
            <div className="hidden md:flex flex-col items-center">
              <div className="w-[7px] h-[7px] bg-[#1A1A1A] mt-[6px] shrink-0" />
              <div className="w-px flex-1 bg-[#E8E5E0]" />
            </div>

            {/* Content */}
            <div className="pb-12 pl-4 border-l border-[#E8E5E0] md:border-l-0 md:pl-0 space-y-5">
              {groupItems.map((item) =>
                item.kind === 'event' ? (
                  <EventCard key={item.data._id} event={item.data} lang={lang} />
                ) : (
                  <CollectionCard key={item.data._id} collection={item.data} lang={lang} />
                )
              )}
            </div>
          </div>

          {/* Pull quote after 2021 group */}
          {year === 2021 && (
            <div className="grid grid-cols-1 md:grid-cols-[80px_1px_1fr] md:gap-x-8">
              <div className="hidden md:block" />
              <div className="hidden md:block bg-[#E8E5E0] w-px" />
              <div className="pb-10 pl-4 border-l border-[#E8E5E0] md:border-l-0 md:pl-0">
                <p className="text-[14px] italic text-muted leading-relaxed border-l-2 border-[#E8E5E0] pl-4 max-w-lg">
                  {lang === 'es' ? PULL_QUOTE.es : PULL_QUOTE.en}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Event Card ────────────────────────────────────────────────────────────────

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
    <div className="flex gap-3 items-start">
      {thumbUrl && (
        <div className="shrink-0 w-[72px] h-[72px] relative overflow-hidden bg-border">
          <Image
            src={thumbUrl}
            alt={title ?? ''}
            fill
            className="object-cover"
            sizes="72px"
          />
        </div>
      )}
      <div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
          <span className="text-[14px] font-semibold text-foreground leading-tight">{title}</span>
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

// ── Collection Card ───────────────────────────────────────────────────────────

function CollectionCard({ collection, lang }: { collection: Collection; lang: string }) {
  const imageUrl = collection.coverImage?.asset
    ? urlFor(collection.coverImage).width(240).height(240).quality(75).auto('format').url()
    : null

  const viewLabel = lang === 'es' ? 'Ver colección →' : 'View collection →'
  const meta = [collection.year, t(collection.medium, lang)].filter(Boolean).join(' · ')

  return (
    <Link
      href={`/${lang}/works/${collection.slug.current}`}
      className="group flex gap-3 items-start"
    >
      {imageUrl && (
        <div className="shrink-0 w-[72px] h-[72px] relative overflow-hidden bg-border">
          <Image
            src={imageUrl}
            alt={t(collection.title, lang)}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="72px"
          />
        </div>
      )}
      <div>
        <p className="text-[14px] font-semibold text-foreground uppercase tracking-[0.04em] leading-tight mb-1">
          {t(collection.title, lang)}
        </p>
        {meta && <p className="text-[12px] text-muted leading-snug">{meta}</p>}
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted group-hover:text-foreground transition-colors mt-1 inline-block">
          {viewLabel}
        </span>
      </div>
    </Link>
  )
}
