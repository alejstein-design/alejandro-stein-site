import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import type { SanityImageSource } from '@sanity/image-url'

interface HeroImageProps {
  image: SanityImageSource
  alt?: string
  lqip?: string
}

export default function HeroImage({ image, alt = '', lqip }: HeroImageProps) {
  return (
    <section className="sticky top-0 z-0 h-[70vh] w-full overflow-hidden">
      <Image
        src={urlFor(image).width(2400).quality(85).auto('format').url()}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        {...(lqip ? { placeholder: 'blur' as const, blurDataURL: lqip } : {})}
      />
    </section>
  )
}
