interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Override the default pt-10 */
  className?: string
}

export default function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <div
      className={`animate-fade-up max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] pb-10 ${className ?? 'pt-10'}`}
    >
      <h1 className="text-[clamp(2.25rem,6vw,4.5rem)] font-semibold uppercase tracking-[0.02em] text-foreground leading-[0.95]">
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
