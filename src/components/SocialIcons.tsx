import type { SocialLinks } from '@/types/sanity'

interface SocialIconsProps {
  links: SocialLinks
  gap?: number
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5"/>
      <circle cx="12" cy="12" r="5"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  )
}

export default function SocialIcons({ links, gap = 16 }: SocialIconsProps) {
  const items = [
    { key: 'instagram', url: links.instagram, Icon: InstagramIcon, label: 'Instagram' },
    { key: 'facebook',  url: links.facebook,  Icon: FacebookIcon,  label: 'Facebook'  },
    { key: 'twitter',   url: links.twitter,   Icon: TwitterIcon,   label: 'X / Twitter' },
    { key: 'linkedin',  url: links.linkedin,  Icon: LinkedInIcon,  label: 'LinkedIn'  },
  ].filter((item) => item.url)

  if (items.length === 0) return null

  return (
    <div className="flex items-center" style={{ gap }}>
      {items.map(({ key, url, Icon, label }) => (
        <a
          key={key}
          href={url!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="hover:opacity-60 transition-opacity"
        >
          <Icon />
        </a>
      ))}
    </div>
  )
}
