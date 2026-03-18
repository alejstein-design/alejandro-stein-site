import { defineField, defineType } from 'sanity'

export const collection = defineType({
  name: 'collection',
  title: 'Collection',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'object',
      fields: [
        { name: 'es', title: 'Spanish', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title.en',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'object',
      fields: [
        { name: 'es', title: 'Spanish', type: 'text', rows: 3 },
        { name: 'en', title: 'English', type: 'text', rows: 3 },
      ],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Handmade', value: 'handmade' },
          { title: 'Murals', value: 'murals' },
          { title: 'Tapestries', value: 'tapestries' },
          { title: 'Digital', value: 'digital' },
          { title: 'Doors', value: 'doors' },
          { title: 'Mixed Media', value: 'mixed-media' },
          { title: 'Mosaico Refractario', value: 'mosaico-refractario' },
          { title: 'Combinación', value: 'combinacion' },
          { title: 'Architectural Patterns', value: 'architectural-patterns' },
          { title: 'Portraits', value: 'portraits' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coverArtwork',
      title: 'Cover Image',
      description: 'Pick an artwork from this collection. Add artworks first, then return here to set the cover.',
      type: 'reference',
      to: [{ type: 'artwork' }],
      options: {
        filter: ({ document }: { document: { _id?: string } }) =>
          document._id
            ? {
                filter: 'collection._ref == $collectionId',
                params: { collectionId: document._id.replace(/^drafts\./, '') },
              }
            : { filter: '_type == "artwork"' },
        disableNew: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
      description: 'e.g. "2018 — Present" or "2021"',
    }),
    defineField({
      name: 'medium',
      title: 'Medium / Technique',
      type: 'object',
      fields: [
        { name: 'es', title: 'Spanish', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
      ],
    }),
    defineField({
      name: 'layoutStyle',
      title: 'Layout Style',
      type: 'string',
      options: {
        list: [
          { title: 'Grid (uniform)', value: 'grid' },
          { title: 'Masonry', value: 'masonry' },
          { title: 'Editorial', value: 'editorial' },
        ],
      },
      initialValue: 'grid',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Lower numbers appear first',
    }),
    defineField({
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title.en',
      media: 'coverArtwork.images.0',
      subtitle: 'category',
    },
  },
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrderAsc',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
  ],
})
