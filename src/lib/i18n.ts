export const locales = ['en', 'es'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

const dictionaries = {
  en: {
    home: 'Home',
    works: 'Works',
    about: 'Info',
    statement: 'Statement',
    contact: 'Contact',
    shop: 'Shop',
    comingSoon: 'Coming soon',
    back: 'Back',
    readMore: 'Read more',
    allCollections: 'All collections',
    getInTouch: 'Get in touch',
    year: 'Year',
    medium: 'Medium',
    dimensions: 'Dimensions',
    close: 'Close',
    previous: 'Previous',
    next: 'Next',
    noArtworks: 'No artworks yet',
    viewCollection: 'View collection',
    selectedWorks: 'Selected Works',
    selectedCollections: 'Selected Collections',
    collections: 'Collections',
    exhibitionHistory: 'Exhibition History',
    commissions: 'Commissions',
    solo: 'Solo',
    group: 'Group',
  },
  es: {
    home: 'Inicio',
    works: 'Obras',
    about: 'Info',
    statement: 'Declaración',
    contact: 'Contacto',
    shop: 'Tienda',
    comingSoon: 'Próximamente',
    back: 'Volver',
    readMore: 'Leer más',
    allCollections: 'Todas las colecciones',
    getInTouch: 'Contacto',
    year: 'Año',
    medium: 'Técnica',
    dimensions: 'Dimensiones',
    close: 'Cerrar',
    previous: 'Anterior',
    next: 'Siguiente',
    noArtworks: 'Sin obras aún',
    viewCollection: 'Ver colección',
    selectedWorks: 'Obras Seleccionadas',
    selectedCollections: 'Colecciones Seleccionadas',
    collections: 'Colecciones',
    exhibitionHistory: 'Historial de Exposiciones',
    commissions: 'Encargos',
    solo: 'Individual',
    group: 'Colectiva',
  },
} as const

export type Dictionary = {
  home: string
  works: string
  about: string
  statement: string
  contact: string
  shop: string
  comingSoon: string
  back: string
  readMore: string
  allCollections: string
  getInTouch: string
  year: string
  medium: string
  dimensions: string
  close: string
  previous: string
  next: string
  noArtworks: string
  viewCollection: string
  selectedWorks: string
  selectedCollections: string
  collections: string
  exhibitionHistory: string
  commissions: string
  solo: string
  group: string
}

export function getDictionary(lang: string): Dictionary {
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale
  return dictionaries[locale]
}

/** Pick the right language from a bilingual object, fall back to the other. */
export function t(
  obj: { es?: string | null; en?: string | null } | undefined | null,
  lang: string
): string {
  if (!obj) return ''
  const key = lang as 'es' | 'en'
  return obj[key] ?? obj.en ?? obj.es ?? ''
}
