interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Override the default pt-[120px] — useful when a back link precedes the header */
  className?: string
}

export default function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <div
      className={`animate-fade-up max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] pb-12 ${className ?? 'pt-[120px]'}`}
    >
      <h1 className="text-[clamp(28px,5vw,40px)] font-semibold uppercase tracking-[0.05em] text-foreground leading-none">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 text-[16px] text-muted max-w-[640px] leading-[1.8]">
          {subtitle}
        </p>
      )}
    </div>
  )
}
