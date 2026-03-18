import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getDictionary, locales } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!locales.includes(lang as Locale)) {
    notFound()
  }

  const dict = getDictionary(lang)

  return (
    <div className="flex flex-col min-h-screen">
      <Header lang={lang} dict={dict} />
      <main className="flex-1 pt-14">{children}</main>
      <Footer />
    </div>
  )
}
