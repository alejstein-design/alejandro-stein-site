import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import type { SanityImageWithLqip } from '@/types/sanity'

interface InstagramFeedProps {
  images: SanityImageWithLqip[]
  handle: string
  lang: string
}

export default function InstagramFeed({ images, handle, lang }: InstagramFeedProps) {
  if (!images.length) return null

  const sectionLabel = lang === 'es' ? 'LO ÚLTIMO EN INSTAGRAM' : 'LATEST ON INSTAGRAM'
  const profileUrl = `https://instagram.com/${handle}`

  return (
    <div>
      <p className="text-[14px] font-medium italic uppercase tracking-widest text-muted mb-4">
        {sectionLabel}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-[4px]">
        {images.map((img, i) => {
          const url = urlFor(img).width(600).quality(80).auto('format').url()
          return (
            <a
              key={i}
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden bg-border"
            >
              <Image
                src={url}
                alt={`Instagram post ${i + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                {...(img.lqip
                  ? { placeholder: 'blur' as const, blurDataURL: img.lqip }
                  : {})}
              />
            </a>
          )
        })}
      </div>

      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-5 text-[14px] text-muted hover:text-foreground transition-colors"
      >
        @{handle} →
      </a>
    </div>
  )
}
