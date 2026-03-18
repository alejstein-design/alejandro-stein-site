'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', marginBottom: '16px' }}>
          Error
        </p>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '24px' }}>
          Something went wrong
        </h1>
        <button
          onClick={reset}
          style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: '1px solid currentColor', padding: '8px 16px' }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
