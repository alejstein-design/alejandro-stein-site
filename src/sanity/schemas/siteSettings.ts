import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // Singleton — enforced via desk structure
  groups: [
    { name: 'general',  title: 'General',               default: true },
    { name: 'homepage', title: 'Homepage Customization'               },
  ],
  fields: [
    // ── General ───────────────────────────────────────────────────────────
    defineField({
      name: 'artistName',
      title: 'Artist Name',
      type: 'string',
      group: 'general',
      initialValue: 'Alejandro Stein',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'object',
      group: 'general',
      fields: [
        { name: 'es', title: 'Spanish', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
      ],
    }),
    defineField({
      name: 'bio',
      title: 'Bio (short — for homepage)',
      type: 'object',
      group: 'general',
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
      group: 'general',
    }),
    defineField({
      name: 'studioLocation',
      title: 'Studio Location',
      type: 'string',
      group: 'general',
      description: 'e.g. "Buenos Aires, Argentina"',
    }),
    defineField({
      name: 'commissionsText',
      title: 'Commissions Text',
      type: 'object',
      group: 'general',
      fields: [
        { name: 'es', title: 'Spanish', type: 'text', rows: 2 },
        { name: 'en', title: 'English', type: 'text', rows: 2 },
      ],
    }),

    // ── Social links ──────────────────────────────────────────────────────
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      group: 'general',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'platform', title: 'Platform', type: 'string' }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
          preview: {
            select: { title: 'platform', subtitle: 'url' },
          },
        },
      ],
    }),
    defineField({
      name: 'instagramHandle',
      title: 'Instagram Handle',
      type: 'string',
      group: 'general',
      description: 'Without the @ sign, e.g. "alustein"',
    }),
    defineField({
      name: 'beholdFeedId',
      title: 'Behold Instagram Feed ID',
      type: 'string',
      group: 'general',
      description: 'From behold.so dashboard → Feeds → Embed Code. e.g. "cbj6v4U5dR9dGucknTwk"',
    }),

    // ── Homepage Customization ─────────────────────────────────────────────
    defineField({
      name: 'homepageHeroImage',
      title: 'Hero Image',
      type: 'image',
      group: 'homepage',
      options: { hotspot: true },
    }),
    defineField({
      name: 'featuredArtworks',
      title: 'Featured Artworks (Grid)',
      description: 'Select up to 8 artworks to show in the homepage grid.',
      type: 'array',
      group: 'homepage',
      of: [{ type: 'reference', to: [{ type: 'artwork' }] }],
      validation: (Rule) => Rule.max(8).warning('Maximum 8 artworks on the homepage'),
    }),
    defineField({
      name: 'selectedCollections',
      title: 'Selected Collections',
      description: 'Select up to 6 collections to feature on the homepage.',
      type: 'array',
      group: 'homepage',
      of: [{ type: 'reference', to: [{ type: 'collection' }] }],
      validation: (Rule) => Rule.max(6).warning('Maximum 6 collections on the homepage'),
    }),
  ],
  preview: {
    select: { title: 'artistName' },
  },
})
