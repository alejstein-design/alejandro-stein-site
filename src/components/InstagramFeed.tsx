import Image from 'next/image'
import SectionLabel from '@/components/SectionLabel'
import { urlFor } from '@/lib/sanity'
import type { SanityImageWithLqip } from '@/types/sanity'

interface InstagramFeedProps {
  images: SanityImageWithLqip[]
  lang: string
}

export default function InstagramFeed({ images, lang }: InstagramFeedProps) {
  if (!images.length) return null

  const followLabel =
    lang === 'es'
      ? 'Seguí a @alustein en Instagram →'
      : 'Follow @alustein on Instagram →'

  return (
    <div className="mt-20 pt-12 border-t border-border">
      <div className="mb-6">
        <SectionLabel text="Instagram" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-[4px]">
        {images.map((img, i) => {
          const url = urlFor(img).width(350).quality(75).auto('format').url()
          return (
            <a
              key={i}
              href="https://instagram.com/alustein"
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
        href="https://instagram.com/alustein"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-6 text-[14px] text-muted hover:text-foreground transition-colors"
      >
        {followLabel}
      </a>
    </div>
  )
}
