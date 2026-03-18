import { client } from './sanity'
import type {
  Collection,
  CollectionWithArtworks,
  FeaturedArtwork,
  SiteSettings,
  SanityPage,
  Exhibition,
} from '@/types/sanity'

export async function getAllCollections(): Promise<Collection[]> {
  return client.fetch(
    `*[_type == "collection"] | order(sortOrder asc) {
      _id,
      title,
      slug,
      description,
      category,
      coverImage,
      year,
      medium,
      layoutStyle,
      featured,
      sortOrder
    }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export async function getCollectionWithArtworks(
  slug: string
): Promise<CollectionWithArtworks | null> {
  return client.fetch(
    `*[_type == "collection" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      category,
      coverImage,
      year,
      medium,
      layoutStyle,
      "artworks": *[_type == "artwork" && collection._ref == ^._id] | order(sortOrder asc) {
        _id,
        title,
        slug,
        "images": images[] {
          ...,
          "lqip": asset->metadata.lqip,
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height
        },
        year,
        dimensions,
        medium,
        description,
        featured,
        homepageSize,
        sortOrder
      }
    }`,
    { slug },
    { next: { revalidate: 60 } }
  )
}

export async function getFeaturedArtworks(): Promise<FeaturedArtwork[]> {
  return client.fetch(
    `*[_type == "artwork" && featured == true] | order(sortOrder asc) [0...8] {
      _id,
      title,
      slug,
      "images": images[] {
        ...,
        "lqip": asset->metadata.lqip
      },
      homepageSize,
      sortOrder,
      "collection": collection-> {
        _id,
        title,
        slug
      }
    }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch(
    `*[_type == "siteSettings"][0] {
      _id,
      artistName,
      tagline,
      bio,
      socialLinks,
      contactEmail,
      "homepageHeroImage": homepageHeroImage {
        ...,
        "lqip": asset->metadata.lqip
      },
      "instagramImages": instagramImages[] {
        ...,
        "lqip": asset->metadata.lqip
      }
    }`,
    {},
    { next: { revalidate: 300 } }
  )
}

export async function getFeaturedCollections(): Promise<Collection[]> {
  return client.fetch(
    `*[_type == "collection" && featured == true] | order(sortOrder asc) [0...3] {
      _id,
      title,
      slug,
      coverImage,
      year,
      medium,
      sortOrder
    }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export async function getPageBySlug(slug: string): Promise<SanityPage | null> {
  return client.fetch(
    `*[_type == "page" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      body,
      "image": image {
        ...,
        "lqip": asset->metadata.lqip
      }
    }`,
    { slug },
    { next: { revalidate: 300 } }
  )
}

export async function getExhibitions(): Promise<Exhibition[]> {
  return client.fetch(
    `*[_type == "exhibition"] | order(sortOrder desc) {
      _id,
      year,
      title,
      venue,
      city,
      type,
      sortOrder
    }`,
    {},
    { next: { revalidate: 300 } }
  )
}

export async function getAllCollectionSlugs(): Promise<string[]> {
  const result = await client.fetch<Array<{ current: string }>>(
    `*[_type == "collection"].slug`,
    {},
    { next: { revalidate: 3600 } }
  )
  return result?.map((s) => s.current) ?? []
}
