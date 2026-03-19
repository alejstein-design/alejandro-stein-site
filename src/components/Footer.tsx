import { getSiteSettings } from '@/lib/queries'
import SocialIcons from '@/components/SocialIcons'

export default async function Footer() {
  const settings = await getSiteSettings().catch(() => null)
  const email       = settings?.contactEmail ?? 'alejandrosteinart@gmail.com'
  const handle      = settings?.instagramHandle
  const socialLinks = {
    ...settings?.socialLinks,
    // Derive instagram URL from handle if explicit URL isn't set
    instagram: settings?.socialLinks?.instagram || (handle ? `https://instagram.com/${handle}` : undefined),
  }

  return (
    <footer className="border-t border-border">
      <div className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] py-5 flex items-center justify-between gap-4">

        <div className="flex items-center gap-[14px]" style={{ color: '#6B6B6B' }}>
          <a
            href={`mailto:${email}`}
            aria-label="Email"
            className="hover:opacity-60 transition-opacity"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M2 7l10 7 10-7"/>
            </svg>
          </a>
          <SocialIcons links={socialLinks} gap={14} />
        </div>

        <span className="text-[13px] text-muted">
          © {new Date().getFullYear()} Alejandro Stein
        </span>

      </div>
    </footer>
  )
}
