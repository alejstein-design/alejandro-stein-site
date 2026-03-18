'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, type Variants } from 'framer-motion'
import { PortableText } from '@portabletext/react'
import { urlFor } from '@/lib/sanity'
import { t } from '@/lib/i18n'
import type { Collection, BilingualText } from '@/types/sanity'
import type { Dictionary } from '@/lib/i18n'
import SectionLabel from '@/components/SectionLabel'

// ─────────────────────────────────────────────────────────────────────────────
// About Section
// ─────────────────────────────────────────────────────────────────────────────

interface AboutSectionProps {
  bio?: BilingualText | null
  lang: string
  dict: Dictionary
}

export function AboutSection({ bio, lang, dict }: AboutSectionProps) {
  const bioContent = bio?.[lang as 'es' | 'en']
  if (!bioContent?.length) return null

  return (
    <section className="py-[80px] border-t border-border">
      <motion.div
        className="max-w-[680px] mx-auto px-[clamp(20px,4vw,48px)]"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="text-[16px] text-foreground leading-[1.8] [&_p]:mb-[1.5em] [&_p:last-child]:mb-0">
          <PortableText value={bioContent} />
        </div>

        <Link
          href={`/${lang}/about`}
          className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted hover:text-foreground transition-colors mt-8"
        >
          {dict.readMore} →
        </Link>
      </motion.div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Featured Collections Row
// ─────────────────────────────────────────────────────────────────────────────

interface FeaturedCollectionsRowProps {
  collections: Collection[]
  lang: string
  dict: Dictionary
}

const collectionContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const collectionFadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function FeaturedCollectionsRow({
  collections,
  lang,
  dict,
}: FeaturedCollectionsRowProps) {
  if (collections.length === 0) return null

  return (
    <section className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] py-16 md:py-20 border-t border-border">
      <SectionLabel text={dict.selectedCollections} />

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={collectionContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
      >
        {collections.map((col) => {
          const imageUrl = col.coverImage
            ? urlFor(col.coverImage).width(700).quality(75).auto('format').url()
            : null

          return (
            <motion.article key={col._id} variants={collectionFadeUp}>
              <Link
                href={`/${lang}/works/${col.slug.current}`}
                className="group block"
              >
                {/* Cover image 4/3 */}
                <div className="relative aspect-[4/3] overflow-hidden bg-border mb-4 transition-shadow duration-300 group-hover:shadow-lg">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={t(col.title, lang)}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>

                <div className="transition-transform duration-300 group-hover:-translate-y-0.5">
                  <h3 className="text-[16px] font-semibold uppercase tracking-[0.05em] text-foreground leading-tight mb-1">
                    {t(col.title, lang)}
                  </h3>
                  {col.year && (
                    <p className="text-[12px] text-muted">{col.year}</p>
                  )}
                </div>
              </Link>
            </motion.article>
          )
        })}
      </motion.div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Contact CTA
// ─────────────────────────────────────────────────────────────────────────────

interface ContactCTAProps {
  email?: string | null
  dict: Dictionary
}

export function ContactCTA({ email, dict }: ContactCTAProps) {
  return (
    <section className="border-t border-border">
      <motion.div
        className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] py-[120px] flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-semibold uppercase tracking-[0.05em] text-foreground mb-10 leading-tight">
          {dict.getInTouch}
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {email && (
            <a
              href={`mailto:${email}`}
              className="text-[13px] text-foreground hover:text-accent-red transition-colors tracking-wide"
            >
              {email}
            </a>
          )}

          {email && (
            <span className="hidden sm:block w-px h-4 bg-border" aria-hidden />
          )}

          <a
            href="https://instagram.com/alustein"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-muted hover:text-foreground transition-colors tracking-wide"
          >
            @alustein
          </a>
        </div>
      </motion.div>
    </section>
  )
}
