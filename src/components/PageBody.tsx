'use client'

import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from 'sanity'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-[16px] leading-[1.8] text-foreground mb-[1.5em] last:mb-0">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="text-[20px] font-medium text-foreground mt-12 mb-4 leading-tight">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-[17px] font-medium text-foreground mt-8 mb-3 leading-tight">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="italic text-[1.1rem] text-foreground/75 leading-[1.7] pl-6 border-l border-foreground/20 my-10">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => (
      <a
        href={value?.href ?? '#'}
        target={value?.href?.startsWith('http') ? '_blank' : undefined}
        rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors"
      >
        {children}
      </a>
    ),
  },
}

interface PageBodyProps {
  value: PortableTextBlock[]
  className?: string
}

export default function PageBody({ value, className }: PageBodyProps) {
  if (!value?.length) return null
  return (
    <div className={className}>
      <PortableText value={value} components={components} />
    </div>
  )
}
