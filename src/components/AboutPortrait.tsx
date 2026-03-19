'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useRef, useEffect, useState } from 'react'

const KaleidoscopeEasterEgg = dynamic(
  () => import('@/components/KaleidoscopeEasterEgg'),
  { ssr: false }
)

interface AboutPortraitProps {
  src: string
  artworkImages: string[]
  lang: string
}

export default function AboutPortrait({ src, artworkImages, lang }: AboutPortraitProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div
        ref={wrapperRef}
        className={`hidden md:block sticky bottom-0 self-end -ml-10 w-[calc(100%+2.5rem)] transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="relative">
          <Image
            src={src}
            alt="Alejandro Stein"
            width={800}
            height={1000}
            className="w-full h-auto"
            crossOrigin="anonymous"
          />
          {/* Aggressive bottom fade — fully opaque at 75% so image edge is never visible */}
          <div
            className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(250,250,248,0.4) 25%, rgba(250,250,248,0.8) 50%, #FAFAF8 75%)',
            }}
          />
        </div>
      </div>

      <KaleidoscopeEasterEgg
        artworkImages={artworkImages}
        lang={lang}
        portraitRef={wrapperRef}
      />
    </>
  )
}
