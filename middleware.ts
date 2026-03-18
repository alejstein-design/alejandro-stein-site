import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales, defaultLocale } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

const COOKIE = 'NEXT_LOCALE'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Find which locale (if any) the path starts with
  const pathnameLocale = locales.find(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (!pathnameLocale) {
    // No locale prefix — redirect to the stored preference, else default
    const cookieLang = request.cookies.get(COOKIE)?.value
    const target: Locale = locales.includes(cookieLang as Locale)
      ? (cookieLang as Locale)
      : defaultLocale
    const suffix = pathname === '/' ? '' : pathname
    return NextResponse.redirect(new URL(`/${target}${suffix}`, request.url))
  }

  // Path already has a locale prefix.
  // Forward the locale as a header so the root layout can set html[lang].
  // Write/refresh the cookie so future root visits land here.
  const response = NextResponse.next()
  response.headers.set('x-locale', pathnameLocale)
  response.cookies.set(COOKIE, pathnameLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  })
  return response
}

export const config = {
  matcher: ['/((?!_next|api|studio|favicon\\.ico|.*\\..*).*)', '/'],
}
