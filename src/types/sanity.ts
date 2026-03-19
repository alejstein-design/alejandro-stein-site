import type { PortableTextBlock } from 'sanity'

export interface SanityImageAsset {
  _ref: string
  _type: 'reference'
}

export interface SanityImage {
  _type: 'image'
  asset: SanityImageAsset
  hotspot?: { x: number; y: number; height: number; width: number }
  crop?: { top: number; bottom: number; left: number; right: number }
  alt?: { es?: string; en?: string }
}

export interface BilingualString {
  es?: string | null
  en?: string | null
}

export interface BilingualText {
  es?: PortableTextBlock[]
  en?: PortableTextBlock[]
}

export interface Collection {
  _id: string
  title: BilingualString
  slug: { current: string }
  description?: BilingualString
  category?: string
  coverImage: SanityImage
  year?: string
  medium?: BilingualString
  layoutStyle?: 'grid' | 'masonry' | 'editorial'
  featured?: boolean
  sortOrder?: number
}

export interface Artwork {
  _id: string
  title: BilingualString
  slug: { current: string }
  images: SanityImageWithLqip[]
  year?: number
  dimensions?: string
  medium?: BilingualString
  description?: BilingualText
  featured?: boolean
  homepageSize?: 'small' | 'medium' | 'large' | 'wide' | 'tall'
  sortOrder?: number
}

export interface CollectionWithArtworks extends Collection {
  artworks: Artwork[]
}

/** Image with LQIP + natural dimensions for blur-up placeholder and aspect ratio */
export interface SanityImageWithLqip extends SanityImage {
  lqip?: string | null
  width?: number
  height?: number
}

/** Artwork as fetched for the homepage — includes dereferenced collection + LQIP */
export interface FeaturedArtwork {
  _id: string
  title: BilingualString
  slug: { current: string }
  images: SanityImageWithLqip[]
  homepageSize?: 'small' | 'medium' | 'large' | 'wide' | 'tall'
  sortOrder?: number
  collection?: {
    _id: string
    title: BilingualString
    slug: { current: string }
  }
}

export interface SanityPage {
  _id: string
  title: BilingualString
  slug: { current: string }
  body?: BilingualText
  image?: SanityImageWithLqip
}

export interface CareerEvent {
  _id: string
  title: string
  titleEs: string
  year: number
  eventType: 'solo' | 'group' | 'award' | 'milestone'
  venue?: string
  location?: string
  locationEs?: string
  description?: string
  descriptionEs?: string
  highlight?: boolean
  image?: SanityImageWithLqip
}

export interface Exhibition {
  _id: string
  year?: string
  title?: BilingualString
  venue?: string
  city?: string
  type?: 'solo' | 'group' | 'residency' | 'fair'
  sortOrder?: number
}

export interface SocialLinks {
  instagram?: string | null
  facebook?: string | null
  twitter?: string | null
  linkedin?: string | null
}

export interface SiteSettings {
  _id: string
  artistName?: string
  tagline?: BilingualString
  bio?: BilingualText
  contactEmail?: string
  studioLocation?: string
  commissionsText?: BilingualString
  socialLinks?: SocialLinks
  instagramHandle?: string
  homepageHeroImage?: SanityImageWithLqip
  featuredArtworks?: FeaturedArtwork[]
  selectedCollections?: Collection[]
  beholdFeedId?: string
  instagramImages?: SanityImageWithLqip[]
}
