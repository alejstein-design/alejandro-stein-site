'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Dictionary } from '@/lib/i18n'
import NavLinkAnimated from '@/components/NavLinkAnimated'

interface HeaderProps {
  lang: string
  dict: Dictionary
}

export default function Header({ lang, dict }: HeaderProps) {
  const [visible, setVisible] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const prevScrollRef = useRef(0)

  // Combined scroll + navigation effect
  useEffect(() => {
    // Reset to visible on navigation (async to avoid synchronous setState-in-effect lint rule)
    const resetTimer = setTimeout(() => {
      setVisible(true)
      prevScrollRef.current = window.scrollY
    }, 0)

    const handleScroll = () => {
      const current = window.scrollY
      if (menuOpen) return
      if (current < 10) {
        setVisible(true)
      } else {
        const delta = current - prevScrollRef.current
        if (Math.abs(delta) > 5) setVisible(delta < 0)
      }
      prevScrollRef.current = current
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      clearTimeout(resetTimer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [pathname, menuOpen])

  const navLinks = [
    { href: `/${lang}/works`,   label: dict.works   },
    { href: `/${lang}/about`,   label: dict.about   },
    { href: `/${lang}/contact`, label: dict.contact },
  ]

  const isHomepage    = pathname === `/${lang}` || pathname === `/${lang}/`
  const otherLang     = lang === 'en' ? 'es' : 'en'
  const otherLangPath = `/${otherLang}${pathname.slice(`/${lang}`.length) || '/'}`

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] h-14 flex items-center justify-between">

        {/* Logo — hidden on homepage where the hero already shows the name */}
        <Link
          href={`/${lang}`}
          className={`text-[12px] font-semibold tracking-[0.15em] uppercase text-foreground hover:text-muted transition-colors ${
            isHomepage ? 'invisible' : ''
          }`}
          aria-hidden={isHomepage}
          tabIndex={isHomepage ? -1 : undefined}
        >
          ALEJANDRO STEIN
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <NavLinkAnimated
                key={link.href}
                href={link.href}
                label={link.label}
                isActive={isActive}
                className="text-[12px] font-medium uppercase tracking-[0.08em]"
              />
            )
          })}

          {/* Shop — disabled (no animation on non-link) */}
          <span className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.08em] text-muted/40 cursor-default select-none">
            {dict.shop}
            <span className="text-[9px] border border-muted/20 text-muted/40 px-1.5 py-0.5 uppercase tracking-[1px]">
              {dict.comingSoon}
            </span>
          </span>

          {/* Language toggle */}
          <div className="flex items-center gap-1 text-[11px]">
            {lang === 'en' ? (
              <span className="font-medium text-foreground">EN</span>
            ) : (
              <Link href={otherLangPath} className="text-muted hover:text-foreground transition-colors">EN</Link>
            )}
            <span className="text-muted px-0.5">/</span>
            {lang === 'es' ? (
              <span className="font-medium text-foreground">ES</span>
            ) : (
              <Link href={otherLangPath} className="text-muted hover:text-foreground transition-colors">ES</Link>
            )}
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] w-6 h-6 text-foreground"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <span className="block w-5 h-px bg-current" />
          <span className="block w-5 h-px bg-current" />
          <span className="block w-5 h-px bg-current" />
        </button>
      </div>

      {/* Mobile fullscreen overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-background/97 backdrop-blur-md flex flex-col items-center justify-center md:hidden">
          <button
            className="absolute top-5 right-6 text-2xl text-foreground hover:text-muted transition-colors"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>

          <nav className="flex flex-col items-center gap-9">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <NavLinkAnimated
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  isActive={isActive}
                  onClick={() => setMenuOpen(false)}
                  className="text-[13px] font-medium uppercase tracking-[0.08em]"
                  tileSize={28}
                />
              )
            })}

            {/* Shop — disabled */}
            <span className="flex items-center gap-3 text-[13px] font-medium uppercase tracking-[0.08em] text-muted/40 cursor-default">
              {dict.shop}
              <span className="text-[9px] border border-muted/20 px-2 py-0.5 uppercase tracking-[1px]">
                {dict.comingSoon}
              </span>
            </span>

            {/* Language toggle — mobile */}
            <div className="flex items-center gap-1.5 text-[13px] mt-4">
              {lang === 'en' ? (
                <span className="font-medium text-foreground">EN</span>
              ) : (
                <Link href={otherLangPath} className="text-muted hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>EN</Link>
              )}
              <span className="text-muted px-0.5">/</span>
              {lang === 'es' ? (
                <span className="font-medium text-foreground">ES</span>
              ) : (
                <Link href={otherLangPath} className="text-muted hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>ES</Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
