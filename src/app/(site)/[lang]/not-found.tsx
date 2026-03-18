import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted mb-4">404</p>
      <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold uppercase tracking-[0.02em] text-foreground leading-[1] mb-6">
        Not Found
      </h1>
      <p className="text-[14px] text-muted mb-10 max-w-sm">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/en"
        className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted hover:text-foreground transition-colors"
      >
        ← Back to home
      </Link>
    </div>
  )
}
