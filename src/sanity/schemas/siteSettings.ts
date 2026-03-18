import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // Singleton — enforced via desk structure
  fields: [
    defineField({
      name: 'artistName',
      title: 'Artist Name',
      type: 'string',
      initialValue: 'Alejandro Stein',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'object',
      fields: [
        { name: 'es', title: 'Spanish', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
      ],
    }),
    defineField({
      name: 'bio',
      title: 'Bio (short — for homepage)',
      type: 'object',
      fields: [
        {
          name: 'es',
          title: 'Spanish',
          type: 'array',
          of: [{ type: 'block' }],
        },
        {
          name: 'en',
          title: 'English',
          type: 'array',
          of: [{ type: 'block' }],
        },
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'platform', title: 'Platform', type: 'string' },
            { name: 'url', title: 'URL', type: 'url' },
          ],
          preview: {
            select: { title: 'platform', subtitle: 'url' },
          },
        },
      ],
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    }),
    defineField({
      name: 'homepageHeroImage',
      title: 'Homepage Hero Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'featuredArtworks',
      title: 'Featured Artworks (Homepage Grid)',
      description: 'Select up to 8 artworks to show in the homepage grid.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'artwork' }] }],
      validation: (Rule) => Rule.max(8).warning('Maximum 8 artworks on the homepage'),
    }),
    defineField({
      name: 'selectedCollections',
      title: 'Selected Collections (Homepage)',
      description: 'Select up to 6 collections to feature on the homepage.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'collection' }] }],
      validation: (Rule) => Rule.max(6).warning('Maximum 6 collections on the homepage'),
    }),
    defineField({
      name: 'instagramImages',
      title: 'Instagram Feed Images',
      description: 'Upload 8–12 recent Instagram posts. These appear on the Contact page.',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (Rule) => Rule.max(12),
    }),
  ],
  preview: {
    select: { title: 'artistName' },
  },
})
