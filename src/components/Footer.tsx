import { getSiteSettings } from '@/lib/queries'
import SocialIcons from '@/components/SocialIcons'

export default async function Footer() {
  const settings = await getSiteSettings().catch(() => null)
  const email       = settings?.contactEmail ?? 'alejandrosteinart@gmail.com'
  const socialLinks = settings?.socialLinks ?? {}

  return (
    <footer className="border-t border-border">
      <div className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] py-5 flex items-center justify-between gap-4">

        <a
          href={`mailto:${email}`}
          className="text-[13px] text-muted hover:text-foreground transition-colors"
        >
          {email}
        </a>

        <div style={{ color: '#6B6B6B' }}>
          <SocialIcons links={socialLinks} gap={14} />
        </div>

        <span className="text-[13px] text-muted">
          © {new Date().getFullYear()} Alejandro Stein
        </span>

      </div>
    </footer>
  )
}
