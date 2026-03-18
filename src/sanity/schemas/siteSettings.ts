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
        { name: 'es', title: 'Spanish', type: 'array', of: [{ type: 'block' }] },
        { name: 'en', title: 'English', type: 'array', of: [{ type: 'block' }] },
      ],
    }),

    // ── Contact info ──────────────────────────────────────────────────────
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    }),
    defineField({
      name: 'studioLocation',
      title: 'Studio Location',
      type: 'string',
      description: 'e.g. "Buenos Aires, Argentina"',
    }),
    defineField({
      name: 'commissionsText',
      title: 'Commissions Text',
      type: 'object',
      fields: [
        { name: 'es', title: 'Spanish', type: 'text', rows: 2 },
        { name: 'en', title: 'English', type: 'text', rows: 2 },
      ],
    }),

    // ── Social links ──────────────────────────────────────────────────────
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        defineField({ name: 'instagram', title: 'Instagram URL', type: 'url' }),
        defineField({ name: 'facebook', title: 'Facebook URL', type: 'url' }),
        defineField({ name: 'twitter', title: 'X / Twitter URL', type: 'url' }),
        defineField({ name: 'linkedin', title: 'LinkedIn URL', type: 'url' }),
      ],
    }),
    defineField({
      name: 'instagramHandle',
      title: 'Instagram Handle',
      type: 'string',
      description: 'Without the @ sign, e.g. "alustein"',
    }),

    // ── Homepage images ───────────────────────────────────────────────────
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

    // ── Contact page Instagram feed ───────────────────────────────────────
    defineField({
      name: 'instagramImages',
      title: 'Instagram Feed Images',
      description: 'Upload up to 4 recent Instagram post images. These appear on the Contact page.',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (Rule) => Rule.max(4).warning('Maximum 4 Instagram images'),
    }),
  ],
  preview: {
    select: { title: 'artistName' },
  },
})
