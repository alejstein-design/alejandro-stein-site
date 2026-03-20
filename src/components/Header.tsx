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
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const prevScrollRef = useRef(0)
  const burgerRef = useRef<HTMLButtonElement>(null)

  // Combined scroll + navigation effect
  useEffect(() => {
    const resetTimer = setTimeout(() => {
      setVisible(true)
      prevScrollRef.current = window.scrollY
    }, 0)

    const handleScroll = () => {
      const current = window.scrollY
      if (isOpen) return
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
  }, [pathname, isOpen])

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close menu on navigation
  useEffect(() => {
    const t = setTimeout(() => setIsOpen(false), 0)
    return () => clearTimeout(t)
  }, [pathname])

  const navLinks = [
    { href: `/${lang}/works`,   label: dict.works   },
    { href: `/${lang}/about`,   label: dict.about   },
    { href: `/${lang}/contact`, label: dict.contact },
  ]

  const menuItems = [
    { label: dict.home,    href: `/${lang}`,          delay: '300ms' },
    { label: dict.works,   href: `/${lang}/works`,    delay: '380ms' },
    { label: dict.about,   href: `/${lang}/about`,    delay: '460ms' },
    { label: dict.contact, href: `/${lang}/contact`,  delay: '540ms' },
    { label: dict.shop,    href: null,                 delay: '620ms' },
  ]

  const isHomepage    = pathname === `/${lang}` || pathname === `/${lang}/`
  const otherLangPath = `/${lang === 'en' ? 'es' : 'en'}${pathname.slice(`/${lang}`.length) || '/'}`

  return (
    <>
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] h-14 flex items-center justify-between">

        {/* Logo */}
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

          {/* Shop — disabled */}
          <span className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.08em] text-muted/40 cursor-default select-none">
            {dict.shop}
            <span className="text-[9px] border border-muted/20 text-muted/40 px-1.5 py-0.5 uppercase tracking-[1px]">
              {dict.comingSoon}
            </span>
          </span>

          {/* Desktop language toggle */}
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

        {/* Mobile right side: globe toggle + hamburger */}
        <div className="md:hidden flex items-center gap-3">
          {/* Globe language toggle */}
          <Link
            href={otherLangPath}
            className="flex items-center gap-1.5 relative z-[60]"
            aria-label={`Switch to ${lang === 'en' ? 'Spanish' : 'English'}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
            <span className="text-[11px] font-medium uppercase tracking-wide text-[#1A1A1A]">
              {lang === 'en' ? 'EN' : 'ES'}
            </span>
          </Link>

          {/* Burger / X button */}
          <button
            ref={burgerRef}
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-[60] w-6 h-4 flex flex-col justify-between"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={`block w-full h-[1.5px] bg-[#1A1A1A] transition-all duration-300 origin-center ${
              isOpen ? 'translate-y-[7px] rotate-45' : ''
            }`} />
            <span className={`block w-full h-[1.5px] bg-[#1A1A1A] transition-all duration-300 ${
              isOpen ? 'opacity-0' : ''
            }`} />
            <span className={`block w-full h-[1.5px] bg-[#1A1A1A] transition-all duration-300 origin-center ${
              isOpen ? '-translate-y-[7px] -rotate-45' : ''
            }`} />
          </button>
        </div>
      </div>

    </header>

      {/* Mobile fullscreen overlay — outside <header> to avoid transform containment */}
      <div className="md:hidden">
        {/* White expanding circle */}
        <div
          className="fixed z-40 bg-white rounded-full"
          style={{
            top: '14px',
            right: '16px',
            width: isOpen ? '200vmax' : '0px',
            height: isOpen ? '200vmax' : '0px',
            transform: 'translate(50%, -50%)',
            pointerEvents: isOpen ? 'auto' : 'none',
            transition: isOpen
              ? 'width 500ms cubic-bezier(0.4,0,0.2,1), height 500ms cubic-bezier(0.4,0,0.2,1)'
              : 'width 400ms cubic-bezier(0.4,0,0.2,1), height 400ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />

        {/* Menu content — starts below the navbar (top-14 = 56px) */}
        <div
          className={`fixed inset-x-0 top-14 bottom-0 z-40 flex flex-col px-8 pt-8 ${
            isOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <div className="flex flex-col gap-7">
            {menuItems.map((item) => (
              <div
                key={item.label}
                style={{
                  opacity: isOpen ? 1 : 0,
                  transition: isOpen
                    ? `opacity 200ms ease ${item.delay}`
                    : 'opacity 50ms ease 0ms',
                }}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block"
                  >
                    <span className="text-[28px] font-semibold uppercase tracking-wide text-[#1A1A1A]">
                      {item.label}
                    </span>
                  </Link>
                ) : (
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[28px] font-semibold uppercase tracking-wide text-[#ADADAD]">
                        {dict.shop}
                      </span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ADADAD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <p className="text-[11px] uppercase tracking-wide text-[#ADADAD] mt-1">
                      {lang === 'en' ? 'Coming soon' : 'Próximamente'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
