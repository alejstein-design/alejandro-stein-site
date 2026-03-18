'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { PortableText } from '@portabletext/react'
import { urlFor } from '@/lib/sanity'
import { t } from '@/lib/i18n'
import type { Artwork } from '@/types/sanity'
import type { Dictionary } from '@/lib/i18n'

interface ArtworkLightboxProps {
  artworks: Artwork[]
  selectedIndex: number
  lang: string
  dict: Dictionary
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function ArtworkLightbox({
  artworks,
  selectedIndex,
  lang,
  dict,
  onClose,
  onPrev,
  onNext,
}: ArtworkLightboxProps) {
  const artwork = artworks[selectedIndex]
  const hasPrev = selectedIndex > 0
  const hasNext = selectedIndex < artworks.length - 1

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext) onNext()
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  if (!artwork) return null

  const primaryImage = artwork.images?.[0]
  const imageUrl = primaryImage
    ? urlFor(primaryImage).width(1600).quality(95).auto('format').url()
    : null

  const title = t(artwork.title, lang)
  const medium = t(artwork.medium, lang)
  const description = artwork.description?.[lang as 'es' | 'en']
  const altText =
    primaryImage?.alt?.[lang as 'es' | 'en'] ?? title

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox-backdrop"
        className="fixed inset-0 z-50 bg-foreground/95 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          {/* Counter */}
          <span className="font-sans text-[11px] tracking-[2px] text-background/50 uppercase">
            {selectedIndex + 1} / {artworks.length}
          </span>

          {/* Close */}
          <button
            onClick={onClose}
            aria-label={dict.close}
            className="font-sans text-[11px] tracking-[2px] uppercase text-background/60 hover:text-background transition-colors flex items-center gap-2"
          >
            {dict.close}
            <span aria-hidden className="text-lg leading-none">×</span>
          </button>
        </div>

        {/* Main area: image + nav */}
        <div className="flex-1 flex items-center min-h-0 px-4 md:px-16 gap-4">
          {/* Prev button */}
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label={dict.previous}
            className="shrink-0 w-10 h-10 flex items-center justify-center text-background/40 hover:text-background disabled:opacity-0 disabled:pointer-events-none transition-colors"
          >
            <span aria-hidden className="text-2xl">←</span>
          </button>

          {/* Image */}
          <motion.div
            key={artwork._id}
            className="flex-1 relative h-full max-h-[75vh]"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={altText}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-contain"
                priority
              />
            ) : (
              <div className="w-full h-full bg-border/20 flex items-center justify-center">
                <span className="font-sans text-[11px] text-background/40 uppercase tracking-[2px]">
                  No image
                </span>
              </div>
            )}
          </motion.div>

          {/* Next button */}
          <button
            onClick={onNext}
            disabled={!hasNext}
            aria-label={dict.next}
            className="shrink-0 w-10 h-10 flex items-center justify-center text-background/40 hover:text-background disabled:opacity-0 disabled:pointer-events-none transition-colors"
          >
            <span aria-hidden className="text-2xl">→</span>
          </button>
        </div>

        {/* Info panel */}
        <motion.div
          key={`${artwork._id}-info`}
          className="shrink-0 px-6 py-5 border-t border-background/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            {/* Left: title + description */}
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-xl md:text-2xl text-background leading-tight">
                {title}
              </h2>
              {description && description.length > 0 && (
                <div className="font-sans text-[12px] text-background/60 mt-1.5 leading-relaxed max-w-prose [&_p]:mb-1">
                  <PortableText value={description} />
                </div>
              )}
            </div>

            {/* Right: meta */}
            <div className="flex flex-wrap gap-x-8 gap-y-1 shrink-0">
              {artwork.year && (
                <span className="font-sans text-[11px] text-background/50">
                  <span className="uppercase tracking-[2px] text-background/30 text-[10px] mr-1.5">
                    {dict.year}
                  </span>
                  {artwork.year}
                </span>
              )}
              {medium && (
                <span className="font-sans text-[11px] text-background/50">
                  <span className="uppercase tracking-[2px] text-background/30 text-[10px] mr-1.5">
                    {dict.medium}
                  </span>
                  {medium}
                </span>
              )}
              {artwork.dimensions && (
                <span className="font-sans text-[11px] text-background/50">
                  <span className="uppercase tracking-[2px] text-background/30 text-[10px] mr-1.5">
                    {dict.dimensions}
                  </span>
                  {artwork.dimensions}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Backdrop click to close */}
        <div
          className="fixed inset-0 -z-10"
          onClick={onClose}
          aria-hidden
        />
      </motion.div>
    </AnimatePresence>
  )
}
