import { defineField, defineType } from 'sanity'
import { CoverImagePreview } from '../components/CoverImagePreview'

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
          { title: 'Canvas', value: 'canvas' },
          { title: 'Doors', value: 'doors' },
          { title: 'Paper', value: 'paper' },
          { title: 'Tapestries', value: 'tapestries' },
          { title: 'Murals', value: 'murals' },
          { title: 'Digital', value: 'digital' },
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
      validation: (Rule) => Rule.warning('A cover image is recommended'),
      components: { field: CoverImagePreview },
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
      images: 'coverArtwork.images',
      subtitle: 'category',
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare({ title, images, subtitle }: any) {
      return {
        title: title ?? 'Untitled',
        subtitle,
        media: Array.isArray(images) ? images[0] : images,
      }
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
